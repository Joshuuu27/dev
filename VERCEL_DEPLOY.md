# Deploy FairFare to Vercel

## 1. Push your code to GitHub

If you haven't already:

```bash
git init
git add .
git commit -m "Initial commit"
```

Create a new repository on [GitHub](https://github.com/new), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

## 2. Production database (required)

Your app uses **MySQL** via Prisma. Localhost won't work on Vercel. Use a hosted MySQL provider and set `DATABASE_URL` to its connection string, for example:

- [PlanetScale](https://planetscale.com) (MySQL-compatible, free tier)
- [Railway](https://railway.app)
- [Aiven](https://aiven.io)
- Any other hosted MySQL

After creating a database, run migrations from your machine (or via the provider’s console):

```bash
npx prisma migrate deploy
```

(Or use `prisma db push` if you're not using migrations.)

## 3. Deploy on Vercel

### Option A: Vercel website (recommended)

1. Go to [vercel.com](https://vercel.com) and sign in (use GitHub).
2. Click **Add New…** → **Project**.
3. **Import** your GitHub repository (FairFare).
4. **Configure:**
   - **Framework Preset:** Next.js (auto-detected)
   - **Build Command:** `prisma generate && next build` (or leave default; it’s already in `package.json`)
   - **Output Directory:** leave default
5. **Environment Variables:** Add every variable from your `.env` (see list below).  
   Use **Production** (and optionally Preview/Development).  
   For production, set:
   - `DATABASE_URL` = your **production** MySQL URL (not localhost).
   - `NEXT_PUBLIC_API_URL` = your Vercel app URL, e.g. `https://your-app.vercel.app/api`.
6. Click **Deploy**. Wait for the build to finish.

### Option B: Vercel CLI

```bash
npm i -g vercel
cd "c:\Users\user\Downloads\FAIRFAREAPP (2)\FairFare"
vercel login
vercel
```

Follow the prompts. Then add environment variables in the Vercel dashboard: **Project → Settings → Environment Variables**.

## 4. Environment variables to set in Vercel

Add these in **Project → Settings → Environment Variables** (use your own values; do not commit `.env`):

| Variable | Notes |
|----------|--------|
| `DATABASE_URL` | Production MySQL URL (required) |
| `NEXT_PUBLIC_API_URL` | e.g. `https://your-app.vercel.app/api` |
| `NEXT_PUBLIC_API_KEY` | Your API key |
| `JWT_SECRET` | Strong secret |
| `NEXT_PUBLIC_FIREBASE_*` | All Firebase client vars from .env |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | Service account email |
| `FIREBASE_PRIVATE_KEY` | Full private key (multiline as one string) |
| `FIREBASE_API_KEY` | Firebase API key |
| `COOKIE_SIGNATURE_KEY_1` | At least 32 characters |
| `OPENAI_API_KEY` | If you use OpenAI |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | For maps |
| `NEXT_PUBLIC_BASEFARE` | e.g. 15 |
| `NEXT_PUBLIC_PERKM` | e.g. 1 |

For `FIREBASE_PRIVATE_KEY`, paste the key including `\n` as literal newlines, or paste the key in the Vercel UI (it supports multiline).

## 5. After first deploy

- Open your project URL (e.g. `https://fairfare-xxx.vercel.app`).
- Set `NEXT_PUBLIC_API_URL` to that URL + `/api` if you didn’t before, then redeploy.
- In Firebase Console → Authentication → Authorized domains, add your Vercel domain (e.g. `your-app.vercel.app` and any custom domain).

## 6. Optional: skip Husky on Vercel

If the build fails on `husky install`, add in Vercel:

- **Name:** `HUSKY`  
- **Value:** `0`

---

**Summary:** Push code to GitHub → create production MySQL and set `DATABASE_URL` → import repo in Vercel → add all env vars (with production URLs and keys) → Deploy. Add your Vercel domain in Firebase authorized domains.
