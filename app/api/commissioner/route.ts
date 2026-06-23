import { NextRequest, NextResponse } from "next/server";
import { generateCommissionerVerdict } from "@/lib/pundits/generator";
import { addChatMessage, latestMatch } from "@/lib/db/state";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
        const topic = (body.topic as string) || "";

        const match = latestMatch();
        if (!match) {
            return NextResponse.json(
                { error: "No matches on record yet. Trigger a matchday first." },
                { status: 404 }
            );
        }

        const matchContext = `${match.homeTeam} ${match.homeScore}–${match.awayScore} ${match.awayTeam}`;
        const searchTopic = topic || `${match.homeTeam} vs ${match.awayTeam}`;

        const verdict = await generateCommissionerVerdict(
            matchContext,
            matchContext,
            searchTopic
        );

        const msg = {
            id: uuidv4(),
            punditId: "commissioner" as const,
            message: verdict.message,
            matchContext,
            timestamp: new Date().toISOString(),
            blobIds: verdict.blobIds,
            citations: verdict.priorMemories.slice(0, 6).map((m) => ({
                text: m.text,
                blobId: m.blobId,
                explorerUrl: m.explorerUrl,
            })),
        };

        addChatMessage(msg);

        return NextResponse.json({ message: msg });
    } catch (err) {
        console.error("Commissioner route error:", err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}