import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
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
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { type ReactNode, useState } from "react";
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

const HN_SHAKE_FLAVOURS = [
  "Mango",
  "Vanilla",
  "Banana",
  "Orange",
  "Chocolate",
  "Strawberry",
  "Kulfi",
];

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
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

const GENERAL_AVOID_FOODS = [
  {
    name: "Refined Sugar & Sweets",
    desc: "Cold drinks, packaged sweets, candy",
  },
  {
    name: "Fried & Deep-Fried Foods",
    desc: "Samosa, vada, chips",
  },
  {
    name: "White Bread & Maida Products",
    desc: "White bread, naan, biscuits",
  },
  {
    name: "Processed & Packaged Foods",
    desc: "Chips, instant noodles, ready meals",
  },
  {
    name: "Soft Drinks & Fruit Juices",
    desc: "Cola, store-bought juice, energy drinks",
  },
  {
    name: "Trans Fats & Hydrogenated Oils",
    desc: "Vanaspati, margarine, fast food",
  },
  {
    name: "Excess Salt & Pickles",
    desc: ">5g salt/day, achar, papad",
  },
  {
    name: "Alcohol",
    desc: "Depletes B vitamins, increases fat storage",
  },
];

const CONDITION_AVOID_FOODS: Record<
  string,
  { food: string; reason: string }[]
> = {
  "Uric Acid": [
    { food: "Red Meat & Organ Meats", reason: "High purines raise uric acid" },
    { food: "Seafood (prawns, sardines)", reason: "High purine content" },
    { food: "Beer & Alcohol", reason: "Impairs uric acid excretion" },
    {
      food: "High-Fructose Foods",
      reason: "Fructose increases uric acid production",
    },
  ],
  "Joint Pain": [
    {
      food: "Refined Sugar & Sweets",
      reason: "Triggers inflammatory response",
    },
    {
      food: "Trans Fats & Fried Food",
      reason: "Promotes systemic inflammation",
    },
    {
      food: "Excess Omega-6 Oils",
      reason: "Imbalances Omega-3:6 ratio",
    },
    { food: "Processed Snacks", reason: "Contains inflammatory additives" },
  ],
  "Breath Issue": [
    {
      food: "Dairy Products",
      reason: "Can increase mucus production",
    },
    {
      food: "Sulfite-Rich Foods (wine, dried fruits)",
      reason: "Can trigger breathing difficulty",
    },
    { food: "Cold & Iced Foods", reason: "May constrict airways" },
  ],
  "Sleep Disorders": [
    { food: "Caffeine (coffee, tea, cola)", reason: "Disrupts sleep cycle" },
    { food: "Heavy Meals at Night", reason: "Impairs sleep quality" },
    { food: "Alcohol", reason: "Fragments deep sleep stages" },
    {
      food: "Spicy Foods at Night",
      reason: "Causes discomfort and acid reflux",
    },
  ],
  "Stress / Depression / Anxiety": [
    { food: "Refined Sugar", reason: "Causes energy spikes and crashes" },
    { food: "Caffeine in excess", reason: "Heightens anxiety and cortisol" },
    { food: "Alcohol", reason: "Depressant; worsens mood disorders" },
    {
      food: "Processed Fast Food",
      reason: "Linked to poor mental health outcomes",
    },
  ],
  "Diabetes (Type 2)": [
    {
      food: "White Rice & White Bread",
      reason: "Rapidly spikes blood glucose",
    },
    {
      food: "Refined Sugar & Sweets",
      reason: "Direct blood sugar impact",
    },
    {
      food: "Sweetened Beverages",
      reason: "No fiber; pure sugar load",
    },
    { food: "Fruit Juices", reason: "High sugar without fiber" },
    { food: "Deep Fried Foods", reason: "Increases insulin resistance" },
  ],
  Hypertension: [
    {
      food: "Table Salt & High-Sodium Foods",
      reason: "Raises blood pressure directly",
    },
    {
      food: "Processed Meats (sausage, bacon)",
      reason: "High sodium content",
    },
    {
      food: "Canned & Pickled Foods",
      reason: "Excessive sodium preservatives",
    },
    { food: "Caffeine in excess", reason: "Temporarily spikes BP" },
    { food: "Alcohol", reason: "Raises blood pressure over time" },
  ],
  "High Cholesterol": [
    {
      food: "Trans Fats (vanaspati, margarine)",
      reason: "Raises LDL, lowers HDL",
    },
    {
      food: "Saturated Fats (ghee in excess, red meat)",
      reason: "Increases total cholesterol",
    },
    {
      food: "Full-Fat Dairy (cream, cheese)",
      reason: "High in saturated fats",
    },
    { food: "Fried & Processed Foods", reason: "Trans fat content" },
  ],
  PCOS: [
    {
      food: "Refined Carbohydrates",
      reason: "Spikes insulin, worsens hormonal imbalance",
    },
    { food: "Sugar & Sweets", reason: "Increases androgen levels" },
    { food: "Dairy in excess", reason: "May affect hormonal balance" },
    {
      food: "Processed & Packaged Foods",
      reason: "Contains endocrine disruptors",
    },
  ],
  "Thyroid Disorder": [
    {
      food: "Raw Cruciferous Vegetables (cabbage, cauliflower)",
      reason: "Contains goitrogens (cook before eating)",
    },
    {
      food: "Excess Soy Products",
      reason: "Interferes with thyroid hormone absorption",
    },
    {
      food: "Processed & High-Iodine Foods",
      reason: "Can worsen thyroid function",
    },
    {
      food: "Gluten (if Hashimoto's)",
      reason: "May trigger autoimmune response",
    },
  ],
  "Heart Disease": [
    {
      food: "Trans Fats & Hydrogenated Oils",
      reason: "Increases cardiovascular risk",
    },
    { food: "Excess Saturated Fats", reason: "Raises LDL cholesterol" },
    {
      food: "High-Sodium Foods",
      reason: "Increases blood pressure and heart strain",
    },
    { food: "Refined Carbohydrates", reason: "Raise triglycerides" },
    { food: "Alcohol", reason: "Weakens heart muscle over time" },
  ],
};

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

  // Health conditions (filter out "None")
  const activeConditions = (formData.health_conditions || []).filter(
    (c) => c && c.toLowerCase() !== "none",
  );

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
                Diet &amp; Nutrition Plan
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
            {formData.name}&apos;s Diet Plan
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

        {/* ── 7-Day Meal Plan ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-card rounded-2xl border border-border p-6"
        >
          <h2 className="text-xl font-display font-bold text-foreground mb-2 flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-primary" />
            Weekly Meal Plan
          </h2>
          <p className="text-sm text-muted-foreground mb-5">
            Your personalised 7-day meal schedule — all days visible below.
            Scroll to see each day's meals in chronological order.
          </p>

          {/* Meal Schedule Summary */}
          {schedule && formData.wake_up_time && (
            <div
              data-print-schedule
              className="mb-6 p-3 rounded-2xl border border-primary/20"
              style={{ background: "oklch(var(--primary) / 0.07)" }}
            >
              <div className="text-xs font-bold uppercase tracking-widest text-primary mb-3 flex items-center gap-1.5">
                <span>🕐</span> Your Daily Meal Schedule
              </div>
              <div className="flex flex-wrap gap-2">
                {schedule.map((item) => (
                  <div
                    key={item.key}
                    data-print-schedule-item
                    className="flex flex-col items-center bg-card border border-border rounded-xl px-3 py-2 shadow-sm min-w-[80px]"
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

          {/* 7 Day Tables */}
          <div className="space-y-8">
            {DAYS_OF_WEEK.map((day, dayIdx) => {
              const opt = MEAL_OPTIONS[dayIdx];
              const flavour = HN_SHAKE_FLAVOURS[dayIdx];
              const eveningSnack =
                EVENING_SNACKS[dayIdx % EVENING_SNACKS.length];
              const midSnackGrams = Math.round(formData.weight * 10);
              const isNonVeg = dietPref === "non_vegetarian";

              // Build meal rows based on meal gap
              const mealRows: {
                key: string;
                emoji: string;
                meal: string;
                time: string;
                details: ReactNode;
              }[] = [];

              // Breakfast always present
              mealRows.push({
                key: "breakfast",
                emoji: "🌅",
                meal: "Breakfast",
                time: timeMap.breakfast || "—",
                details: (
                  <div>
                    <div className="font-medium text-foreground">
                      🥤 HN Shake —{" "}
                      <span className="text-primary">{flavour}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      230 kcal · Carbs 24g · Fat 3g · Protein 19.75g · 19
                      Essential Vitamins &amp; Minerals
                    </div>
                  </div>
                ),
              });

              // Mid-morning snack (3hr gap only)
              if (formData.meal_gap === 3 || formData.meal_gap === 3) {
                mealRows.push({
                  key: "midSnack",
                  emoji: "🍎",
                  meal: "Mid-Morning Snack",
                  time: timeMap.midSnack || "—",
                  details: (
                    <div>
                      <div className="font-medium text-foreground">
                        Fruits &amp; Sprouts Salad
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Eat{" "}
                        <span className="font-semibold text-foreground">
                          {midSnackGrams}g (1%)
                        </span>{" "}
                        of fruits and sprouts mixed with raw vegetables.
                        Includes 4–5 different colours.
                        {isNonVeg && (
                          <span className="font-medium"> + 2 Egg Whites</span>
                        )}
                      </div>
                    </div>
                  ),
                });
              }

              // Lunch always present
              mealRows.push({
                key: "lunch",
                emoji: "🍽️",
                meal: "Lunch",
                time: timeMap.lunch || "—",
                details: (
                  <div>
                    <div className="font-medium text-foreground">
                      🍚 Rice 150g / 🫓 Chapati 2 pcs
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Dal: {opt.dal} (100g) · Cooked Veg: {opt.cookedVeg} (100g)
                      · Salad 300g ({opt.salad.join(", ")}) · Dahi 100g
                    </div>
                  </div>
                ),
              });

              // Evening snack (3hr and 4hr gap)
              if (
                formData.meal_gap === 3 ||
                formData.meal_gap === 3 ||
                formData.meal_gap === 4 ||
                formData.meal_gap === 4
              ) {
                mealRows.push({
                  key: "eveningSnack",
                  emoji: "🫘",
                  meal: "Evening Snack",
                  time: timeMap.eveningSnack || "—",
                  details: (
                    <div>
                      <div className="font-medium text-foreground">
                        {eveningSnack.name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {eveningSnack.cal} kcal · {eveningSnack.desc}
                      </div>
                      <div className="text-xs font-semibold text-amber-700 dark:text-amber-300 mt-1">
                        Hot Afresh (2 spoons) — every day
                      </div>
                    </div>
                  ),
                });
              }

              // Dinner always present
              mealRows.push({
                key: "dinner",
                emoji: "🌙",
                meal: "Dinner",
                time: timeMap.dinner || "—",
                details: (
                  <div>
                    <div className="font-medium text-foreground">
                      🍚 Rice 120g / 🫓 Chapati 2 pcs
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Dal: {opt.dal} (80g) · Cooked Veg: {opt.cookedVeg} (80g) ·
                      Salad 240g ({opt.salad.join(", ")}) · Dahi 80g
                    </div>
                  </div>
                ),
              });

              return (
                <div
                  key={day}
                  data-ocid={`result.day_plan.item.${dayIdx + 1}`}
                  className="rounded-2xl border border-border overflow-hidden"
                >
                  <div className="bg-primary/10 px-4 py-3 flex items-center gap-2 border-b border-border">
                    <span className="text-base font-bold text-primary">
                      {day}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      — {mealRows.length} meals
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-secondary/30 border-b border-border">
                          <th className="text-left px-4 py-2.5 font-semibold text-foreground w-40">
                            Meal
                          </th>
                          <th className="text-left px-4 py-2.5 font-semibold text-foreground w-24">
                            Time
                          </th>
                          <th className="text-left px-4 py-2.5 font-semibold text-foreground">
                            Food Items / Details
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {mealRows.map((row, ri) => (
                          <tr
                            key={row.key}
                            className={
                              ri % 2 === 0 ? "bg-background" : "bg-secondary/20"
                            }
                          >
                            <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                              <span className="mr-1.5">{row.emoji}</span>
                              {row.meal}
                            </td>
                            <td className="px-4 py-3 text-primary font-semibold whitespace-nowrap text-xs">
                              {row.time}
                            </td>
                            <td className="px-4 py-3">{row.details}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Daily Wellness */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.38 }}
          className="bg-card rounded-2xl border border-border p-6"
          data-ocid="result.daily_wellness.section"
        >
          <h2 className="text-xl font-display font-bold text-foreground mb-5 flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            Daily Wellness
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Hydration */}
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex gap-3 items-start">
              <div className="text-2xl mt-0.5">💧</div>
              <div>
                <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">
                  Hydration
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {(formData.weight / 18).toFixed(1)} L
                  <span className="text-sm font-normal text-muted-foreground">
                    /day
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Drink 250ml of water every hour
                </div>
              </div>
            </div>
            {/* Walking */}
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-4 flex gap-3 items-start">
              <div className="text-2xl mt-0.5">🚶</div>
              <div>
                <div className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide mb-1">
                  Daily Walking
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {Math.round(formData.weight * 110).toLocaleString()}
                  <span className="text-sm font-normal text-muted-foreground">
                    {" "}
                    steps/day
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Target footsteps based on your body weight
                </div>
              </div>
            </div>
            {/* Exercise */}
            <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-xl p-4 flex gap-3 items-start">
              <div className="text-2xl mt-0.5">🏋️</div>
              <div>
                <div className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide mb-1">
                  General Exercise
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {Math.round((formData.weight * 45) / 60)}
                  <span className="text-sm font-normal text-muted-foreground">
                    {" "}
                    min/day
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Recommended daily exercise duration
                </div>
              </div>
            </div>
            {/* Sleep */}
            <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-xl p-4 flex gap-3 items-start">
              <div className="text-2xl mt-0.5">🌙</div>
              <div>
                <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-1">
                  Sleep (WHO Recommendation)
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {formData.age <= 1
                    ? "14–17"
                    : formData.age <= 2
                      ? "12–15"
                      : formData.age <= 5
                        ? "10–13"
                        : formData.age <= 13
                          ? "9–11"
                          : formData.age <= 17
                            ? "8–10"
                            : formData.age <= 25
                              ? "7–9"
                              : formData.age <= 64
                                ? "7–9"
                                : "7–8"}
                  <span className="text-sm font-normal text-muted-foreground">
                    {" "}
                    hours/night
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Based on your age ({formData.age} yrs)
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Foods to Avoid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.42 }}
          className="bg-card rounded-2xl border border-border p-6"
          data-ocid="result.foods_avoid.section"
        >
          <h2 className="text-xl font-display font-bold text-foreground mb-2 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" />
            Foods to Avoid
          </h2>
          <p className="text-sm text-muted-foreground mb-5">
            Eliminating these foods accelerates your health goals and prevents
            nutrient deficiencies.
          </p>

          {/* General Avoid List */}
          <h3 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wide flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            General Foods to Avoid
          </h3>
          <div className="grid sm:grid-cols-2 gap-3 mb-6">
            {GENERAL_AVOID_FOODS.map((item) => (
              <div
                key={item.name}
                className="flex items-start gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40"
              >
                <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-foreground text-sm">
                    {item.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Condition-Specific Avoid List */}
          {activeConditions.length > 0 && (
            <div className="space-y-4">
              {activeConditions.map((condition) => {
                const foods = CONDITION_AVOID_FOODS[condition];
                if (!foods) return null;
                return (
                  <div key={condition}>
                    <div className="flex items-center gap-2 mb-3 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                        Based on Your Health Condition: {condition}
                      </span>
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-border">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-amber-50/80 dark:bg-amber-950/30 hover:bg-amber-50/80">
                            <TableHead className="font-bold text-foreground">
                              Food to Avoid
                            </TableHead>
                            <TableHead className="font-bold text-foreground">
                              Reason
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {foods.map((f, idx) => (
                            <TableRow
                              key={f.food}
                              className={
                                idx % 2 === 0
                                  ? "bg-amber-50/40 dark:bg-amber-950/10"
                                  : ""
                              }
                            >
                              <TableCell className="font-medium text-foreground text-sm">
                                <span className="flex items-center gap-2">
                                  <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                                  {f.food}
                                </span>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {f.reason}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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

        {/* Footer / Generate New Report */}
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
              Fruits &amp; Sprouts Salad
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

// Keep exports for any potential future usage
export { MealCard, MidMorningSnackCard, EveningSnackCard };
