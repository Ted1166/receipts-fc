import { NextRequest, NextResponse } from "next/server";
import { generateAwardsShow } from "@/lib/pundits/generator";
import { allMatches, getChatMessages } from "@/lib/db/state";

export async function GET(req: NextRequest) {
    const sessionId = req.nextUrl.searchParams.get("sessionId") ?? undefined;

    const matches = allMatches();
    const messages = getChatMessages(5);
    if (matches.length === 0 || messages.length === 0) {
        return NextResponse.json({
            roast: null,
            empty: true,
        });
    }

    const roast = await generateAwardsShow(sessionId);
    return NextResponse.json({ roast });
}