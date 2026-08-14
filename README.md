# DEVLORE ✦ *Your commits. Your legend.*

> **Drop this folder into any GitHub repository to begin your saga.**

Every line of code you write is a chapter in an epic story. DevLore transforms your real GitHub commit history into a personalized fantasy narrative — with AI-generated weekly chronicles, collectible lore cards, and a hero identity unique to you.

---

## ⚡ Quick Start (2 minutes)

### Step 1 — Connect Your Account

1. Visit **[devlore.app](https://devlore.app)** and sign in with GitHub
2. Your **Origin Story** is generated automatically — your hero class, title, and first chapter appear within 60 seconds

### Step 2 — Drop This Folder Into Your Repo

This folder contains a GitHub Action that notifies DevLore whenever you push code, keeping your saga current automatically.

```bash
# From your repository root:
cp -r path/to/devlore/.github .github
# or just copy the devlore/ folder directly into your repo
```

### Step 3 — Add Your Token

1. Go to **[devlore.app/dashboard/settings](https://devlore.app/dashboard/settings)**
2. Copy your **DevLore Token**
3. In your GitHub repo: **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `DEVLORE_TOKEN`
   - Value: *(paste your token)*

That's it. Every push now writes a new act in your legend. 🔥

---

## ✨ What You Get

| | Free | Pro ($9/mo) | Legend ($19/mo) |
|---|:---:|:---:|:---:|
| Origin story & hero class | ✅ | ✅ | ✅ |
| Weekly saga chapters | Last 2 | Unlimited | Unlimited |
| Lore card collection | 3 starter | Up to 50 | Unlimited |
| Public Codex page | Basic | Full | Full + analytics |
| Chronicle email (weekly) | — | ✅ | ✅ |
| Private repo analysis | — | — | ✅ |
| 14-day free trial | — | ✅ | ✅ |

---

## 🏛 The 12 Hero Classes

Your class is determined by your coding behavior — no surveys, no choices. The algorithm reads your patterns and assigns you a class. Some possibilities:

| Class | Forged By |
|---|---|
| **Arcane Architect** | TypeScript / Java mastery |
| **Script Sorcerer** | Python / Ruby enchantments |
| **Shell Wraith** | Go / Bash command-line arts |
| **Pixel Paladin** | CSS / Vue / Svelte interface craft |
| **Data Druid** | SQL / R / Jupyter sorcery |
| **Iron Forger** | Rust / C++ raw metal work |
| **Cloud Wanderer** | Terraform / infrastructure drift |
| **Night Wraith** | Commits after midnight |
| **Chaos Mage** | 8+ languages, limitless curiosity |
| **Lore Keeper** | Documentation dedication |
| **The Architect** | One massive, perfect system |
| **Open Sage** | Open-source contributions |

---

## 🔮 How the Saga Works

Your saga is built from real data:

- **Commit messages** become plot beats ("Fixed authentication bug" → "The corrupted gate was sealed at last")
- **PRs merged** become battles won
- **New repos** become new realms claimed
- **Streaks** become legendary feats
- **Languages** become schools of arcane magic

The AI narrator never breaks the fourth wall — it speaks entirely in fantasy metaphor, grounded in your actual activity.

---

## 🔒 Privacy

- **Public repos only** (free/pro) — we only read what GitHub already makes public
- **Private repos** — available on Legend tier via GitHub App installation (you control permissions)
- **Your data** — delete your account at any time; all data purged immediately
- **Webhooks** — we only receive push notifications, never read your actual code

---

## 🛠 Self-Hosting

DevLore is designed to be self-hosted. See the full setup guide:

```bash
git clone https://github.com/yourorg/devlore
cd devlore
cp .env.example .env.local
# Fill in your API keys (see .env.example for all required variables)
npm install
npx prisma db push
npm run dev
```

**Required services:**
- PostgreSQL (Supabase / Neon / Railway — all have free tiers)
- Google AI Studio API key (Gemini 2.0 Flash)
- GitHub OAuth App
- Stripe account (test mode for development)
- Inngest account (free tier: 50K runs/month)

---

## 📜 The Drop-In Structure

```
devlore/
├── README.md                         ← This file
└── .github/
    └── workflows/
        └── devlore-sync.yml          ← Notifies DevLore on every push
```

The GitHub Action is the only file required. It calls a webhook with push metadata — it never reads your code, only your commit actor, repo name, and SHA.

---

*Built with ✦ and TypeScript. Your legend awaits.*

[devlore.app](https://devlore.app) · [Privacy](https://devlore.app/privacy) · [Terms](https://devlore.app/terms)
