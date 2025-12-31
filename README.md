# Admin Dashboard — Prompt Evaluation

A small Next.js admin app that lets an administrator review image prompts submitted by users and run automated evaluations to check size and brand compliance using LLM agents.

---

## What this app does

- Displays user-submitted prompts with image/video thumbnails
- Lets an admin view prompt details, user, and brand info
- Runs automated evaluations (size + brand agents) and stores results
- Helps prioritize or flag creative assets for review using a numerical score and short summary

---

## Important: Seed the database before running

**You must run the seed step before starting the app.** The project includes an import script that loads sample Users, Brands, and Prompts from the `data/` folder.

Run:

```bash
npm run import-data
```

This will clear the related collections and insert CSV data. The script also ensures a development admin user exists:

- Username: `admin`
- Password: `test`

(See `package.json` → `scripts.import-data`)

---

## Quick start

1. Install deps

```bash
npm install
```

2. Create `.env.local` with at least:

```env
MONGODB_URI=your_mongodb_connection_string
# Optional if you won't use AI features:
ANTHROPIC_API_KEY=your_anthropic_key
JWT_SECRET=your_jwt_secret
```

3. Seed the database (required)

```bash
npm run import-data
```

4. Start dev server

```bash
npm run dev
```

5. Open the app

- Login: http://localhost:3000/
- Admin UI (after logging in): http://localhost:3000/admin

---

## Notes & security

- The import script seeds a dev admin with password `test` — replace or remove this in production and use proper password hashing.
- Keep `JWT_SECRET` and `ANTHROPIC_API_KEY` secret and monitor usage.

---

If you'd like, I can also add a minimal `.env.example` and a short section on how to replace the dev admin user with a hashed password. Let me know which you'd prefer.