export type PunditStats = {
    punditId: string;
    correct: number;
    wrong: number;
    flips: number;
};

export type MatchRecord = {
    id: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    matchDate: string;
    stage: string;
    group?: string;
    blobId?: string;
};

export type UserPrediction = {
    sessionId: string;
    matchId: string;
    prediction: string;
    outcome: "correct" | "wrong" | "pending";
    blobId?: string;
};

export type ContradictionRecord = {
    punditId: string;
    earlierStatement: string;
    earlierBlobId: string;
    laterStatement: string;
    laterBlobId: string;
    detectedAt: string;
    topic: string;
};

const state = {
    punditStats: new Map<string, PunditStats>(),
    matches: new Map<string, MatchRecord>(),
    userPredictions: new Map<string, UserPrediction[]>(),
    contradictions: [] as ContradictionRecord[],
    chatMessages: [] as ChatMessage[],
};

export type ChatMessage = {
    id: string;
    punditId: string;
    message: string;
    matchContext?: string;
    timestamp: string;
    blobIds?: string[];
    citations?: Array<{ text: string; blobId: string; explorerUrl: string }>;
    isContradiction?: boolean;
};

// --- Pundit stats ---
export function getPunditStats(punditId: string): PunditStats {
    if (!state.punditStats.has(punditId)) {
        state.punditStats.set(punditId, {
            punditId,
            correct: 0,
            wrong: 0,
            flips: 0,
        });
    }
    return state.punditStats.get(punditId)!;
}

export function allPunditStats(): PunditStats[] {
    return Array.from(state.punditStats.values());
}

export function recordPunditOutcome(
    punditId: string,
    outcome: "correct" | "wrong"
) {
    const stats = getPunditStats(punditId);
    if (outcome === "correct") stats.correct++;
    else stats.wrong++;
}

export function recordFlip(punditId: string) {
    getPunditStats(punditId).flips++;
}

// --- Matches ---
export function upsertMatch(match: MatchRecord) {
    state.matches.set(match.id, match);
}

export function getMatch(id: string): MatchRecord | undefined {
    return state.matches.get(id);
}

export function allMatches(): MatchRecord[] {
    return Array.from(state.matches.values()).sort(
        (a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime()
    );
}

export function latestMatch(): MatchRecord | undefined {
    return allMatches()[0];
}

// --- User predictions ---
export function addUserPrediction(pred: UserPrediction) {
    const existing = state.userPredictions.get(pred.sessionId) ?? [];
    existing.push(pred);
    state.userPredictions.set(pred.sessionId, existing);
}

export function getUserPredictions(sessionId: string): UserPrediction[] {
    return state.userPredictions.get(sessionId) ?? [];
}

// --- Contradictions ---
export function addContradiction(c: ContradictionRecord) {
    state.contradictions.push(c);
    recordFlip(c.punditId);
}

export function getContradictions(
    punditId?: string
): ContradictionRecord[] {
    if (punditId)
        return state.contradictions.filter((c) => c.punditId === punditId);
    return state.contradictions;
}

// --- Chat messages ---
export function addChatMessage(msg: ChatMessage) {
    state.chatMessages.push(msg);
}

export function getChatMessages(limit = 50): ChatMessage[] {
    return state.chatMessages.slice(-limit);
}

export function clearChat() {
    state.chatMessages = [];
}