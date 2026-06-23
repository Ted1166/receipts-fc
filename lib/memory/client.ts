import { MemWal } from "@mysten-incubation/memwal";

export type PunditId =
    | "pundit-stats"
    | "pundit-vibes"
    | "pundit-contrarian"
    | "pundit-homer"
    | "commissioner";

export const PUNDIT_NAMESPACES: Record<PunditId, string> = {
    "pundit-stats": "receiptsfc-pundit-stats",
    "pundit-vibes": "receiptsfc-pundit-vibes",
    "pundit-contrarian": "receiptsfc-pundit-contrarian",
    "pundit-homer": "receiptsfc-pundit-homer",
    commissioner: "receiptsfc-commissioner",
};

export function userNamespace(sessionId: string): string {
    return `receiptsfc-user-${sessionId.toLowerCase().slice(0, 16)}`;
}

let _client: MemWal | null = null;

export function getMemWal(): MemWal {
    if (_client) return _client;
    const key = process.env.MEMWAL_PRIVATE_KEY;
    const accountId = process.env.MEMWAL_ACCOUNT_ID;
    if (!key || !accountId) {
        throw new Error(
            "Missing MEMWAL_PRIVATE_KEY or MEMWAL_ACCOUNT_ID. " +
            "Get these from https://memory.walrus.xyz and add to .env.local"
        );
    }
    _client = MemWal.create({
        key,
        accountId,
        serverUrl:
            process.env.MEMWAL_SERVER_URL ?? "https://relayer.memory.walrus.xyz",
    });
    return _client;
}