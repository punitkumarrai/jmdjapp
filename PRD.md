# PRD — JMDJ App (Jai Mata Di Jewellers)

**Version:** 1.0 · **Date:** 2026-08-15 · **Status:** Phase 1 approved for build

> **Agents: read `AGENTS.md` first.** This document says *what* to build.
> **Sections marked 🔴 PHASE 2 are NOT part of this build. Do not implement them.**

---

## 1. What this is

A mobile app + admin web page for **Jai Mata Di Jewellers**, a gold and silver jewellery shop in India.

**The problem it solves:** customers constantly call or visit the shop to ask today's gold rate, and have no way to estimate what a piece will cost. The shop has no digital record customers can see. This app puts live rates in the customer's pocket, lets them estimate a price themselves, and (in Phase 2) shows them their bills and outstanding dues.

**Users:**

| User | Platform | What they do |
|---|---|---|
| **Customer** | Expo mobile app (Android APK) | View daily rates, estimate prices, receive notifications |
| **Admin (shop owner)** | Next.js web page | Update daily rates. 🔴 Phase 2: create bills, record payments |

**Commercial context:** fixed quote ₹40,000. Phase 1 is a demo built to win client approval. Phase 2 begins only after the client approves and the scope is agreed in writing.

---

## 2. Phase boundary — READ THIS BEFORE BUILDING

| | Phase 1 — BUILD NOW | 🔴 Phase 2 — DO NOT BUILD |
|---|---|---|
| Login | Dummy OTP (fixed code, no SMS sent) | Real MSG91 OTP |
| Rates | Full: admin updates → customer sees live | (same, unchanged) |
| Calculator | Full, correct math | (same, unchanged) |
| Notifications | Simple in-app list + one triggered demo notification | Real FCM push |
| Billing | ❌ Nothing | Bills, line items, dues, payments, refunds |
| Customer bills screen | ❌ Nothing | Full bill history + outstanding |

**Why this split:** the client has not paid for or approved the full build. Building Phase 2 early gives away unpaid work and risks the ₹40,000 line. Phase 2 is documented here **so its decisions are not lost**, not so it can be built.

**Build to production quality even in Phase 1:** the rate storage model and all money/number handling (section 6 of `AGENTS.md`). These carry into Phase 2 unchanged and must not be rewritten later.

---

## 3. PHASE 1 — Customer mobile app

Four screens. A bottom tab bar for Rates / Calculator / Notifications, with login in front.

### 3.1 Login

- User enters **mobile number** (10 digits, Indian). Then enters an OTP.
- **Phase 1: dummy.** Accept a fixed code (e.g. `1234`) with no SMS sent. No MSG91 integration, no cost.
- The number entered is remembered as the user's identity for the session.
- Must still *look* like a real OTP flow — the owner is judging polish.
- Validate: exactly 10 digits, numeric. Show clear inline errors.

> 🔴 **Phase 2:** real MSG91 OTP, resend timer, rate limiting, session persistence.

### 3.2 Home / Rates — *the most important screen*

Shows today's rates for **four** metal types:

| Key | Display name |
|---|---|
| `gold_24k` | Gold 24K |
| `gold_22k` | Gold 22K |
| `gold_18k` | Gold 18K |
| `silver` | Silver |

Requirements:

- Rates displayed **per gram**, in ₹, large and highly legible. This is the screen customers open daily.
- Show **"last updated"** timestamp, converted to IST for display.
- Show a **7-day history** for each metal (last 7 days of rates). Simple list or small trend indicator — no heavy charting library.
- **Live update:** when the admin changes a rate on the web page, this screen must update **without the customer restarting or manually refreshing**. Use Supabase Realtime subscription.
- Graceful states required: loading, empty (no rates yet), offline/error.

**This live update is the single most important demo moment.** The owner changes a rate on a laptop and watches the phone update. It must be reliable.

### 3.3 Calculator

A price **estimator**. It is **not** a bill and produces no record.

Inputs:
1. **Metal selector** — 24K / 22K / 18K / Silver. Pulls today's rate automatically; the customer **cannot** edit the rate.
2. **Weight** — numeric input, **prefilled with `10` grams**, editable. Accepts up to 3 decimal places.
3. **Making charge** — dropdown, **0% to 25%**.

Output — show the full breakdown, not just a total:

```
Metal value      = rate × weight
Making charge    = metal value × making%
Subtotal         = metal value + making charge
GST (3%)         = subtotal × 3%
─────────────────────────────
Total            = subtotal + GST   (rounded to nearest ₹1)
```

Rules:
- GST is **3%** on **metal + making** (not metal alone).
- Round **only the final total**, to nearest ₹1. Never round intermediates.
- All math in `lib/money.ts`, no floats. **Unit tests required.**
- Show the rate used and a line: *"Estimate only. Final price may vary."*

**⚠️ The owner will check this against his own calculation. If the math is wrong, the demo fails.**

### 3.4 Notifications

- A simple list of notifications with title, body, timestamp (IST).
- Demo requirement: **one triggered notification** — e.g. when a rate is updated, a notification appears ("22K gold rate updated to ₹7,050/g").
- Phase 1 may use a local/in-app notification. Real FCM push is Phase 2.

> ❓ **NEEDS CLIENT CONFIRMATION:** what should trigger notifications in the real product? Options: every rate change, daily rate summary, new bill issued, payment reminder for dues. Not yet decided.

---

## 4. PHASE 1 — Admin web page

Separate **Next.js app on Vercel**, not part of the mobile APK. Two pages.

### 4.1 Admin login
- Simple email+password or a single shared password (Phase 1 only — acceptable for a demo).
- **No rate may be changeable without login.**

### 4.2 Rate update
- Four inputs, one per metal, prefilled with the current rate.
- "Save" writes new rate rows and the customer app updates live.
- Show the current/previous value so a typo is obvious before saving.
- **Confirmation step before saving** — a mistyped rate (₹700 instead of ₹7,000) would be visible to every customer instantly.
- Show last-updated time and who updated it.

> 🔴 **Phase 2:** this grows into the full admin dashboard (customers, billing, payments, reports).

---

## 5. Data model — Phase 1

Only what Phase 1 needs. **Propose the schema and get approval before writing migrations** (`AGENTS.md` rule 3).

### `metal_rates` — append-only rate history
- `id`
- `metal_type` — enum/text: `gold_24k` | `gold_22k` | `gold_18k` | `silver`
- `rate_per_gram` — **NUMERIC**, never float
- `effective_at` — `timestamptz`, UTC
- `created_by` — admin user reference
- `created_at` — `timestamptz`, UTC

**Rules:**
- **Append-only.** An update = INSERT a new row. Never UPDATE or DELETE.
- "Today's rate" = most recent row per `metal_type`.
- 7-day history = rows within the last 7 days.
- RLS: anyone authenticated may **read**; only admin may **insert**.

### Admin users
- Use Supabase Auth for the admin. Do not hand-roll authentication.

**Not in Phase 1:** customers table, bills, bill line items, payments. Those are Phase 2.

---

## 6. 🔴 PHASE 2 — documented for context, DO NOT BUILD

These decisions are locked so they are not lost or re-litigated. **They describe future work.**

### 6.1 Customers
- Identity key = **mobile number**, but the number is NOT the primary key. Each customer has an internal ID; phone is a separate unique, indexed, normalised field. This lets the owner correct a wrong number without breaking bills.
- Admin creates the customer record (name + phone). Customer logs in with that number via OTP and sees their own bills.
- ❓ **NEEDS CLIENT CONFIRMATION:** is the app for all customers or only regulars?

### 6.2 Bills
- A bill has **multiple line items**. Each line has its own metal, purity, weight, making charge, and computed amounts. Bill total = sum of lines.
- **Each line freezes the rate used at creation time.** Bills never read the live rate table.
- Same calculation chain as the calculator (section 3.3). Round only the final total.
- The **owner sets the making charge** on a bill — it is not customer-selected. The calculator's making % never flows into a bill.
- ❓ Open: whether to show a separate visible "Discount" line, or just let the owner set a lower making charge (which needs no extra field).

### 6.3 Bills are immutable
- Once issued, a bill is **never edited or deleted**.
- Corrections = **void + reissue** (old bill marked void, kept forever, new bill created) or an **adjustment / credit note**.
- A refund is a **negative entry**, never a deletion.
- Every void/adjustment records **who, when, and why**.
- *Rationale: editing in place destroys the audit trail and can silently change what a customer already saw and paid against.*

### 6.4 Dues and payments
- **Model A (per-bill):** each bill tracks its own paid/pending. The customer's total outstanding = sum of open bills. This gives both a per-bill view and a single total.
- **Payments apply FIFO — oldest unpaid bill first.** A payment is recorded against the *customer*; the system applies it to the oldest open bill and spills any remainder to the next.
- **Store the allocation.** Record exactly how each payment was split across bills — do not merely recompute it.
- Partial payment = **any amount**, not preset options.
- Worked example (must hold true):
  - Buys ₹50,000, pays ₹20,000 → Bill 1 pending ₹30,000
  - Buys ₹20,000, pays ₹40,000 → ₹30,000 clears Bill 1, ₹10,000 to Bill 2 → Bill 2 pending ₹10,000
  - Pays ₹5,000, no purchase → Bill 2 pending ₹5,000
  - **Total outstanding ₹5,000**
- ❓ Open: if a customer overpays total dues, does the excess become an advance/credit on account?

### 6.5 Deferred / undecided features
- ❓ **NEEDS CLIENT CONFIRMATION — old-gold exchange:** customer trades in old jewellery, its value is deducted from the new bill. In or out?
- ❓ **NEEDS CLIENT CONFIRMATION — advance booking:** customer pays now for an item delivered later. In or out?
- Real MSG91 OTP and real FCM push.

---

## 7. Explicitly OUT of scope

Not in Phase 1 or Phase 2 unless separately quoted:

- ❌ **Online shopping / e-commerce.** The visual theme comes from the JMDJ website, which *is* a storefront — but this app does **not** sell online. No product catalogue, no cart, no checkout, no VIP booking. (See `DESIGN.md`.)
- ❌ iOS build / App Store submission (Android APK only unless agreed).
- ❌ Payment gateway / online payments.
- ❌ Inventory or stock management.
- ❌ GST filing, accounting exports, or tax reports.
- ❌ Multi-shop / multi-branch support.
- ❌ Customer self-signup without the shop creating the record.

---

## 8. Open questions

**For the client (shop owner):**
1. Old-gold exchange — in or out?
2. Advance booking — in or out?
3. Weighing precision — does the shop scale show 2 or 3 decimals? *(Building for 3.)*
4. Does the shop have a real logo and exact brand colours?
5. App language — English, Hindi, or bilingual?
6. Notification triggers — what should notify a customer?
7. **Commercial:** confirm in writing that the demo APK is look-and-feel + core flows, and that billing/dues/real login are the paid full build.

**For the developer:**
1. Overpayment → advance/credit on account: wanted?
2. Visible discount line vs owner simply setting the making charge.

---

## 9. Success criteria — Phase 1 demo

The demo succeeds if, in front of the owner:

1. The app **looks like JMDJ** — matches his website's brand.
2. The owner changes a rate on a laptop and the phone **updates live**, unprompted.
3. He punches numbers into the calculator and the total **matches his own manual calculation exactly**.
4. A notification appears when the rate changes.
5. Nothing crashes, and no screen looks unfinished.

**The demo fails if** the calculator math is wrong, the live update doesn't fire, or the UI looks generic.
