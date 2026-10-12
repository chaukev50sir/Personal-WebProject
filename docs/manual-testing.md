# Manual Accessibility Test Log

| | |
|---|---|
| **Tester** | Victor Chauke |
| **Date** | 10/10/2026 |
| **Screen reader** | NVDA |
| **Browser** | Chrome 141 |
| **OS** | Windows 11 |
| **Build** | Production build (`npm run build`, served with `npx vite preview`) |

## A. Keyboard-only tab sequence (no screen reader)

| # | Step | Expected | Result (works?? (Y/N)) | Notes |
|---|---|---|---|---|
| A1 | Load home, press Tab once | "Skip to main content" appears top-left as a marigold box |Y| |
| A2 | Press Enter | Focus moves to main content. The next Tab goes to the search box |Y| |
| A3 | Tab through the whole home page | Order matches the visual order. Links turn marigold (highlighter) and buttons/inputs get an ink ring with a marigold halo. No stop is invisible |Y| |
| A4 | Activate "Courses & archives" | Focus lands on the "Courses and learning archives" heading |Y| |
| A5 | Tab to "Topic", press Enter, then Space | The panel opens, then closes. Chips are only reachable while it's open |Y| |
| A6 | Tab to the "Languages" chip, press Space | The chip fills with its berry colour and shows ✓. The list shrinks |Y| |
| A7 | Activate "Clear all filters" | Focus moves to the "Results" heading |Y| |
| A8 | Open a course, Tab to "Register", press Enter | The dialog opens and focus is on "Confirm" |Y| |
| A9 | Tab repeatedly inside the dialog | Focus never reaches the page behind |Y| |
| A10 | Press Escape | The dialog closes and focus returns to "Register" |Y| |
| A11 | "Book a room": submit the empty form | The error summary is focused. Each link jumps to its field |Y| |
| A12 | Complete a valid booking with the keyboard only (arrow keys for the radios, date typed) | "Booking confirmed" heading is focused |Y| |
| A13 | Browser zoom to 400% on the booking page | Single column, no horizontal scroll, nothing cut off |Y| |

## B. Screen reader script

Announcements from the NVDA Speech Viewer.

| # | Step | Expected announcement (approximately) | Actually announced what we expected??(Y/N) | Result works?? (Y/N) |
|---|---|---|---|---|
| B1 | NVDA `D` (next landmark) on home | banner, Primary navigation, main, complementary, content info |Y|Y|
| B2 | NVDA `H` through home | h1 "Learn, borrow and meet…", h2 "Search the catalogue", … |Y|Y|
| B3 | Catalogue: Tab to "Topic" | "Topic, button, collapsed" (plus heading level in browse mode) |Y|Y|
| B4 | Press Enter on "Topic" | "expanded" |Y|Y|
| B5 | Space on the "Languages" chip | "Languages, toggle button, pressed". After about 0.6 s: "Showing 2 of 12 resources. |Y|Y|
| B6 | Press Space on "Languages" again to turn it off, then type "excel" in the keyword box | No count while typing. One announcement after the pause: "Showing 1 of 12 resources." |Y|Y|
| B7 | Booking: focus Email | "Email address, edit, We'll send your booking confirmation here." |Y|Y|
| B8 | Type `lindiwe@`, press Tab | "Email address: Enter an email address in the format name@example.com" (polite) |Y|Y|
| B9 | Shift+Tab back to Email | "…invalid entry… Error: Enter an email address in the format…" |Y|Y|
| B10 | Choose "Media room", then type a date within the next 14 days | "N of 3 time slots available in Media room on …" (or "No time slots are free…") |Y|Y|
| B11 | Submit with errors | "There are N problems with your booking" read when the summary receives focus |Y|Y|
| B12 | Submit valid booking | "Booking confirmed" heading read, plus "Booking confirmed: Media room, …" |Y|Y|
| B13 | Detail: Register → Confirm | Dialog announced with title + description. After confirm: "You are registered for…" |Y|Y|

## C. Findings 
None #Everything runs well (nothing failed)

