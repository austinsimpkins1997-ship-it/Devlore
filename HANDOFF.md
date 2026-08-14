# DEVLORE — Session Handoff

**Status: code complete, NOT yet built, NOT yet deployed.**
Read "What I could not do" before you run anything.

---

## Run this first (one command)

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy.ps1
```

It runs, in order: `prisma generate` → `prisma db push` → `npm run build` → `git commit` → `git push origin master`.
It stops at the first failure and tells you which step broke.

If Vercel is connected to the GitHub repo, the push triggers the deploy. If not: `npx vercel --prod`.

**The schema change is additive only** — 7 new tables and 6 new `User` columns, all with defaults.
No existing column is dropped or retyped, so current users, chapters, and lore cards are preserved.

---

## What I could not do (and why)

The Linux sandbox I use for shell commands failed to start for the entire session
("RPC pipe closed"), and I retried it repeatedly. That means I could **not**:

- run `npm run build`, `next lint`, or `tsc`
- run `prisma generate` / `prisma db push`
- start the dev server and click through the site
- run `git push` or trigger a Vercel deploy

So I cannot claim the build is clean or that the site is deployed — I have not seen
either happen. What I did instead: wrote everything against the actual files in your
repo, cross-checked every import and Prisma relation by reading the code back, and put
the shell steps into `deploy.ps1` so they run in the right order with real error checks.

`next.config.ts` still has `ignoreBuildErrors: true` and `ignoreDuringBuilds: true`.
I deliberately left those ON. Turning them off without being able to run the build once
could hand you a broken overnight deploy. Once `deploy.ps1` succeeds, flip them to
`false` and run it again to get a genuinely warning-free build.

---

## The two dev-server errors you sent

**1. "Network error — check the dev server" on Generate Chapter**

Not a network problem. `/api/github/generate-chapter` had no outer try/catch, so when
anything inside threw (most likely the Gemini call — see below), Next returned an HTML
error page. The client then did `res.json()` on HTML, which throws, and the client's
`catch` block prints "Network error".

Fixed: the whole handler is wrapped and always returns JSON. The AI call now falls back
to a deterministic, stats-derived chapter instead of throwing.

**2. "An analysis is already in progress"**

A stale lock. An `Analysis` row was left in `RUNNING` after a dev-server restart killed
the request mid-flight, and nothing ever cleared it.

Fixed: a watchdog marks any `PENDING`/`RUNNING` analysis older than 10 minutes as
`FAILED` before the check runs, so it self-heals.

**Likely root cause of both — your `GEMINI_API_KEY`.**
`.env` has `GEMINI_API_KEY=AQ.Ab8RN6IATa_wQY36xzHmnzA9UD2m60Iwb11eihZf6hexOg_0uw`.
Google AI Studio keys start with `AIza`. I could not test the key (no shell), so treat
this as a strong suspicion, not a confirmed fact. Either way the site now works without
it — every AI path falls back to generated prose — but replace it to get real AI writing.

---

## Multi-provider AI with free-tier failover

DevLore no longer depends on one AI vendor. Requests go through `lib/ai/client.ts`,
which walks a provider chain and moves to the next one on a rate limit, quota error,
timeout, or outage. If every provider fails, the deterministic writer in
`lib/narrative/fallback.ts` takes over — the feature never hard-stops.

**Providers supported** (all have free tiers; add as many keys as you like):

| Provider | Key env | Notes |
|---|---|---|
| Google AI Studio | `GEMINI_API_KEY` | Free on Flash / Flash-Lite. Keys start with `AIza`. |
| Groq | `GROQ_API_KEY` | Free, no credit card. Fastest of the group. |
| Cerebras | `CEREBRAS_API_KEY` | Free daily token allowance. |
| Mistral | `MISTRAL_API_KEY` | Generous free tier; requires opting into training. |
| OpenRouter | `OPENROUTER_API_KEY` | Many free models; low daily cap until $10 credited. |

Only Gemini uses an SDK (already a dependency). The other four speak the OpenAI
chat-completions protocol, so they share one adapter — **no new npm packages**, which
also means nothing new to install before building.

**Recommended setup:** get a Groq key (60 seconds, no card) and put it first:

```
GROQ_API_KEY=gsk_...
AI_PROVIDER_ORDER=groq,gemini,cerebras,mistral,openrouter
```

That gives you a working AI path immediately, independent of the Gemini key problem.

**Operational details worth knowing:**
- Every model ID is env-overridable (`GROQ_MODEL`, `GEMINI_MODEL`, …). Providers rename
  models fairly often; when one 404s you can swap it in the Vercel dashboard without a
  code change.
- A provider that returns 429/402/5xx is put in a 5-minute cooldown and skipped. The
  cooldown is in-memory, so it's per serverless instance and resets on cold start —
  deliberate: no extra infrastructure, and the worst case is one wasted call that
  immediately fails over.
- JSON parsing tolerates markdown fences and leading prose, since the non-Gemini models
  are less strict about JSON mode than Gemini is.
- **Check what's actually live:** sign in, then open `/api/ai/status?probe=1`. It shows
  each provider's configured/not-configured state, the model in use, which provider
  served the probe, and anything it failed over from. It never returns key material.

**Cost note:** free tiers are fine for you and early users, but weekly chronicle
generation across a real user base will blow past ~1,000 requests/day. Stacking several
free providers buys real headroom, and the failover chain means adding a paid key later
is a one-line env change rather than a refactor.

---

## What was built

### Quests & milestones (DB-backed, replaces the static stub)
- `lib/quests/` — 11 quests across daily / weekly / milestone cadences
- Progress is **recomputed server-side** from real data on every read and again at claim
  time; the client is never trusted
- Claims are transactional and replay-safe (`@@unique([userId, questSlug, periodKey])`),
  so double-clicking cannot double-award XP
- Daily quests reset by UTC day, weekly by ISO week — no cron needed
- `MilestonesPanel` on dashboard + public codex

### Weekly automated trophies
- Monday cron now awards three trophies for the week that just ended:
  **Champion's Quill** (best Forge submission), Relentless Flame (most Forge XP),
  Unbroken Chain (longest streak)
- `@@unique([kind, weekKey])` makes it idempotent — a double cron run is a no-op
- Winners get XP, a legendary/epic lore card, and a trophy case entry

### The Forge (was a no-op, now real)
- Submissions **persist** to a new `ForgeEntry` table and award XP + lore cards
- This is what makes quests and trophies possible — before this, "Save" just reloaded

### Equipment & loot
- One drop per level gained, in RARE / EPIC / UNIQUE / LEGENDARY
- 4 slots × 4 rarities × 3 named forms = 48 distinct items
- Drops are deterministic (seeded on `userId:level`) and unique-constrained, so retries
  and replays cannot duplicate loot
- Every XP path — forge, quests, trophies, chapters (both manual and Inngest) — routes
  through one `awardXpWithLoot()` helper, so progression can't drift between them
- Existing users get their full loot history backfilled on next re-analysis

### Character creator + RuneScape-style equipment UI
- First login opens a character creator (build, skin, hair, cloak, aura)
- Paper-doll SVG avatar that visibly changes as you equip gear — pure SVG, no assets
- Equipment panel with 4 clickable slots flanking the doll, click-to-equip inventory,
  and a live stat sheet: **Might / Wisdom / Endurance / Fortune**
- Bonuses are itemized and earned: active streak, peak streak, lifetime commits,
  languages, open-source contributions, trophies — plus a tier multiplier
  (Pro +10%, Legend +25%) so higher-achieving and paying coders are genuinely stronger

### Arena (was mock data, now real)
- Live head-to-head from the database with a published formula:
  `XP + commits×2 + streak×50 + level×100 + trophies×500 + gear power`
- Honest error when a username hasn't joined DevLore, instead of fake stats

### Leaderboard + Hall of Heroes
- `/leaderboard` — Hall of Champions, top XP, longest streaks, weekly Forge XP
- `/heroes` — searchable, sortable, paginated directory of every public hero
- Both respect `isPublic` and show Pro/Legend flair

### Social
- Friend requests with accept/decline; a reverse request auto-accepts instead of
  creating a duplicate row
- Friends-only DMs with unread counts, HTML stripping, and a 60/hour rate limit
- Kudos (one per pair) on public codex pages
- Fellowship tab on the dashboard

### Contribution badges
- 10 badges derived on read from verified GitHub stats — nothing to fake, no new tables

### Monetization
Paid tiers now gate things people actually feel, rather than unbuilt promises:
- **Pro $5** — automatic weekly chronicles, unlimited history, weekly quest XP claims,
  chronicle emails
- **Legend $15** — 1.5× XP on every quest claim, unlimited cards, leaderboard flair

I removed the pricing table's annual/monthly toggle: it changed the displayed price but
Stripe only has monthly price IDs, so it was quoting numbers you couldn't actually
charge. Prices now match `lib/stripe.ts` ($5 / $15). The old table also advertised
custom domains, API access, and animated cards — none of which exist. Selling those
would be a refund and chargeback problem, so I replaced them with shipped features.

---

## Please verify after deploying

1. Sign in with a fresh account → character creator appears → dashboard loads
2. Forge tab → submit an entry → XP rises, entry persists after refresh
3. Quests tab → complete "Chronicle Keeper" → Claim XP works → second click is refused
4. Character tab → equip/unequip gear → avatar and stats update
5. `/leaderboard` and `/heroes` load with real data
6. Arena → compare two real DevLore usernames
7. Add a friend from `/heroes` → accept → exchange a message

The weekly trophy path can't be verified until a Monday cron run. To test it early, call
`GET /api/cron/weekly` with header `Authorization: Bearer <CRON_SECRET>` — it's
idempotent, so a manual test won't cause double awards on Monday.

---

## Known gaps (unchanged, still open)

- `nightCommitRatio` still hardcoded to `0.15` (TODO left in place, as instructed)
- `totalPRs` / `totalIssues` still `0` — needs GraphQL pagination
- Chronicle emails still use inline HTML, not the React template
- Private repo analysis (GitHub App install flow) still not built
- Team sagas and PDF export still not built — I removed them from pricing copy rather
  than continue advertising them
