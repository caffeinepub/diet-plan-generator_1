# HN Coach – Diet & Nutrition Plan

## Current State
- 7-day meal plan rendered as 7 separate full-width tables (one per day), each with rows for HN Digestion, main meals, HN Tea
- HN Digestion and HN Tea rows have no visual distinction from main meal rows (same size/style)
- Step 1 form has a generic illustration banner
- No logo photo used; HN Coach branding uses a teal leaf icon

## Requested Changes (Diff)

### Add
- Logo: use uploaded user photo `/assets/uploads/IMG-20260226-WA0000-2.jpg` as the HN Coach logo in the header (both screen and print), replacing the teal leaf icon
- Fit India Movement banner on Step 1 of the form using generated image `/assets/generated/fit-india-banner.dim_800x200.jpg`

### Modify
- **HN Digestion & HN Tea rows**: render these rows visually smaller and distinct -- smaller font (text-xs), muted gray/light background (bg-gray-50), italic text, pill/badge style label, clearly distinguishable from main meal rows (Breakfast, Lunch, Dinner, Snacks)
- **7-day diet plan layout**: redesign to show all 7 days in a compact, organized banner/grid view inspired by the uploaded 1200-calorie diet plan reference image. Use a compact table with Day as rows and meal types (HN Digestion, Breakfast, Mid-Morning Snack, Lunch, Evening Snack, Dinner) as columns. Each cell shows the key food items concisely. This takes far less space than 7 separate full tables. HN Digestion and HN Tea cells styled differently (smaller, muted). The motivational quote banner stays above this compact plan.

### Remove
- Nothing removed

## Implementation Plan
1. Replace header logo icon with the user's uploaded photo (`/assets/uploads/IMG-20260226-WA0000-2.jpg`) in DietResult.tsx header and print header. Use rounded-full img tag, ~40px
2. In DietForm.tsx Step 1, add Fit India banner image at the top using `/assets/generated/fit-india-banner.dim_800x200.jpg`
3. In DietResult.tsx, refactor the 7-day meal plan section from 7 separate tables to a single compact banner-style table:
   - Rows = Days (Monday to Sunday)
   - Columns = Meal types: HN Digestion (before meals note), Breakfast, Mid-Morning Snack, Lunch, Evening Snack, Dinner
   - Each cell shows food items in compact text
   - HN Tea shown as a small note/row or footnote below the table
   - Sunday lunch cell highlighted as Reward Meal
   - Colored column headers (teal for main meals, gray for supplements)
4. Style HN Digestion column cells and HN Tea rows/footnote with: text-xs, italic, muted background, pill styling
5. Ensure compact table fits well in print layout
