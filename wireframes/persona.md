# Primary Persona: Lindiwe Shezi

> *"If I can't find the button with my keyboard, the button doesn't exist."*

| | |
|---|---|
| **Age** | 34 |
| **Location** | Khayelitsha, Cape Town |
| **Occupation** | Call-centre agent, studying part-time for a bookkeeping certificate |
| **Languages** | isiXhosa (home), English (work and study) |
| **Disability** | Blind since age 19 (diabetic retinopathy). No usable vision. |
| **Digital confidence** | High with her own setup. Low tolerance for poorly built sites. |

## Technical configuration

| Context | Device | OS / Browser | Assistive technology |
|---|---|---|---|
| Home (primary) | 4-year-old Lenovo laptop | Windows 11, Chrome | NVDA 2024.x with eSpeak NG, browse mode by default |
| On the go | Mid-range Samsung phone | Android 14, Chrome | TalkBack |
| At the library | Public media-room PC | Windows, Edge | JAWS + refreshable braille display |

## Input modalities

- **Keyboard only** on desktop. She never uses a mouse.
- NVDA quick-navigation keys: `H` / `1`–`6` for headings, `D` for landmarks, `F` for form fields, `B` for buttons, `K` for links, `Insert+F7` for the elements list.
- Switches between browse mode and focus mode when filling in forms. She expects NVDA to switch automatically when she tabs into a field.
- Swipe gestures and the TalkBack reading controls on mobile.

## Assistive tools

| Tool | How she uses it |
|---|---|
| **NVDA** screen reader (Windows) | Primary tool for all desktop browsing, at home on her own laptop |
| **JAWS** screen reader | On the library's public PCs, which have a JAWS licence |
| **TalkBack** (Android) | Quick checks on her phone: event times, booking confirmations |
| **Refreshable braille display** (40-cell) | At the library, for proofreading her bookkeeping assignments |
| **eSpeak NG** synthesiser | Fast, clear voice at about 450 words per minute |

## How she navigates a new page

1. Listens to the page `<title>` to confirm she's in the right place.
2. Presses `H` to skim the headings and build a mental map.
3. Jumps to the `main` landmark with `D`.
4. Tabs through a form once before filling it in, to learn how long it is.

## Pain points with conventional web design

1. **Unlabelled or placeholder-only inputs.** NVDA reads "edit, blank" and she has to guess what the field is for.
2. **Silent validation.** She submits a form, nothing is announced, and she has to re-read the whole page to find the red text she can't see.
3. **Custom dropdowns and filters built from `<div>`s.** They don't receive focus, don't respond to Enter or Space, and don't say whether they're open or closed.
4. **Results that change with no announcement.** She ticks a filter and has no idea whether the list updated or how many results remain.
5. **Focus lost after an action.** After a dialog closes or a page section changes, focus drops to the top of the page or to `<body>`, so she has to start again.
6. **Ambiguous links.** A list of ten "Read more" links is useless in NVDA's elements list.
7. **Session timeouts** that log her out mid-form without warning, because she's slower than a sighted mouse user.

## Goals on the library portal

| Priority | Goal | What success sounds like to her |
|---|---|---|
| 1 | Find a free digital-skills course (Excel) for her bookkeeping studies | "Heading level 3, Excel for beginners. Course, digital skills, in person, 6 weeks." |
| 2 | Book the media room, which has a braille display, for a Saturday study session | "Booking confirmed for Media room, Saturday 24 October, 09:00." |
| 3 | Find recorded lectures that come with transcripts | Filters announce "Showing 4 of 12 resources" as she changes them |
| 4 | Register for the CV workshop | One form, errors read aloud, no surprises |

## Design implications

- Every input gets a visible `<label>`. Hints are connected with `aria-describedby`.
- Validation results go to a live region. A failed submit moves focus to an error summary.
- Filter toggles are real `<button>` elements with `aria-expanded` and `aria-pressed`.
- The result count is announced politely after each filter change.
- After a view change, focus moves to the new view's `<h1>`.
- Link text makes sense out of context, with visually hidden suffixes where needed.
- No time limits on the booking form.

## Secondary considerations

The primary persona is a screen-reader user, but the same choices help:
- **Low-vision magnifier users** (ZoomText at 400%): single-column reflow, no horizontal scrolling, large focus rings.
- **Motor-impaired keyboard or switch users**: 44px targets, no keyboard traps, a logical tab order.
