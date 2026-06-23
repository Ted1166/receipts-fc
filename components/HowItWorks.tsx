"use client";

import { useState } from "react";

export function HowItWorks() {
    const [open, setOpen] = useState(false);

    return (
        <div className="border border-white/10 rounded overflow-hidden">
            <button
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-white/5 transition-colors"
            >
                <span className="text-[11px] font-mono font-bold text-white/50 tracking-widest">
                    HOW IT WORKS
                </span>
                <span className="text-white/30 text-xs">{open ? "▲" : "▼"}</span>
            </button>

            {open && (
                <div className="px-3 pb-3 space-y-3 border-t border-white/10">

                    {/* Step 1 */}
                    <div className="pt-3">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-yellow-400 font-mono font-black text-[10px]">01</span>
                            <span className="text-[11px] font-mono text-white/60 font-bold">TRIGGER MATCHDAY</span>
                        </div>
                        <p className="text-[11px] text-white/35 leading-snug">
                            Fetches the latest real World Cup result. Stores it in Walrus Memory under the Commissioner namespace as verifiable ground truth.
                        </p>
                    </div>

                    {/* Step 2 */}
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-yellow-400 font-mono font-black text-[10px]">02</span>
                            <span className="text-[11px] font-mono text-white/60 font-bold">PUNDITS REACT</span>
                        </div>
                        <p className="text-[11px] text-white/35 leading-snug">
                            Before each pundit speaks, <code className="text-yellow-400/70">recall()</code> fetches their prior statements from Walrus. Their take is generated with that memory injected — so they reference what they actually said before.
                        </p>
                    </div>

                    {/* Step 3 */}
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-yellow-400 font-mono font-black text-[10px]">03</span>
                            <span className="text-[11px] font-mono text-white/60 font-bold">MEMORY STORED</span>
                        </div>
                        <p className="text-[11px] text-white/35 leading-snug">
                            Each take is decomposed into atomic facts via <code className="text-yellow-400/70">analyze()</code> and stored as separate Walrus blobs — so future recall is precise, not fuzzy.
                        </p>
                    </div>

                    {/* Step 4 */}
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-yellow-400 font-mono font-black text-[10px]">04</span>
                            <span className="text-[11px] font-mono text-white/60 font-bold">COMMISSIONER WATCHES</span>
                        </div>
                        <p className="text-[11px] text-white/35 leading-snug">
                            After each match, the Commissioner sweeps all four pundit namespaces, finds contradictions between prior statements and the result, and reads them back verbatim — with blob IDs.
                        </p>
                    </div>

                    {/* Step 5 */}
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-yellow-400 font-mono font-black text-[10px]">05</span>
                            <span className="text-[11px] font-mono text-white/60 font-bold">THE RECEIPTS</span>
                        </div>
                        <p className="text-[11px] text-white/35 leading-snug">
                            Click <span className="text-white/50">🔍 MEMORY</span> on any message to see exactly which Walrus blobs were recalled before it was written, and which blobs were created after. Every claim is verifiable on-chain.
                        </p>
                    </div>

                    {/* Walrus badge */}
                    <div className="pt-1 border-t border-white/5 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        <span className="text-[10px] font-mono text-white/20">
                            Powered by Walrus Memory · Sui mainnet
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}