"use client";

type PunditStat = {
    punditId: string;
    name: string;
    emoji: string;
    correct: number;
    wrong: number;
    flips: number;
    accuracy: number | null;
};

type ContradictionRecord = {
    punditId: string;
    punditName: string;
    topic: string;
    earlierStatement: string;
    laterStatement: string;
};

export function Scoreboard({
    stats,
    onAwards,
}: {
    stats: {
        pundits: PunditStat[];
        contradictions: ContradictionRecord[];
        totalMessages: number;
    };
    onAwards: () => void;
}) {
    const sorted = [...stats.pundits].sort(
        (a, b) => (b.accuracy ?? -1) - (a.accuracy ?? -1)
    );

    return (
        <div className="space-y-4">
            {/* Pundit leaderboard */}
            <div>
                <div className="text-[10px] font-mono text-white/30 tracking-widest mb-2">
                    PUNDIT STANDINGS
                </div>
                <div className="space-y-1.5">
                    {sorted.length === 0 ? (
                        <p className="text-xs text-white/20 font-mono">No data yet. Trigger a matchday.</p>
                    ) : (
                        sorted.map((p, i) => (
                            <div
                                key={p.punditId}
                                className="flex items-center justify-between text-xs font-mono"
                            >
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <span className="text-white/20 w-4 shrink-0">{i + 1}</span>
                                    <span className="text-sm shrink-0">{p.emoji}</span>
                                    <span className="text-white/70 truncate">{p.name.split(" ")[1]}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    {p.flips > 0 && (
                                        <span className="text-red-400 text-[10px]">🔄{p.flips}</span>
                                    )}
                                    <span className="text-white/40">
                                        {p.correct}W/{p.wrong}L
                                    </span>
                                    {p.accuracy !== null && (
                                        <span className="text-yellow-400 font-bold">{p.accuracy}%</span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Recent contradictions */}
            {stats.contradictions.length > 0 && (
                <div>
                    <div className="text-[10px] font-mono text-white/30 tracking-widest mb-2">
                        RECENT RECEIPTS
                    </div>
                    <div className="space-y-2">
                        {stats.contradictions.slice(-3).map((c, i) => (
                            <div
                                key={i}
                                className="bg-red-950/20 rounded border border-red-500/20 p-2"
                            >
                                <div className="text-[10px] font-mono text-red-400 mb-0.5">{c.punditName}</div>
                                <p className="text-[10px] text-white/40 italic leading-snug line-clamp-2">
                                    &ldquo;{c.earlierStatement}&rdquo;
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Stats footer */}
            <div className="pt-2 border-t border-white/5">
                <div className="flex justify-between text-[10px] font-mono text-white/25">
                    <span>{stats.totalMessages} messages</span>
                    <button
                        onClick={onAwards}
                        className="text-yellow-400/60 hover:text-yellow-400 transition-colors"
                    >
                        VIEW AWARDS →
                    </button>
                </div>
            </div>
        </div>
    );
}