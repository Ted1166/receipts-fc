import Anthropic from "@anthropic-ai/sdk";
import { PunditId } from "@/lib/memory/client";
import {
    PUNDITS,
    buildPunditPrompt,
    buildCommissionerPrompt,
} from "@/lib/pundits/personas";
import {
    recallPunditMemory,
    recallAllPunditsOnTopic,
    rememberPunditStatement,
    MemoryCitation,
} from "@/lib/memory/operations";

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

export type PunditResponse = {
    punditId: PunditId;
    message: string;
    priorMemories: MemoryCitation[];
    blobIds: string[];
    isContradiction?: boolean;
    contradiction?: {
        priorStatement: string;
        priorBlobId: string;
    };
};

export async function generatePunditTake(
    punditId: PunditId,
    matchContext: string,
    userMessage?: string
): Promise<PunditResponse> {
    const priorMemories = await recallPunditMemory(
        punditId,
        matchContext,
        4
    );

    const prompt = buildPunditPrompt(
        punditId,
        matchContext,
        priorMemories.map((m) => ({ text: m.text, blobId: m.blobId })),
        userMessage
    );

    const result = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 256,
        system: PUNDITS[punditId].systemPrompt,
        messages: [{ role: "user", content: prompt }],
    });

    const message =
        result.content[0].type === "text" ? result.content[0].text : "";

    const stored = await rememberPunditStatement(
        punditId,
        message,
        matchContext
    );

    let isContradiction = false;
    let contradiction: PunditResponse["contradiction"];
    if (priorMemories.length > 0 && priorMemories[0].distance < 0.25) {
        isContradiction = true;
        contradiction = {
            priorStatement: priorMemories[0].text,
            priorBlobId: priorMemories[0].blobId,
        };
    }

    return {
        punditId,
        message,
        priorMemories,
        blobIds: stored.blobIds,
        isContradiction,
        contradiction,
    };
}

export async function generateCommissionerVerdict(
    matchContext: string,
    matchResult: string,
    topic: string
): Promise<PunditResponse> {
    const allStatements = await recallAllPunditsOnTopic(topic, 3);

    const prompt = buildCommissionerPrompt(
        topic,
        Object.fromEntries(
            Object.entries(allStatements).map(([id, citations]) => [
                id,
                citations.map((c) => ({ text: c.text, blobId: c.blobId })),
            ])
        ),
        matchResult
    );

    const result = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 400,
        system: PUNDITS.commissioner.systemPrompt,
        messages: [{ role: "user", content: prompt }],
    });

    const message =
        result.content[0].type === "text" ? result.content[0].text : "";

    const stored = await rememberPunditStatement(
        "commissioner",
        message,
        matchContext
    );

    const flatPriors = Object.values(allStatements).flat();

    return {
        punditId: "commissioner",
        message,
        priorMemories: flatPriors,
        blobIds: stored.blobIds,
    };
}

export async function generateAwardsShow(
    userSessionId?: string
): Promise<string> {
    const {
        getContradictions,
        allPunditStats,
        getUserPredictions,
    } = await import("@/lib/db/state");

    const stats = allPunditStats();
    const contradictions = getContradictions();

    const biggestFlip = contradictions.sort(
        (a, b) => (b.topic?.length ?? 0) - (a.topic?.length ?? 0)
    )[0];

    const statsSection = stats
        .map(
            (s) =>
                `${PUNDITS[s.punditId as PunditId]?.name ?? s.punditId}: ${s.correct}W/${s.wrong}L, ${s.flips} flip(s)`
        )
        .join("\n");

    const userSection =
        userSessionId
            ? `User predictions: ${getUserPredictions(userSessionId).length} total`
            : "";

    const prompt = `You are the host of the Receipts FC Awards Show — the end-of-phase roast ceremony.

Pundit records so far:
${statsSection}
${userSection}

${biggestFlip
            ? `Biggest contradiction on record: ${biggestFlip.punditId} said "${biggestFlip.earlierStatement}" then later said "${biggestFlip.laterStatement}"`
            : ""
        }

Announce these awards with ceremony:
1. Most Accurate Pundit (best record)
2. Biggest Flip-Flop (cite the actual contradictory quotes if available)
3. Most Stubborn (most wrong but never admitted it)
4. Personal roast of the user if their predictions are provided

Be dramatic. Be specific. Cite real quotes. Keep it under 300 words.`;

    const result = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 512,
        messages: [{ role: "user", content: prompt }],
    });

    return result.content[0].type === "text" ? result.content[0].text : "";
}