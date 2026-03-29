# ReRoute

**Your AI travel agent that fights for you when flights fall apart.**

## Motivation

The 2025-2026 TSA staffing crisis left thousands of workers stranded. White collar workers rebook with points and lounges. Blue collar workers lose $200 tickets AND a day's wages. ReRoute is their advocate.

## Architecture

ReRoute orchestrates three specialized AI models through the Lava unified gateway:

- **Hermes 3** (Nous Research, 405B) — Real-time message triage and intent classification
- **K2 Think V2** (MBZUAI, 70B) — Multi-step legal reasoning for DOT compensation analysis
- **Claude Sonnet** (Anthropic) — Conversational agent for empathetic, multilingual worker communication

All model calls route through a single Lava API gateway, demonstrating unified multi-model orchestration.

Transport search aggregates results from Wanderu (bus/train), Rome2Rio (multi-modal routes), and direct airline availability.

Analytics layer powered by Hex API for real-time disruption trend analysis.

## Features

- **Smart Trip Monitoring** — Real-time flight status tracking with automatic disruption detection
- **Multi-Model Chat Agent** — Three AI models work together to classify, reason, and respond
- **K2 Compensation Calculator** — Step-by-step DOT legal reasoning with specific CFR citations
- **Cross-Modal Rebooking** — Compare flights, buses, trains, and rideshares via Wanderu, Rome2Rio, and direct airline availability
- **Know Your Rights** — DOT consumer protections explained in plain language
- **Bilingual Support** — Full English/Spanish support across chat and rights pages
- **Voice Input** — Web Speech API integration for hands-free operation
- **Disruption Analytics** — TSA crisis impact dashboard with real-time charts
- **Demo Mode** — Full animated walkthrough showing the disruption recovery flow

## Tech Stack

- **Framework**: Next.js 14 (App Router), TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **AI Gateway**: Lava AI (unified multi-model orchestration)
- **Analytics**: Hex API, Recharts
- **Voice**: Web Speech API
- **Icons**: Lucide React

## Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Fill in your API keys:
# - LAVA_API_KEY
# - K2_API_URL (defaults to https://api.lava.so/v2/chat/completions)
# - HEX_API_KEY
# - HEX_PROJECT_ID

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Screenshots

_Coming soon_

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/chat` | POST | Multi-model orchestrated chat (Hermes → K2 → Claude) |
| `/api/analyze-rights` | POST | K2 deep reasoning for DOT compensation |
| `/api/analyze-trip` | POST | Trip risk assessment |
| `/api/analytics` | GET | Disruption analytics (Hex-powered) |

---

Built at **YHack 2026**
