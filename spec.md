# HN Coach Diet Plan Generator

## Current State
The app has a multi-step form and a detailed results/report page. The form includes a diet preference (vegetarian/non-vegetarian) step, and Step 1 does not have a WhatsApp number field. The meal plan shows 7 day tables (Mon-Sun), each with meals in chronological order. HN Tea appears 2-3 times between meals AND after dinner. Mid-morning snack shows '+2 egg whites' only for non-vegetarians. Print layout currently takes ~13 pages.

## Requested Changes (Diff)

### Add
- WhatsApp number input field in Step 1 of the form (Personal Details), which auto-populates the referral link
- Egg whites shown for ALL users (not just non-vegetarians)

### Modify
- Remove HN Tea row that appears after Dinner in each day's meal table (keep HN Tea between other meals)
- Aggressively compress print CSS: reduce font sizes, minimize padding/margins, collapse whitespace, remove decorative elements in print, target 5-6 pages
- WhatsApp field in Step 1 feeds into the referral link generation

### Remove
- Vegetarian/Non-Vegetarian diet preference question from the form entirely
- HN Tea after Dinner row from all 7 day tables

## Implementation Plan
1. In DietForm.tsx: Remove the diet preference step; add WhatsApp number input to Step 1; update step count/progress accordingly
2. In DietResult.tsx: Remove HN Tea rows that come after Dinner in each day table; show egg whites for all users regardless of diet preference
3. In DietResult.tsx / index.css: Aggressively tighten @media print CSS - reduce font to 8-9pt, minimize all padding/margin, hide non-essential decorative elements, shrink table cells, target 5-6 pages
