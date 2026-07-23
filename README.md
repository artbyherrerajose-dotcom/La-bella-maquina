# La Bella Máquina

Car customization shop & club app — React Native (Expo) frontend backed by
[Supabase](https://supabase.com) (Postgres + Auth + Storage).

This is a from-scratch rebuild of an HTML/canvas prototype (`labellamaquinaclub.jsx`) as a real
mobile app. **Phase 1** (this drop) ships:

- Real authentication (Supabase Auth, email/password) with a racer display name.
- **Mi Garaje**: each member's custom-build project — cover photo, specs, a color-coded build,
  a photo-required progress bitácora ("bitácora de avance") that awards club points per upgrade
  type, and comments.

Later phases (not yet built): Autos marketplace, Mecánica bookings, Accesorios shop/cart,
Garajes del Club (browsing other members' projects), Contactos, Pedir Repuestos, and the
Lista Negra leaderboard — all visible today only as "próximamente" placeholders on the Garage
home tab.

## Stack

- **Frontend:** React Native, Expo SDK 57, Expo Router (file-based routing, typed routes),
  TypeScript.
- **Backend:** Supabase (Postgres database, Auth, Storage for avatar / car / progress photos).
- **Fonts:** Rajdhani (display) + JetBrains Mono (mono accents), matching the club's dark neon
  aesthetic (`#0A0A0C` background, lime/orange/red/blue accents).

## Architecture notes

- **Points are server-authoritative.** A member never sends a point value from the client —
  `progress_entries.points_awarded` is computed by a Postgres `BEFORE INSERT` trigger from the
  upgrade `tipo` (pintura/motor/rines/aero/accesorios/otro), and a profile's `points` column can
  only change via `SECURITY DEFINER` trigger functions (`award_progress_points`,
  `award_comment_points`). A `BEFORE UPDATE` guard trigger (`guard_profile_points`) silently
  rejects any attempt to change `points` directly from the client (detected via
  `pg_trigger_depth() = 0`), so a malicious client can't grant itself points through the REST API.
- **Row Level Security** is enabled on every table. Authenticated users can read all profiles /
  garage projects / progress / comments (needed for the future club leaderboard and garage
  showcase), but can only write their own rows — enforced per-row, not just in the app.
- **Auto-provisioning:** signing up creates the `auth.users` row; a trigger
  (`handle_new_user`) copies the racer display name (passed as `signUp({ options: { data:
  { display_name } } })`) into a new `public.profiles` row. The app never inserts into
  `profiles` directly.
- **Storage:** `avatars` and `garage-photos` are public-read buckets. Uploads are scoped to
  `<bucket>/<user_id>/...` and storage policies only allow a user to write inside their own
  folder (`storage.foldername(name)[1] = auth.uid()`).

## 1. Create your Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In **Project Settings → API**, copy the **Project URL** and the **anon public** key.
3. Copy `.env.example` to `.env` and fill those two values in:

   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
   ```

## 2. Run the database migration

Open the **SQL Editor** in your Supabase dashboard and run the contents of
[`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql) (or, with the
[Supabase CLI](https://supabase.com/docs/guides/cli), `supabase link` your project and run
`supabase db push`). This creates the `profiles`, `garage_projects`, `progress_entries`, and
`garage_comments` tables, all RLS policies and triggers, and the `avatars` / `garage-photos`
storage buckets.

By default Supabase requires email confirmation before a new user gets a session — the signup
screen tells the member to check their inbox. You can turn this off for local testing in
**Authentication → Providers → Email → Confirm email**.

## 3. Run the app

```bash
npm install
npx expo start
```

Scan the QR code with [Expo Go](https://expo.dev/go), or press `i` / `a` for the iOS
simulator / Android emulator.

## Project structure

```
src/
  app/
    _layout.tsx        root layout: loads fonts, wraps AuthProvider, guards routes
    login.tsx           sign in
    signup.tsx           sign up (racer display name + email + password)
    (app)/
      _layout.tsx        tab navigator (Garage / Mi Garaje), only reachable with a session
      index.tsx          Garage home (points, rank, "próximamente" doors)
      mi-garaje.tsx       Mi Garaje: car project, progress bitácora, comments
  lib/
    supabase.ts          Supabase client (session persisted via AsyncStorage)
    auth-context.tsx      AuthProvider / useAuth (session + profile)
    upload-image.ts       pick from photo library → upload to Supabase Storage
  hooks/
    useGarage.ts          load/save the current user's garage project, progress, comments
  components/            Button, TextField, SectionTitle, PointsBadge
  constants/theme.ts       colors, fonts, rank titles, upgrade-type point values
  types/database.ts        typed Supabase Database schema
supabase/migrations/0001_init.sql
```
