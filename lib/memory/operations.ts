import { getMemWal, PUNDIT_NAMESPACES, PunditId } from "./client";

export type MemoryCitation = {
  blobId: string;
  text: string;
  distance: number;
  explorerUrl: string;
};

export async function rememberPunditStatement(
  punditId: PunditId,
  statement: string,
  matchContext: string
): Promise<{ blobIds: string[]; facts: string[] }> {
  const memwal = getMemWal();
  const ns = PUNDIT_NAMESPACES[punditId];
  const content = `[Match: ${matchContext}] ${statement}`;

  try {
    const result = await memwal.analyze(content, ns);
    return {
      blobIds: result.job_ids ?? [],
      facts: result.facts?.map((f) => f.text) ?? [],
    };
  } catch (e) {
    console.warn(`analyze() failed for ${punditId}, falling back to remember():`, e);
    try {
      const job = await memwal.remember(content, ns);
      return { blobIds: [job.job_id], facts: [statement] };
    } catch (e2) {
      console.warn(`remember() fallback also failed for ${punditId}:`, e2);
      return { blobIds: [], facts: [] };
    }
  }
}

export async function rememberMatchResult(matchSummary: string): Promise<string> {
  const memwal = getMemWal();
  const ns = PUNDIT_NAMESPACES["commissioner"];
  try {
    const job = await memwal.remember(matchSummary, ns);
    return job.job_id;
  } catch (e) {
    console.warn("rememberMatchResult failed:", e);
    return "";
  }
}

export async function recallPunditMemory(
  punditId: PunditId,
  query: string,
  limit = 5
): Promise<MemoryCitation[]> {
  const memwal = getMemWal();
  const ns = PUNDIT_NAMESPACES[punditId];
  try {
    const result = await memwal.recall({ query, namespace: ns, limit });
    return result.results.map((r) => ({
      blobId: r.blob_id,
      text: r.text,
      distance: r.distance,
      explorerUrl: `https://walruscan.com/mainnet/blob/${r.blob_id}`,
    }));
  } catch (e) {
    console.warn(`recallPunditMemory failed for ${punditId}:`, e);
    return [];
  }
}

export async function recallAllPunditsOnTopic(
  query: string,
  limit = 3
): Promise<Record<PunditId, MemoryCitation[]>> {
  const punditIds: PunditId[] = [
    "pundit-stats",
    "pundit-vibes",
    "pundit-contrarian",
    "pundit-homer",
  ];

  const results = await Promise.all(
    punditIds.map((id) => recallPunditMemory(id, query, limit))
  );

  return Object.fromEntries(
    punditIds.map((id, i) => [id, results[i]])
  ) as Record<PunditId, MemoryCitation[]>;
}

export async function rememberUserPrediction(
  sessionId: string,
  prediction: string,
  matchContext: string
): Promise<string> {
  const memwal = getMemWal();
  const ns = `receiptsfc-user-${sessionId.slice(0, 16)}`;
  try {
    const job = await memwal.remember(
      `[User Prediction | ${matchContext}] ${prediction}`,
      ns
    );
    return job.job_id;
  } catch (e) {
    console.warn("rememberUserPrediction failed:", e);
    return "";
  }
}

export async function recallUserHistory(
  sessionId: string,
  query: string,
  limit = 10
): Promise<MemoryCitation[]> {
  const memwal = getMemWal();
  const ns = `receiptsfc-user-${sessionId.slice(0, 16)}`;
  try {
    const result = await memwal.recall({ query, namespace: ns, limit });
    return result.results.map((r) => ({
      blobId: r.blob_id,
      text: r.text,
      distance: r.distance,
      explorerUrl: `https://walruscan.com/mainnet/blob/${r.blob_id}`,
    }));
  } catch (e) {
    console.warn("recallUserHistory failed:", e);
    return [];
  }
}