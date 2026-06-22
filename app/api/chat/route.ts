import { NextRequest, NextResponse } from "next/server";
import { generatePunditTake } from "@/lib/pundits/generator";
import {
    addChatMessage,
    getChatMessages,
    addUserPrediction,
} from "@/lib/db/state";
import {
    rememberUserPrediction,
    recallUserHistory,
} from "@/lib/memory/operations";
import { PunditId } from "@/lib/memory/client";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            message,
            sessionId = "anon",
            punditId,
            matchContext = "World Cup 2026",
            isPrediction = false,
        } = body as {
            message: string;
            sessionId?: string;
            punditId?: PunditId;
            matchContext?: string;
            isPrediction?: boolean;
        };

        if (!message?.trim()) {
            return NextResponse.json({ error: "Message required" }, { status: 400 });
        }

        const userMsg = {
            id: uuidv4(),
            punditId: "user" as PunditId,
            message,
            matchContext,
            timestamp: new Date().toISOString(),
        };
        addChatMessage(userMsg);

        let predictionBlobId: string | undefined;
        if (isPrediction) {
            predictionBlobId = await rememberUserPrediction(
                sessionId,
                message,
                matchContext
            );
            addUserPrediction({
                sessionId,
                matchId: matchContext,
                prediction: message,
                outcome: "pending",
                blobId: predictionBlobId,
            });
        }

        const respondingPundits: PunditId[] = punditId
            ? [punditId]
            : ["pundit-stats", "pundit-vibes", "pundit-contrarian", "pundit-homer"];

        const responses = [];
        for (const pid of respondingPundits) {
            try {
                const response = await generatePunditTake(pid, matchContext, message);
                const msg = {
                    id: uuidv4(),
                    punditId: pid,
                    message: response.message,
                    matchContext,
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
                responses.push(msg);
            } catch (e) {
                console.error(`Pundit ${pid} failed:`, e);
            }
        }

        return NextResponse.json({
            userMessage: userMsg,
            predictionBlobId,
            responses,
        });
    } catch (err) {
        console.error("Chat error:", err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const limit = Number(req.nextUrl.searchParams.get("limit") ?? "50");
    return NextResponse.json({ messages: getChatMessages(limit) });
}