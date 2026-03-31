# HN Coach – Diet & Nutrition Plan

## Current State
The DietResult.tsx report has various card styles across sections: ReportCard wrapper components with large padding, body science info cards with p-2 padding and flex-col layout, calorie guide card, timeline cards, foods to avoid cards, health tips, referral section, and more. The Personal Coaching Program card is already compact: `rounded-xl border p-3 flex items-center gap-3 shadow-sm` - horizontal layout with icon + text + button, slim and tight.

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- **All ReportCard sections** (Personal Details, Goal Timeline, Body Science cards, Global Nutrition Philosophy, Daily Calorie Guide, Foods to Avoid, Health Tips, Referral section, Get Your Personal Coach section): Apply compact, slim, minimal padding style consistent with the Personal Coaching Program card
- **ReportCard wrapper component**: Reduce header padding, body padding to match slim style (px-3 py-2 or similar)
- **Body science info cards** (cells, tissues, organs, nutrients): Make more compact, reduce internal padding, smaller text
- **Goal timeline cards**: Smaller padding, tighter grid
- **Foods to avoid section**: Compact rows
- **Health tips**: Compact list items
- **Referral section**: Slim card style
- Both on-screen and print views

### Remove
- Excess whitespace/padding from all cards except Daily Wellness grid (keep as-is)

## Implementation Plan
1. Update the ReportCard component style: reduce header padding to px-3 py-2, body padding to px-3 py-2
2. Compact all section cards that use ReportCard or custom card styles
3. Body science cards: reduce p-2 to p-1.5, tighter gap
4. Timeline section: tighter padding on milestone boxes
5. Foods to avoid: compact rows with less padding
6. Health tips: tighter list
7. Referral and coach sections: already slim, minor tuning if needed
8. Keep Daily Wellness grid completely unchanged
9. Validate build
