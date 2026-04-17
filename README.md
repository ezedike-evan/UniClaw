# UniClaw 🦅

AI-powered campus assistant for University of Lagos (UNILAG) students — Telegram Bot + Mini App, powered by Claude.

## Architecture

```
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│  Telegram User  │◄──┤  UniClaw Bot    │──►│  Claude API     │
│  (chat + mini)  │   │  (GrammY + TS)  │   │  (sonnet-4)     │
└─────────────────┘   └────────┬────────┘   └─────────────────┘
                               │
                               ▼
                      ┌─────────────────┐
                      │  Knowledge Base │
                      │  (markdown)     │
                      └─────────────────┘
                               ▲
                               │
┌─────────────────┐            │
│  Telegram Mini  │────────────┘
│  App (React)    │
└─────────────────┘
```

## Project layout

```
uniclaw/
├── bot/         GrammY Telegram bot (TypeScript)
├── miniapp/     React + Vite Telegram Mini App
├── knowledge/   Seeded UNILAG knowledge base (markdown)
└── docker-compose.yml
```

## Prerequisites

- Node.js 20+
- A Telegram Bot token (from [@BotFather](https://t.me/BotFather))
- An Anthropic API key ([console.anthropic.com](https://console.anthropic.com))
- A public URL to host the Mini App (Vercel, Netlify, Railway, etc.)

## Setup

### 1. Bot

```bash
cd bot
cp .env.example .env       # fill in TELEGRAM_BOT_TOKEN, ANTHROPIC_API_KEY, MINI_APP_URL
npm install
npm run dev
```

### 2. Mini App

```bash
cd miniapp
npm install
npm run dev                # local dev at http://localhost:5173
npm run build              # production build → dist/
```

### 3. Register Mini App with BotFather

In @BotFather, run `/newapp`, choose your bot, upload an icon, and set the URL to your deployed Mini App (the `MINI_APP_URL` in bot `.env`).

## Docker

```bash
docker-compose up --build
```

## Bot commands

| Command | Description |
|---|---|
| `/start` | Welcome + Mini App launch button |
| `/ask [question]` | Ask Claude anything about UNILAG |
| `/timetable` | Course timetable info |
| `/hostel` | Hostel availability, pricing, application |
| `/events` | Current & upcoming campus events |
| `/exams` | Exam schedules & results portal links |
| `/food` | Food spots on campus |
| `/contacts` | Faculty & admin contacts |
| `/contribute` | Submit new data to the knowledge base |
| `/help` | Full command list |

Natural-language messages (non-commands) are also routed to Claude with UNILAG grounding.

## Knowledge base

All verified UNILAG information lives in `/knowledge/*.md`. Each file follows a standard schema with sections, FAQs, official links, and **Data Gaps** (things we need community contributions for).

Anything marked `[VERIFY]` should not be stated as fact — Claude treats these as uncertain.

To update or add info:

1. Edit the relevant `.md` file.
2. Restart the bot — knowledge is loaded once at startup and cached.

## Contributing data

Students can contribute via `/contribute` in the bot or the Mini App's Contribute tab. Submissions are appended to `bot/contributions.log.json` for admin review.

## Environment variables

See `bot/.env.example`. Key variables:

- `TELEGRAM_BOT_TOKEN` — from BotFather
- `ANTHROPIC_API_KEY` — from Anthropic console
- `MINI_APP_URL` — public URL of the deployed Mini App
- `PORT` — bot HTTP port (default 3000) for streaming endpoints used by the Mini App

## License

MIT.
