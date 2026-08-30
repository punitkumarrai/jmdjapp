# Changelog

## 2026-08-28
- Downgraded `mobile/` project Expo SDK from version `57.0.16` to `56.0.21` (via `npm install expo@^56.0.0` and `npx expo install --fix`). 
- Realigned all native dependency versions (`react-native` to `0.85.3`, `expo-router` to `~56.2.20`, etc.) to be compatible with SDK 56.
- Reason: The device's Play Store Expo Go app supports SDK 56, not 57.

## 2026-08-28 (SDK 54 Downgrade)
- Downgraded "mobile/" project Expo SDK from version "56.0.21" to "54.0.37" (via "npm install expo@^54.0.0" and "npx expo install --fix").
- Cleared node_modules and package-lock.json to avoid ERESOLVE peer-dependency conflicts during downgrade.
- Realigned all native dependency versions ("react-native" to "0.81.5", "expo-router" to "~6.0.24", etc.) to be compatible with SDK 54.
- Reason: The device's Play Store Expo Go app supports SDK 54 exclusively.


## 2026-08-28 (Cleanup SDK 54 plugins)
- Removed "expo-image", "expo-font", "expo-status-bar", and "expo-web-browser" from plugins in "app.json" as they don't have valid config plugins in SDK 54.
- Uninstalled "expo-image" as it wasn't used in the codebase.
- Cleaned dependencies and verified build via 
px expo-doctor and 
px tsc --noEmit.


## 2026-08-28 (Rate Detail Screen)
- Made \RateCard\ tappable via \Link\ (expo-router) to push a per-metal rate detail screen over the tabs.
- Created \pp/rate/[metal].tsx\ to parse the metal param and display current rate, movement, 7-day flex-bar chart, and a derived daily delta list for the last 7 calendar days.
- Styled with existing burgundy/cream/serif tokens without modifying navigation stack dependencies.


## 2026-08-28 (Rate Detail Chart & Date Fix)
- Fixed 'Invalid Date' bug in \pp/rate/[metal].tsx\ by dropping locale string-parsing in favor of direct Javascript Date millisecond offset math and explicit array-based date formatting.
- Added interactivity to the 7-day rate bar chart: bars are now tappable, highlight in brand primary when selected, and dynamically update a localized readout immediately below the chart.


## 2026-08-29 (Rate Detail UI Polish)
- Updated top price section to explicitly anchor as 'Today' with a date label.
- Refactored chart scaling to be strictly proportional to absolute values (base 0, with a 5% padding above max), preventing exaggeration of minor price variances.
- Added faint dashed reference lines at the 7-day max and min boundaries with numeric labels.
- Enhanced the interactive chart readout to display a 'vs today' metric for historical days.


## 2026-08-29 (Bar Chart Redesign)
- Overhauled the chart component in \pp/rate/[metal].tsx\ to behave like a standard Y-axis chart.
- Calculated smart \xisMin\ and \xisMax\ bounds (rounded to the nearest 50 with margin) to properly emphasize realistic day-over-day changes.
- Placed 5 evenly spaced, numeric-labeled gridlines in the background spanning the active rate window.
- Injected shortened weekday X-axis labels under the bars.
- Adjusted styling logic to tint the 'Today' bar and any active selected bar with the brand burgundy token, while defaulting other days to sand/gold.


## 2026-08-29 (Money Calculation Engine)
- Built \src/lib/money.ts\ entirely using BigInt to handle Indian jewellery calculations (metal value, making, 3% GST).
- Guaranteed no floating-point discrepancies by processing the final total internally via a single \1,000,000,000n\ fractional division step, correctly applying round-half-up to the nearest Rupee.
- Prepared comprehensive unit tests in \__tests__/money.test.ts\ verifying edge cases and sample math without arbitrary rounding.


## 2026-08-29 (Jest Testing Setup)
- Installed \jest-expo\, \jest\, and \@types/jest\ (SDK 54 compliant) into the mobile project to enable test coverage.
- Verified all BigInt math logic in \src/lib/__tests__/money.test.ts\ successfully matches explicit real-world shop values, proving complete zero-float safety for upcoming calculators.


## 2026-08-30 (Estimate Calculator Build)
- Implemented the user-facing Estimate Calculator screen at \pp/(tabs)/calculator.tsx\ using precise BigInt logic from \money.ts\.
- Added live inputs for Metal (chips), Weight (numeric text input with decimal guard), and Making Charge (Modal sheet dropdown from 0-25%).
- Plumbed accurate breakdown metrics for metal value, making, GST, and rounded final total strictly formatted via \ormatCurrency\ with paise precision.

