# Architecture — Admin Dashboard (Prompt Evaluation)

This document explains the architecture and design decisions of the Admin Dashboard app. It is written for an engineer reviewing the implementation and contains practical, actionable information (where to look in the codebase, how things are organized, and important limitations).

---

## High-level system overview

- Purpose: a small admin interface to review user-submitted images/videos and run automated evaluations that judge size and brand compliance.
- Primary actors:
  - Admin (human) using the Admin UI
  - The server (Next.js API) that orchestrates agents and persists results
  - External LLM (Claude / Anthropic) used by the brand compliance agent
- Data store: MongoDB (Users, Brands, Prompts, Evaluations)

---

## What the app does

- Lists prompts (image/video + prompt text) for admins
- Allows admins to inspect media and metadata
- Runs an evaluation pipeline on demand that produces:
  - A final score and short summary
  - Per-agent outputs (size compliance, brand compliance, etc.)
- Persists evaluations and shows them live in the UI

---

## Who it is for

- Engineers and product reviewers who need a straightforward tool to evaluate creative assets against brand guidelines and sizing requirements
- Moderators or brand managers who want fast automated feedback to prioritize manual review

---

## Architecture breakdown

### Frontend (Admin UI)

- Tech: React within Next.js app directory (app/admin)
- Responsibilities:
  - Login flow (client calls `POST /api/login` and stores JWT in localStorage)
  - Fetch and display prompts (`GET /api/prompts`) and filters
  - Modal with prompt details and evaluation results
  - Trigger evaluation (`POST /api/evaluate`) and show progress states
- Key files: `app/admin/page.tsx`, `app/admin/components/PromptModal.tsx`, `app/admin/components/MediaThumbnail.tsx`

### Backend / API layer

- Tech: Next.js API routes (app/api/\*)
- Responsibilities:
  - Auth endpoints (`/api/login`) issue JWTs (see `lib/auth.ts`)
  - Prompt listing (`/api/prompts`) supports filters and populates evaluation details
  - Evaluation orchestration endpoint (`/api/evaluate`) runs the multi-agent pipeline and persists results
  - Helper endpoints to fetch user and brand details (`/api/users/:id`, `/api/brands/:id`)
- Key file: `app/api/evaluate/route.ts`

### Agent system

- Each agent implements one responsibility and returns a typed JSON-like result (the code uses a `parseClaudeResponse` helper to extract JSON from LLM output).
- Agents live in `agents/`:
  - `sizeCompliance.ts` — deterministic, metadata-based; uses `lib/imageMetadata` to inspect width/height/format
  - `brandCompliance.ts` — uses Anthropic (Claude) and sends image (base64) + prompt + brand details; parses JSON response
  - `aggregator.ts` — deterministic: combines agent outputs using chosen weights and returns the final score and summary
  - (Optional) `creativity` / other subjective agents can be added if needed
- LLM access is abstracted by `lib/anthropic.ts`

### Database

- MongoDB via Mongoose
- Models live in `models/` (`Prompt`, `Brand`, `User`, `Evaluation`)
- Evaluations are stored in a dedicated collection with full per-agent output for auditability and later analysis
- Seeding helper: `scripts/importData.ts` (run `npm run import-data` before starting locally)

---

## Multi-Agent Design

### Per-agent responsibilities

- Size Compliance Agent (deterministic):

  - Input: image metadata (width, height, format), prompt, channel
  - Output: numeric size score, reasoning, and boolean `isOptimal`
  - Why deterministic: sizing checks are rule-based (dimensions, aspect ratios, platform constraints); deterministic checks are fast, testable, and cheaper.

- Brand Compliance Agent (LLM-based):

  - Input: image (base64), prompt text, structured brand details (name, style, voice, colors)
  - Output: multiple component scores (style alignment, color compliance, voice consistency, vision alignment), reasoning, strengths, improvements
  - Why LLM: brand compliance is semantic and subjective: mapping an image to brand voice and vision requires flexible, natural-language reasoning.

- Creativity Agent (optional / subjective):

  - Purpose: judge novelty/creativity; kept optional due to subjectivity and potential unreliability.

- Aggregator Agent (deterministic):
  - Input: numeric and qualitative outputs from other agents
  - Output: final endScore, short summary
  - Why deterministic: ensures reproducible weighted scoring and allows straightforward changes to weights without re-calling LLMs.

### Orchestration & async behavior

- Agents are executed in parallel using Promise.all in `app/api/evaluate/route.ts` to minimize latency.
- Once all agent promises resolve, the aggregator is invoked synchronously using the agent outputs.
- The resulting evaluation document is created/updated in MongoDB and the prompt is updated with a reference to the evaluation.
- The API responds with the evaluation so the UI can show results immediately; the frontend also triggers a background refetch of the prompts list to update cards.

---

## Data Model (Evaluations)

Evaluation document (high-level):

- `promptId` (ref)
- `score` (final numeric score)
- `summary` (short textual verdict)
- `sizeCompliance` (object: `score`, `reasoning`, `isOptimal`)
- `brandCompliance` (object: `score`, `styleAlignment`, `colorCompliance`, `voiceConsistency`, `visionAlignment`, `reasoning`, `strengths`, `improvements`)
- `createdAt`

Why store full per-agent outputs?

- Auditability: engineers and brand teams need to see _why_ a score was assigned.
- Reproducibility and debugging: LLM outputs can vary over time; keeping the original outputs helps troubleshoot regressions.
- Downstream analysis: storing per-agent fields enables building dashboards, histograms, and change-tracking later.

(See `models/evaluation.ts` for exact schema.)

---

## Evaluation Flow (Step-by-step)

1. Admin clicks **Evaluate** for a prompt in the UI.
2. UI sends `POST /api/evaluate` with `{ id: promptId }` and `Authorization: Bearer <token>` header.
3. Server validates admin JWT using `lib/auth.ts`.
4. Server reads prompt and brand records from MongoDB.
5. Server starts agents in parallel: `sizeComplianceAgent(prompt)` and `brandComplianceAgent(prompt, brand)` (and optionally any other agents) with `Promise.all`.
6. When agents finish, server calls `aggregatorAgent(sizeResult, brandResult, ...)` to compute the final score and summary.
7. Server creates or updates an `Evaluation` document and sets `Prompt.evaluation` to the evaluation id.
8. Server replies with `{ success: true, evaluation }` to the client.
9. Client receives the evaluation and either attaches it to the open modal or refetches the prompts list (the app does both: immediate modal update and background refetch).

---

## Trade-offs & Design Decisions

### LLM vs heuristics

- Use heuristics (deterministic logic) for tasks that are well-defined (image dimensions, file format). This reduces latency and cost, and gives reproducible results.
- Use LLM (Claude) for brand compliance because brand alignment is semantic, contextual, and benefits from the LLM's ability to reason about language and visual descriptions.
- Storing raw/intermediate outputs reduces reliance on the LLM when re-evaluating or debugging later.

### Manual orchestration vs specialized frameworks

- Orchestration is implemented manually in the API route (simple Promise.all) to keep the system small and explicit.
- This avoids complexity and dependency on orchestration frameworks (e.g., workflow engines) which would be overkill for the assignment scope.
- Trade-off: manual orchestration is straightforward to understand but offers less built-in retry/observability features than a dedicated workflow system.

### Image vs video evaluation constraints

- The brand agent accepts a media payload (base64) and will attempt to parse it. However, videos can be large and LLM models or APIs may reject or charge more for video uploads.
- Design decision: video evaluation is intentionally limited and should be treated as a best-effort or replaced by a single extracted frame/thumbnail for evaluation.
- The UI supports video playback (see `MediaThumbnail.tsx`), but evaluations are more reliable for images.

### Why some features are intentionally scoped

- Passwords are seeded in plaintext for rapid local setup (development only). Production-ready identity management and password hashing is deliberately out of scope for the assignment but called out in README.
- No heavy orchestration or queueing is included to keep the project within a compact implementation envelope.

---

## Local setup (developer runbook)

1. Install deps

```bash
npm install
```

2. Copy `.env.example` → `.env.local` and edit values

```bash
cp .env.example .env.local
# then edit .env.local to put actual MONGODB_URI and (optionally) ANTHROPIC_API_KEY and JWT_SECRET
```

`.env.example` contains the minimal variables expected by the app: `MONGODB_URI`, `ANTHROPIC_API_KEY` (optional for no-AI dev), `JWT_SECRET`.

3. Seed the database (required)

```bash
npm run import-data
```

This loads `data/users.csv`, `data/brands.csv`, `data/prompts.csv` and ensures a dev admin user (username `admin`, password `test`).

4. Run dev server

```bash
npm run dev
```

5. Open `http://localhost:3000/` and log in using the seeded admin.

---

## Where to look in the code

- Frontend: `app/admin` (`page.tsx`, components)
- Evaluate endpoint: `app/api/evaluate/route.ts`
- Agents: `agents/*` (`sizeCompliance.ts`, `brandCompliance.ts`, `aggregator.ts`)
- Anthropic wrapper: `lib/anthropic.ts`
- Response parsing: `lib/ai/parseClaudeResponse.ts`
- Models: `models/*.ts` (especially `models/evaluation.ts`)
- Seeder: `scripts/importData.ts`

---

## Architecture diagram (ASCII)

```
[Admin UI (browser)]
        |
        | HTTP (JWT auth)
        v
    [Next.js App / API] ---------------------> [Anthropic / Claude]
         |    \                                (brand agent calls LLM)
         |     \---> [Agents (size, brand, creativity, aggregator)]
         |                    |
         |                    v
         |                [Aggregator]
         |                    |
         v                    v
    [MongoDB (Prompts, Evaluations, Users, Brands)]

```

---

## Known limitations

- Seeded credentials are plaintext (dev only); do not use in production.
- Video evaluation is best-effort — prefer images or extracted frames for best results.
- Minimal observability and retry logic in the orchestration; a larger system would add retries, queuing, and tracing.
- LLM outputs may vary; storing raw outputs is critical for post-hoc analysis.

---

## Final notes

This project is intentionally compact and explicit to serve as a straightforward proof-of-concept for multi-agent assisted asset evaluation. The implementation favors clarity and auditability: agent outputs are persisted, scoring is deterministic at aggregation time, and the flow is easy to reason about and extend.

If you want, I can also:

- Add a small `ARCHITECTURE.svg` generated from the ASCII diagram
- Add short unit/integration tests around the evaluate route and aggregator
- Convert video evaluation to a thumbnail-frame-extraction step before sending to the brand agent
