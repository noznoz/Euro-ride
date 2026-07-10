# Euro Ride — Shared backend setup (Supabase)

Out of the box the app runs in **local mode**: each rider picks a name and
their data stays on their own phone. Follow these steps once to upgrade the
whole group to **shared mode** — real accounts, and everyone sees the
group's expenses, ride progress, and trip photos live.

## 1. Create the Supabase project
1. Go to https://supabase.com → **New project** (free tier is fine).
2. Pick a name + database password, wait ~2 min for it to provision.

## 2. Run the schema
1. In your project: **SQL Editor → New query**.
2. Open `supabase/schema.sql` from this repo, copy everything, paste, **Run**.
   - Creates tables (profiles, expenses, reservations, completions, photos,
     invite_codes), Row-Level-Security policies, the admin-approval logic,
     Realtime, and a public `media` storage bucket for photos.
   - Seeds one invite code: **`JEDDAH-2026`** (change it later in Table Editor).

## 3. Add your keys to GitHub
1. In Supabase: **Project Settings → API**. Copy the **Project URL** and the
   **anon public** key.
2. In the GitHub repo: **Settings → Secrets and variables → Actions →
   New repository secret**, add both:
   - `VITE_SUPABASE_URL` = the Project URL
   - `VITE_SUPABASE_ANON_KEY` = the anon key
3. Re-run the deploy (push any commit, or Actions → Deploy → Re-run).
   The next build switches the live app into shared mode.

For local development put the same two values in a `.env` file:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

## 4. Auth providers
- **Email + password** works out of the box.
  - For the crew, turn **off** email confirmation so riders can sign in
    immediately: **Authentication → Providers → Email → uncheck "Confirm email"**.
- **Google sign-in** (optional): **Authentication → Providers → Google →
  Enable**, then follow the inline instructions.

## 5. First login = admin
The **first account** that signs up automatically becomes the chapter
**admin** (approved + admin role). That's you. After that:
- Riders **with the invite code** (`JEDDAH-2026`) are approved instantly.
- Riders **without** a code land in a **pending** queue — approve them in
  Supabase: Table Editor → profiles → set `status` to `approved`.

## What's shared vs personal in shared mode
| Data          | Visibility                                   |
|---------------|----------------------------------------------|
| Expenses      | Everyone sees all; you edit only your own    |
| Ride progress | Your own bar; days show who else completed   |
| Photos        | Shared trip album per day                    |
| Reservations  | Shown only under your account                |
| Packing list  | Stays on your device (offline, personal)     |
