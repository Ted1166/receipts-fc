import { NextResponse } from "next/server";
import { getMemWal } from "@/lib/memory/client";

export async function GET() {
    try {
        const memwal = getMemWal();
        const health = await memwal.health();
        return NextResponse.json({
            walrusMemory: health,
            accountId: process.env.MEMWAL_ACCOUNT_ID,
            explorerUrl: `https://suiscan.xyz/mainnet/object/${process.env.MEMWAL_ACCOUNT_ID}`,
            status: "ok",
        });
    } catch (err) {
        return NextResponse.json(
            { status: "error", message: String(err) },
            { status: 503 }
        );
    }
}