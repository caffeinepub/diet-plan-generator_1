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
import type { DietPlan, Meal } from "../backend.d";
import type { FormData } from "../types/diet";

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
      rda: `${(1.2 * weight).toFixed(0)} g/day`,
      role: "Muscle repair, enzymes, immune function",
    },
    {
      nutrient: "Carbohydrates",
      rda: `${Math.round((0.4 * tdee) / 4)} g/day`,
      role: "Primary energy source for brain & body",
    },
    {
      nutrient: "Dietary Fat",
      rda: `${Math.round((0.25 * bmr) / 9)} g/day`,
      role: "Hormone production, fat-soluble vitamins",
    },
    {
      nutrient: "Dietary Fibre",
      rda: "25–40 g/day",
      role: "Gut health, blood sugar regulation",
    },
    {
      nutrient: "Water",
      rda: `${(weight / 18).toFixed(1)} L/day`,
      role: "Hydration, digestion, temperature regulation",
    },
  ];
}

// ── Lunch / Dinner data ───────────────────────────────────────────────────────

interface MealOption {
  dal: string;
  cookedVeg: string;
  salad: string[];
}

const MEAL_OPTIONS: MealOption[] = [
  {
    dal: "Dal Tadka",
    cookedVeg: "Aloo Gobi Gravy",
    salad: ["Cucumber", "Tomato", "Carrot", "Onion", "Beetroot"],
  },
  {
    dal: "Moong Dal",
    cookedVeg: "Palak Paneer Gravy",
    salad: ["Radish", "Capsicum", "Carrot", "Tomato", "Raw Mango"],
  },
  {
    dal: "Chana Dal",
    cookedVeg: "Mixed Veg Curry",
    salad: ["Cucumber", "Tomato", "Lettuce", "Corn", "Onion"],
  },
  {
    dal: "Rajma Curry",
    cookedVeg: "Seasonal Veg Gravy",
    salad: ["Carrot", "Beetroot", "Cabbage", "Tomato", "Pomegranate"],
  },
  {
    dal: "Masoor Dal",
    cookedVeg: "Bhindi Masala Gravy",
    salad: ["Cucumber", "Onion", "Tomato", "Mint", "Lemon slices"],
  },
  {
    dal: "Dal Makhani",
    cookedVeg: "Paneer Bhurji Gravy",
    salad: ["Watermelon", "Carrot", "Tomato", "Radish", "Coriander"],
  },
  {
    dal: "Toor Dal",
    cookedVeg: "Lauki Gravy",
    salad: ["Cucumber", "Tomato", "Carrot", "Capsicum", "Spring Onion"],
  },
];

const BREAKFAST_OPTIONS = [
  { name: "Oats Porridge", desc: "with banana & nuts", cal: 350 },
  { name: "Moong Dal Chilla", desc: "with mint chutney", cal: 300 },
  { name: "Poha", desc: "with peanuts & vegetables", cal: 320 },
  { name: "Idli (3 pcs) + Sambar", desc: "+ Coconut chutney", cal: 340 },
  { name: "Upma", desc: "with mixed vegetables", cal: 310 },
  { name: "Whole Wheat Paratha (2)", desc: "+ Curd", cal: 280 },
  { name: "Vegetable Daliya", desc: "with seeds", cal: 330 },
];

const EVENING_SNACKS = [
  {
    name: "Roasted Chana (Bengal Gram)",
    cal: 120,
    desc: "High protein, high fibre, satisfying crunch",
  },
  {
    name: "Roasted Popcorn (air-popped, no butter)",
    cal: 90,
    desc: "Light, whole grain, low calorie",
  },
  {
    name: "Makhana (Fox Nuts) – 30g roasted",
    cal: 110,
    desc: "Low fat, rich in magnesium & calcium",
  },
  {
    name: "Tomato Soup (no cream)",
    cal: 80,
    desc: "Antioxidant-rich, warm and filling",
  },
  {
    name: "Roasted Peanuts – 20g",
    cal: 115,
    desc: "Healthy fats, protein-packed",
  },
  {
    name: "Mixed Vegetable Clear Soup",
    cal: 70,
    desc: "Low calorie, micronutrient-rich",
  },
  {
    name: "Sprout Chaat (small bowl)",
    cal: 130,
    desc: "High protein, gut-friendly probiotics",
  },
];

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

  // Compute meal schedule times
  const schedule =
    formData.wake_up_time &&
    formData.meal_gap &&
    MEAL_SCHEDULE[formData.meal_gap]
      ? MEAL_SCHEDULE[formData.meal_gap]
      : null;
  const timeMap: Record<string, string> = {};
  if (schedule && formData.wake_up_time) {
    for (const item of schedule) {
      timeMap[item.key] = addMinutes(formData.wake_up_time, item.offset);
    }
  }

  const dietPref = formData.dietary_preferences[0] || "vegetarian";

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
            <div>
              <span className="font-display font-bold text-foreground">
                HN Coach
              </span>
              <div className="text-xs text-muted-foreground leading-none">
                Diet & Nutrition Plan
              </div>
            </div>
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
                    ? `${formData.target_weight_kg} kg${
                        formData.goal === "weight_loss" &&
                        formData.target_belly_inches > 0
                          ? ` · ${formData.target_belly_inches}" belly`
                          : ""
                      }`
                    : ""
                }
              />
            )}
            {(formData.bmr_manual > 0 || formData.tdee_manual > 0) && (
              <SummaryField
                label="BMR / TDEE (from report)"
                value={`${
                  formData.bmr_manual > 0 ? `${formData.bmr_manual} kcal` : "—"
                } / ${
                  formData.tdee_manual > 0
                    ? `${formData.tdee_manual} kcal`
                    : "—"
                }`}
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
                ? `Your target: lose ${targetKg} kg${
                    targetBellyInches > 0
                      ? ` + ${targetBellyInches} inches from belly fat`
                      : ""
                  }`
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

        {/* ── Meal Options Plan ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-card rounded-2xl border border-border p-6"
        >
          <h2 className="text-xl font-display font-bold text-foreground mb-2 flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-primary" />
            Meal Options
          </h2>
          <p className="text-sm text-muted-foreground mb-5">
            Choose any option from each meal category. Mix and match to keep
            your diet varied and enjoyable.
          </p>

          {/* Meal Schedule */}
          {schedule && formData.wake_up_time && (
            <div className="mb-6 p-3 rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/20 border border-primary/20">
              <div className="text-xs font-bold uppercase tracking-widest text-primary mb-3 flex items-center gap-1.5">
                <span>🕐</span> Your Daily Meal Schedule
              </div>
              <div className="flex flex-wrap gap-2">
                {schedule.map((item) => (
                  <div
                    key={item.key}
                    className="flex flex-col items-center bg-card/80 backdrop-blur-sm border border-border rounded-xl px-3 py-2 shadow-sm min-w-[80px]"
                  >
                    <span className="text-lg mb-0.5">{item.emoji}</span>
                    <span className="text-[10px] font-semibold text-muted-foreground text-center leading-tight">
                      {item.label}
                    </span>
                    <span className="text-xs font-bold text-primary mt-1">
                      {timeMap[item.key]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Tabs defaultValue="breakfast">
            <TabsList className="grid grid-cols-4 mb-6 h-auto">
              <TabsTrigger
                value="breakfast"
                data-ocid="result.meal_option.tab"
                className="text-xs sm:text-sm py-2"
              >
                🌅 Breakfast
              </TabsTrigger>
              <TabsTrigger
                value="lunch"
                data-ocid="result.meal_option.tab"
                className="text-xs sm:text-sm py-2"
              >
                🍽️ Lunch
              </TabsTrigger>
              <TabsTrigger
                value="dinner"
                data-ocid="result.meal_option.tab"
                className="text-xs sm:text-sm py-2"
              >
                🌙 Dinner
              </TabsTrigger>
              <TabsTrigger
                value="snacks"
                data-ocid="result.meal_option.tab"
                className="text-xs sm:text-sm py-2"
              >
                🍎 Snacks
              </TabsTrigger>
            </TabsList>

            {/* BREAKFAST */}
            <TabsContent value="breakfast">
              <div className="grid sm:grid-cols-2 gap-4">
                {BREAKFAST_OPTIONS.map((opt, i) => {
                  const backendBreakfast = plan.weekly_plan[i]?.breakfast;
                  return (
                    <div
                      key={opt.name}
                      data-ocid={`result.option.item.${i + 1}`}
                      className="bg-secondary/30 rounded-xl border border-border p-4"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                          Option {i + 1}
                        </Badge>
                        {backendBreakfast && (
                          <span className="text-xs text-muted-foreground">
                            {backendBreakfast.calories} kcal
                          </span>
                        )}
                      </div>
                      {backendBreakfast ? (
                        <>
                          <div className="font-semibold text-foreground text-sm">
                            {backendBreakfast.name}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            P {backendBreakfast.protein}g · C{" "}
                            {backendBreakfast.carbs}g · F{" "}
                            {backendBreakfast.fats}g
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {backendBreakfast.ingredients.map((ing) => (
                              <Badge
                                key={ing}
                                variant="outline"
                                className="text-xs"
                              >
                                {ing}
                              </Badge>
                            ))}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="font-semibold text-foreground text-sm">
                            {opt.name}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {opt.desc}
                          </div>
                          <div className="text-xs font-medium text-primary mt-1">
                            ~{opt.cal} kcal
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            {/* LUNCH */}
            <TabsContent value="lunch">
              <div className="grid sm:grid-cols-2 gap-4">
                {MEAL_OPTIONS.map((opt, i) => (
                  <StructuredMealCard
                    key={opt.dal}
                    index={i + 1}
                    option={opt}
                    type="lunch"
                  />
                ))}
              </div>
            </TabsContent>

            {/* DINNER */}
            <TabsContent value="dinner">
              <div className="grid sm:grid-cols-2 gap-4">
                {MEAL_OPTIONS.map((opt, i) => (
                  <StructuredMealCard
                    key={opt.dal}
                    index={i + 1}
                    option={opt}
                    type="dinner"
                  />
                ))}
              </div>
            </TabsContent>

            {/* SNACKS */}
            <TabsContent value="snacks">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wide">
                    Mid-Morning Snack
                  </h3>
                  <MidMorningSnackCard
                    bodyWeight={formData.weight}
                    dietPref={dietPref}
                    timeLabel={timeMap.midSnack}
                  />
                </div>
                <Separator />
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wide">
                    Evening Snack Options
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {EVENING_SNACKS.map((snack, i) => (
                      <div
                        key={snack.name}
                        data-ocid={`result.option.item.${i + 1}`}
                        className="bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800 p-4"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
                            Option {i + 1}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {snack.cal} kcal
                          </span>
                        </div>
                        <div className="font-semibold text-foreground text-sm">
                          {snack.name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {snack.desc}
                        </div>
                        <div className="mt-2 p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
                          <p className="text-xs font-semibold text-amber-800 dark:text-amber-200">
                            Hot Afresh (2 spoons) — every day
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
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

function StructuredMealCard({
  index,
  option,
  type,
}: {
  index: number;
  option: MealOption;
  type: "lunch" | "dinner";
}) {
  const isLunch = type === "lunch";
  const riceG = isLunch ? 150 : 120;
  const dalG = isLunch ? 100 : 80;
  const vegG = isLunch ? 100 : 80;
  const saladG = isLunch ? 300 : 240;
  const dahiG = isLunch ? 100 : 80;

  return (
    <div
      data-ocid={`result.option.item.${index}`}
      className="bg-secondary/30 rounded-xl border border-border p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
          Option {index}
        </Badge>
        <span className="text-xs font-semibold text-muted-foreground">
          {option.dal} {isLunch ? "Lunch" : "Dinner"}
        </span>
      </div>
      <ul className="space-y-1.5 text-sm">
        <li className="flex items-start gap-2">
          <span>🍚</span>
          <span>
            <span className="font-medium text-foreground">Rice {riceG}g</span>
            <span className="text-muted-foreground"> / </span>
            <span className="font-medium text-foreground">
              🫓 Chapati 2 pcs
            </span>
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span>🫘</span>
          <span>
            <span className="font-medium text-foreground">Dal:</span>{" "}
            <span className="text-foreground">{option.dal}</span>{" "}
            <span className="text-muted-foreground">— {dalG}g</span>
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span>🥘</span>
          <span>
            <span className="font-medium text-foreground">
              Cooked Veg (gravy):
            </span>{" "}
            <span className="text-foreground">{option.cookedVeg}</span>{" "}
            <span className="text-muted-foreground">— {vegG}g</span>
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span>🥗</span>
          <span>
            <span className="font-medium text-foreground">
              Salad {saladG}g:
            </span>{" "}
            <span className="text-muted-foreground">
              {option.salad.join(", ")}
            </span>
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span>🥛</span>
          <span>
            <span className="font-medium text-foreground">Dahi</span>{" "}
            <span className="text-muted-foreground">— {dahiG}g</span>
          </span>
        </li>
      </ul>
      {!isLunch && (
        <div className="mt-2 px-2 py-1 bg-primary/5 rounded-lg">
          <p className="text-xs text-muted-foreground">
            Portions are 20% less than lunch for lighter evening digestion.
          </p>
        </div>
      )}
    </div>
  );
}

function MealCard({
  meal,
  label,
  timeLabel,
}: { meal: Meal; label: string; timeLabel?: string }) {
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
            {timeLabel && (
              <div className="text-xs text-primary font-semibold">
                {timeLabel}
              </div>
            )}
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

function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + mins;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  const ampm = nh >= 12 ? "PM" : "AM";
  const hour12 = nh % 12 === 0 ? 12 : nh % 12;
  return `${hour12}:${String(nm).padStart(2, "0")} ${ampm}`;
}

const MEAL_SCHEDULE = {
  3: [
    { key: "breakfast", label: "Breakfast", emoji: "🌅", offset: 180 },
    { key: "midSnack", label: "Mid Morning Snack", emoji: "🍎", offset: 360 },
    { key: "lunch", label: "Lunch", emoji: "🍽️", offset: 540 },
    { key: "eveningSnack", label: "Evening Snack", emoji: "🥗", offset: 720 },
    { key: "dinner", label: "Dinner", emoji: "🌙", offset: 900 },
  ],
  4: [
    { key: "breakfast", label: "Breakfast", emoji: "🌅", offset: 180 },
    { key: "lunch", label: "Lunch", emoji: "🍽️", offset: 420 },
    { key: "eveningSnack", label: "Evening Snack", emoji: "🥗", offset: 660 },
    { key: "dinner", label: "Dinner", emoji: "🌙", offset: 900 },
  ],
  5: [
    { key: "breakfast", label: "Breakfast", emoji: "🌅", offset: 180 },
    { key: "lunch", label: "Lunch", emoji: "🍽️", offset: 480 },
    { key: "dinner", label: "Dinner", emoji: "🌙", offset: 780 },
  ],
} as Record<
  number,
  { key: string; label: string; emoji: string; offset: number }[]
>;

function MidMorningSnackCard({
  bodyWeight,
  dietPref,
  timeLabel,
}: { bodyWeight: number; dietPref: string; timeLabel?: string }) {
  const grams = Math.round(bodyWeight * 10);
  const isNonVeg = dietPref === "non_vegetarian";
  return (
    <div className="bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-200 dark:border-green-800 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center shrink-0">
            <span className="text-base">🍎</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-green-700 dark:text-green-400 font-medium uppercase tracking-wide">
              Mid Morning Snack
            </div>
            {timeLabel && (
              <div className="text-xs text-primary font-semibold">
                {timeLabel}
              </div>
            )}
            <div className="font-semibold text-foreground text-sm mt-0.5">
              Fruits & Sprouts Salad
            </div>
          </div>
        </div>
        <div className="mt-3 rounded-lg overflow-hidden border border-green-200 dark:border-green-800">
          <img
            src="/assets/generated/fruits-sprouts-salad.dim_600x400.jpg"
            alt="Fruits and sprouts salad"
            className="w-full h-40 object-cover"
          />
        </div>
        <div className="mt-3 p-3 bg-green-100 dark:bg-green-900/40 rounded-lg">
          <p className="text-sm font-semibold text-green-800 dark:text-green-200">
            Eat{" "}
            <span className="text-green-600 dark:text-green-400 font-bold">
              {grams}g (1%)
            </span>{" "}
            of fruits and sprouts mixed with raw vegetables.
          </p>
          <p className="text-xs text-green-700 dark:text-green-300 mt-1">
            Includes 4–5 different colours of fruits and vegetables for maximum
            micronutrients.
          </p>
          {isNonVeg && (
            <p className="text-xs text-green-700 dark:text-green-300 mt-1 font-medium">
              + 2 Egg Whites (boiled or poached)
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function EveningSnackCard({
  dayIndex,
  timeLabel,
}: { dayIndex: number; timeLabel?: string }) {
  const snack = EVENING_SNACKS[dayIndex % EVENING_SNACKS.length];
  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
            <span className="text-base">🫘</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-amber-700 dark:text-amber-400 font-medium uppercase tracking-wide">
              Evening Snack
            </div>
            {timeLabel && (
              <div className="text-xs text-primary font-semibold">
                {timeLabel}
              </div>
            )}
            <div className="font-semibold text-foreground text-sm mt-0.5">
              {snack.name}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {snack.cal} kcal · {snack.desc}
            </div>
          </div>
        </div>
        <div className="mt-3 p-3 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
          <p className="text-xs font-semibold text-amber-800 dark:text-amber-200">
            Indian snack under 150 kcal — freshly prepared, eaten hot/warm.
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
            +{" "}
            <span className="font-semibold">
              Hot Afresh (2 spoons) — every day
            </span>
          </p>
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

// Keep EveningSnackCard exported-accessible (used in print view if needed)
export { MealCard, MidMorningSnackCard, EveningSnackCard };
