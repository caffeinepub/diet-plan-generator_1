# HN Coach - Diet Plan Generator

## Current State
- 14-step form with Activity Level (step 4) and Stress Level (step 12) pages
- Banner image (uploaded PNG) shown on step 1 of the form
- Banner image also shown at top of the Global Nutrition Philosophy section in the report
- Macronutrient RDA table shows calculation formulas (e.g. "1.2 g × 70 kg = 84 g/day")

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- TOTAL_STEPS: 14 → 12
- STEP_META: Remove "Activity Level" (index 3) and "Stress Level" (index 11) entries
- Step rendering: Remove step 4 (Step3/activity) and step 12 (Step11/stress), renumber subsequent steps accordingly
- validateStep: Update step numbers after removal (dietary pref: 4, water intake: 7, health conditions: 8, macro targets: 10)
- Macronutrient RDA `getMacroRDA` function: Show only the final gram/day value, not the calculation formula
  - Protein: show only `${(1.2 * weight).toFixed(0)} g/day`
  - Carbohydrates: show only `${Math.round((0.4 * tdee) / 4)} g/day`
  - Dietary Fat: show only `${Math.round((0.25 * bmr) / 9)} g/day`
  - Water: show only the gram/litre value without formula

### Remove
- Banner image from step 1 of the form (the `{step === 1 && <div>...<img>...</div>}` block)
- Banner image `<img>` from the Global Nutrition Philosophy section in DietResult.tsx (the `<div className="w-full"><img src="/assets/uploads/..."/></div>` block)
- Activity Level step from STEP_META and form rendering
- Stress Level step from STEP_META and form rendering

## Implementation Plan
1. DietForm.tsx:
   - Remove banner image block (step === 1 hero image)
   - Remove "Activity Level" from STEP_META
   - Remove "Stress Level" from STEP_META
   - Update TOTAL_STEPS to 12
   - Remap step rendering: old step 5→4, 6→5, 7→6, 8→7, 9→8, 10→9, 11→10, 13→11, 14→12
   - Update validateStep numbers accordingly
2. DietResult.tsx:
   - Remove the uploaded banner `<img>` from the Global Nutrition Philosophy section
   - Update `getMacroRDA` rda strings to show only final values (no formula)
