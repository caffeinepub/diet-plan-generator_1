# HN Coach Diet Plan Generator

## Current State
The app is a 12-step multi-step form that generates a personalized diet report. The results page (DietResult.tsx) shows:
- Profile summary, goal timeline, RDA tables, meal plan, daily wellness, foods to avoid sections
- Meal plan currently shows meals grouped by meal type (breakfast table, lunch table, etc.) with Monday-Sunday as rows
- No local storage persistence of reports
- Snacks appear at the end of the meal sections, not in chronological time order
- No day-by-day scrollable view

## Requested Changes (Diff)

### Add
- Save generated report data to localStorage when a report is generated
- "View Previous Report" button on the home/form start page that loads saved report from localStorage
- 7 separate day tables (Monday through Sunday), each showing all meals for that day in chronological order

### Modify
- Meal plan layout: instead of meal-type tables (one table per meal), show 7 individual day tables (one per day: Monday-Sunday), all visible and scrollable
- Each day table rows: Breakfast, Mid-Morning Snack, Lunch, Evening Snack, Dinner (chronological order)
- Each day table columns: Meal Name, Time, Food Items / Details
- Home page (step 1 of form or landing): add "View Previous Report" button that appears only if localStorage has a saved report

### Remove
- Current meal-type toggle/switch buttons for navigating between meal types
- The per-meal-type table structure (replaced by per-day tables)

## Implementation Plan
1. In App.tsx or DietResult.tsx: after report generation, serialize the report data (formData + computed plan) to localStorage key `hn_coach_last_report`
2. In DietForm.tsx or App.tsx: on the initial landing/home step, check localStorage for saved report; if found, show "View Previous Report" button that loads and renders the DietResult with saved data
3. Restructure the meal plan section in DietResult.tsx:
   - Remove per-meal-type tables and toggle buttons
   - Create 7 day sections (Monday-Sunday), each rendered as a table
   - Table rows in order: Breakfast, Mid-Morning Snack, Lunch, Evening Snack, Dinner
   - Show meal time (calculated from wake-up time + meal gap), food items/details for each row
   - All 7 tables visible simultaneously, scrollable
