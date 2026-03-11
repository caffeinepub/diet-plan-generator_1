# HN Coach - Diet Plan Generator

## Current State
- 12-step multi-step form collects user profile, goals, dietary preferences, health conditions, sleep, BMR/TDEE
- Step 1 has personal details (name, age, gender, weight, height, WhatsApp number)
- Results page shows: profile summary, goal timeline, RDA tables, 7-day meal plan (Mon-Sun tables), daily wellness, foods to avoid
- Report is saved in localStorage for previous report viewing
- No referral system exists

## Requested Changes (Diff)

### Add
- Step 1: "Who referred you to HN Coach?" field for referrer's WhatsApp number
  - Auto-fills from URL parameter `?ref=<whatsapp_number>` if present
  - Once filled, field is locked/non-editable (readonly)
- Referral section on results page:
  - User's unique referral link = `<current_url>?ref=<user_whatsapp>`
  - Share button opens WhatsApp with pre-filled message: "Hey! I just got my personalized diet plan from HN Coach. Generate yours free here: [link]"
  - Shows referral count (tracked in localStorage keyed by user's WhatsApp number)
  - Promotional message: "Help 2 friends download their report and get a full refund!"
- "Get Your Personal Coach" section on results page:
  - WhatsApp button connecting to the referrer's number
  - Pre-filled message: "Hi! I generated my HN Coach diet plan and would like personal guidance. Please help me achieve my goals."
  - If no referrer, show a message to contact via the referral link
- Report: "Referred by" line in profile summary showing referrer's WhatsApp number (non-editable display)

### Modify
- Report layout: more compact overall (tighter spacing, smaller padding, more condensed tables)
- Print CSS (`@media print`): further reduce spacing, font sizes, margins for fewer pages
- Professional styling: cleaner typography hierarchy, subtle borders, trust signals

### Remove
- Nothing removed

## Implementation Plan
1. DietForm.tsx Step 1: add referrer WhatsApp input field, read URL param on mount to auto-fill, lock field once filled
2. Pass referrer WhatsApp through form data to DietResult
3. DietResult.tsx: add "Referred by" in profile summary (display only)
4. DietResult.tsx: add Referral Section with unique link, share button, referral count from localStorage
5. DietResult.tsx: add Personal Coach section with WhatsApp CTA using referrer number
6. CSS: compact spacing throughout report, aggressive print compression via @media print
7. Professional polish: clean section headers, trust badges, consistent typography
