"use client";

type Citation = { text: string; blobId: string; explorerUrl: string };
type ChatMessage = {
    id: string;
    punditId: string;
    message: string;
    matchContext?: string;
    timestamp: string;
    blobIds?: string[];
    citations?: Citation[];
    isContradiction?: boolean;
};

const PUNDIT_NAMES: Record<string, string> = {
    "pundit-stats": "The Stats Nerd",
    "pundit-vibes": "The Vibes Guy",
    "pundit-contrarian": "The Contrarian",
    "pundit-homer": "The Homer",
    commissioner: "The Commissioner",
};

export function MemoryInspector({
    message,
    onClose,
}: {
    message: ChatMessage;
    onClose: () => void;
}) {
    const name = PUNDIT_NAMES[message.punditId] ?? message.punditId;
    const accountId = process.env.NEXT_PUBLIC_MEMWAL_ACCOUNT_ID;

    return (
        <aside className="fixed inset-y-0 right-0 w-80 bg-[#0d0d14] border-l border-white/10 flex flex-col z-50 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div>
                    <div className="text-xs font-mono font-bold text-yellow-400 tracking-wider">
                        WALRUS MEMORY INSPECTOR
                    </div>
                    <div className="text-[11px] text-white/40 font-mono mt-0.5">{name}</div>
                </div>
                <button
                    onClick={onClose}
                    className="text-white/40 hover:text-white transition-colors text-lg leading-none"
                >
                    ✕
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Original statement */}
                <section>
                    <div className="text-[10px] font-mono text-white/30 tracking-widest mb-2">
                        STATEMENT STORED
                    </div>
                    <div className="bg-white/5 rounded p-3 border border-white/5">
                        <p className="text-xs text-white/80 leading-relaxed">{message.message}</p>
                    </div>
                </section>

                {/* Blob IDs — the actual Walrus receipts */}
                {message.blobIds && message.blobIds.length > 0 && (
                    <section>
                        <div className="text-[10px] font-mono text-white/30 tracking-widest mb-2">
                            WALRUS BLOB IDs ({message.blobIds.length} facts stored)
                        </div>
                        <div className="space-y-1.5">
                            {message.blobIds.map((blobId, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between bg-white/5 rounded p-2 border border-white/5"
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                                        <span className="text-[10px] font-mono text-white/50 truncate">
                                            {blobId.length > 20 ? `${blobId.slice(0, 10)}...${blobId.slice(-8)}` : blobId}
                                        </span>
                                    </div>
                                    <a
                                        href={`https://walruscan.com/mainnet/blob/${blobId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] font-mono text-blue-400 hover:text-blue-300 ml-2 shrink-0 transition-colors"
                                    >
                                        VIEW ↗
                                    </a>
                                </div>
                            ))}
                        </div>
                        <p className="text-[10px] text-white/25 font-mono mt-2">
                            Each blob is a separate atomic fact extracted by analyze()
                        </p>
                    </section>
                )}

                {/* What was recalled before generating */}
                {message.citations && message.citations.length > 0 && (
                    <section>
                        <div className="text-[10px] font-mono text-white/30 tracking-widest mb-2">
                            RECALLED BEFORE GENERATING ({message.citations.length})
                        </div>
                        <div className="space-y-2">
                            {message.citations.map((c, i) => (
                                <div
                                    key={i}
                                    className="bg-white/3 rounded p-2 border border-white/5 space-y-1"
                                >
                                    <p className="text-[11px] text-white/60 italic leading-snug">
                                        &ldquo;{c.text}&rdquo;
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-mono text-white/25 truncate max-w-[160px]">
                                            {c.blobId.slice(0, 12)}...
                                        </span>
                                        <a
                                            href={c.explorerUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[10px] font-mono text-blue-400 hover:text-blue-300 transition-colors"
                                        >
                                            VERIFY ↗
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Contradiction flag */}
                {message.isContradiction && (
                    <section className="bg-red-950/40 rounded border border-red-500/30 p-3">
                        <div className="text-[10px] font-mono font-bold text-red-400 tracking-widest mb-1">
                            ⚠ CONTRADICTION DETECTED
                        </div>
                        <p className="text-[11px] text-white/60">
                            A prior statement with high semantic similarity was recalled before generation.
                            The Commissioner has been notified.
                        </p>
                    </section>
                )}

                {/* Account info */}
                <section>
                    <div className="text-[10px] font-mono text-white/30 tracking-widest mb-2">
                        MEMWAL ACCOUNT
                    </div>
                    <div className="bg-white/5 rounded p-2 border border-white/5 space-y-1">
                        {accountId ? (
                            <>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-mono text-white/40">Object ID</span>
                                    <a
                                        href={`https://suiscan.xyz/mainnet/object/${accountId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] font-mono text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                        VIEW ON SUI ↗
                                    </a>
                                </div>
                                <p className="text-[10px] font-mono text-white/25 break-all">{accountId}</p>
                            </>
                        ) : (
                            <p className="text-[10px] font-mono text-white/30">
                                Set NEXT_PUBLIC_MEMWAL_ACCOUNT_ID to show explorer link
                            </p>
                        )}
                    </div>
                </section>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-white/10">
                <p className="text-[10px] text-white/20 font-mono text-center">
                    Memory encrypted via Seal · Stored on Walrus · Verified on Sui
                </p>
            </div>
        </aside>
    );
}