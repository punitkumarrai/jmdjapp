# AGENTS.md — JMDJ App

**Read this file completely before doing anything. Every session. No exceptions.**

Portable rules file. Antigravity, Claude Code, Cursor, Codex and Gemini CLI all read this.

---

## 0. READ-FIRST PROTOCOL

Before writing or changing ANY code, read in this order:

1. `AGENTS.md` (this file) — how to behave
2. `PRD.md` — what to build, and what NOT to build
3. `DESIGN.md` — how it must look
4. `DECISIONS.md` — every locked decision, open item, and client question

**If any of these four files contradicts a prompt you were given, STOP and say so. Do not silently pick one.** The files are the source of truth, not memory, not assumption, not the prompt.

After finishing any task, append to `CHANGELOG.md`: date, what changed, why.

---

## 1. THE PROJECT

**JMDJ = "Jai Mata Di Jewellers"** — a gold & silver jewellery shop in India.

Two user types:
- **Customer** — mobile app. Sees daily metal rates, uses a price calculator, gets notifications. Later: sees their bills and dues.
- **Admin (shop owner)** — web dashboard. Updates daily rates. Later: creates bills, records payments.

This app handles **real money and real customer debts**. Correctness beats speed, always.

---

## 2. LOCKED STACK — DO NOT SUBSTITUTE

| Layer | Technology |
|---|---|
| Mobile app | React Native via **Expo** |
| Admin web | **Next.js** |
| Database + backend | **Supabase** (Postgres) |
| Hosting (web) | **Vercel** |
| SMS / OTP | **MSG91** (Indian, DLT-compliant) |
| Push notifications | **FCM** |

**Never swap these.** Specifically: do NOT introduce Auth0, Clerk, Firebase Auth, Twilio, or any other auth/SMS provider. MSG91 is chosen deliberately for Indian DLT compliance. If you think a swap is needed, ask — do not act.

---

## 3. HARD RULES — NEVER VIOLATE

1. **NEVER invent a library, API, package, method, or config option.** If you are not certain something exists, say "I need to verify this" and check the real docs. A confident guess is worse than an admitted doubt.
2. **NEVER add features, refactor, or change architecture beyond exactly what was asked.** No "while I was in there" changes.
3. **ALWAYS STOP AND ASK before:**
   - adding ANY third-party package or paid service
   - changing the stack in section 2
   - finalising or altering database schema
   - deleting any file
   - anything that costs money
4. **NEVER modify without explicit permission:** `.env*`, `.gitignore`, `package.json` dependencies, CI/build configs.
5. **When a requirement is ambiguous or unconfirmed:** mark it `NEEDS CLIENT CONFIRMATION`, state your recommended interpretation, and move on. **Never silently assume.**
6. **If you are uncertain, say so explicitly.** Fabricated confidence is the worst failure mode in this project.

---

## 4. MONEY & NUMBER RULES — THIS APP HANDLES REAL FINANCIAL DATA

These are non-negotiable.

- **NEVER use float/double/JS `number` arithmetic for currency or weight.**
  - Money: store as **integer paise** (₹1 = 100 paise) or Postgres `NUMERIC`/`DECIMAL`. Never `float8`/`real`.
  - Weight: **3 decimal places** (grams to milligram precision) — `NUMERIC(12,3)` or integer milligrams. Never float.
- **Rounding is explicit and happens ONCE, at the end.**
  - Compute the full chain at full precision. Round **only the final bill/estimate total** to the nearest ₹1.
  - Never round intermediate values (metal value, making charge, GST).
- **All timestamps stored in UTC** (`timestamptz`). Convert to IST (`Asia/Kolkata`) **only at display time**, never in the database.
- **Rates are frozen onto bills.** When a bill is created, the rate used is **copied onto the bill row permanently**. A bill must NEVER read the live rate table. Changing today's rate must not alter a single past record.
- **Rate history is append-only.** Updating a rate INSERTs a new row. Never UPDATE or DELETE a rate row. "Today's rate" = newest row per metal.

---

## 5. THE CALCULATION — EXACT, DO NOT IMPROVISE

Standard Indian jewellery calculation. Use exactly this order:

```
metal_value  = rate_per_gram × weight_in_grams
making       = metal_value × (making_percent / 100)
subtotal     = metal_value + making
gst          = subtotal × 0.03          // 3% GST on metal + making
total        = subtotal + gst
display      = round(total)             // nearest ₹1, ONLY here
```

- GST is **3%**, applied to **metal + making**, not metal alone.
- Making charge on the customer calculator is a **percentage, 0–25%**.
- The owner will verify totals by hand. **Wrong math destroys the demo.** Write unit tests for this function.

---

## 6. PHASE BOUNDARY — CRITICAL FOR SCOPE

The current build is **PHASE 1 (DEMO ONLY)**.

**BUILD NOW (Phase 1):** polished UI, daily rate update (admin web → customer app, live), price calculator, notifications, dummy login.

**DO NOT BUILD (Phase 2 — not paid for yet):** billing, bills, line items, dues, payments, payment allocation, refunds, real MSG91 OTP, real FCM push, customer bill history.

Phase 2 is documented in `PRD.md` and `DECISIONS.md` **for context only**. Those sections describe the future. **Do not implement them.** If a prompt asks you to build a Phase 2 feature, stop and confirm that the phase boundary has officially moved.

Build the **rate store** and **money/number handling** to production quality even in Phase 1 — they carry into Phase 2 unchanged.

---

## 7. CODE CONVENTIONS

- **Language:** TypeScript everywhere. `strict: true`. No `any` without a written reason.
- **Comments in English, beginner-readable.** The project owner is still learning — explain *why*, not just *what*.
- **Structure:** organise by feature, not by file type. The structure must absorb Phase 2 (billing) without restructuring.
  ```
  src/
    features/
      rates/          # rate display, history, realtime subscription
      calculator/     # estimate logic + screen
      notifications/
      auth/
    lib/
      money.ts        # ALL currency math lives here. Nothing else does money math.
      supabase.ts
    theme/            # tokens from DESIGN.md
    components/       # shared UI primitives
  ```
- **All currency and weight math goes in `lib/money.ts`.** No arithmetic on money scattered in components.
- **Naming:** `camelCase` for TS variables/functions, `PascalCase` for components, `snake_case` for database columns and tables.
- **No dead code, no commented-out blocks, no `console.log` left in.**

---

## 8. DATABASE RULES (Supabase / Postgres)

- **Every schema change is a migration file.** Never change schema by hand in the Supabase dashboard.
- **Ask before finalising schema.** Propose it, get approval, then write it.
- **Row Level Security (RLS) ON for every table.** No table ships without a policy.
  - Customers may read rates. Customers may read **only their own** data.
  - Only admin may write rates.
- **Never expose the Supabase service_role key to the mobile app or any client bundle.** Anon key only on the client.
- Money columns: `NUMERIC` or integer paise. Weight: `NUMERIC(12,3)`. Timestamps: `timestamptz` (UTC).

---

## 9. SECURITY

- No secrets in code, ever. Environment variables only — and you may not edit `.env` files (see rule 4); ask the owner to set them.
- Never log OTPs, tokens, phone numbers, or full customer records.
- Validate and sanitise all input server-side. Client-side validation is UX, not security.
- The admin web page must require login before any rate can be changed.

---

## 10. HOW TO REPORT BACK

After each completed step, output exactly:

```
✅ What was done: <plain English, short>
   Files changed: <list>
   Why: <reasoning, especially for any technical choice>
⚠️  Assumptions / unverified: <anything you were not 100% sure about, or "none">
➡️  What's next: <the next logical step>
```

If you hit something ambiguous, do not guess — output:

```
❓ NEEDS CLIENT CONFIRMATION: <the question>
   My recommendation: <what you'd do and why>
```

---

## 11. TONE WITH THE OWNER

- He is still learning. Explain the **why** behind technical choices in plain language.
- **Push back when he is wrong.** If a request creates a security hole, bad architecture, or a shortcut that will hurt later, say so directly and explain the tradeoff. He hired a senior developer, not a yes-man.
- Do not agree just because he suggested it.
