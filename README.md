# Receipts FC 🎙️⚽

> *The World Cup pundit chat where no one escapes their past takes.*

A tournament-long AI pundit group chat built on Walrus Memory. Four opinionated personas — the Stats Nerd, the Vibes Guy, the Contrarian, and the Homer — react to real World Cup 2026 results, remember everything they say, and get held accountable for it by the Commissioner.

The longer the tournament runs, the more useful the agent becomes — because it remembers.

---

## What It Does

Every pundit take is stored on Walrus as individually-recallable atomic facts. Before each pundit speaks, their prior statements are recalled from Walrus and injected into the prompt — so they reference what they actually said before, not a generic take. The Commissioner agent sweeps all four pundit namespaces after every match, finds contradictions between prior statements and the result, and reads them back verbatim with on-chain blob IDs.

By the knockout rounds the chat has a memory of itself: running records per pundit, callbacks, grudges, and a personal predictor profile for the user. At the end of each phase, an Awards Show roasts everyone — Most Accurate Pundit, Biggest Flip-Flop (two contradictory quotes cited side by side from chain), Most Stubborn, and a personal roast of the user's predictions.

---

## The Four Pundits

| Pundit | Personality |
|--------|-------------|
| 📊 **The Stats Nerd** | Speaks exclusively in xG, PPDA, and progressive passes. Smug when right. |
| ✨ **The Vibes Guy** | Analyzes purely on feeling, energy, and narrative. Occasionally right for the wrong reasons. |
| 🙃 **The Contrarian** | Reflexively takes the opposite position of the consensus. Genuinely believes he sees what others miss. |
| 🦁 **The Homer** | England will win. It's always coming home. No result can shake this. |
| ⚖️ **The Commissioner** | Holds everyone accountable. Pulls exact prior quotes from Walrus Memory and reads them back. No opinions, only receipts. |

---

## How Walrus Memory is Used

One `MemWalAccount`, one delegate key, five namespaces — one per pundit, one for the Commissioner.

| Operation | Where | What it does |
|-----------|-------|-------------|
| `analyze()` | After every pundit take | Decomposes the statement into atomic, individually-recallable facts stored as separate blobs |
| `recall()` | Before every pundit take | Fetches prior statements semantically relevant to the current match — injected into the prompt |
| `remember()` | After each match result | Stores the ground truth result in the Commissioner namespace |
| Cross-namespace `recall()` | Commissioner agent | Sweeps all four pundit namespaces to surface contradictions |
| Per-session `remember()` | User predictions | Stores predictions under a personal namespace — recalled for the end-of-tournament roast |

Every message in the UI has a **🔍 MEMORY** button that shows exactly which Walrus blob IDs were recalled before the message was generated, and which blobs were created after. Each blob links directly to the Walrus explorer — verifiable on-chain.

---

## Stack

- **Next.js 14** — App Router, TypeScript, Tailwind CSS
- **@mysten-incubation/memwal** — Walrus Memory TypeScript SDK
- **Anthropic Claude** (claude-sonnet-4-6) — pundit persona generation
- **football-data.org** — real World Cup 2026 match results (graceful mock fallback)
- In-memory state for structured data (W/L tallies) — per SDK documentation, semantic recall is not suited for deterministic key-based reads

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/receipts-fc
cd receipts-fc
npm install
cp .env.local.example .env.local
```

### 2. Get your credentials

**Walrus Memory** — [memory.walrus.xyz](https://memory.walrus.xyz)
- Connect a Sui wallet
- Create a MemWalAccount
- Generate a delegate key
- Copy the Account Object ID and delegate private key

**Anthropic** — [console.anthropic.com](https://console.anthropic.com)

**football-data.org** — [football-data.org/client/register](https://www.football-data.org/client/register) (optional — falls back to mock data)

### 3. Fill in `.env.local`

```env
MEMWAL_ACCOUNT_ID=0x<your-memwal-account-object-id>
MEMWAL_PRIVATE_KEY=<your-delegate-private-key-hex>
MEMWAL_SERVER_URL=https://relayer.memory.walrus.xyz
ANTHROPIC_API_KEY=sk-ant-...
FOOTBALL_DATA_API_KEY=<optional>
NEXT_PUBLIC_MEMWAL_ACCOUNT_ID=0x<same-account-object-id>
```

### 4. Run

```bash
npm run dev
# → http://localhost:3000
```

---

## Usage

**▶ TRIGGER MATCHDAY**
Fetches the latest finished World Cup match, stores the result in Walrus, generates all four pundit takes plus a Commissioner verdict. Messages appear automatically — no refresh needed.

**Chat with the pundits**
Type anything in the input. All four pundits respond, each after recalling relevant prior statements from their own Walrus namespace. After a few matchdays they start referencing what they actually said before.

**📋 PREDICTION MODE**
Toggle on before sending to store your prediction in your personal Walrus namespace. You will be held accountable at the Awards Show.

**🔍 MEMORY inspector**
Click on any pundit message to see which blob IDs were recalled before generation and which were created after, with direct links to the Walrus blob explorer and Sui object explorer.

**🏆 AWARDS**
After two or more matchdays, triggers the end-of-phase roast ceremony with citations pulled directly from Walrus Memory.

**▶ READ**
Every pundit message has a text-to-speech button. Each persona has a distinct voice profile — the Commissioner reads slowest, the Vibes Guy fastest.

---

## Project Structure

```
app/
├── api/
│   ├── matchday/     Fetch result → store in Walrus → generate all takes
│   ├── chat/         User message → recall → generate → analyze → store
│   ├── commissioner/ Manual contradiction trigger
│   ├── stats/        Leaderboard and contradiction feed
│   ├── awards/       End-of-phase roast
│   └── health/       Walrus Memory relayer health check
├── page.tsx          Main chat UI with auto-polling
lib/
├── memory/
│   ├── client.ts     MemWal singleton, namespace map
│   └── operations.ts remember, recall, analyze wrappers with fallbacks
├── pundits/
│   ├── personas.ts   Pundit profiles and prompt builders
│   └── generator.ts  Anthropic API calls grounded in recalled memory
├── db/state.ts       In-memory structured state (W/L tallies)
└── matches/fetcher.ts football-data.org + mock fallback
components/
├── MessageBubble.tsx  Broadcast chyron style, RECEIPTS stamp, TTS button
├── MemoryInspector.tsx Blob IDs, explorer links, recall provenance
├── Scoreboard.tsx     Pundit leaderboard, contradiction feed
├── AwardsModal.tsx    End-of-phase ceremony
└── HowItWorks.tsx     Collapsible explainer panel
public/
└── logo.svg          Club badge
```

---

## Deploy

```bash
npx vercel --prod
```

Add the environment variables in the Vercel dashboard under Project → Settings → Environment Variables. The `/api/health` endpoint verifies the Walrus Memory relayer is live.

---

## Reflection

`analyze()` decomposing each take into atomic facts is genuinely more powerful than storing raw text — semantic recall becomes precise enough to surface specific prior claims rather than whole paragraphs.

The known limitation: Walrus Memory's semantic recall is not suited for deterministic key-based lookups, so W/L tallies and structured state live in process memory. In a production version these would be backed by a database. The Commissioner's contradiction verdicts improve significantly from Day 4 onwards as the memory store fills up — the Day 1 experience is intentionally thin.

`analyze()` is LLM-mediated so contradiction detection is not perfect. It occasionally misses a real flip-flop or flags a non-contradiction. This is expected behavior and documented honestly here.