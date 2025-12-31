# Admin Dashboard — Prompt Evaluation

**Admin Dashboard** is a Next.js app for reviewing and evaluating user image prompts against brand and size compliance using Anthropic (Claude) agents. The app allows an admin to log in, browse prompts, view media, run automated evaluations (size + brand), and inspect evaluation details.

---

## 🔧 Features

- Admin login (JWT)
- Prompt listing with filters (newest/oldest, score, evaluated/not evaluated)
- Thumbnail and media preview (images & videos)
- Run automated evaluations that combine:
  - Size compliance agent (image metadata + prompt)
  - Brand compliance agent (image + prompt + brand details)
  - Aggregator agent (combines results into final score & summary)
- Persisted data in MongoDB: Users, Brands, Prompts, Evaluations
- Import helper to seed sample data from CSV files

---

## ⚙️ Requirements

- Node.js (recommended latest LTS)
- A MongoDB instance (connection string in `MONGODB_URI`)
- Anthropic API Key (optional if you won't run AI evaluations): `ANTHROPIC_API_KEY`

---

## 🚀 Quick Start

1. Install dependencies

```bash
npm install
```

2. Create a `.env.local` file in the project root and set the following variables:

```env
MONGODB_URI=mongodb+srv://...your-mongo-uri...
ANTHROPIC_API_KEY=sk-...
JWT_SECRET=supersecret
```

- `JWT_SECRET` defaults to `dev_secret` if not provided (development only).

3. Import sample data (users, brands, prompts)

```bash
npm run import-data
```

The import script also ensures an admin user exists:

- Username: `admin`
- Password: `test`

4. Run the app in development

```bash
npm run dev
```

5. Open the app

- Login page: `http://localhost:3000/`
- Admin dashboard (after login with admin account): `http://localhost:3000/admin`

---

## 🧭 How to Use

1. Login on the root page with an admin user (see import step above).
2. After successful login you are redirected to `/admin`.
3. Use the filter dropdown to sort or filter prompts.
4. Click a prompt card to open the modal and view details and media.
5. Click **Evaluate** on a prompt to run the size and brand agents. The evaluation result (score, summary, details) will be stored and available immediately.

---

## 🧩 API Endpoints (internal, server-side)

- POST `/api/login` — authenticate user (returns JWT token and role)
- GET `/api/prompts` — list prompts (supports `?filter=`)
- POST `/api/evaluate` — run evaluation for a prompt (requires admin JWT)
- GET `/api/evaluate?id=...` — fetch an evaluation by id
- GET `/api/users/:userId` — fetch user details (admin only)
- GET `/api/brands/:brandId` — fetch brand details (admin only)

> All admin endpoints use `requireAdmin()` which validates a Bearer JWT in the `Authorization` header and ensures `role === 'admin'`.

---

## 📁 Data Models

- User: `userId`, `userName`, `password` (plaintext in this project; **do not** use in production), `userRole`
- Brand: `brandId`, `brandName`, `brandDescription`, `style`, `brandVoice`, etc.
- Prompt: `imagePath`, `prompt` text, `userId`, `brandId`, `timestamp`, `evaluation` (ref)
- Evaluation: `promptId`, `score`, `summary`, `sizeCompliance`, `brandCompliance`, `createdAt`

---

## 🤖 Agents & AI

- Implementation uses the Anthropic SDK (`@anthropic-ai/sdk`) to call Claude models.
- Agents live in `agents/`:
  - `sizeCompliance.ts` — checks image dimensions & prompt for sizing guidance
  - `brandCompliance.ts` — checks image against brand guidelines (image + prompt + brand info)
  - `aggregator.ts` — merges results into final `endScore` and `summary`
- Responses are parsed via `lib/ai/parseClaudeResponse.ts` which extracts JSON from Claude's output.

Note: Evaluations involve uploading/encoding the image (base64) and sending to the LLM; watch for API usage and cost.

---

## ⚠️ Security & Production Notes

- Passwords are stored in plaintext in seed CSVs and the import script sets the admin password to `test` — replace this flow and add proper password hashing and secure user management for production.
- Always set a strong `JWT_SECRET` in production.
- Control access to your Anthropic API key and monitor usage.
- Ensure images referenced by `imagePath` are accessible to the server (public URL or reachable resource).

---

## 🧪 Development & Testing Notes

- Run `npm run dev` for development (Next.js).
- Use `npm run build` and `npm run start` for production builds.
- `npm run import-data` will clear the related collections and import CSV data from `data/`.

---

## 📚 Where to Look in Code

- Pages & UI: `app/` (login + `app/admin`)
- Components: `app/admin/components`
- API Routes: `app/api/*`
- Models: `models/`
- Agents: `agents/`
- Helpers: `lib/` and `hooks/`

---

## ✅ Quick Troubleshooting

- "401 Unauthorized" or "403 Forbidden" on API calls — ensure you include the JWT `Authorization: Bearer <token>` header and the token is still valid.
- Images fail to load or evaluation requests fail — verify `imagePath` is reachable from the server and that `ANTHROPIC_API_KEY` is set (if evaluations use Anthropic).
- Mongo connection error — confirm `MONGODB_URI` is correct and reachable.

---

## Contributing

- Contributions are welcome. Please open an issue / PR with a short description of the change.

---

## License

This repository does not specify a license. Add a license file if you plan to publish or share.

---

If you want, I can also:
- Add a short `.env.example` file
- Harden login (hash passwords) and add a dev-only seeding strategy
- Add e2e tests for the API + UI flows

