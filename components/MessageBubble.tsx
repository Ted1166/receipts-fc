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

const PUNDIT_CONFIG: Record<string, { name: string; emoji: string; color: string; border: string; nameColor: string }> = {
    "pundit-stats": {
        name: "THE STATS NERD",
        emoji: "📊",
        color: "bg-blue-950/60",
        border: "border-blue-500/30",
        nameColor: "text-blue-400",
    },
    "pundit-vibes": {
        name: "THE VIBES GUY",
        emoji: "✨",
        color: "bg-purple-950/60",
        border: "border-purple-500/30",
        nameColor: "text-purple-400",
    },
    "pundit-contrarian": {
        name: "THE CONTRARIAN",
        emoji: "🙃",
        color: "bg-orange-950/60",
        border: "border-orange-500/30",
        nameColor: "text-orange-400",
    },
    "pundit-homer": {
        name: "THE HOMER",
        emoji: "🦁",
        color: "bg-red-950/60",
        border: "border-red-500/30",
        nameColor: "text-red-400",
    },
    commissioner: {
        name: "THE COMMISSIONER",
        emoji: "⚖️",
        color: "bg-yellow-950/60",
        border: "border-yellow-500/50",
        nameColor: "text-yellow-400",
    },
    user: {
        name: "YOU",
        emoji: "👤",
        color: "bg-white/5",
        border: "border-white/10",
        nameColor: "text-white/60",
    },
};

export function MessageBubble({
    message,
    onInspect,
}: {
    message: ChatMessage;
    onInspect?: () => void;
}) {
    const config = PUNDIT_CONFIG[message.punditId] ?? {
        name: message.punditId.toUpperCase(),
        emoji: "🎙️",
        color: "bg-white/5",
        border: "border-white/10",
        nameColor: "text-white/60",
    };

    const isUser = message.punditId === "user";
    const isCommissioner = message.punditId === "commissioner";
    const hasCitations = message.citations && message.citations.length > 0;

    return (
        <div className={`relative rounded border ${config.border} ${config.color} p-3 ${isUser ? "ml-8" : ""}`}>
            {/* Contradiction stamp */}
            {message.isContradiction && (
                <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black font-mono px-2 py-0.5 rounded rotate-2 tracking-widest z-10">
                    RECEIPTS
                </div>
            )}

            {/* Commissioner gets a special top bar */}
            {isCommissioner && (
                <div className="flex items-center gap-1 mb-2 pb-2 border-b border-yellow-500/20">
                    <div className="w-1 h-4 bg-yellow-400 rounded" />
                    <span className="text-[10px] font-mono font-bold text-yellow-400 tracking-widest">
                        OFFICIAL VERDICT
                    </span>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                    <span className="text-base leading-none">{config.emoji}</span>
                    <span className={`text-[11px] font-black font-mono tracking-wider ${config.nameColor}`}>
                        {config.name}
                    </span>
                    {message.matchContext && (
                        <span className="text-[10px] text-white/25 font-mono hidden sm:block truncate max-w-[180px]">
                            · {message.matchContext}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] text-white/20 font-mono">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {onInspect && (
                        <button
                            onClick={onInspect}
                            title="Inspect Walrus memory"
                            className="text-[10px] font-mono text-white/25 hover:text-yellow-400 border border-white/10 hover:border-yellow-400/40 px-1.5 py-0.5 rounded transition-colors"
                        >
                            🔍 MEMORY
                        </button>
                    )}
                </div>
            </div>

            {/* Message body */}
            <p className="text-sm text-white/90 leading-relaxed font-sans">{message.message}</p>

            {/* Prior citations — what was recalled before generating this response */}
            {hasCitations && !isUser && (
                <div className="mt-2 pt-2 border-t border-white/5">
                    <div className="text-[10px] font-mono text-white/30 mb-1">
                        RECALLED FROM WALRUS MEMORY:
                    </div>
                    <div className="space-y-1">
                        {message.citations!.slice(0, 2).map((c, i) => (
                            <div key={i} className="flex items-start gap-1.5">
                                <span className="text-white/20 text-[10px] mt-0.5 font-mono shrink-0">↩</span>
                                <p className="text-[11px] text-white/40 italic leading-snug line-clamp-1">
                                    &ldquo;{c.text}&rdquo;
                                </p>
                                <a
                                    href={c.explorerUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="shrink-0 text-[10px] font-mono text-blue-400/50 hover:text-blue-400 transition-colors"
                                    title="View blob on Walrus explorer"
                                >
                                    ↗
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}