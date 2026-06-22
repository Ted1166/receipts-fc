import { NextRequest, NextResponse } from "next/server";
import {
    allPunditStats,
    allMatches,
    getContradictions,
    getUserPredictions,
} from "@/lib/db/state";
import { recallUserHistory } from "@/lib/memory/operations";
import { PUNDITS } from "@/lib/pundits/personas";
import { PunditId } from "@/lib/memory/client";

export async function GET(req: NextRequest) {
    const sessionId = req.nextUrl.searchParams.get("sessionId") ?? "anon";

    const rawStats = allPunditStats();
    const stats = rawStats.map((s) => ({
        ...s,
        name: PUNDITS[s.punditId as PunditId]?.name ?? s.punditId,
        emoji: PUNDITS[s.punditId as PunditId]?.emoji ?? "🎙️",
        accuracy:
            s.correct + s.wrong > 0
                ? Math.round((s.correct / (s.correct + s.wrong)) * 100)
                : null,
    }));

    const matches = allMatches();
    const contradictions = getContradictions().map((c) => ({
        ...c,
        punditName: PUNDITS[c.punditId as PunditId]?.name ?? c.punditId,
    }));

    const userPredictions = getUserPredictions(sessionId);

    return NextResponse.json({
        pundits: stats,
        matches: matches.slice(0, 10),
        contradictions: contradictions.slice(-10),
        userPredictions,
        totalMessages: require("@/lib/db/state").getChatMessages(1000).length,
    });
}