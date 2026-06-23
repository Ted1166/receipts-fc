"use client";

import { useState, useEffect, useRef } from "react";
import { MessageBubble } from "@/components/MessageBubble";
import { MemoryInspector } from "@/components/MemoryInspector";
import { Scoreboard } from "@/components/Scoreboard";
import { AwardsModal } from "@/components/AwardsModal";
import { HowItWorks } from "@/components/HowItWorks";

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

function getSessionId() {
  if (typeof window === "undefined") return "anon";
  const stored = localStorage.getItem("receipts_session");
  if (stored) return stored;
  const id = Math.random().toString(36).slice(2, 18);
  localStorage.setItem("receipts_session", id);
  return id;
}

function dedupeMessages(msgs: ChatMessage[]): ChatMessage[] {
  const seen = new Set<string>();
  return msgs.filter((m) => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });
}

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isPrediction, setIsPrediction] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMatchdayLoading, setIsMatchdayLoading] = useState(false);
  const [inspectedMessage, setInspectedMessage] = useState<ChatMessage | null>(null);
  const [showAwards, setShowAwards] = useState(false);
  const [sessionId, setSessionId] = useState("anon");
  const [stats, setStats] = useState<{
    pundits: Array<{
      punditId: string; name: string; emoji: string;
      correct: number; wrong: number; flips: number; accuracy: number | null;
    }>;
    contradictions: Array<{ punditId: string; punditName: string; topic: string; earlierStatement: string; laterStatement: string }>;
    totalMessages: number;
  } | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const messageCountRef = useRef(0);

  useEffect(() => {
    setSessionId(getSessionId());
  }, []);

  useEffect(() => {
    fetch("/api/chat?limit=100")
      .then((r) => r.json())
      .then((d) => {
        if (d.messages) {
          setMessages(dedupeMessages(d.messages));
          messageCountRef.current = d.messages.length;
        }
      });
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const r = await fetch("/api/chat?limit=100");
        const d = await r.json();
        if (d.messages && d.messages.length !== messageCountRef.current) {
          messageCountRef.current = d.messages.length;
          setMessages(dedupeMessages(d.messages));
          loadStats();
        }
      } catch { /* ignore */ }
    }, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadStats = async () => {
    const r = await fetch(`/api/stats?sessionId=${getSessionId()}`);
    const d = await r.json();
    setStats(d);
  };

  const handleMatchday = async () => {
    setIsMatchdayLoading(true);
    try {
      const r = await fetch("/api/matchday", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const d = await r.json();
      if (d.messages) {
        setMessages((prev) => dedupeMessages([...prev.filter(m => !m.id.startsWith("temp-")), ...d.messages]));
        messageCountRef.current = d.messages.length;
        loadStats();
      }
    } finally {
      setIsMatchdayLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    setInput("");
    setIsLoading(true);

    const tempId = "temp-" + Date.now();
    setMessages((prev) => dedupeMessages([...prev, {
      id: tempId, punditId: "user", message: text,
      timestamp: new Date().toISOString(),
    }]));

    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId, isPrediction }),
      });
      const d = await r.json();
      if (d.responses) {
        setMessages((prev) => dedupeMessages([
          ...prev.filter((m) => m.id !== tempId),
          ...d.responses,
        ]));
        loadStats();
      }
    } finally {
      setIsLoading(false);
      setIsPrediction(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a0f] text-white overflow-hidden">
      <aside className="hidden lg:flex flex-col w-72 border-r border-white/10 p-4 gap-4 overflow-y-auto shrink-0">
        <div className="flex flex-col items-center gap-1 mb-2">
          <img src="/logo.svg" alt="Receipts FC" className="w-36 h-auto" />
        </div>
        {stats && <Scoreboard stats={stats} onAwards={() => setShowAwards(true)} />}
        <HowItWorks />
        <button
          onClick={handleMatchday}
          disabled={isMatchdayLoading}
          className="mt-auto w-full py-3 bg-yellow-400 text-black font-bold font-mono text-sm tracking-wide rounded hover:bg-yellow-300 disabled:opacity-50 transition-colors"
        >
          {isMatchdayLoading ? "⏳ PROCESSING..." : "▶ TRIGGER MATCHDAY"}
        </button>
      </aside>

      <main className="flex flex-col flex-1 min-w-0">
        <header className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Receipts FC" className="w-8 h-8 rounded-full border border-yellow-400/30" />
            <span className="font-mono font-black text-yellow-400 text-lg tracking-tighter">RECEIPTS FC</span>
            <span className="text-xs text-white/40 font-mono hidden sm:block">WORLD CUP 2026</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAwards(true)}
              className="text-xs font-mono text-yellow-400 border border-yellow-400/30 px-3 py-1 rounded hover:bg-yellow-400/10 transition-colors"
            >
              🏆 AWARDS
            </button>
            <button
              onClick={handleMatchday}
              disabled={isMatchdayLoading}
              className="lg:hidden text-xs font-mono bg-yellow-400 text-black px-3 py-1 rounded font-bold hover:bg-yellow-300 disabled:opacity-50 transition-colors"
            >
              {isMatchdayLoading ? "..." : "▶ MATCHDAY"}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 text-white/30">
              <div className="text-6xl">⚽</div>
              <div className="font-mono text-sm">
                <p className="text-white/50 font-bold mb-1">THE CHAT IS EMPTY.</p>
                <p>Trigger a matchday to let the pundits loose.</p>
                <p className="mt-1 text-xs">They&apos;ll remember everything they say.</p>
              </div>
            </div>
          )}
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              onInspect={msg.blobIds?.length ? () => setInspectedMessage(msg) : undefined}
            />
          ))}
          {isLoading && (
            <div className="flex gap-2 px-4 py-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-white/30 animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-white/10 p-4 bg-[#0a0a0f]/80 backdrop-blur-sm shrink-0">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => setIsPrediction((v) => !v)}
                  className={`text-xs font-mono px-2 py-0.5 rounded border transition-colors ${isPrediction
                      ? "bg-yellow-400 text-black border-yellow-400 font-bold"
                      : "border-white/20 text-white/40 hover:border-white/40"
                    }`}
                >
                  📋 PREDICTION {isPrediction ? "ON" : "OFF"}
                </button>
                {isPrediction && (
                  <span className="text-xs text-yellow-400/70 font-mono">
                    Stored on Walrus — you will be held accountable
                  </span>
                )}
              </div>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder={
                  isPrediction
                    ? "Make a prediction (e.g. 'Brazil wins the group')"
                    : "Talk to the pundits..."
                }
                className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-sm font-mono placeholder-white/20 focus:outline-none focus:border-yellow-400/50 transition-colors"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="px-4 py-3 bg-yellow-400 text-black font-bold font-mono text-sm rounded hover:bg-yellow-300 disabled:opacity-40 transition-colors whitespace-nowrap"
            >
              SEND
            </button>
          </div>
        </div>
      </main>

      {inspectedMessage && (
        <MemoryInspector
          message={inspectedMessage}
          onClose={() => setInspectedMessage(null)}
        />
      )}

      {showAwards && <AwardsModal sessionId={sessionId} onClose={() => setShowAwards(false)} />}
    </div>
  );
}