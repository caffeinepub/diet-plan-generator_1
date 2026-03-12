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
  Copy,
  Globe,
  Heart,
  Leaf,
  Lock,
  MessageCircle,
  Pill,
  Printer,
  RefreshCw,
  Share2,
  Target,
  User,
  UtensilsCrossed,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { type ReactNode, useEffect, useState } from "react";
import type { DietPlan, Meal } from "../backend.d";
import type { FormData } from "../types/diet";

const GOAL_LABELS: Record<string, string> = {
  weight_loss: "Weight Loss",
  muscle_gain: "Muscle Gain",
  maintenance: "Maintenance",
  body_recomposition: "Body Recomposition",
};

const _ACTIVITY_LABELS: Record<string, string> = {
  sedentary: "Sedentary",
  lightly_active: "Lightly Active",
  moderately_active: "Moderately Active",
  very_active: "Very Active",
  extra_active: "Extra Active",
};

const _STRESS_LABELS: Record<string, string> = {
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
    { food: "Fried Fast Food", reason: "High in trans & saturated fats" },
    { food: "Full-Fat Dairy in excess", reason: "High saturated fat content" },
  ],
  "PCOS / Hormonal Imbalance": [
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
  const [referralCount, setReferralCount] = useState(0);
  const [copied, setCopied] = useState(false);

  const userWa = formData.user_whatsapp || formData.referrer_whatsapp || "";
  const referralLink = userWa
    ? `${window.location.origin}${window.location.pathname}?ref=${userWa}`
    : "";

  useEffect(() => {
    if (userWa) {
      const key = `hncoach_referrals_${userWa}`;
      setReferralCount(Number.parseInt(localStorage.getItem(key) || "0"));
    }
  }, [userWa]);

  function handleCopyLink() {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

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

  const _allAllergies = formData.food_allergies_text
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

  const _dietPref = formData.dietary_preferences[0] || "vegetarian";

  // Health conditions (filter out "None")
  const activeConditions = (formData.health_conditions || []).filter(
    (c) => c && c.toLowerCase() !== "none",
  );

  return (
    <div
      data-ocid="result.page"
      className="result-page min-h-screen bg-slate-50"
    >
      {/* Print-only professional header */}
      <div className="print-only-header hidden print:flex items-center justify-between border-b-2 border-teal-600 pb-3 mb-4 px-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <img
              src="/assets/uploads/IMG-20260226-WA0000-2.jpg"
              className="w-8 h-8 rounded-full object-cover border border-teal-300"
              alt="HN Coach"
            />
            <div>
              <div className="font-bold text-lg text-teal-700">HN Coach</div>
              <div className="text-xs text-gray-500">
                Diet &amp; Nutrition Plan
              </div>
            </div>
          </div>
        </div>
        <div className="text-center">
          <div className="font-bold text-sm text-gray-800">
            CONFIDENTIAL DIET REPORT
          </div>
          <div className="text-xs text-gray-500">
            Generated for {formData.name}
          </div>
        </div>
        <div className="text-right text-xs text-gray-500">
          <div>
            {new Date().toLocaleDateString("en-IN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          <div className="text-[10px] mt-0.5">Evidence-Based Nutrition</div>
        </div>
      </div>

      {/* Header */}
      <header className="no-print sticky top-0 z-10 border-b border-teal-100 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/assets/uploads/IMG-20260226-WA0000-2.jpg"
              className="w-9 h-9 rounded-full object-cover border-2 border-teal-200"
              alt="HN Coach"
            />
            <div>
              <span className="font-bold text-gray-900">HN Coach</span>
              <div className="text-xs text-gray-500 leading-none">
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
              className="gap-2 no-print border-teal-200 text-teal-700 hover:bg-teal-50"
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

      <main className="max-w-5xl mx-auto px-4 py-5 space-y-5">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-4"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 mb-4">
            <UtensilsCrossed className="w-7 h-7 text-teal-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            {formData.name}&apos;s Diet Plan
          </h1>
          <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-full px-4 py-1.5 text-sm font-semibold">
              {GOAL_LABELS[formData.goal]}
            </span>
          </div>
        </motion.div>

        {/* ── PERSONAL DETAILS ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          <ReportCard
            title="Personal Details"
            icon={<User className="w-4 h-4" />}
          >
            <div className="grid sm:grid-cols-2 gap-x-8">
              <div>
                <ReportField label="Name" value={formData.name} />
                <ReportField label="Age" value={`${formData.age} years`} />
                <ReportField
                  label="Gender"
                  value={
                    formData.gender.charAt(0).toUpperCase() +
                    formData.gender.slice(1)
                  }
                />
                <ReportField label="Height" value={`${formData.height} cm`} />
                <ReportField label="Weight" value={`${formData.weight} kg`} />
              </div>
              <div>
                <ReportField label="Goal" value={GOAL_LABELS[formData.goal]} />
                {formData.target_weight_kg > 0 && (
                  <ReportField
                    label={
                      formData.goal === "weight_loss"
                        ? "Target Loss"
                        : formData.goal === "muscle_gain"
                          ? "Target Gain"
                          : "Target"
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
                  <ReportField
                    label="BMR / TDEE"
                    value={`${
                      formData.bmr_manual > 0
                        ? `${formData.bmr_manual} kcal`
                        : "—"
                    } / ${
                      formData.tdee_manual > 0
                        ? `${formData.tdee_manual} kcal`
                        : "—"
                    }`}
                  />
                )}
                <ReportField
                  label="Meal Gap"
                  value={`${formData.meal_gap} hours`}
                />
                <ReportField
                  label="Health"
                  value={
                    formData.health_conditions.length > 0
                      ? formData.health_conditions.join(", ")
                      : "None"
                  }
                />
                <ReportField
                  label="Bed Time"
                  value={formData.bed_time || "—"}
                />
                <ReportField
                  label="Wake Up"
                  value={formData.wake_up_time || "—"}
                />
                <ReportField label="Sleep" value={sleepDurationText} />
                {(formData.protein_target > 0 ||
                  formData.fat_target > 0 ||
                  formData.carbs_target > 0) && (
                  <ReportField
                    label="Macros"
                    value={`P: ${formData.protein_target}g · F: ${formData.fat_target}g · C: ${formData.carbs_target}g`}
                  />
                )}
                {allSupplements.length > 0 && (
                  <ReportField
                    label="Supplements"
                    value={allSupplements.join(", ")}
                  />
                )}
                {formData.referrer_whatsapp && (
                  <div className="flex items-center gap-3 border-b border-gray-100 py-2 last:border-b-0">
                    <span className="bg-teal-50 text-teal-700 text-xs font-semibold uppercase rounded-full px-3 py-1 min-w-[100px] text-center shrink-0">
                      Referred By
                    </span>
                    <span className="flex items-center gap-1.5 text-gray-800 font-medium text-sm">
                      <Lock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      +91 {formData.referrer_whatsapp}
                      <span className="ml-1 text-xs bg-teal-100 text-teal-800 rounded-full px-2 py-0.5 font-semibold">
                        Verified ✓
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </ReportCard>
        </motion.div>

        {/* ── GOAL TIMELINE ── */}
        {showTimeline && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            data-ocid="result.goal_timeline.panel"
          >
            <ReportCard
              title={isLoss ? "Weight Loss Timeline" : "Weight Gain Timeline"}
              icon={<Target className="w-4 h-4" />}
            >
              <p className="text-sm text-gray-500 mb-4">
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
                    bg: "bg-red-50 border-red-100",
                  },
                  {
                    rate: 3,
                    label: "3 kg/month",
                    color: "text-orange-600",
                    bg: "bg-orange-50 border-orange-100",
                  },
                  {
                    rate: 4,
                    label: "4 kg/month",
                    color: "text-amber-600",
                    bg: "bg-amber-50 border-amber-100",
                  },
                  {
                    rate: 5,
                    label: "5 kg/month",
                    color: "text-teal-600",
                    bg: "bg-teal-50 border-teal-100",
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
                    <div className="text-xs text-gray-500 mt-1 font-medium">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
              {isLoss && targetBellyInches > 0 && (
                <div className="mt-4 bg-teal-50 border border-teal-100 rounded-xl p-4 text-sm text-gray-600">
                  <span className="font-semibold text-gray-800">
                    Belly fat target:
                  </span>{" "}
                  {targetBellyInches} inches reduction. Generally, by losing 2–3
                  kg you can expect to lose approximately 1 inch from belly fat.
                  Consistent caloric deficit, strength training, and quality
                  sleep accelerate results.
                </div>
              )}
            </ReportCard>
          </motion.div>
        )}

        {/* ── GLOBAL NUTRITION PHILOSOPHY + RDA TABLES ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <ReportCard
            title="Global Nutrition Philosophy"
            icon={<Globe className="w-4 h-4" />}
          >
            <div className="text-center mb-5">
              <p className="text-sm text-gray-600 max-w-2xl mx-auto">
                A human body requires all these nutrients{" "}
                <strong className="text-gray-900">every single day</strong> to
                meet its biological requirements — to stay healthy, look better,
                and maintain strong immunity.
              </p>
            </div>

            {/* Macronutrients Table */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2 uppercase tracking-wide">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block" />
                Macronutrients — Daily RDA for Indians
              </h3>
              <div className="overflow-x-auto rounded-lg border border-teal-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-teal-50">
                      <th className="text-left p-3 font-semibold text-teal-800 rounded-tl-lg">
                        Nutrient
                      </th>
                      <th className="text-left p-3 font-semibold text-teal-800">
                        RDA (Adult)
                      </th>
                      <th className="text-left p-3 font-semibold text-teal-800 rounded-tr-lg">
                        Primary Role
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {macroRDA.map((row, i) => (
                      <tr
                        key={row.nutrient}
                        className={i % 2 === 0 ? "bg-white" : "bg-teal-50/30"}
                      >
                        <td className="p-3 font-medium text-gray-800">
                          {row.nutrient}
                        </td>
                        <td className="p-3 text-teal-700 font-semibold">
                          {row.rda}
                        </td>
                        <td className="p-3 text-gray-500">{row.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Micronutrients Table */}
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2 uppercase tracking-wide">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                Micronutrients — Daily RDA for Indians
              </h3>
              <div className="overflow-x-auto rounded-lg border border-amber-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-amber-50">
                      <th className="text-left p-3 font-semibold text-amber-800 rounded-tl-lg">
                        Nutrient
                      </th>
                      <th className="text-left p-3 font-semibold text-amber-800">
                        RDA (Adult)
                      </th>
                      <th className="text-left p-3 font-semibold text-amber-800 rounded-tr-lg">
                        Primary Role
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {MICRO_RDA.map((row, i) => (
                      <tr
                        key={row.nutrient}
                        className={i % 2 === 0 ? "bg-white" : "bg-amber-50/30"}
                      >
                        <td className="p-3 font-medium text-gray-800">
                          {row.nutrient}
                        </td>
                        <td className="p-3 text-amber-700 font-semibold">
                          {row.rda}
                        </td>
                        <td className="p-3 text-gray-500">{row.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-5 bg-gradient-to-r from-teal-50 to-amber-50 border border-teal-100 rounded-xl p-4 text-center">
              <p className="text-sm font-medium text-gray-700">
                ✨ <strong className="text-gray-900">Remember:</strong> No
                single food provides all nutrients. A diverse, balanced diet is
                the cornerstone of lasting health, vitality, and immunity — eat
                the rainbow every day.
              </p>
            </div>
          </ReportCard>
        </motion.div>

        {/* ── Motivational Quote ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.28 }}
          className="relative text-center py-6 px-8"
        >
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-16 rounded-full bg-teal-500 opacity-60" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-16 rounded-full bg-teal-500 opacity-60" />
          <span className="text-4xl text-teal-300 font-bold leading-none select-none absolute -top-2 left-8">
            &ldquo;
          </span>
          <p className="text-base sm:text-lg italic font-medium text-gray-700 leading-relaxed max-w-3xl mx-auto px-6">
            7 days to practice, 14 days to feel the change, 21 days to build the
            habit, 90 days to transform your life.{" "}
            <span className="not-italic">🚀</span>
          </p>
          <span className="text-4xl text-teal-300 font-bold leading-none select-none absolute -bottom-4 right-8">
            &rdquo;
          </span>
        </motion.div>

        {/* ── 7-Day Meal Plan ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <ReportCard
            title="7-Day Meal Plan"
            icon={<UtensilsCrossed className="w-4 h-4" />}
          >
            {/* Supplement pills banner */}
            <div className="flex gap-2 mb-3 flex-wrap">
              <div className="flex items-center gap-1.5 bg-gray-100 border border-gray-200 rounded-full px-3 py-1">
                <span className="text-xs">💊</span>
                <span className="text-xs italic text-gray-500 font-medium">
                  HN Digestion
                </span>
                <span className="text-xs text-gray-400">
                  — before Breakfast, Lunch &amp; Dinner
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                <span className="text-xs">🍵</span>
                <span className="text-xs italic text-amber-700 font-medium">
                  HN Tea
                </span>
                <span className="text-xs text-amber-500">
                  — 2-3 times between meals
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-full px-3 py-1">
                <span className="text-xs">💧</span>
                <span className="text-xs italic text-blue-600 font-medium">
                  HN Drink
                </span>
                <span className="text-xs text-blue-400">— Before exercise</span>
              </div>
            </div>

            {/* Timing strip */}
            {formData.wake_up_time && (
              <div className="text-xs text-gray-500 bg-teal-50 border border-teal-100 rounded-lg px-3 py-2 mb-4 flex flex-wrap gap-x-4 gap-y-1">
                <span className="font-semibold text-teal-700">
                  ⏰ Meal Times:
                </span>
                <span>
                  🌅 Breakfast:{" "}
                  <strong className="text-teal-700">
                    {timeMap.breakfast || "—"}
                  </strong>
                </span>
                <span>
                  🍎 Mid-Morning:{" "}
                  <strong className="text-teal-700">
                    {timeMap.midSnack || "—"}
                  </strong>
                </span>
                <span>
                  🍽️ Lunch:{" "}
                  <strong className="text-teal-700">
                    {timeMap.lunch || "—"}
                  </strong>
                </span>
                <span>
                  🫘 Evening:{" "}
                  <strong className="text-teal-700">
                    {timeMap.eveningSnack || "—"}
                  </strong>
                </span>
                <span>
                  🌙 Dinner:{" "}
                  <strong className="text-teal-700">
                    {timeMap.dinner || "—"}
                  </strong>
                </span>
              </div>
            )}

            {/* Compact 7-day banner table */}
            <div className="overflow-x-auto print-color-exact">
              <table
                className="w-full text-xs border-collapse"
                style={{
                  WebkitPrintColorAdjust: "exact",
                  printColorAdjust: "exact",
                }}
              >
                <thead>
                  <tr>
                    <th className="p-2 border border-gray-300 text-white font-bold text-center bg-teal-700 min-w-[48px]">
                      Day
                    </th>
                    <th className="p-2 border border-gray-300 text-white font-bold text-left bg-violet-600 min-w-[130px]">
                      🥤 Breakfast
                    </th>
                    <th className="p-2 border border-gray-300 text-white font-bold text-left bg-teal-600 min-w-[120px]">
                      🍎 Mid-Morning
                    </th>
                    <th className="p-2 border border-gray-300 text-white font-bold text-left bg-orange-500 min-w-[150px]">
                      🍽️ Lunch
                    </th>
                    <th className="p-2 border border-gray-300 text-white font-bold text-left bg-rose-500 min-w-[120px]">
                      🫘 Evening Snack
                    </th>
                    <th className="p-2 border border-gray-300 text-white font-bold text-left bg-blue-600 min-w-[150px]">
                      🌙 Dinner
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {DAYS_OF_WEEK.map((day, dayIdx) => {
                    const opt = MEAL_OPTIONS[dayIdx];
                    const flavour = HN_SHAKE_FLAVOURS[dayIdx];
                    const eveningSnack =
                      EVENING_SNACKS[dayIdx % EVENING_SNACKS.length];
                    const midSnackGrams = Math.round(formData.weight * 10);
                    const dayLabel = [
                      "Mon",
                      "Tue",
                      "Wed",
                      "Thu",
                      "Fri",
                      "Sat",
                      "Sun",
                    ][dayIdx];
                    const isRewardDay = dayIdx === 6;
                    const rowBg = dayIdx % 2 === 0 ? "bg-white" : "bg-gray-50";
                    return (
                      <tr
                        key={day}
                        data-ocid={`result.day_plan.item.${dayIdx + 1}`}
                        className={rowBg}
                      >
                        <td className="p-2 border border-gray-200 font-bold text-teal-700 bg-teal-50 text-center align-top">
                          {dayLabel}
                        </td>
                        <td className="p-2 border border-gray-200 align-top">
                          <div className="font-semibold text-violet-700">
                            HN Shake — {flavour}
                          </div>
                          <div className="text-gray-400 mt-0.5">
                            230 kcal · C:24g P:19.75g F:3g
                          </div>
                        </td>
                        <td className="p-2 border border-gray-200 align-top">
                          <div className="font-semibold text-teal-700">
                            {midSnackGrams}g Fruits &amp; Sprouts
                          </div>
                          <div className="text-gray-400 mt-0.5">
                            4-5 colours + 2 Egg Whites
                          </div>
                        </td>
                        <td
                          className={`p-2 border border-gray-200 align-top ${isRewardDay ? "bg-amber-50" : ""}`}
                        >
                          {isRewardDay ? (
                            <div>
                              <div className="font-bold text-orange-700">
                                🎉 Reward Meal!
                              </div>
                              <div className="text-gray-600 mt-0.5">
                                Have 1 of your favourite meals — you&apos;ve
                                earned it! Enjoy mindfully 💪
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="font-semibold text-orange-700">
                                Rice 100g + Chapati 2pc
                              </div>
                              <div className="text-gray-500 mt-0.5">
                                {opt.dal} · {opt.cookedVeg} · Salad 300g · Dahi
                                100g
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="p-2 border border-gray-200 align-top">
                          <div className="font-semibold text-rose-700">
                            {eveningSnack.name}
                          </div>
                          <div className="text-gray-400 mt-0.5">
                            {eveningSnack.cal} kcal · hot afresh 2 spoon
                          </div>
                        </td>
                        <td className="p-2 border border-gray-200 align-top">
                          <div className="font-semibold text-blue-700">
                            Rice 100g + Chapati 2pc
                          </div>
                          <div className="text-gray-500 mt-0.5">
                            {opt.dal} (80g) · {opt.cookedVeg} (80g) · Salad 240g
                            · Dahi 80g
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </ReportCard>
        </motion.div>

        {/* ── DAILY WELLNESS — DO NOT CHANGE ── */}
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

        {/* ── FOODS TO AVOID ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.42 }}
          data-ocid="result.foods_avoid.section"
        >
          <ReportCard
            title="Foods to Avoid"
            icon={<XCircle className="w-4 h-4" />}
          >
            <p className="text-sm text-gray-500 mb-5">
              Eliminating these foods accelerates your health goals and prevents
              nutrient deficiencies.
            </p>

            {/* General Avoid List */}
            <h3 className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
              General Foods to Avoid
            </h3>
            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              {GENERAL_AVOID_FOODS.map((item) => (
                <div
                  key={item.name}
                  className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-100"
                >
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
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
                      <div className="flex items-center gap-2 mb-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="text-sm font-semibold text-amber-800">
                          Based on Your Health Condition: {condition}
                        </span>
                      </div>
                      <div className="overflow-x-auto rounded-xl border border-teal-100">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-teal-50 hover:bg-teal-50">
                              <TableHead className="font-bold text-teal-800">
                                Food to Avoid
                              </TableHead>
                              <TableHead className="font-bold text-teal-800">
                                Reason
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {foods.map((f, idx) => (
                              <TableRow
                                key={f.food}
                                className={
                                  idx % 2 === 0 ? "bg-white" : "bg-teal-50/20"
                                }
                              >
                                <TableCell className="font-medium text-gray-800 text-sm">
                                  <span className="flex items-center gap-2">
                                    <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                                    {f.food}
                                  </span>
                                </TableCell>
                                <TableCell className="text-sm text-gray-500">
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
          </ReportCard>
        </motion.div>

        {/* ── HEALTH TIPS ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <ReportCard
            title="Personalized Health Tips"
            icon={<Heart className="w-4 h-4" />}
          >
            <div className="space-y-3">
              {plan.health_tips.map((tip, i) => (
                <motion.div
                  key={tip.slice(0, 30)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.06 }}
                  className="flex gap-3 p-3 rounded-xl bg-teal-50/60 border border-teal-100"
                >
                  <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700 leading-relaxed">{tip}</p>
                </motion.div>
              ))}
            </div>
          </ReportCard>
        </motion.div>

        {/* ── SUPPLEMENTS ── */}
        {allSupplements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <ReportCard
              title="Your Supplements"
              icon={<Pill className="w-4 h-4" />}
            >
              <div className="flex flex-wrap gap-2 mb-4">
                {allSupplements.map((s) => (
                  <span
                    key={s}
                    className="bg-teal-50 text-teal-700 border border-teal-200 rounded-full px-3 py-1 text-sm font-semibold"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                Your supplement stack has been considered in generating your
                meal plan. Take supplements as directed and consult a healthcare
                provider for personalized supplement advice.
              </p>
            </ReportCard>
          </motion.div>
        )}

        {/* ── REFERRAL SECTION ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.44 }}
          className="no-print"
          data-ocid="result.referral.section"
        >
          <ReportCard
            title="Refer &amp; Earn"
            icon={<Share2 className="w-4 h-4" />}
          >
            {/* Promo Banner */}
            <div className="bg-gradient-to-r from-teal-500 to-emerald-600 rounded-xl p-4 mb-5 text-white text-center">
              <div className="text-2xl mb-1">🎁</div>
              <div className="font-bold text-lg leading-tight">
                Refer &amp; Earn Full Refund!
              </div>
              <div className="text-sm text-teal-100 mt-1">
                Help <strong>2 friends</strong> download their HN Coach report
                and get a <strong>100% full refund</strong>.
              </div>
            </div>

            {formData.user_whatsapp ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={referralLink}
                    data-ocid="result.referral.input"
                    className="flex-1 text-xs rounded-lg border border-teal-200 bg-teal-50/50 px-3 py-2 font-mono text-gray-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    data-ocid="result.referral.secondary_button"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-teal-200 bg-teal-50 text-teal-700 text-xs font-semibold hover:bg-teal-100 transition-colors"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy
                      </>
                    )}
                  </button>
                </div>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Hey! I just got my personalized diet plan from HN Coach. Generate yours free here: ${referralLink}`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-ocid="result.referral.primary_button"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#1ebe5a] text-white font-semibold transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Share on WhatsApp
                </a>

                <div className="text-center py-3 bg-teal-50 rounded-xl border border-teal-100">
                  <div className="text-xs text-teal-600 font-semibold uppercase tracking-wide mb-1">
                    Friends Referred
                  </div>
                  <div className="text-3xl font-bold text-teal-700">
                    {referralCount}
                    <span className="text-base font-normal text-gray-500">
                      {" "}
                      / 2 for full refund
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden mx-4">
                    <div
                      className="h-full bg-teal-500 rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (referralCount / 2) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-teal-50 border border-teal-100 text-sm text-gray-600 text-center">
                Add your WhatsApp number when generating a report to get your
                unique referral link.
              </div>
            )}
          </ReportCard>
        </motion.div>

        {/* ── PERSONAL COACH ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.46 }}
          className="no-print"
        >
          <ReportCard
            title="Get Your Personal Coach"
            icon={<MessageCircle className="w-4 h-4" />}
          >
            <div className="text-center mb-5">
              <div className="text-3xl mb-2">👨‍⚕️</div>
              <p className="text-sm text-gray-600 max-w-sm mx-auto">
                Get 24×7 personal guidance from a dedicated coach who will help
                you achieve your health goals faster.
              </p>
            </div>
            {formData.referrer_whatsapp ? (
              <a
                href={`https://wa.me/91${formData.referrer_whatsapp}?text=${encodeURIComponent(
                  "Hi! I generated my HN Coach diet plan and would like personal guidance. Please help me achieve my goals.",
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                data-ocid="result.personal_coach.primary_button"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#1ebe5a] text-white font-semibold transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                Chat with My Coach on WhatsApp
              </a>
            ) : (
              <div className="p-4 rounded-xl bg-teal-50 border border-teal-100 text-sm text-gray-600 text-center">
                Ask the friend who referred you to HN Coach for personal
                coaching guidance.
              </div>
            )}
          </ReportCard>
        </motion.div>

        {/* Trust signal */}
        <div className="border-t border-teal-100 pt-4 pb-6 text-center space-y-1">
          <p className="text-xs text-gray-400 max-w-xl mx-auto">
            🔒 This report is generated based on your personal health data and
            follows evidence-based nutrition guidelines aligned with Indian RDA
            standards.
          </p>
        </div>
      </main>
    </div>
  );
}

// ── ReportCard & ReportField — Teal pill-label card style ─────────────────────

function ReportCard({
  title,
  icon,
  children,
  className,
}: {
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white rounded-xl border border-teal-100 shadow-sm overflow-hidden print:shadow-none print:border print:border-teal-200 ${
        className || ""
      }`}
    >
      <div className="border-l-4 border-teal-500 px-5 py-5">
        {title && (
          <div className="flex items-center gap-2 mb-4">
            {icon && (
              <span className="text-teal-600 shrink-0 print:text-teal-600">
                {icon}
              </span>
            )}
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-800">
              <span className="text-teal-500 mr-1.5">—</span>
              {title}
            </h2>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

function ReportField({
  label,
  value,
}: {
  label: string;
  value: string | ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-gray-100 py-2 last:border-b-0">
      <span className="bg-teal-50 text-teal-700 text-xs font-semibold uppercase rounded-full px-3 py-1 min-w-[100px] text-center shrink-0 print:bg-teal-50 print:text-teal-700">
        {label}
      </span>
      <span className="text-gray-800 font-medium text-sm">{value}</span>
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
  timeLabel,
}: { bodyWeight: number; timeLabel?: string }) {
  const grams = Math.round(bodyWeight * 10);
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
          <p className="text-xs text-green-700 dark:text-green-300 mt-1 font-medium">
            + 2 Egg Whites (boiled or poached)
          </p>
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
          </div>
        </div>
        <div className="mt-3 p-3 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
          <p className="text-xs text-amber-700 dark:text-amber-300">
            {snack.cal} kcal · {snack.desc}
          </p>
          <p className="text-xs font-semibold text-amber-800 dark:text-amber-200 mt-1">
            Hot Afresh (2 spoons) — every day
          </p>
        </div>
      </div>
    </div>
  );
}

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
