# ARCHITECTURE

## 1. Key Extensions

| Area            | Key files / modules          | Purpose                                                                                              |
| --------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------- |
| **AI Agents**   | `agents/*.ts`                | Three agents: size compliance (Agent A), brand compliance (Agent B), and aggregator (Agent C).       |
| **API Routes**  | `app/api/**`                 | REST endpoints for auth, prompts listing, evaluation orchestration, and fetching evaluation results. |
| **Admin UI**    | `app/admin/**`               | Dashboard with prompt cards, modal for details, evaluation trigger, and live results display.        |
| **LLM Wrapper** | `lib/anthropic.ts`           | Anthropic Claude API integration with request/response handling.                                     |
| **Parsers**     | `lib/parseClaudeResponse.ts` | Extracts and parses JSON from LLM responses, handles markdown cleanup.                               |
| **Image Utils** | `lib/imageMetadata.ts`       | Extracts image dimensions and metadata for size compliance checks.                                   |

## 2. Data Model (MongoDB + Mongoose)

Using MongoDB via Mongoose. Schema is straightforward with clear references between collections.

### Core Collections

| Collection     | What it stores                                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------------------------------ |
| **User**       | Admin credentials (`username`, `password`), role field for access control.                                         |
| **Brand**      | Brand profile with style, voice, vision, colors. Used by Agent B for brand compliance evaluation.                  |
| **Prompt**     | User-generated content: prompt text, media URL, media type, references to user, brand, and evaluation.             |
| **Evaluation** | Per-prompt evaluation results. Contains objects for size compliance, brand compliance, final score, and timestamp. |

### Why these choices

1. **Mongoose** – Simple ORM with good TypeScript support, familiar for rapid prototyping.
2. **ObjectId references** – Keeps documents lean, enables efficient queries.
3. **Embedded agent outputs** – Each evaluation stores full JSON from Agent A and Agent B for auditability and debugging.

## 3. Seeding

`scripts/importData.ts` loads CSVs (`users.csv`, `brands.csv`, `prompts.csv`) into MongoDB:

1. Parse CSVs with Papaparse
2. Create/update documents using Mongoose
3. Sets up admin user (username: `admin`, password: `test`)

Run with: `npm run import-data`

## 4. Multi-Agent Pipeline

### Agent Roles

| Agent              | Type         | What it checks                                                       | Output                                                                               | Why this approach                                    |
| ------------------ | ------------ | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------- |
| **Agent A: Size**  | LLM (Claude) | Image dimensions vs platform requirements (Instagram, etc.)          | `{ score: 0-10, reasoning: string, isOptimal: boolean }`                             | LLM provides contextual reasoning for size decisions |
| **Agent B: Brand** | LLM (Claude) | Visual content alignment with brand style, colors, voice, and vision | `{ score: 0-10, styleAlignment, colorCompliance, voiceConsistency, reasoning, ... }` | Requires semantic understanding and visual reasoning |
| **Agent C: Agg**   | LLM (Claude) | Combines Agent A + B scores with contextual analysis                 | `{ endScore: 0-10, summary: string }`                                                | LLM provides nuanced summary based on all inputs     |

### Evaluation Flow

```
┌──────────────┐
│Admin clicks  │
│"Evaluate"    │
└──────┬───────┘
       ▼
┌──────────────────┐
│API validates JWT │
│Fetch Prompt+Brand│
└──────┬───────────┘
       ▼ (parallel execution)
  ┌────────┐  ┌───────────┐
  │Agent A │  │ Agent B   │
  │(size)  │  │(brand+LLM)│
  └───┬────┘  └─────┬─────┘
      └─────┬───────┘
            ▼
      ┌──────────┐
      │ Agent C  │ (aggregator)
      │ endScore │
      └────┬─────┘
           ▼
    ┌─────────────┐
    │Save to Mongo│
    │Return to UI │
    └─────────────┘
```

**Orchestration:** Agents A and B run in parallel using `Promise.all()` to minimize latency. Agent C runs synchronously after receiving both results.

## 5. UI & Real-time Updates

- **Dashboard** displays all prompts with filtering/sorting
- **Modal** shows prompt details and triggers evaluation
- **Loading state** appears during agent execution
- **Results** update immediately after evaluation completes (no polling needed - response contains full evaluation)
- **Background refetch** updates the prompt list to show evaluation badge

## 6. Prompt Engineering

Each agent uses a carefully crafted prompt to ensure consistent, structured output:

| Agent   | Prompt Focus                                                                                     |
| ------- | ------------------------------------------------------------------------------------------------ |
| Agent A | Evaluates image dimensions against platform specs, provides reasoning for optimization           |
| Agent B | Analyzes visual content against brand guidelines (style, colors, voice, vision) with image input |
| Agent C | Synthesizes Agent A + B results, weighs brand alignment (80%) vs size (20%), provides summary    |

All agents are instructed to return **valid JSON only** with specific schema, making parsing reliable.

## 7. Aggregation Formula

Agent C uses LLM to intelligently aggregate scores:

```typescript
endScore = (
  agentA.score * 0.2 + // Size compliance: 20%
  agentB.score * 0.8
) // Brand alignment: 80%
  .toFixed(1);

// LLM also generates contextual summary based on both agent outputs
```

**Rationale:** Brand alignment is more critical than sizing. LLM aggregation allows for nuanced interpretation beyond simple weighted average.

## 8. Design Trade-offs

| Choice                             | Why                                                       | Downside                                              |
| ---------------------------------- | --------------------------------------------------------- | ----------------------------------------------------- |
| All agents use LLM                 | Consistent quality, contextual reasoning, structured JSON | Higher API costs, ~3-5s total latency for 3 LLM calls |
| Manual orchestration (Promise.all) | Simple, explicit, no framework dependencies               | No built-in retry or observability                    |
| Storing full agent outputs         | Auditability, debugging LLM variations, historical trends | Larger documents, needs parsing for queries           |
| Video evaluation deferred          | Time constraint (4-hour limit), complex frame extraction  | Videos currently unsupported                          |
| No caching                         | Evaluations stored in DB, intentional re-evaluation OK    | Repeated evaluations cost tokens                      |
| Parallel agent execution           | Faster evaluation (A & B run simultaneously)              | Higher instantaneous API load                         |

## 9. Extension Points

| To add...              | Change...                                                               |
| ---------------------- | ----------------------------------------------------------------------- |
| New evaluation metric  | Add agent in `agents/`, update orchestrator in `/api/evaluate/route.ts` |
| Video frame extraction | Add preprocessing in Agent B using `fluent-ffmpeg`                      |
| Different LLM          | Swap `lib/anthropic.ts` with OpenAI/Gemini wrapper                      |
| Custom weights         | Modify formula in `agents/aggregator.ts`                                |
| Batch processing       | Wrap orchestrator in queue worker (BullMQ/Redis)                        |

---
