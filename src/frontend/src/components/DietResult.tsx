import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Globe,
  Heart,
  Leaf,
  Pill,
  Printer,
  RefreshCw,
  Target,
  User,
  UtensilsCrossed,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { DayPlan, DietPlan, Meal } from "../backend.d";
import type { FormData } from "../types/diet";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const GOAL_LABELS: Record<string, string> = {
  weight_loss: "Weight Loss",
  muscle_gain: "Muscle Gain",
  maintenance: "Maintenance",
  body_recomposition: "Body Recomposition",
};

const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: "Sedentary",
  lightly_active: "Lightly Active",
  moderately_active: "Moderately Active",
  very_active: "Very Active",
  extra_active: "Extra Active",
};

const STRESS_LABELS: Record<string, string> = {
  low: "Low",
  moderate: "Moderate",
  high: "High",
  very_high: "Very High",
};

interface Props {
  plan: DietPlan;
  formData: FormData;
  onStartOver: () => void;
}

function getMacroRDA(weight: number, bmr: number, tdee: number) {
  return [
    {
      nutrient: "Protein",
      rda: `1.2 g × ${weight} kg = ${(1.2 * weight).toFixed(0)} g/day`,
      role: "Muscle repair, enzymes, immune function",
    },
    {
      nutrient: "Carbohydrates",
      rda: `40% of TDEE = ${Math.round((0.4 * tdee) / 4)} g/day (${Math.round(0.4 * tdee)} kcal)`,
      role: "Primary energy source for brain & body",
    },
    {
      nutrient: "Dietary Fat",
      rda: `25% of BMR = ${Math.round((0.25 * bmr) / 9)} g/day (${Math.round(0.25 * bmr)} kcal)`,
      role: "Hormone production, fat-soluble vitamins",
    },
    {
      nutrient: "Dietary Fibre",
      rda: "25–40 g/day",
      role: "Gut health, blood sugar regulation",
    },
    {
      nutrient: "Water",
      rda: `1 L per 18 kg = ${(weight / 18).toFixed(1)} L/day`,
      role: "Hydration, digestion, temperature regulation",
    },
  ];
}

export default function DietResult({ plan, formData, onStartOver }: Props) {
  function handlePrint() {
    window.print();
  }

  const allSupplements = [
    ...formData.supplements,
    ...(formData.other_supplements
      ? formData.other_supplements
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : []),
  ];

  const allAllergies = formData.food_allergies_text
    ? formData.food_allergies_text
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : formData.food_allergies.length > 0
      ? formData.food_allergies
      : [];

  let sleepDurationText = "—";
  if (formData.bed_time && formData.wake_up_time) {
    const [bh, bm] = formData.bed_time.split(":").map(Number);
    const [wh, wm] = formData.wake_up_time.split(":").map(Number);
    let diff = wh * 60 + wm - (bh * 60 + bm);
    if (diff < 0) diff += 24 * 60;
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    sleepDurationText = `${hours}h${mins > 0 ? ` ${mins}m` : ""}`;
  }

  const isLoss = formData.goal === "weight_loss";
  const isGain = formData.goal === "muscle_gain";
  const targetKg = formData.target_weight_kg || 0;
  const targetBellyInches = formData.target_belly_inches || 0;
  const showTimeline = (isLoss || isGain) && targetKg > 0;

  const bmr = formData.bmr_manual > 0 ? formData.bmr_manual : plan.bmr;
  const tdee = formData.tdee_manual > 0 ? formData.tdee_manual : plan.tdee;

  const macroRDA = getMacroRDA(formData.weight, bmr, tdee);

  function calcMonths(kgPerMonth: number): string {
    if (!targetKg || kgPerMonth <= 0) return "—";
    const months = targetKg / kgPerMonth;
    if (months < 1) return "< 1 month";
    const m = Math.floor(months);
    const weeks = Math.round((months - m) * 4);
    if (weeks === 0) return `${m} month${m > 1 ? "s" : ""}`;
    return `${m} month${m > 1 ? "s" : ""} ${weeks} week${weeks > 1 ? "s" : ""}`;
  }

  return (
    <div
      data-ocid="result.page"
      className="result-page min-h-screen bg-background"
    >
      {/* Header */}
      <header className="no-print sticky top-0 z-10 border-b border-border bg-card/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
              <Leaf className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground">
              NutriPlan
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              data-ocid="result.print_button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-2 no-print"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print Plan</span>
            </Button>
            <Button
              data-ocid="result.start_over_button"
              variant="outline"
              size="sm"
              onClick={onStartOver}
              className="gap-2 no-print"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Generate New Report</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <UtensilsCrossed className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground">
            {formData.name}'s Diet Plan
          </h1>
          <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
            <Badge className="bg-primary/10 text-primary border-primary/20 text-sm">
              {GOAL_LABELS[formData.goal]}
            </Badge>
            <Badge variant="outline" className="text-sm">
              {ACTIVITY_LABELS[formData.activity_level] ||
                formData.activity_level}
            </Badge>
            {formData.dietary_preferences.length > 0 &&
              formData.dietary_preferences[0] !== "None/Omnivore" && (
                <Badge variant="outline" className="text-sm">
                  {formData.dietary_preferences[0]}
                </Badge>
              )}
          </div>
        </motion.div>

        {/* USER RESPONSES SUMMARY */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="bg-card rounded-2xl border border-border p-6"
        >
          <h2 className="text-xl font-display font-bold text-foreground mb-5 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Your Profile Summary
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <SummaryField label="Name" value={formData.name} />
            <SummaryField label="Age" value={`${formData.age} years`} />
            <SummaryField
              label="Gender"
              value={
                formData.gender.charAt(0).toUpperCase() +
                formData.gender.slice(1)
              }
            />
            <SummaryField label="Height" value={`${formData.height} cm`} />
            <SummaryField label="Weight" value={`${formData.weight} kg`} />
            <SummaryField label="Goal" value={GOAL_LABELS[formData.goal]} />
            <SummaryField
              label="Activity Level"
              value={
                ACTIVITY_LABELS[formData.activity_level] ||
                formData.activity_level
              }
            />
            <SummaryField
              label="Dietary Preference"
              value={formData.dietary_preferences[0] || "Not selected"}
            />
            <SummaryField
              label="Food Allergies"
              value={allAllergies.length > 0 ? allAllergies.join(", ") : "None"}
            />
            {formData.target_weight_kg > 0 && (
              <SummaryField
                label={
                  formData.goal === "weight_loss"
                    ? "Target Weight Loss"
                    : formData.goal === "muscle_gain"
                      ? "Target Weight Gain"
                      : ""
                }
                value={
                  formData.goal === "weight_loss" ||
                  formData.goal === "muscle_gain"
                    ? `${formData.target_weight_kg} kg${formData.goal === "weight_loss" && formData.target_belly_inches > 0 ? ` · ${formData.target_belly_inches}" belly` : ""}`
                    : ""
                }
              />
            )}
            {(formData.bmr_manual > 0 || formData.tdee_manual > 0) && (
              <SummaryField
                label="BMR / TDEE (from report)"
                value={`${formData.bmr_manual > 0 ? `${formData.bmr_manual} kcal` : "—"} / ${formData.tdee_manual > 0 ? `${formData.tdee_manual} kcal` : "—"}`}
              />
            )}
            <SummaryField
              label="Meal Gap"
              value={`${formData.meal_gap} hours`}
            />
            <SummaryField
              label="Water Intake"
              value={`${formData.water_intake} L/day`}
            />
            <SummaryField
              label="Health Conditions"
              value={
                formData.health_conditions.length > 0
                  ? formData.health_conditions.join(", ")
                  : "None"
              }
            />
            <SummaryField label="Bed Time" value={formData.bed_time || "—"} />
            <SummaryField
              label="Wake Up Time"
              value={formData.wake_up_time || "—"}
            />
            <SummaryField label="Sleep Duration" value={sleepDurationText} />
            {(formData.protein_target > 0 ||
              formData.fat_target > 0 ||
              formData.carbs_target > 0) && (
              <SummaryField
                label="Macro Targets"
                value={`P: ${formData.protein_target}g · F: ${formData.fat_target}g · C: ${formData.carbs_target}g`}
              />
            )}
            <SummaryField
              label="Stress Level"
              value={
                STRESS_LABELS[formData.stress_level] || formData.stress_level
              }
            />
            {allSupplements.length > 0 && (
              <SummaryField
                label="Supplements"
                value={allSupplements.join(", ")}
              />
            )}
          </div>
        </motion.div>

        {/* GOAL TIMELINE */}
        {showTimeline && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-card rounded-2xl border border-border p-6"
            data-ocid="result.goal_timeline.panel"
          >
            <h2 className="text-xl font-display font-bold text-foreground mb-2 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              {isLoss ? "Weight Loss" : "Weight Gain"} Timeline
            </h2>
            <p className="text-sm text-muted-foreground mb-5">
              {isLoss
                ? `Your target: lose ${targetKg} kg${targetBellyInches > 0 ? ` + ${targetBellyInches} inches from belly fat` : ""}`
                : `Your target: gain ${targetKg} kg`}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  rate: 2,
                  label: "2 kg/month",
                  color: "text-red-600",
                  bg: "bg-red-50 border-red-200",
                },
                {
                  rate: 3,
                  label: "3 kg/month",
                  color: "text-orange-600",
                  bg: "bg-orange-50 border-orange-200",
                },
                {
                  rate: 4,
                  label: "4 kg/month",
                  color: "text-amber-600",
                  bg: "bg-amber-50 border-amber-200",
                },
                {
                  rate: 5,
                  label: "5 kg/month",
                  color: "text-green-600",
                  bg: "bg-green-50 border-green-200",
                },
              ].map((item) => (
                <div
                  key={item.rate}
                  className={`rounded-xl border p-4 text-center ${item.bg}`}
                  data-ocid={`result.timeline.item.${item.rate / 2}`}
                >
                  <div className={`text-lg font-bold ${item.color}`}>
                    {calcMonths(item.rate)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 font-medium">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
            {isLoss && targetBellyInches > 0 && (
              <div className="mt-4 bg-primary/5 rounded-xl p-4 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  Belly fat target:
                </span>{" "}
                {targetBellyInches} inches reduction. Generally, by losing 2–3
                kg you can expect to lose approximately 1 inch from belly fat.
                Consistent caloric deficit, strength training, and quality sleep
                accelerate results.
              </div>
            )}
          </motion.div>
        )}

        {/* GLOBAL NUTRITION PHILOSOPHY */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-card rounded-2xl border border-border overflow-hidden"
        >
          {/* Uploaded banner image */}
          <div className="w-full">
            <img
              src="/assets/uploads/file_00000000b1f071fa852a880787585b1b-1.png"
              alt="Global Nutrition Philosophy"
              className="w-full object-cover"
            />
          </div>

          <div className="p-6 space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 mb-3">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-display font-bold text-foreground">
                Global Nutrition Philosophy
              </h2>
              <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                A human body requires all these nutrients{" "}
                <strong className="text-foreground">every single day</strong> to
                meet its biological requirements — to stay healthy, look better,
                and maintain strong immunity.
              </p>
            </div>

            {/* Macronutrients */}
            <div>
              <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary inline-block" />
                Macronutrients — Daily RDA for Indians
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-primary/10">
                      <th className="text-left p-3 font-semibold text-foreground rounded-tl-lg">
                        Nutrient
                      </th>
                      <th className="text-left p-3 font-semibold text-foreground">
                        RDA (Adult)
                      </th>
                      <th className="text-left p-3 font-semibold text-foreground rounded-tr-lg">
                        Primary Role
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {macroRDA.map((row, i) => (
                      <tr
                        key={row.nutrient}
                        className={i % 2 === 0 ? "bg-secondary/30" : ""}
                      >
                        <td className="p-3 font-medium text-foreground">
                          {row.nutrient}
                        </td>
                        <td className="p-3 text-primary font-semibold">
                          {row.rda}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {row.role}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Micronutrients */}
            <div>
              <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                Micronutrients — Daily RDA for Indians
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-amber-500/10">
                      <th className="text-left p-3 font-semibold text-foreground rounded-tl-lg">
                        Nutrient
                      </th>
                      <th className="text-left p-3 font-semibold text-foreground">
                        RDA (Adult)
                      </th>
                      <th className="text-left p-3 font-semibold text-foreground rounded-tr-lg">
                        Primary Role
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {MICRO_RDA.map((row, i) => (
                      <tr
                        key={row.nutrient}
                        className={i % 2 === 0 ? "bg-secondary/30" : ""}
                      >
                        <td className="p-3 font-medium text-foreground">
                          {row.nutrient}
                        </td>
                        <td className="p-3 text-amber-600 font-semibold">
                          {row.rda}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {row.role}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-gradient-to-r from-primary/10 to-amber-500/10 border border-primary/20 rounded-xl p-4 text-center">
              <p className="text-sm font-medium text-foreground">
                ✨ <strong>Remember:</strong> No single food provides all
                nutrients. A diverse, balanced diet is the cornerstone of
                lasting health, vitality, and immunity — eat the rainbow every
                day.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Weekly Meal Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-card rounded-2xl border border-border p-6"
        >
          <h2 className="text-xl font-display font-bold text-foreground mb-5 flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-primary" />
            Weekly Meal Plan
          </h2>

          <div className="no-print">
            <Tabs defaultValue="0">
              <TabsList className="grid grid-cols-7 mb-6 h-auto">
                {DAYS.map((_day, i) => (
                  <TabsTrigger
                    key={DAYS[i]}
                    value={String(i)}
                    data-ocid={`result.day.tab.${i + 1}`}
                    className="text-xs px-1 py-2"
                  >
                    {DAY_SHORT[i]}
                  </TabsTrigger>
                ))}
              </TabsList>
              {plan.weekly_plan.map((dayPlan, i) => (
                <TabsContent key={DAYS[i]} value={String(i)}>
                  <DayPlanView dayPlan={dayPlan} dayName={DAYS[i]} />
                </TabsContent>
              ))}
            </Tabs>
          </div>

          <div className="hidden print:block space-y-6">
            {plan.weekly_plan.map((dayPlan, i) => (
              <div key={DAYS[i]} className="page-break-inside-avoid">
                <h3 className="font-display font-bold text-lg text-foreground mb-3 border-b pb-2">
                  {DAYS[i]}
                </h3>
                <DayPlanView dayPlan={dayPlan} dayName={DAYS[i]} />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Health Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-card rounded-2xl border border-border p-6"
        >
          <h2 className="text-xl font-display font-bold text-foreground mb-5 flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            Personalized Health Tips
          </h2>
          <div className="space-y-3">
            {plan.health_tips.map((tip, i) => (
              <motion.div
                key={tip.slice(0, 30)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.06 }}
                className="flex gap-3 p-3 rounded-xl bg-secondary/40"
              >
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-foreground leading-relaxed">{tip}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Supplements Note */}
        {allSupplements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-card rounded-2xl border border-border p-6"
          >
            <h2 className="text-xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
              <Pill className="w-5 h-5 text-primary" />
              Your Supplements
            </h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {allSupplements.map((s) => (
                <Badge
                  key={s}
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20"
                >
                  {s}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Your supplement stack has been considered in generating your meal
              plan. Take supplements as directed and consult a healthcare
              provider for personalized supplement advice.
            </p>
          </motion.div>
        )}

        {/* Generate New Report */}
        <div className="text-center pb-8 no-print">
          <Button
            data-ocid="result.start_over_button"
            variant="outline"
            onClick={onStartOver}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Create a New Plan
          </Button>
        </div>
      </main>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="text-sm font-medium text-foreground bg-secondary/40 rounded-lg px-3 py-2">
        {value}
      </div>
    </div>
  );
}

function MealCard({ meal, label }: { meal: Meal; label: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-secondary/30 rounded-xl border border-border overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <UtensilsCrossed className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              {label}
            </div>
            <div className="font-semibold text-foreground text-sm">
              {meal.name}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="font-bold text-foreground text-sm">
              {meal.calories} kcal
            </div>
            <div className="text-xs text-muted-foreground">
              P{meal.protein}g · C{meal.carbs}g · F{meal.fats}g
            </div>
          </div>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4">
          <Separator className="mb-3" />
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
            Ingredients
          </p>
          <div className="flex flex-wrap gap-1.5">
            {meal.ingredients.map((ing) => (
              <Badge key={ing} variant="outline" className="text-xs">
                {ing}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DayPlanView({
  dayPlan,
  dayName,
}: { dayPlan: DayPlan; dayName: string }) {
  const dayTotal = [
    dayPlan.breakfast,
    dayPlan.lunch,
    dayPlan.dinner,
    ...dayPlan.snacks,
  ].reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fats: acc.fats + m.fats,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 },
  );

  return (
    <div className="space-y-3">
      <div className="hidden print:block text-sm font-semibold text-muted-foreground mb-2">
        {dayName}
      </div>

      <MealCard meal={dayPlan.breakfast} label="Breakfast" />
      <MealCard meal={dayPlan.lunch} label="Lunch" />
      <MealCard meal={dayPlan.dinner} label="Dinner" />
      {dayPlan.snacks.map((snack, i) => (
        <MealCard
          key={snack.name + String(i)}
          meal={snack}
          label={dayPlan.snacks.length > 1 ? `Snack ${i + 1}` : "Snack"}
        />
      ))}

      <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/20 text-sm">
        <span className="font-semibold text-foreground">Daily Total</span>
        <div className="flex gap-3 text-xs font-medium">
          <span className="text-foreground">{dayTotal.calories} kcal</span>
          <span className="text-green-600">P {dayTotal.protein}g</span>
          <span className="text-blue-600">C {dayTotal.carbs}g</span>
          <span className="text-amber-600">F {dayTotal.fats}g</span>
        </div>
      </div>
    </div>
  );
}

// ── Nutrition RDA Data ────────────────────────────────────────────────────────

const MICRO_RDA = [
  {
    nutrient: "Vitamin A",
    rda: "600 mcg/day",
    role: "Vision, immune defence, skin health",
  },
  {
    nutrient: "Vitamin B1 (Thiamine)",
    rda: "1.4 mg/day",
    role: "Energy metabolism, nerve function",
  },
  {
    nutrient: "Vitamin B2 (Riboflavin)",
    rda: "1.6 mg/day",
    role: "Cell growth, energy production",
  },
  {
    nutrient: "Vitamin B3 (Niacin)",
    rda: "18 mg/day",
    role: "DNA repair, metabolism",
  },
  {
    nutrient: "Vitamin B6",
    rda: "2.0 mg/day",
    role: "Protein metabolism, neurotransmitters",
  },
  {
    nutrient: "Vitamin B9 (Folate)",
    rda: "200 mcg/day",
    role: "Cell division, DNA synthesis",
  },
  {
    nutrient: "Vitamin B12",
    rda: "1.0 mcg/day",
    role: "Red blood cells, nerve function",
  },
  {
    nutrient: "Vitamin C",
    rda: "40 mg/day",
    role: "Antioxidant, collagen synthesis, immunity",
  },
  {
    nutrient: "Vitamin D",
    rda: "600 IU (15 mcg)/day",
    role: "Bone health, immunity, mood regulation",
  },
  {
    nutrient: "Vitamin E",
    rda: "10 mg/day",
    role: "Antioxidant, skin & cell protection",
  },
  {
    nutrient: "Vitamin K",
    rda: "55–65 mcg/day",
    role: "Blood clotting, bone metabolism",
  },
  {
    nutrient: "Calcium",
    rda: "600–1000 mg/day",
    role: "Bone & teeth strength, muscle contraction",
  },
  {
    nutrient: "Iron",
    rda: "17 mg (M) / 21 mg (F)/day",
    role: "Oxygen transport, energy metabolism",
  },
  {
    nutrient: "Iodine",
    rda: "150 mcg/day",
    role: "Thyroid hormones, metabolism",
  },
  {
    nutrient: "Zinc",
    rda: "12 mg/day",
    role: "Immunity, wound healing, taste & smell",
  },
  {
    nutrient: "Magnesium",
    rda: "340 mg/day",
    role: "Muscle & nerve function, bone health",
  },
  {
    nutrient: "Potassium",
    rda: "3500 mg/day",
    role: "Heart health, blood pressure, fluid balance",
  },
  {
    nutrient: "Phosphorus",
    rda: "600 mg/day",
    role: "Bone structure, energy storage (ATP)",
  },
  {
    nutrient: "Selenium",
    rda: "40 mcg/day",
    role: "Antioxidant defence, thyroid function",
  },
  {
    nutrient: "Omega-3 Fatty Acids",
    rda: "250 mg EPA+DHA/day",
    role: "Heart health, brain function, inflammation",
  },
  {
    nutrient: "Collagen",
    rda: "2.5–15 g/day",
    role: "Skin elasticity, joint health, connective tissue repair",
  },
  {
    nutrient: "Nitric Oxide (precursors)",
    rda: "L-Arginine 3–6 g/day or dietary nitrates 300–500 mg/day",
    role: "Blood vessel dilation, circulation, exercise performance",
  },
];
