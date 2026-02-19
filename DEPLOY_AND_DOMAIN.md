# FairFare: Deploy to Vercel and Use Your Domain

Follow these steps in order to get your app live and then on your own domain.

---

## Part 1: Push your code to GitHub

1. Open a terminal (PowerShell or Command Prompt).
2. Go to your project folder:
   ```powershell
   cd "c:\Users\user\Downloads\FAIRFAREAPP (2)\FairFare"
   ```
3. If Git doesn’t know who you are (first time only):
   ```powershell
   git config user.email "your-email@example.com"
   git config user.name "Your Name"
   ```
4. Stage, commit, and push:
   ```powershell
   git add .
   git commit -m "Update FairFare app"
   git push origin main
   ```
5. If it asks to sign in, use your **GitHub username** and a **Personal Access Token** (not your password). Create one at: GitHub.com → Settings → Developer settings → Personal access tokens → Generate new token.

Your latest code is now on GitHub (e.g. `https://github.com/Joshuuu27/dev`).

---

## Part 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (with GitHub).
2. Click **Add New…** → **Project**.
3. **Import** your GitHub repository (e.g. **Joshuuu27/dev**).
4. **Project name:** e.g. `fairfare` (or keep as `dev`).
5. **Environment Variables:** Add the same variables as in your `.env`:
   - Click **Import .env** and paste your `.env` contents, **or**
   - Add each variable manually (Key = name, Value = value).
   - Important: set **DATABASE_URL** to your **production** MySQL URL (not localhost). Set **NEXT_PUBLIC_API_URL** after you have your live URL (see below).
6. Click **Deploy**.
7. Wait until the deployment is **Ready**. Your app will be at something like `https://fairfare-xxxx.vercel.app`.

---

## Part 3: Set production URL in Vercel

1. In Vercel, open your project → **Settings** → **Environment Variables**.
2. Find **NEXT_PUBLIC_API_URL** and edit it.
3. Set the value to your **live** URL + `/api`, for example:
   - `https://fairfare-xxxx.vercel.app/api`  
   or, after you add a domain:
   - `https://yourdomain.com/api`
4. Save, then go to **Deployments** → click **…** on the latest → **Redeploy** so the new value is used.

---

## Part 4: Firebase – allow your live URL

1. Go to [Firebase Console](https://console.firebase.google.com) → your project.
2. **Authentication** → **Settings** (or **Authorized domains**).
3. Click **Add domain**.
4. Add:
   - Your Vercel URL, e.g. `fairfare-xxxx.vercel.app` (no `https://`),  
   - And later your custom domain, e.g. `yourdomain.com` or `app.yourdomain.com`.
5. Save.

Login will then work on those URLs.

---

## Part 5: Add your custom domain in Vercel

1. In Vercel: your project → **Settings** → **Domains**.
2. Under **Domain**, type your domain (e.g. `fairfare.com` or `app.fairfare.com`).
3. Click **Add**.
4. Vercel will show you which **DNS records** to create (e.g. A record or CNAME). Leave this tab open.

---

## Part 6: Point your domain to Vercel (DNS)

1. Log in where you bought your domain (GoDaddy, Namecheap, Cloudflare, etc.).
2. Open **DNS** / **DNS Management** for that domain.
3. Add the record Vercel asked for. Typical examples:
   - **Root domain (e.g. fairfare.com):**  
     - Type: **A**  
     - Name: `@` (or leave blank)  
     - Value: `76.76.21.21` (confirm in Vercel’s Domains page)
   - **Subdomain (e.g. app.fairfare.com):**  
     - Type: **CNAME**  
     - Name: `app`  
     - Value: `cname.vercel-dns.com` (or what Vercel shows)
4. Save. DNS can take a few minutes up to 48 hours.

---

## Part 7: Wait for domain to be valid

1. Back in Vercel → **Settings** → **Domains**.
2. Wait until your domain shows as **Valid** / **Ready**.
3. Vercel will issue an SSL certificate (HTTPS) automatically.

---

## Part 8: Use your domain in the app (env and Firebase)

1. **Vercel → Settings → Environment Variables**  
   - Edit **NEXT_PUBLIC_API_URL** and set it to:  
     `https://yourdomain.com/api`  
     (or `https://app.yourdomain.com/api` if you use a subdomain).
2. **Redeploy:** Deployments → … → **Redeploy**.
3. **Firebase:** If you didn’t already, add your domain in **Authentication → Authorized domains** (e.g. `yourdomain.com` or `app.yourdomain.com`).

---

## Quick reference

| Goal | Where | What to do |
|------|--------|------------|
| Update live app with new code | Terminal | `git add .` → `git commit -m "message"` → `git push origin main` |
| New deployment | Vercel | Automatic on push to `main` (if repo is connected) |
| Change API URL / env | Vercel → Settings → Environment Variables | Edit **NEXT_PUBLIC_API_URL**, then **Redeploy** |
| Add custom domain | Vercel → Settings → Domains | Add domain, then add DNS record at your registrar |
| Login to work on domain | Firebase → Auth → Authorized domains | Add your domain (no `https://`) |

---

## Doing it “all again” from scratch

If you want to redo everything:

1. **Part 1** – Push latest code to GitHub.
2. **Part 2** – If the project is already on Vercel, new pushes auto-deploy. If not, import the repo again and add env vars, then Deploy.
3. **Part 3** – Set **NEXT_PUBLIC_API_URL** to your current live URL + `/api`, Redeploy.
4. **Part 4** – Add your Vercel URL and custom domain in Firebase Authorized domains.
5. **Parts 5–8** – Add domain in Vercel, set DNS at registrar, then set **NEXT_PUBLIC_API_URL** to your domain and Redeploy.

After that, your updated code runs on your custom domain.

---

## Map not working on deployed domain (works on localhost)

The map works on localhost but often fails on your live URL for two reasons.

### 1. Environment variable not set in production

The map needs `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in the browser. In Vercel it is not read from your local `.env` unless you add it there.

**Fix:**

1. Vercel → your project → **Settings** → **Environment Variables**.
2. Add **Key:** `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, **Value:** your Google Maps API key (same as in `.env`).
3. Optional: add `NEXT_PUBLIC_BASEFARE` and `NEXT_PUBLIC_PERKM` if you use custom values.
4. **Redeploy:** Deployments → … on latest deployment → **Redeploy**.

Without this, the key is undefined in production and the map will not load.

### 2. Google Cloud API key restricted to localhost

If your key is restricted by **HTTP referrer**, it may only allow `http://localhost:*`. Requests from your deployed domain are then blocked by Google.

**Fix:**

1. Open [Google Cloud Console](https://console.cloud.google.com) → your project.
2. Go to **APIs & Services** → **Credentials**.
3. Click your **Maps API key**.
4. Under **Application restrictions**, choose **HTTP referrers**.
5. Under **Website restrictions**, add your deployed URLs, for example:
   - `https://fairfaree.vercel.app/*`
   - `https://*.vercel.app/*`
   - `https://yourdomain.com/*` (and `https://www.yourdomain.com/*` if you use a custom domain)
6. Ensure **Maps JavaScript API** (and **Places API**, **Geocoding API** if used) are enabled under **APIs & Services** → **Library**.
7. Save. Changes can take a few minutes to apply.

After both steps, the map should work on your deployed domain.
