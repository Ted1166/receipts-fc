export type Match = {
    id: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number | null;
    awayScore: number | null;
    matchDate: string;
    status: "SCHEDULED" | "LIVE" | "IN_PLAY" | "PAUSED" | "FINISHED" | "TIMED";
    stage: string;
    group?: string;
};

const FOOTBALL_API_BASE = "https://api.football-data.org/v4";
const WC_CODE = "WC";

async function fetchFromFootballData(path: string) {
    const apiKey = process.env.FOOTBALL_DATA_API_KEY;
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (apiKey) {
        headers["X-Auth-Token"] = apiKey;
    }

    const res = await fetch(`${FOOTBALL_API_BASE}${path}`, { headers });
    if (!res.ok) {
        throw new Error(`football-data.org error: ${res.status} ${res.statusText}`);
    }
    return res.json();
}

export async function getRecentMatches(limit = 5): Promise<Match[]> {
    try {
        const data = await fetchFromFootballData(
            `/competitions/${WC_CODE}/matches?status=FINISHED&limit=${limit}`
        );
        return (data.matches ?? []).slice(-limit).map(normalizeMatch);
    } catch (e) {
        console.warn("football-data.org unavailable, using mock data:", e);
        return getMockMatches();
    }
}

export async function getUpcomingMatches(limit = 3): Promise<Match[]> {
    try {
        const data = await fetchFromFootballData(
            `/competitions/${WC_CODE}/matches?status=SCHEDULED,TIMED&limit=${limit}`
        );
        return (data.matches ?? []).slice(0, limit).map(normalizeMatch);
    } catch (e) {
        console.warn("football-data.org unavailable, using mock data:", e);
        return [];
    }
}

export async function getLiveMatches(): Promise<Match[]> {
    try {
        const data = await fetchFromFootballData(
            `/competitions/${WC_CODE}/matches?status=LIVE,IN_PLAY,PAUSED`
        );
        return (data.matches ?? []).map(normalizeMatch);
    } catch (e) {
        return [];
    }
}

function normalizeMatch(m: any): Match {
    return {
        id: String(m.id),
        homeTeam: m.homeTeam?.shortName ?? m.homeTeam?.name ?? "Home",
        awayTeam: m.awayTeam?.shortName ?? m.awayTeam?.name ?? "Away",
        homeScore: m.score?.fullTime?.home ?? null,
        awayScore: m.score?.fullTime?.away ?? null,
        matchDate: m.utcDate,
        status: m.status,
        stage: m.stage,
        group: m.group ?? undefined,
    };
}

export function matchToContextString(match: Match): string {
    if (match.homeScore !== null && match.awayScore !== null) {
        return `${match.homeTeam} ${match.homeScore}–${match.awayScore} ${match.awayTeam} (${match.stage}${match.group ? ` ${match.group}` : ""})`;
    }
    return `${match.homeTeam} vs ${match.awayTeam} (${match.stage}${match.group ? ` ${match.group}` : ""})`;
}

function getMockMatches(): Match[] {
    return [
        {
            id: "mock-1",
            homeTeam: "Brazil",
            awayTeam: "Argentina",
            homeScore: 1,
            awayScore: 2,
            matchDate: new Date(Date.now() - 2 * 86400000).toISOString(),
            status: "FINISHED",
            stage: "GROUP_STAGE",
            group: "GROUP_C",
        },
        {
            id: "mock-2",
            homeTeam: "France",
            awayTeam: "Germany",
            homeScore: 3,
            awayScore: 1,
            matchDate: new Date(Date.now() - 1 * 86400000).toISOString(),
            status: "FINISHED",
            stage: "GROUP_STAGE",
            group: "GROUP_D",
        },
        {
            id: "mock-3",
            homeTeam: "England",
            awayTeam: "Spain",
            homeScore: 0,
            awayScore: 2,
            matchDate: new Date().toISOString(),
            status: "FINISHED",
            stage: "GROUP_STAGE",
            group: "GROUP_B",
        },
    ];
}