# Upkeep — Project Specification

> **How to use this file**: This is the standing reference for the Upkeep project. Sections 1–4 define the product concept, design system, tech stack, and data model — they stay here permanently. Section 5 contains the five build phases; feed them to your AI coding assistant **one at a time**, reviewing each phase's output before moving to the next. Sections 6–7 are the full feature checklist and notes on a future community version.

---

## 1. Product Concept

Upkeep is a personal, multi-vehicle maintenance tracker — cars, motorcycles, scooters, whatever's in the garage — for one owner to log services, track cost and mileage, get reminded before things are due, and keep quick-reference specs (part numbers, fluid types, tire pressures) per vehicle. It runs on your existing Supabase project, so there's no second free-tier database to manage.

### Scoping Decisions

- **"Reuse my Supabase DB + login" vs. "local-first, localStorage, no login."** These can't both be true as written. **Resolution:** Supabase is the real backend — your data, your one login — and TanStack Query with a persisted cache gives you the local-first feel (instant loads, readable offline) without giving up a permanent, syncable database.
- **A public "community-driven" specs tool vs. a personal app on a shared, free-tier Supabase project.** A crowdsourced database open to any rider is really a separate product — public sign-ups, user-submitted content, moderation — and Supabase Auth is project-wide, not per-app, so it would share GradeLedger's exact user pool. **Resolution:** a personal specs library for your own vehicles, plus a shareable read-only link. Section 7 sketches what the full public version would need if you ever want to build it as its own project.

---

## 2. Design System — Apple-inspired

### Signature Element

Maintenance countdowns render as **ring gauges** — a sweep arc like a fuel or temperature gauge, the same underlying idea as Apple Watch's activity rings — instead of flat progress bars. It's the one place this design allows itself a flourish, and it's drawn from an actual dashboard rather than a generic admin-panel motif. Use rings on vehicle cards and the main dashboard; plain bars are fine in dense list/table views where a full ring would just be noise.

### Color Tokens

| Token | Light | Dark | Used for |
|---|---|---|---|
| Background | `#F5F5F7` | `#000000` | Page background |
| Surface | `#FFFFFF` | `#1C1C1E` | Cards, panels, sheets |
| Border | `#D2D2D7` | `#38383A` | Dividers, card outlines |
| Text primary | `#1D1D1F` | `#F5F5F7` | Headlines, body copy |
| Text secondary | `#6E6E73` | `#98989D` | Meta text, captions |
| Accent | `#0071E3` | `#0A84FF` | Links, primary buttons, active nav |
| Tier — plenty left | `#34C759` | `#32D74B` | Ring/bar, >50% life remaining |
| Tier — due soon | `#FF9F0A` | `#FFD60A` | Ring/bar, <20% life remaining |
| Tier — overdue | `#FF3B30` | `#FF453A` | Overdue badge |

```css
:root[data-theme="light"] {
  --color-bg: #F5F5F7;
  --color-surface: #FFFFFF;
  --color-border: #D2D2D7;
  --color-text-primary: #1D1D1F;
  --color-text-secondary: #6E6E73;
  --color-accent: #0071E3;
  --tier-good: #34C759;
  --tier-ok: #FF9F0A;
  --tier-warn: #FF3B30;
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 22px;
  --shadow-1: 0 1px 2px rgba(0,0,0,.04), 0 1px 1px rgba(0,0,0,.03);
  --shadow-2: 0 4px 16px rgba(0,0,0,.08);
}
:root[data-theme="dark"] {
  --color-bg: #000000;
  --color-surface: #1C1C1E;
  --color-border: #38383A;
  --color-text-primary: #F5F5F7;
  --color-text-secondary: #98989D;
  --color-accent: #0A84FF;
  --tier-good: #32D74B;
  --tier-ok: #FFD60A;
  --tier-warn: #FF453A;
  --shadow-1: 0 1px 2px rgba(0,0,0,.4);
  --shadow-2: 0 4px 20px rgba(0,0,0,.5);
}
```

### Typography

- **Headings/body:** `-apple-system, BlinkMacSystemFont, "Inter", sans-serif` — the first two pick up real SF Pro automatically on Apple hardware; Inter (loaded as a webfont) is the closest open match for everyone else, since SF Pro itself isn't licensed for general web embedding.
- **Numbers** — mileage, cost, part numbers: `"SF Mono", "IBM Plex Mono", monospace` — same logic, and IBM Plex Mono is already in your GradeLedger stack, so figures feel consistent across both apps.
- Bold, tight tracking (`-0.02em`) on headlines; 15–17px body at 1.5 line-height.

### Depth & Motion

- Layer 2–3 low-opacity shadows for elevation rather than one hard drop-shadow.
- `backdrop-filter: blur(20px)` on the top nav and modals over a translucent surface color — the frosted-glass look.
- 14–22px border radius everywhere; no sharp corners.
- Hover lifts an element 1–2px with a longer shadow; press compresses slightly. 200–300ms ease-out transitions, never linear.
- Skeleton loaders while data streams in from Supabase, not spinners.
- Respect `prefers-reduced-motion`: swap transforms for simple opacity fades when it's set.

### Navigation

- **Logged-out marketing page:** sticky nav, frosted glass on scroll, hamburger icon on mobile opening a full-height blurred overlay — this mirrors apple.com's own mobile nav, so it's an accurate Apple cue rather than decoration.
- **Logged-in app:** a collapsible icon+label sidebar on desktop (Dashboard, Garage, Service Logs, Reminders, Specs, Fuel Log, Settings); on mobile, a bottom tab bar for the primary sections plus a hamburger/"more" menu for Settings and anything secondary. Apple's own apps mostly use tab bars for primary in-app navigation rather than hamburgers — this gets you the depth and polish while still giving you a real burger icon where it belongs.

---

## 3. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | React 18 + Vite | Modern default, fast dev server |
| Language | TypeScript (plain JS is a fine swap) | Catches Supabase schema mismatches early |
| Styling | Tailwind CSS v4 + the tokens above | v4's CSS-first `@theme` maps straight onto custom tokens instead of fighting Tailwind's default palette |
| Backend | Supabase (your existing project) | Auth, Postgres, Storage, RLS — all reused |
| Server cache | TanStack Query + a localStorage/IndexedDB persister | The actual mechanism behind the "local-first, instant" feel |
| Local UI state | Zustand or Context | Theme, sidebar state, active vehicle |
| Routing | React Router | Public, auth, and protected app routes |
| Forms | React Hook Form + Zod | Validation that mirrors your Postgres constraints |
| Charts | Recharts | Cost-over-time, fuel-efficiency trends |
| Icons | lucide-react | Clean line icons, close in spirit to SF Symbols |
| Motion | Framer Motion | Page/modal transitions, hover/press micro-interactions |
| Offline/installable | vite-plugin-pwa | Home-screen install, works with no signal in the garage |
| Hosting | Vercel or Netlify (free tier) | Supabase already hosts the backend |

### Directory Structure

```
src/
  components/     # shared UI: buttons, cards, tier-ring, nav
  features/       # vehicles/ service-logs/ reminders/ specs/ fuel/ auth/
  hooks/
  lib/            # supabase client, query client, formatters
  types/
  styles/         # tokens.css, globals.css
```

---

## 4. Data Model

### Naming Convention

Every new table is prefixed `vt_` so nothing collides with whatever GradeLedger already has in the `public` schema. Before any migration runs, list existing tables first (`select table_name from information_schema.tables where table_schema = 'public'`) to confirm there's no overlap.

### Security Note

Supabase Auth's `auth.users` is shared across your whole project, not per app — whoever can sign in to Upkeep draws from the same pool as GradeLedger. That's a non-issue for a single-user tool. If you ever open sign-up to other riders, double-check GradeLedger's RLS is strictly `auth.uid() = user_id` everywhere first, or just leave public sign-up off and create your one account manually.

### Tables

- **vt_vehicles** — `user_id`, `nickname`, `make`, `model`, `year`, `vehicle_type`, `vin`, `fuel_type`, `current_mileage`, `mileage_unit`, `photo_url`
- **vt_service_categories** — `name`, `icon`, `default_interval_km`, `default_interval_months`, `user_id` (nullable — null rows are shared defaults like Oil Change, Spark Plugs, Tire Rotation, Chain Lube, Brake Pads; a user's own custom categories have `user_id` set)
- **vt_service_logs** — `vehicle_id`, `category_id`, `service_date`, `mileage_at_service`, `cost`, `currency`, `performed_by`, `notes`, `receipt_url`
- **vt_service_log_parts** — `service_log_id`, `part_name`, `part_number`, `brand`, `quantity`, `unit_cost` — this is where "exact iridium spark plug code" detail lives
- **vt_vehicle_specs** — `vehicle_id`, `spec_type`, `value`, `unit`, `source_note` — flexible key-value, so tire PSI, oil viscosity, fuel octane, battery type, and torque specs all live here without a schema change each time
- **vt_fuel_logs** — `vehicle_id`, `date`, `mileage`, `volume`, `cost`, `full_tank`
- **vt_documents** — `vehicle_id`, `service_log_id` (nullable), `file_url`, `file_type`
- **vt_share_links** — `vehicle_id`, `token`, `include_costs`, `expires_at`

### Pattern to Repeat for Every Table

```sql
create table if not exists public.vt_vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nickname text not null,
  make text, model text, year int,
  vehicle_type text check (vehicle_type in ('car','motorcycle','scooter','truck','other')),
  vin text,
  current_mileage numeric default 0,
  mileage_unit text default 'km',
  photo_url text,
  created_at timestamptz default now()
);

alter table public.vt_vehicles enable row level security;

create policy "owner reads own vehicles" on public.vt_vehicles
  for select using (auth.uid() = user_id);
create policy "owner writes own vehicles" on public.vt_vehicles
  for insert with check (auth.uid() = user_id);
create policy "owner updates own vehicles" on public.vt_vehicles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner deletes own vehicles" on public.vt_vehicles
  for delete using (auth.uid() = user_id);
```

### Reminders — Computed, Not Stored

Rather than a table you have to keep in sync, compute due-status live — take the latest `service_date` / `mileage_at_service` per vehicle+category from `vt_service_logs`, add the category's interval, compare against `current_mileage` and today's date, and surface whichever threshold is closer. Same logic real maintenance schedules use.

### Share Links

`vt_share_links` holds a random token; a public `/shared/:token` route (no auth) calls a `security definer` Postgres function that checks the token and `expires_at`, then returns a sanitized read-only payload — specs and schedule always, costs only if `include_costs` is true.

---

## 5. Build Phases — Paste One at a Time

### Phase 1 — Foundation, Design System & Auth

Set up a React + Vite (TypeScript) project called Upkeep. Install Tailwind CSS v4 and wire up the color/typography/depth tokens from Section 2 as CSS custom properties toggled by a `data-theme` attribute. Install the Supabase client, connect to my existing project via environment variables, and list the existing public schema tables before creating anything new — every new table gets a `vt_` prefix. Build: a marketing landing page with a frosted-glass nav that collapses into a hamburger menu on mobile; sign-up/login/forgot-password via Supabase Auth; a protected route wrapper; and the logged-in app shell — a collapsible sidebar on desktop (Dashboard, Garage, Service Logs, Reminders, Specs, Fuel Log, Settings) that becomes a bottom tab bar plus an overflow menu on mobile, with a dark-mode toggle. No real vehicle data yet — just the shell, auth, and design system working end to end. Avoid generic AI-dashboard patterns: no numbered banner comments, no comments narrating the obvious, nothing that reads like a default template.

### Phase 2 — Vehicles & Service Logs

Add `vt_vehicles`, `vt_service_categories`, `vt_service_logs`, and `vt_service_log_parts` from Section 4, RLS scoped to `auth.uid()`. Seed default categories: Oil Change, Spark Plugs, Tire Rotation, Chain/Belt, Brake Pads, Coolant Flush, Air Filter, Battery. Build: an "Add Vehicle" flow; a garage view with a vehicle switcher; a "Log a Service" form (date, mileage, category, cost, a repeatable parts sub-form for name/part number/brand/quantity/cost, notes, optional receipt photo to Supabase Storage); and a per-vehicle service history timeline, filterable by category and date.

### Phase 3 — Dashboard, Reminders & Analytics

Build the computed due-status logic from Section 4. Dashboard cards per vehicle with ring-gauge reminders per category, color-coded with the tier tokens, overdue items surfaced first. Add cost analytics (spend over time, by category, by vehicle) with Recharts. Add fuel logging with an efficiency chart, unit-togglable (km/L or L/100km). An in-app notification banner is enough for reminders this phase — treat email/push as a later add-on.

### Phase 4 — Specs Library, Calculators & Sharing

Add `vt_vehicle_specs` with a UI to add/browse specs per vehicle, plus quick-search across all of a user's vehicles at once — typing "spark plug" should surface the part number for every vehicle they own. Build a tire-pressure calculator (base manufacturer PSI plus a load factor for passenger/cargo weight — show the formula used, don't just output a bare number) and a chain-slack checker (user enters their bike's manufacturer-specified range plus a measured value, flags too tight/loose). Add `vt_share_links`: generate a token-based public read-only link with a toggle for whether costs show, served at a `/shared/:token` route that needs no login.

### Phase 5 — Offline, Export & Polish

Add `vite-plugin-pwa` for home-screen install and offline shell/cache. Add CSV and PDF export of service history. Build Settings (units, currency defaulting to PHP/km/liters, theme, account, data export, delete vehicle/account). Add Framer Motion transitions, real empty states, and an accessibility pass (contrast, focus rings, keyboard navigation). Add a first-vehicle onboarding wizard. Pick 2–3 items from Section 6's extras to build now — registration/insurance renewal reminders and a command palette are good places to start.

---

## 6. Full Feature Checklist

### Core Tracker

- [ ] Multi-vehicle garage (car, motorcycle, scooter, truck)
- [ ] Service logs — date, mileage, cost, parts & part numbers
- [ ] Ring-gauge reminders (mileage- and time-based, whichever's sooner)
- [ ] Dashboard with at-a-glance status per vehicle
- [ ] Cost analytics by category, vehicle, time
- [ ] Fuel log + efficiency tracking
- [ ] Document vault — receipts, manuals, warranty cards
- [ ] CSV/PDF export
- [ ] Unit toggles — km/mi, L/gal, currency (default PHP)
- [ ] Dark mode, PWA/offline install

### Specs & Sharing

- [ ] Per-vehicle specs library (oil type, plug code, tire PSI, fuel octane, torque specs)
- [ ] Quick-search across your own garage
- [ ] Load-adjusted tire pressure calculator
- [ ] Chain slack checker
- [ ] Shareable read-only schedule links

### Philippines-specific

- [ ] LTO registration renewal reminder
- [ ] Insurance renewal reminder
- [ ] Emission testing reminder

### Polish

- [ ] Command palette (Cmd/Ctrl+K)
- [ ] Onboarding wizard
- [ ] Service provider/mechanic contact log
- [ ] Achievements/streaks for consistent logging

---

## 7. About the "Community" Idea

The brief you pasted described something bigger than a personal tool — a public, crowdsourced spec database open to any rider, for any bike. That's a genuinely good idea, but it's a separate product: public sign-ups, user-submitted content, moderation, and enough scale that it could threaten the free tier you're protecting — and since it'd share a Supabase project with GradeLedger, it'd share GradeLedger's user pool too.

What's built into the plan above is the personal version of the same idea instead — searchable instantly, shareable via a read-only link, without opening the whole system up.

If you want the full public version later, it's cleanest as its own project on its own fresh Supabase free project: a specs table keyed by `make/model/year` rather than by owner, a submission queue with an approval step before anything goes public, and rate-limiting to keep it from getting spammed. Happy to draft that brief separately whenever you're ready for it.
