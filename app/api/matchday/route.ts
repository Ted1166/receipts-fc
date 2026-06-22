import { NextRequest, NextResponse } from "next/server";
import { getRecentMatches, matchToContextString } from "@/lib/matches/fetcher";
import { generatePunditTake, generateCommissionerVerdict } from "@/lib/pundits/generator";
import { rememberMatchResult } from "@/lib/memory/operations";
import { upsertMatch, addChatMessage } from "@/lib/db/state";
import { PunditId } from "@/lib/memory/client";
import { PUNDITS } from "@/lib/pundits/personas";
import { v4 as uuidv4 } from "uuid";

const PUNDIT_ORDER: PunditId[] = [
    "pundit-stats",
    "pundit-vibes",
    "pundit-contrarian",
    "pundit-homer",
];

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
        const matchId = body.matchId as string | undefined;

        const matches = await getRecentMatches(5);
        if (matches.length === 0) {
            return NextResponse.json(
                { error: "No finished matches found yet. Check back after kick-off!" },
                { status: 404 }
            );
        }

        const match =
            (matchId ? matches.find((m) => m.id === matchId) : null) ?? matches[0];

        const context = matchToContextString(match);

        const matchBlobId = await rememberMatchResult(
            `RESULT: ${context} — played ${new Date(match.matchDate).toLocaleDateString()}`
        );

        upsertMatch({
            id: match.id,
            homeTeam: match.homeTeam,
            awayTeam: match.awayTeam,
            homeScore: match.homeScore ?? 0,
            awayScore: match.awayScore ?? 0,
            matchDate: match.matchDate,
            stage: match.stage,
            group: match.group,
            blobId: matchBlobId,
        });

        const messages = [];

        for (const punditId of PUNDIT_ORDER) {
            try {
                const response = await generatePunditTake(punditId, context);
                const msg = {
                    id: uuidv4(),
                    punditId,
                    message: response.message,
                    matchContext: context,
                    timestamp: new Date().toISOString(),
                    blobIds: response.blobIds,
                    citations: response.priorMemories.map((m) => ({
                        text: m.text,
                        blobId: m.blobId,
                        explorerUrl: m.explorerUrl,
                    })),
                    isContradiction: response.isContradiction,
                };
                addChatMessage(msg);
                messages.push(msg);
            } catch (e) {
                console.error(`Failed to generate take for ${punditId}:`, e);
            }
        }

        const teams = `${match.homeTeam} vs ${match.awayTeam}`;
        try {
            const commVerdict = await generateCommissionerVerdict(
                context,
                context,
                teams
            );
            const commMsg = {
                id: uuidv4(),
                punditId: "commissioner" as PunditId,
                message: commVerdict.message,
                matchContext: context,
                timestamp: new Date().toISOString(),
                blobIds: commVerdict.blobIds,
                citations: commVerdict.priorMemories.slice(0, 5).map((m) => ({
                    text: m.text,
                    blobId: m.blobId,
                    explorerUrl: m.explorerUrl,
                })),
            };
            addChatMessage(commMsg);
            messages.push(commMsg);
        } catch (e) {
            console.error("Commissioner verdict failed:", e);
        }

        return NextResponse.json({
            match: { ...match, blobId: matchBlobId },
            messages,
            pundits: PUNDIT_ORDER.map((id) => PUNDITS[id]),
        });
    } catch (err) {
        console.error("Matchday error:", err);
        return NextResponse.json(
            { error: String(err) },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const matches = await getRecentMatches(5);
        return NextResponse.json({ matches });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}