# JMDJ Phase 1 Demo — Stitch UI Generation Plan (Corrected)

**Version:** 1.1 · **Date:** 2026-08-16
**Corrects v1.0 (Antigravity):** token block updated to the verified **Royal Burgundy & Sand** system in `DESIGN.md`. Old v1.0 placeholder colours, Inter, and 12px card radius were stale — do not use them.

> **Before generating: re-read `DESIGN.md`.** The tokens below are the single source of truth. Do not invent, adjust, or substitute colours, fonts, or spacing.

The goal is to generate 5 static mobile UI screens using the Stitch MCP server, strictly adhering to the "Royal Burgundy & Sand" design system and the requirements in `PRD.md` and `DESIGN.md`.

---

## Visual System (prepend to every prompt)

```text
Design strictly for a mobile phone in portrait mode (approx 390px wide).
DO NOT design a website, desktop layout, or responsive web view.
DO NOT include any e-commerce patterns (no cart, no collections, no products).
Use a light theme only. No dark mode.
Colors (Royal Burgundy & Sand):
- Background: #FAF9F6
- Surface (cards): #FFFFFF
- Primary (royal burgundy): #5C061C
- Primary pressed: #4A0516
- Secondary (sand/gold — large numerals, dividers, icons only): #E6C787
- Accent (muted rose — subtle highlights): #C89D9C
- Text on burgundy fills: #FAF9F6
- Text primary: #2C1E21
- Text secondary: #6B5E52
- Border: rgba(230, 199, 135, 0.3)
- Success (rate up): #1E7A4A
- Danger (rate down): #B3261E
Typography:
- Headings: Playfair Display (serif)
- Body/UI: Manrope (sans-serif)
- Numbers: Tabular figures, weight 600-700
- Minimum body text size: 16px
Spacing & Borders:
- Spacing scale: 4, 8, 12, 16, 24, 32, 48px
- Screen padding: 16px
- Radius: Cards 8px, Buttons 8px, Pills 999px
- Elevation: Subtle (prefer hairline borders over heavy shadows)
Contrast rule:
- Sand/gold (#E6C787) is for LARGE display numerals, dividers, and icons ONLY.
  Never use it for small text — it fails contrast on the cream background.
  Small/important text is Primary (#5C061C) or Text primary (#2C1E21).
```

---

## Screens to Generate

### 1. Login Screen
Generate a mobile app Login screen for "Jai Mata Di Jewellers".
- Top: Centered "JMDJ" wordmark in large Playfair Display serif, royal burgundy (#5C061C). Generous whitespace above.
- Body: A large numeric-keypad style phone input for a 10-digit Indian mobile number.
- Button: One primary button, burgundy fill (#5C061C) with #FAF9F6 text.
- Note: Premium, warm, traditional Indian luxury.

### 2. OTP Entry Screen
Generate a mobile app OTP entry screen for "Jai Mata Di Jewellers".
- Top: "JMDJ" wordmark or a back button with a simple heading (Playfair Display).
- Body: 4 separate large digit boxes for a 4-digit OTP.
- Action: A "Resend code" text link in burgundy (#5C061C).
- Button: One primary button (burgundy fill, #FAF9F6 text) to verify the OTP.
- Note: Cream background (#FAF9F6), burgundy and sand/gold accents.

### 3. Home / Rates Screen
Generate a mobile app Home/Rates screen for "Jai Mata Di Jewellers" showing live metal rates.
- Header: A visible "Last updated 10:30 AM IST" line (text secondary #6B5E52).
- Content: Four stacked cards vertically — Gold 24K, Gold 22K, Gold 18K, Silver.
- Card contents: Metal name in Playfair Display; today's rate per gram in ₹ as a LARGE tabular number in burgundy (#5C061C) or text primary (#2C1E21) — NOT gold; an up/down movement indicator vs yesterday using success (#1E7A4A) or danger (#B3261E) WITH an arrow; and a compact 7-day history trend. Surface white (#FFFFFF) with hairline borders (rgba(230,199,135,0.3)). Sand/gold (#E6C787) may be used for a divider or the trend accent only.
- Bottom: Tab bar with 3 items — Rates, Calculator, Notifications. Highlight "Rates".

### 4. Calculator Screen
Generate a mobile app Price Calculator screen for "Jai Mata Di Jewellers".
- Top: Inputs section.
  - Metal selector as segmented pills (24K, 22K, 18K, Silver), pill radius 999px; selected pill in burgundy (#5C061C) with #FAF9F6 text.
  - Weight field prefilled with "10" and a "g" suffix.
  - Making-charge dropdown showing a percentage (0-25%).
- Middle: A breakdown card (white surface, hairline border, 8px radius) showing:
  Metal value (e.g., ₹70,500)
  + Making charge (e.g., ₹7,050)
  = Subtotal (e.g., ₹77,550)
  + GST 3% (e.g., ₹2,326)
  Line separator
  TOTAL (largest text element on screen, e.g., ₹79,876) in burgundy (#5C061C).
- Bottom: Small caption "Estimate only. Final price may vary." (text secondary #6B5E52).
- Navigation: Bottom tab bar (Rates, Calculator, Notifications). Highlight "Calculator".

### 5. Notifications Screen
Generate a mobile app Notifications screen for "Jai Mata Di Jewellers".
- Content: A simple list of notifications.
- Items: Title (Manrope medium), body (Manrope regular), timestamp in IST (text secondary #6B5E52). Mark one unread notification with a sand/gold dot (#E6C787).
- Empty State: A friendly empty-state design (soft icon + friendly line) — never a blank screen.
- Navigation: Bottom tab bar (Rates, Calculator, Notifications). Highlight "Notifications".

---

## Verification Plan
- Each screen: confirm mobile-only (no desktop layout, no e-commerce features).
- Confirm every colour used is from the token block above — flag any off-palette colour Stitch introduces.
- Confirm fonts are Playfair Display (headings) + Manrope (body), card radius 8px.
- Confirm sand/gold is never used for small text; success/danger always paired with an arrow.
- Report status and any assumptions back to the owner before implementing in code.
