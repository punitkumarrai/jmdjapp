# DESIGN.md — JMDJ App

**Version:** 1.0 · **Date:** 2026-08-15

> **Agents: read `AGENTS.md` first.** This document says *how it must look*.
> Do not invent colours, fonts, or spacing. Use the tokens below.

---

## 0. ✅ TOKEN VERIFICATION STATUS

**The colour and font values in section 2 are `VERIFIED`.** They are the exact tokens from the existing **JMDJ website** — the **"Royal Burgundy & Sand"** design system — supplied by the owner. Website, mobile app, and admin dashboard now share one source of truth.

**Agents:** use these tokens exactly as written. Do **not** "improve", adjust, or substitute them.

> Note: `primaryDark`, `textSecondary`, `success`, and `danger` are semantic/state tokens (pressed states, rate up/down, errors) derived to match the brand palette. Treat them as final.

---

## 1. Design direction

The theme is taken from the **existing JMDJ website** already built for this client. Reusing it means website + mobile app + admin dashboard share one brand — which is itself part of the pitch.

**The feel:** premium, warm, traditional-Indian-luxury. Cream/ivory backgrounds, deep maroon as the primary, gold as the accent, elegant serif headings over a clean sans body. Devotional undertone appropriate to the name "Jai Mata Di".

**Light theme only.** Do not build a dark mode. One polished theme, not two half-finished ones.

### 🔴 THE MOST IMPORTANT RULE ON THIS PAGE

**Take the THEME. Do NOT take the LAYOUT or the SCOPE.**

The reference website is an **e-commerce storefront** — it has Collections, VIP Booking, Shopping Bag, product grids, New Arrivals, Private Appointments.

**This app is none of those things.** It is: rates, calculator, notifications.

- ✅ Copy: colours, typography, spacing feel, corner radii, the sense of luxury.
- ❌ Do **not** copy: navigation structure, shopping cart, product listings, booking forms, "collections", or any commerce pattern.
- ❌ Do **not** add screens that exist on the website but not in `PRD.md`.

If a design tool (Stitch) generates a shopping-style layout, **reject it** and re-prompt for the app's actual screens.

---

## 2. Design tokens `VERIFIED — Royal Burgundy & Sand`

### Colours — supplied brand palette

| Token | Value | Use |
|---|---|---|
| `background` (`bgWarm`) | `#FAF9F6` | Main screen background (warm off-white) |
| `surface` | `#FFFFFF` | Cards, elevated panels |
| `primary` | `#5C061C` | Royal burgundy — headings, primary buttons, key text |
| `secondary` | `#E6C787` | Sand/gold — highlights, rate values, dividers, icons |
| `accent` | `#C89D9C` | Muted rose — secondary highlights, subtle accents |
| `textDark` | `#2C1E21` | Body text (warm near-black) |
| `textLight` | `#FAF9F6` | Text on burgundy fills (buttons, headers) |
| `border` (`borderColor`) | `rgba(230, 199, 135, 0.3)` | Hairlines, card borders (sand at 30% opacity) |

### Colours — semantic / state tokens

Derived to match the brand palette; used for states the core palette doesn't cover.

| Token | Value | Use |
|---|---|---|
| `primaryDark` | `#4A0516` | Pressed/active state of primary (burgundy, darkened) |
| `textSecondary` | `#6B5E52` | Labels, captions, timestamps (warm taupe, 6.0:1) |
| `success` | `#1E7A4A` | Rate increase, confirmations (deep emerald, 5.1:1) |
| `danger` | `#B3261E` | Rate decrease, errors (bright vermillion, 6.3:1) |

**Rate movement colours:** use `success` for an increase, `danger` for a decrease, `textSecondary` for unchanged. Always pair colour with an arrow or `+`/`−` sign — never rely on colour alone.

### Typography

| Role | Family | Notes |
|---|---|---|
| Headings / display | **Playfair Display**, serif | Matches the website's serif wordmark |
| Body / UI | **Manrope**, sans-serif | Readability first |
| Numbers (rates, totals) | Manrope, **tabular figures**, weight 600–700 | Must not shift width as digits change |

**Scale (mobile):**

| Token | Size / weight | Use |
|---|---|---|
| `display` | 32 / bold serif | Rate hero numbers |
| `h1` | 24 / serif | Screen titles |
| `h2` | 20 / serif | Section headings |
| `body` | 16 / regular sans | Default text |
| `label` | 14 / medium sans | Field labels |
| `caption` | 12 / regular sans | Timestamps, hints |

**Minimum body text size is 16.** Many customers are older; do not go smaller for style.

### Spacing, radius, elevation

- **Spacing scale (px):** `4, 8, 12, 16, 24, 32, 48`. Use only these. Default screen padding: `16`.
- **Radius:** `roundness` token = `8` — cards `8`, buttons `8`, pills/chips `999`.
- **Elevation:** subtle only — soft shadow, low opacity. This is a premium brand, not a material-design app. Prefer a hairline `border` over a heavy shadow.

---

## 3. Mobile layout rules

**The reference screenshots are desktop web. This app is a phone in portrait. Re-lay out — never shrink a desktop layout.**

- **Navigation:** bottom tab bar, three tabs — **Rates · Calculator · Notifications**. Login sits in front of the tabs.
- **Vertical stacking.** No multi-column grids. One card per row.
- **Touch targets minimum 44×44 pt.**
- **Thumb reach:** primary actions in the lower half of the screen.
- Support small phones (360 px wide) up to large. Test on 360.
- **Safe areas** respected top and bottom.

---

## 4. Screen-level guidance

Screens are specified in `PRD.md`. This covers only how they should look.

### Login
- Centred, generous whitespace. JMDJ wordmark in serif maroon at the top.
- Large numeric-keypad phone input. OTP as separate digit boxes.
- One clear primary button (maroon fill, cream text).
- Even though the OTP is dummy in Phase 1, it must **look completely real**.

### Home / Rates — the hero screen
- **Rates are the star.** Four cards — Gold 24K, 22K, 18K, Silver — stacked.
- Each card: metal name (serif), **rate per gram large in gold or maroon**, movement indicator vs yesterday, and a compact 7-day history.
- "Last updated <time> IST" clearly visible — it proves the data is live.
- **The live-update moment must be visible.** When a rate changes, animate it — a gentle highlight or count-up, ~300–500 ms. Subtle, not flashy. This is the demo's key moment; the change must be impossible to miss.
- Required states: loading (skeletons, not a bare spinner), empty, offline/error.

### Calculator
- Inputs first, result below.
- Metal selector as pills/segmented control. Weight as a numeric field prefilled `10` with a `g` suffix. Making charge as a dropdown, 0–25%.
- **Show the full breakdown**, not just a total: metal value → making → subtotal → GST 3% → **Total**.
- Total is the visual anchor — largest text, gold or maroon, in its own card.
- Show the rate used, and the line *"Estimate only. Final price may vary."*

### Notifications
- Simple list. Unread marked with a gold dot.
- Title (medium), body (regular), timestamp (caption, IST).
- Empty state with a friendly line and a soft icon — never a blank screen.

### Admin web page
- Same tokens, desktop layout. Clean and functional — this is a tool, not a showpiece.
- Four labelled rate inputs showing current values, then Save.
- **Confirmation step before saving.** Show old → new side by side. A mistyped rate goes live to every customer instantly.

---

## 5. Motion

- Purposeful only. Nothing decorative.
- Standard transition **200–300 ms**, ease-out.
- The rate-change highlight is the **one** signature animation — make it good.
- Respect the OS "reduce motion" setting.
- Prefer the platform-native animation libraries already in the Expo stack. **Do not add an animation package without asking** (`AGENTS.md` rule 3).

---

## 6. Content and language

- Currency: `₹` with Indian digit grouping — **₹7,05,000**, not ₹705,000.
- Weight: show up to 3 decimals, trailing zeros trimmed (`10g`, `10.5g`, `10.505g`).
- Dates/times: IST, human-friendly (`15 Aug 2026, 10:30 AM`).
- Plain, simple English. Short labels. Avoid jargon — the audience is shop customers, not app users by habit.

> ❓ **NEEDS CLIENT CONFIRMATION:** should the app be in English, Hindi, or bilingual? Currently building in English. This affects every screen — confirm before finalising copy.

---

## 7. Accessibility (non-negotiable)

- Body text contrast **≥ 4.5:1** against its background. Verify burgundy-on-cream and especially **sand/gold on cream** — sand `#E6C787` on background `#FAF9F6` **fails badly** for small text (it is lighter than the old gold). Use `secondary` for large numerals and decoration only; use `primary` or `textDark` for anything small.
- Never signal meaning by colour alone (rate up/down needs an arrow too).
- All interactive elements need accessible labels.
- Support OS font scaling — layouts must not break when text is enlarged.

---

## 8. Assets

- **Logo:** currently only a `JMDJ` serif wordmark. ❓ Ask the client for a real logo file and exact brand colours.
- **Imagery:** use sparingly. Rates and the calculator are utilities — do not bury them under decorative photography.
- Do not use stock photos of jewellery that isn't the client's without permission.
- Icons: one consistent set, thin/elegant weight to match the serif brand.
