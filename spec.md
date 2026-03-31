# HN Coach – Diet Plan Generator

## Current State
The report (DietResult.tsx) has cards with varying sizes and spacing. Daily Wellness cards use `p-4` padding with `text-2xl` numbers and emoji icons at `text-2xl`. Body science cards (cells, tissues, organs, nutrients) use `p-3`. ReportCard sections use generous inner spacing. The personal coaching card was previously made compact (slim row). All other cards remain large and inconsistent.

## Requested Changes (Diff)

### Add
- Nothing new to add.

### Modify
- **Daily Wellness cards**: Reduce to `p-2.5` padding, icon `text-lg`, number `text-lg font-bold`, label `text-[10px]`, description `text-[10px]`. Keep 2-column grid.
- **Body science cards** (cells, tissues, organs, nutrients): Reduce icon size, font sizes, and padding to match the compact style.
- **ReportCard inner content**: Tighten padding to `p-3` (from `p-5` or `p-6`).
- **ReportField rows**: Reduce vertical padding.
- **Goal Timeline milestone rows**: Compact font and padding.
- **Daily Calorie Guide boxes**: Compact padding and font.
- **Personal Details fields**: Compact row spacing.
- **Foods to Avoid cards**: Compact padding.
- **Health Tips**: Compact card padding.
- **Macro/Micro tables**: Already compact, maintain.
- **Coaching enrollment card**: Keep existing slim row (already done).
- **Referral card**: Compact.
- **All print:* classes** must remain to ensure white print background and no cropping.

### Remove
- Excessive padding/margin on all cards in the report.

## Implementation Plan
1. In DietResult.tsx, update Daily Wellness card grid: change all 10 wellness cards to use `p-2.5 gap-2`, `text-[10px]` labels, `text-lg font-bold` values, `text-[10px]` descriptions, `text-xl` emoji, keep color borders.
2. Update the ReportCard component's inner padding class (if defined inline) to `p-3`.
3. Tighten ReportField border-b rows padding from `py-2.5` to `py-1.5`.
4. Compact body science 4-cards grid: `p-2`, `text-xs` everywhere, smaller icon.
5. Compact Daily Calorie Guide section padding.
6. Compact timeline milestone items.
7. Compact foods-to-avoid grid cards.
8. Compact health tips cards.
9. Validate and build.
