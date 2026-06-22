"use client";

import { useState, useEffect } from "react";

export function AwardsModal({
    sessionId,
    onClose,
}: {
    sessionId: string;
    onClose: () => void;
}) {
    const [roast, setRoast] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/awards?sessionId=${sessionId}`)
            .then((r) => r.json())
            .then((d) => {
                setRoast(d.roast ?? "No awards yet — need at least one matchday.");
                setIsLoading(false);
            })
            .catch(() => {
                setRoast("Failed to load awards. Try again.");
                setIsLoading(false);
            });
    }, [sessionId]);

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#0d0d14] border border-yellow-500/30 rounded-lg max-w-lg w-full max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                    <div>
                        <div className="font-mono font-black text-yellow-400 tracking-tight">
                            🏆 RECEIPTS FC AWARDS
                        </div>
                        <div className="text-[11px] font-mono text-white/30 mt-0.5">
                            End of phase accountability ceremony
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/40 hover:text-white transition-colors text-xl"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-5 py-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="font-mono text-sm text-white/40 animate-pulse">
                                COMPILING RECEIPTS...
                            </div>
                        </div>
                    ) : (
                        <div className="prose prose-invert prose-sm max-w-none">
                            {roast.split("\n").map((line, i) =>
                                line.trim() ? (
                                    <p
                                        key={i}
                                        className={`text-sm leading-relaxed ${line.startsWith("1.") || line.startsWith("2.") || line.startsWith("3.") || line.startsWith("4.")
                                                ? "font-bold text-yellow-400 font-mono"
                                                : "text-white/80"
                                            }`}
                                    >
                                        {line}
                                    </p>
                                ) : (
                                    <br key={i} />
                                )
                            )}
                        </div>
                    )}
                </div>

                <div className="px-5 py-3 border-t border-white/10">
                    <p className="text-[10px] font-mono text-white/20 text-center">
                        Awards generated from Walrus Memory · All quotes are on-chain
                    </p>
                </div>
            </div>
        </div>
    );
}