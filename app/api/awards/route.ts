import { NextRequest, NextResponse } from "next/server";
import { generateAwardsShow } from "@/lib/pundits/generator";

export async function GET(req: NextRequest) {
    const sessionId = req.nextUrl.searchParams.get("sessionId") ?? undefined;
    const roast = await generateAwardsShow(sessionId);
    return NextResponse.json({ roast });
}