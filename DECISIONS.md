# JMDJ (Jai Mata Di Jewellers) — Decision Log

Jewellery shop app (gold & silver). React Native/Expo + Supabase + Vercel + MSG91 + FCM.
This file is the single source of truth for decisions. If memory and this file disagree, **this file wins**.

> **Project file set — agents must read all four before any work:**
> | File | Purpose |
> |---|---|
> | `AGENTS.md` | How the agent must behave — rules, guardrails, deny list |
> | `PRD.md` | What to build (Phase 1) and what NOT to build (Phase 2) |
> | `DESIGN.md` | How it must look — theme tokens, layout rules |
> | `DECISIONS.md` (this file) | Why — every decision, with date and status |
>
> `CHANGELOG.md` is added once code begins.

**Status tags:**
- `LOCKED` — decided and agreed, do not change without a new dated entry.
- `OPEN` — still being discussed between Bhai and dev.
- `CLIENT-QUESTION` — needs the shop owner's answer before it can be locked.

---

## Session 1 — 2026-08-12 (discussion only, no code)

### Area 1 — Requirements

- `LOCKED` **Metals & rates:** four separate daily rates — 24K gold, 22K gold, 18K gold, silver. Admin updates all daily. Current rates shown on customer's home screen.
- `LOCKED` **Calculator (feature 3):** customer-facing *estimate* tool only. Standard Indian calculation. Completely separate from billing — customer-chosen making charge never flows into a real bill.
- `LOCKED` **Calculator formula:** metal = rate × weight → making = metal × making% → subtotal = metal + making → GST = 3% × subtotal → total = subtotal + GST. Weight box prefilled 10g, editable. Making charge dropdown 0–25%.
- `LOCKED` **Customer identity = mobile number.** Admin creates a bill against a mobile number; customer logs in with that number (OTP) and sees their own bills.
- `OPEN` **Feature 5 (notifications):** triggers not yet defined (new bill? rate change? payment reminder?). To be pinned later.

### Area 2 — Billing logic

- `LOCKED` **Multi-line bills:** one bill holds multiple line items; each line has its own metal, purity, weight, making charge, and amounts. Bill total = sum of lines.
- `LOCKED` **Frozen rate:** the rate used on a bill is copied onto the bill permanently at creation time. Later rate changes never alter past bills.
- `LOCKED` **Dues model = Model A (per-bill) with a combined total shown on top.** Each bill tracks its own paid/pending; customer's overall outstanding = sum of open bills.
- `LOCKED` **Payment allocation = FIFO (oldest bill first).** A payment is recorded against the customer and applied to the oldest unpaid bill; overflow spills to the next. Handles overpayment and payment-with-no-purchase.
- `OPEN` **Overpayment credit:** if a customer pays more than total dues, extra becomes an advance/credit on account. Small add — confirm if wanted.
- `LOCKED` **Rounding:** round only the final bill total to nearest ₹1 (round-off line). Never round mid-calculation.
- `LOCKED` **Partial payment:** any amount, not fixed options.
- `LOCKED` **Bills are immutable.** Corrections = void + reissue or an adjustment/credit note. Refund = negative entry, never a deleted bill. Every void/adjustment logs who/when/why.
- `LOCKED` **Discount — owner controls making charge freely** (this is in; needs no extra field).
- `OPEN` **Visible discount line** ("Making ₹5,000 − Discount ₹1,000"): only build if owner wants the saving shown on the bill. Decide later.
- `CLIENT-QUESTION` **Old-gold exchange** (trade-in old jewellery against a new bill): in or out of this build? Bhai to ask owner.
- `CLIENT-QUESTION` **Advance booking** (pay now for item made/delivered later): in or out? Bhai to ask owner.

### Area 3 — Data model

- `LOCKED` **Rates = append-only history.** Never overwrite. Customer screen shows **last 7 days** of rate history. Newest row per metal = today's rate.
- `LOCKED` **Weight precision = 3 decimals** in the code/number handling for now. `CLIENT-QUESTION` still open to confirm the shop scale actually shows 2 vs 3 decimals.
- `OPEN` (deferred to phase 2) **Payment allocation storage** — store how each payment splits across bills. Billing-side, revisit after approval.
- `OPEN` (deferred to phase 2) **Customer identity** — hidden internal ID as real key, phone as unique field. Revisit when building login/billing for real.

### Strategy — demo-first (decided 2026-08-12)

- `LOCKED` **Build a sample APK first** to win client approval, THEN do the deep build. Demo focuses on: polished UI/UX, daily rate update, price calculator, notification.
- `LOCKED` **Deferred to full build (phase 2):** billing, dues, payments, real OTP (MSG91), real FCM push.
- `LOCKED` **Build for real even in demo:** rate store (append-only, 7-day history) and money/weight number discipline (paise, NUMERIC, 3-decimal weight, no floats) — these carry into phase 2, don't throw away.
- `LOCKED` **Fake in demo:** OTP (dummy code, no MSG91 cost yet), FCM push (simple triggered notification), billing (not shown).
- `LOCKED` **Calculator math must be correct in the demo** — owner will verify totals by hand; wrong GST/making = lost trust.
- `TODO (Bhai)` Tell client in writing before handoff: "This APK is a look-and-feel + core-flow demo. Billing, dues, and login are the full build after approval." Protects the ₹40k scope line.

### Demo scope — screens

- `LOCKED` **Demo = Customer app + a minimal admin rate-update (option B).** Not full Next.js dashboard. The live "admin changes rate → customer screen updates" moment is the main selling point; Supabase realtime makes it cheap.
- `LOCKED` **Admin = separate web page** (Next.js + Supabase on Vercel), not a hidden in-app screen. Demos better (laptop → phone updates live), and becomes the seed of the phase-2 admin dashboard. Needs a basic admin login (simple password OK for demo). So demo = 2 deliverables: Expo customer APK + tiny admin web page.
- `LOCKED` **Customer demo screens (5):** (1) Login (dummy OTP), (2) Home/Rates — 4 metals + last-7-days history, updates live, (3) Calculator, (4) Notifications (one triggered push), (5) [admin lives on web, not in app].
- `NOTE` **Antigravity ↔ Stitch via MCP:** Bhai prompts Antigravity, which drives Stitch to generate UI. Stitch output is web (HTML/Tailwind/React) — Antigravity ports it to Expo/RN. MCP speeds handoff, does not change output format.

### Demo scope — look & feel

- `LOCKED` **Theme = the JMDJ website theme Bhai already built** (reuse for brand consistency across website + app + admin). Light/premium: cream/ivory background, deep maroon/burgundy primary, gold accent, elegant serif headings + clean sans body, subtle devotional (Ganesh/Lakshmi) motif.
- `LOCKED` **Light theme only** for demo (dropped earlier dark-luxury idea). Build one theme, not both.
- `LOCKED` **Take the theme, NOT the layout/scope.** The reference is an e-commerce website (Collections/Shopping Bag/Booking). The app is rates + calculator + notifications only. Lift colours/fonts/feel; do NOT carry over shopping structure. Warn owner at demo so he doesn't assume online shopping is included.
- `LOCKED` **Mobile-first layout.** Reference screenshots are desktop web; app is phone portrait — re-lay out as stacked rate cards + bottom tab bar. Theme carries, layout does not.
- `TODO (Bhai)` Provide **exact hex values + font names** from the existing website CSS for the build brief. Approx from screenshots (verify): cream ~#F7F3EC, maroon ~#5E1B2C, gold ~#C9A227, serif headings (Playfair/Cormorant-style), clean sans body.

### Still-open questions for the client/owner (demo)

- `CLIENT-QUESTION` Does the shop have an actual **logo** (beyond the "JMDJ" wordmark) and official brand colours to match exactly?
- `CLIENT-QUESTION` **Language** — app in English, Hindi, or bilingual? Affects every screen.
- `OPEN` Weighing precision (2 vs 3 decimals) — already noted in Area 3.
- `LOCKED` **Tooling decision:** install no extra Cowork plugins. Do NOT add Auth0/Twilio (conflicts with decided MSG91 OTP path).
- `TODO (Bhai)` **External coding skills to add** (better than built-ins for this stack): `supabase/agent-skills` (official — DB/Auth/Realtime/RLS/migrations), `expo/skills` (official — Expo/RN/EAS). Optional: `software-mansion-labs/skills` (animations/gestures for premium feel). Prefer official repos; vet community ones before trusting in billing code. Install via `npx skills add ...`.
- `LOCKED` **Build tooling:** code in **Google Antigravity** (credit efficiency). Antigravity supports the open Agent Skills standard, so the three skills above load into it directly (`npx skills add`). Claude (this) = planning + prompts (via prompt-master); Antigravity/Gemini = coding.
- `LOCKED` **UI pipeline:** **Stitch** generates the visual design (fast, polished) → implement in Expo via Antigravity → Expo + software-mansion skills refine the code. NOTE: Stitch exports web (HTML/Tailwind/React), **not React Native** — its output is visual direction only and must be ported to RN.
- `LOCKED` **DECISIONS.md is the shared brain across all three AIs** — tool-agnostic; keep updating it so context doesn't fragment.

---

## Open items & client questions — running list

1. `OPEN` Feature 5 notification triggers.
2. `OPEN` Overpayment → advance/credit on account (wanted?).
3. `OPEN` Visible discount line vs owner just setting making charge.
4. `CLIENT-QUESTION` Old-gold exchange — in or out?
5. `CLIENT-QUESTION` Advance booking — in or out?
6. `CLIENT-QUESTION` Weighing precision — does the shop scale show 2 or 3 decimals? (Area 3)
