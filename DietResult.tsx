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
  Atom,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Globe,
  Heart,
  Layers,
  Leaf,
  Lock,
  MessageCircle,
  Pill,
  Printer,
  RefreshCw,
  Share2,
  Star,
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

const INDIAN_VEGETABLES = [
  "Palak Sabzi",
  "Bhindi Masala",
  "Aloo Gobhi",
  "Lauki Chana Dal",
  "Tinda Masala",
  "Karela Masala",
  "Baingan Bharta",
  "Gajar Matar",
  "Paneer Capsicum",
  "Mix Vegetable",
  "Beans Carrot Stir Fry",
  "Patta Gobhi Matar",
  "Lauki Tamatar",
  "Methi Aloo",
];

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getVegSeed(name: string, weight: number): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) + Math.floor(weight * 7);
}

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

const _NON_VEG_OPTIONS = [
  { protein: "Egg Curry" },
  { protein: "Fish Kabab" },
  { protein: "Chicken Tikka" },
  { protein: "Mutton Handi" },
  { protein: "Egg Curry" },
  { protein: "Fish Kabab" },
  { protein: "Chicken Tikka" },
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
    name: "Roasted Chana",
    cal: 120,
    desc: "High protein, high fibre, satisfying crunch",
  },
  {
    name: "Roasted Popcorn (air-popped, no butter)",
    cal: 90,
    desc: "Light, whole grain, low calorie",
  },
  {
    name: "Sprouts Chaat",
    cal: 130,
    desc: "High protein, gut-friendly probiotics",
  },
  {
    name: "Roasted Makhana",
    cal: 110,
    desc: "Low fat, rich in magnesium & calcium",
  },
  {
    name: "Boiled Corn Chaat",
    cal: 125,
    desc: "Fibre-rich, satisfying and nutritious",
  },
  {
    name: "Cucumber Peanut Salad",
    cal: 115,
    desc: "Hydrating, healthy fats and protein",
  },
  {
    name: "Roasted Peanuts (20g)",
    cal: 115,
    desc: "Healthy fats, protein-packed",
  },
  {
    name: "Moong Dal Chilla",
    cal: 140,
    desc: "High protein, light and digestible",
  },
  { name: "Vegetable Soup", cal: 70, desc: "Low calorie, micronutrient-rich" },
  {
    name: "Boiled Egg 3 pcs (without yolk)",
    cal: 105,
    desc: "Pure protein, zero fat",
  },
  { name: "Sabudana Soup", cal: 100, desc: "Light, soothing and energising" },
  { name: "Barley Soup", cal: 95, desc: "High fibre, gut-friendly" },
];

const FRUIT_COMBOS = [
  "Apple + Cucumber + Carrot + Sprouts + Lemon",
  "Papaya + Pomegranate + Cucumber + Sprouts + Mint",
  "Banana + Apple + Tomato + Cucumber + Sprouts",
  "Guava + Carrot + Cucumber + Sprouts + Lemon",
  "Orange + Papaya + Sprouts + Cucumber + Mint",
  "Watermelon + Pomegranate + Cucumber + Sprouts + Lemon",
  "Pineapple + Apple + Carrot + Sprouts + Mint",
  "Papaya + Guava + Tomato + Cucumber + Sprouts",
  "Banana + Orange + Carrot + Sprouts + Lemon",
  "Apple + Watermelon + Cucumber + Sprouts + Mint",
  "Pineapple + Papaya + Carrot + Cucumber + Sprouts",
  "Guava + Pomegranate + Cucumber + Sprouts + Lemon",
  "Orange + Apple + Tomato + Sprouts + Mint",
  "Watermelon + Banana + Carrot + Cucumber + Sprouts",
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

export default function DietResult({
  plan,
  formData,
  onStartOver: _onStartOver,
}: Props) {
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
    ...(formData.supplements || []),
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
    : (formData.food_allergies || []).length > 0
      ? formData.food_allergies || []
      : [];

  let _sleepDurationText = "—";
  if (formData.bed_time && formData.wake_up_time) {
    const [bh, bm] = formData.bed_time.split(":").map(Number);
    const [wh, wm] = formData.wake_up_time.split(":").map(Number);
    let diff = wh * 60 + wm - (bh * 60 + bm);
    if (diff < 0) diff += 24 * 60;
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    _sleepDurationText = `${hours}h${mins > 0 ? ` ${mins}m` : ""}`;
  }

  const isLoss = formData.goal === "weight_loss";
  const isGain = formData.goal === "muscle_gain";
  const targetKg = formData.target_weight_kg || 0;
  const targetBellyInches = formData.target_belly_inches || 0;
  const showTimeline = (isLoss || isGain) && targetKg > 0;

  const bmr = formData.bmr_manual > 0 ? formData.bmr_manual : plan.bmr;
  const tdee = formData.tdee_manual > 0 ? formData.tdee_manual : plan.tdee;

  const macroRDA = getMacroRDA(formData.weight, bmr, tdee);

  const vegSeed = getVegSeed(formData.name || "user", formData.weight || 70);
  const shuffledVegs = seededShuffle(INDIAN_VEGETABLES, vegSeed);
  const lunchVegs = shuffledVegs.slice(0, 7);
  const dinnerVegs = shuffledVegs.slice(7, 14);

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

  const _dietPref = (formData.dietary_preferences || [])[0] || "vegetarian";

  // Health conditions (filter out "None")
  const activeConditions = (formData.health_conditions || []).filter(
    (c) => c && c.toLowerCase() !== "none",
  );

  return (
    <div
      data-ocid="result.page"
      className="result-page min-h-screen bg-white text-gray-900"
    >
      {/* Print-only professional header */}
      <div className="print-only-header hidden print:flex items-center justify-between border-b-2 border-violet-600 pb-3 mb-4 px-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <img
              src="/assets/uploads/IMG-20260226-WA0000-2.jpg"
              className="w-8 h-8 rounded-full object-cover border border-forest-300"
              alt="HN Coach"
            />
            <div>
              <div className="font-bold text-lg text-gray-900">HN Coach</div>
              <div className="text-xs text-gray-600">
                Diet &amp; Nutrition Plan
              </div>
            </div>
          </div>
        </div>
        <div className="text-center">
          <div className="font-bold text-sm text-gray-900">
            CONFIDENTIAL DIET REPORT
          </div>
          <div className="text-xs text-gray-600">
            Generated for {formData.name}
          </div>
        </div>
        <div className="text-right text-xs text-gray-600">
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
      <header className="no-print sticky top-0 z-10 border-b border-violet-200 bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/assets/uploads/IMG-20260226-WA0000-2.jpg"
              className="w-9 h-9 rounded-full object-cover border-2 border-violet-500"
              alt="HN Coach"
            />
            <div>
              <span className="font-bold text-gray-900">HN Coach</span>
              <div className="text-xs text-violet-600 leading-none">
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
              className="gap-2 no-print border-violet-600 text-violet-700 hover:bg-violet-50"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print Plan</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-5 space-y-5">
        {/* Hero Section – 2-column: name/heading left, nutrition image + quotes right */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start py-4 print:grid-cols-2"
        >
          {/* Left: Name, Diet Plan Heading & Personal Details */}
          <div className="flex flex-col items-start justify-start gap-2 pl-2">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-violet-50 border border-violet-200">
                <UtensilsCrossed className="w-5 h-5 text-violet-600" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-violet-500">
                HN Coach
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
              {formData.name}&apos;s Diet Plan
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-200">
              {GOAL_LABELS[formData.goal]}
            </span>
            {/* Personal Details inline */}
            <div className="w-full mt-1 border-t border-violet-100 pt-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-violet-500 mb-1.5 flex items-center gap-1">
                <User className="w-3 h-3" /> Personal Details
              </p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs">
                <div className="flex gap-1">
                  <span className="text-gray-400 shrink-0">Name:</span>
                  <span className="font-semibold text-gray-800 truncate">
                    {formData.name}
                  </span>
                </div>
                <div className="flex gap-1">
                  <span className="text-gray-400 shrink-0">Age:</span>
                  <span className="font-semibold text-gray-800">
                    {formData.age} yrs
                  </span>
                </div>
                <div className="flex gap-1">
                  <span className="text-gray-400 shrink-0">Gender:</span>
                  <span className="font-semibold text-gray-800 capitalize">
                    {formData.gender}
                  </span>
                </div>
                <div className="flex gap-1">
                  <span className="text-gray-400 shrink-0">Height:</span>
                  <span className="font-semibold text-gray-800">
                    {formData.height} cm
                  </span>
                </div>
                <div className="flex gap-1">
                  <span className="text-gray-400 shrink-0">Weight:</span>
                  <span className="font-semibold text-gray-800">
                    {formData.weight} kg
                  </span>
                </div>
                <div className="flex gap-1">
                  <span className="text-gray-400 shrink-0">Goal:</span>
                  <span className="font-semibold text-gray-800 truncate">
                    {GOAL_LABELS[formData.goal]}
                  </span>
                </div>
                {formData.target_weight_kg > 0 && (
                  <div className="flex gap-1 col-span-2">
                    <span className="text-gray-400 shrink-0">Target:</span>
                    <span className="font-semibold text-gray-800">
                      {formData.target_weight_kg} kg
                      {formData.goal === "weight_loss" &&
                      formData.target_belly_inches > 0
                        ? ` · ${formData.target_belly_inches}" belly`
                        : ""}
                    </span>
                  </div>
                )}
                <div className="flex gap-1">
                  <span className="text-gray-400 shrink-0">Meal Gap:</span>
                  <span className="font-semibold text-gray-800">
                    {formData.meal_gap} hrs
                  </span>
                </div>
                {(formData.health_conditions || []).length > 0 && (
                  <div className="flex gap-1 col-span-2">
                    <span className="text-gray-400 shrink-0">Health:</span>
                    <span className="font-semibold text-gray-800 truncate">
                      {(formData.health_conditions || []).join(", ")}
                    </span>
                  </div>
                )}
                {formData.referrer_whatsapp && (
                  <div className="flex gap-1 col-span-2 items-center">
                    <span className="text-gray-400 shrink-0">Referred By:</span>
                    <span className="font-semibold text-gray-800 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-violet-500 shrink-0" />
                      +91 {formData.referrer_whatsapp}
                      <span className="text-[9px] bg-violet-50 text-violet-600 rounded-full px-1.5 py-0.5 font-semibold">
                        Verified ✓
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Right: Nutrition Philosophy Image + Quotes */}
          <div className="flex flex-col items-center gap-2">
            <img
              src="/assets/generated/hn-nutrition-philosophy.dim_800x600.png"
              alt="HN Coach Nutrition Philosophy"
              className="w-4/5 rounded-xl shadow-md mx-auto"
            />
            <p className="text-xs italic text-gray-500 text-center leading-relaxed">
              &ldquo;7 days to practice, 14 days to feel the change, 21 days to
              build the habit, 90 days to transform your life. 🚀&rdquo;
            </p>
            <p className="text-xs font-semibold text-violet-600 italic text-center">
              &quot;You don&apos;t need to eat less — You only need to eat
              right&quot;
            </p>
          </div>
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
              <p className="text-sm text-violet-600 mb-2">
                {isLoss
                  ? `Your target: lose ${targetKg} kg${
                      targetBellyInches > 0
                        ? ` + ${targetBellyInches} inches from belly fat`
                        : ""
                    }`
                  : `Your target: gain ${targetKg} kg`}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                    color: "text-violet-600",
                    bg: "bg-violet-50 border-violet-200",
                  },
                ].map((item) => (
                  <div
                    key={item.rate}
                    className={`rounded-xl border p-2 text-center ${item.bg}`}
                    data-ocid={`result.timeline.item.${item.rate / 2}`}
                  >
                    <div className={`text-lg font-bold ${item.color}`}>
                      {calcMonths(item.rate)}
                    </div>
                    <div className="text-xs text-violet-600 mt-1 font-medium">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
              {isLoss && targetBellyInches > 0 && (
                <div className="mt-2 bg-violet-50 border border-violet-200 rounded-xl p-2 text-xs text-violet-600">
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

        {/* ── ENROLLMENT SECTION ── */}
        <div
          className="rounded-xl border border-violet-300 bg-violet-50 p-3 flex flex-col gap-2 shadow-sm print:p-1 print:text-[8px]"
          data-ocid="result.coaching.section"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0 print:w-6 print:h-6">
              <span className="text-xl print:text-xs">🏆</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-violet-800 leading-tight print:text-[8px]">
                Personal Coaching Program
              </p>
              <p className="text-xs text-violet-600 print:text-[7px]">
                ✅ Result Guaranteed &nbsp;·&nbsp; 1-on-1 Expert Coach
                &nbsp;·&nbsp; Customized Plans
              </p>
              <p className="text-xs text-gray-500 italic print:text-[7px]">
                After enrollment your coach will contact you as soon as
                possible.
              </p>
            </div>
          </div>
          <a
            href={`https://hn-coach-plans-jw1.caffeine.xyz${formData.referrer_whatsapp ? `?ref=${formData.referrer_whatsapp}` : ""}`}
            target="_blank"
            rel="noopener noreferrer"
            data-ocid="result.coaching.primary_button"
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg font-extrabold text-base transition-all hover:scale-[1.02] active:scale-95 shadow-md animate-pulse print:py-1 print:text-[7px]"
            style={{
              background: "linear-gradient(135deg, #f5c842, #ff9500)",
              color: "#4c1d95",
              boxShadow:
                "0 0 16px rgba(212,175,55,0.7), 0 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            <Star className="w-4 h-4" />
            Enroll Now — Get Personal Coach &nbsp;👆 Click Here
          </a>
        </div>

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
            <p className="text-sm text-violet-600 mb-2">
              Eliminating these foods accelerates your health goals and prevents
              nutrient deficiencies.
            </p>

            {/* General Avoid List */}
            <h3 className="text-xs font-bold text-gray-600 mb-1 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
              General Foods to Avoid
            </h3>
            <div className="grid sm:grid-cols-2 gap-2 mb-3">
              {GENERAL_AVOID_FOODS.map((item) => (
                <div
                  key={item.name}
                  className="flex items-start gap-2 p-1.5 rounded-xl bg-red-50 border border-red-100"
                >
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">
                      {item.name}
                    </div>
                    <div className="text-xs text-violet-600 mt-0.5">
                      {item.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Condition-Specific Avoid List */}
            {activeConditions.length > 0 && (
              <div className="space-y-2">
                {activeConditions.map((condition) => {
                  const foods = CONDITION_AVOID_FOODS[condition];
                  if (!foods) return null;
                  return (
                    <div key={condition}>
                      <div className="flex items-center gap-2 mb-2 p-2 bg-amber-50 border border-amber-200 rounded-xl">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="text-sm font-semibold text-amber-800">
                          Based on Your Health Condition: {condition}
                        </span>
                      </div>
                      <div className="overflow-x-auto rounded-xl border border-violet-200">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-violet-50 hover:bg-violet-50">
                              <TableHead className="font-bold text-gray-600">
                                Food to Avoid
                              </TableHead>
                              <TableHead className="font-bold text-gray-600">
                                Reason
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {foods.map((f, idx) => (
                              <TableRow
                                key={f.food}
                                className={
                                  idx % 2 === 0 ? "bg-white" : "bg-violet-50"
                                }
                              >
                                <TableCell className="font-medium text-gray-800 text-sm print:text-gray-900">
                                  <span className="flex items-center gap-2">
                                    <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                                    {f.food}
                                  </span>
                                </TableCell>
                                <TableCell className="text-sm text-violet-600 print:text-gray-700">
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


        {/* ── BODY SCIENCE INFO CARDS ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 print:break-inside-avoid"
        >
          {/* Card 1 – Human Body Cells */}
          <div className="rounded-lg border border-violet-200 overflow-hidden bg-white print:bg-white print:border-gray-200">
            <div className="h-0.5 bg-violet-600 w-full" />
            <div className="flex items-center gap-2 px-2 py-1.5 print:px-1 print:py-1">
              <Atom className="w-4 h-4 text-violet-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-violet-700 print:text-gray-800">
                  Human Body Cells
                </span>
                <span className="text-xs font-semibold text-gray-700 ml-1">
                  37.2 Trillion
                </span>
                <div className="text-[10px] text-gray-400 leading-tight">
                  Each cell needs daily nutrients
                </div>
              </div>
            </div>
          </div>

          {/* Card 2 - Body Tissues */}
          <div className="rounded-lg border border-rose-200 overflow-hidden bg-white print:bg-white print:border-gray-200">
            <div className="h-0.5 bg-rose-500 w-full" />
            <div className="flex items-center gap-2 px-2 py-1.5 print:px-1 print:py-1">
              <span className="text-sm flex-shrink-0">🔬</span>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-rose-600 print:text-gray-800">
                  Body Tissues
                </span>
                <span className="text-xs font-semibold text-gray-700 ml-1">
                  4 Types
                </span>
                <div className="text-[10px] text-gray-400 leading-tight">
                  Epithelial · Connective · Muscle · Nervous
                </div>
              </div>
            </div>
          </div>

          {/* Card 3 - Body Organs */}
          <div className="rounded-lg border border-purple-200 overflow-hidden bg-white print:bg-white print:border-gray-200">
            <div className="h-0.5 bg-purple-500 w-full" />
            <div className="flex items-center gap-2 px-2 py-1.5 print:px-1 print:py-1">
              <span className="text-sm flex-shrink-0">🫀</span>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-purple-700 print:text-gray-800">
                  Human Body Organs
                </span>
                <span className="text-xs font-semibold text-gray-700 ml-1">
                  79 Organs
                </span>
                <div className="text-[10px] text-gray-400 leading-tight">
                  Each organ needs daily nutrition
                </div>
              </div>
            </div>
          </div>
          {/* Card 4 – Daily Nutrient Requirements */}
          <div className="rounded-lg border border-amber-200 overflow-hidden bg-white print:bg-white print:border-gray-200">
            <div className="h-0.5 bg-amber-500 w-full" />
            <div className="flex items-center gap-2 px-2 py-1.5 print:px-1 print:py-1">
              <Layers className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-amber-700 print:text-gray-800">
                  Daily Nutrients
                </span>
                <span className="text-xs font-semibold text-gray-700 ml-1">
                  25 Essential
                </span>
                <div className="text-[10px] text-gray-400 leading-tight">
                  5 Macro + 20 Micro nutrients/day
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── GLOBAL NUTRITION PHILOSOPHY + RDA TABLES ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="print:break-inside-avoid"
        >
          <ReportCard
            title="Global Nutrition Philosophy"
            icon={<Globe className="w-4 h-4" />}
          >
            <div className="text-center mb-2">
              <p className="text-sm text-violet-600 max-w-2xl mx-auto">
                A human body requires all these nutrients{" "}
                <strong className="text-violet-700">every single day</strong> to
                meet its biological requirements — to stay healthy, look better,
                and maintain strong immunity.
              </p>
            </div>

            {/* Macronutrients Table — 2-column grid */}
            <div className="mb-2 print:mb-1">
              <h3 className="text-sm font-bold text-gray-800 mb-1 flex items-center gap-2 uppercase tracking-wide">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-600 inline-block" />
                Macronutrients — Daily RDA for Indians
              </h3>
              <div className="grid grid-cols-2 gap-1 print:gap-0.5">
                {macroRDA.map((row, i) => (
                  <div
                    key={row.nutrient}
                    className={`flex items-start gap-1.5 rounded border px-2 py-1 print:px-1 print:py-0.5 ${i % 2 === 0 ? "bg-violet-50 border-violet-200" : "bg-white border-violet-100"}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] print:text-[7px] font-bold text-gray-800 leading-tight truncate">
                        {row.nutrient}
                      </p>
                      <p className="text-[9px] print:text-[6px] text-violet-600 font-semibold leading-tight">
                        {row.rda}
                      </p>
                      <p className="text-[9px] print:text-[6px] text-gray-500 leading-tight line-clamp-2">
                        {row.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Micronutrients Grid — 2-column like macronutrients */}
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-1 flex items-center gap-2 uppercase tracking-wide">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                Micronutrients — Daily RDA for Indians
              </h3>
              <div className="grid grid-cols-3 gap-1 print:gap-0.5">
                {MICRO_RDA.map((row, i) => (
                  <div
                    key={row.nutrient}
                    className={`flex items-start gap-1.5 rounded border px-2 py-1 print:px-1 print:py-0.5 ${i % 2 === 0 ? "bg-amber-50 border-amber-200" : "bg-white border-amber-100"}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] print:text-[7px] font-bold text-gray-800 leading-tight truncate">
                        {row.nutrient}
                      </p>
                      <p className="text-[9px] print:text-[6px] text-amber-600 font-semibold leading-tight">
                        {row.rda}
                      </p>
                      <p className="text-[9px] print:text-[6px] text-gray-500 leading-tight line-clamp-2">
                        {row.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 bg-gradient-to-r from-violet-50 to-amber-50 border border-violet-200 rounded-xl p-2 text-center">
              <p className="text-sm font-medium text-gray-600">
                ✨ <strong className="text-violet-700">Remember:</strong> No
                single food provides all nutrients. A diverse, balanced diet is
                the cornerstone of lasting health, vitality, and immunity — eat
                the rainbow every day.
              </p>
            </div>
          </ReportCard>
        </motion.div>

        {/* ── POST-SUNDAY CALORIE GUIDANCE ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.41 }}
        >
          <div className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 shadow-sm flex flex-col gap-0.5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
              <span className="text-xs font-bold text-violet-800">
                📅 Daily Calorie Guide
              </span>
              <span className="text-xs text-gray-700">
                Working Days:{" "}
                <strong className="text-violet-700">{tdee} kcal</strong>
              </span>
              <span className="text-xs text-gray-400">|</span>
              <span className="text-xs text-gray-700">
                Rest Days:{" "}
                <strong className="text-emerald-700">{bmr} kcal</strong>
              </span>
            </div>
            <p className="text-[10px] text-gray-500 leading-tight">
              📈 More calories → gain &nbsp;|&nbsp; 🔥 Less calories → lose
              weight &amp; fat &nbsp;|&nbsp; ✅ Complete requirement → maintain
            </p>
            <p className="text-[10px] italic text-violet-500 leading-tight">
              Contact us for personalized guidance and personal coaching.
            </p>
          </div>
        </motion.div>

        {/* ── 7-Day Meal Plan ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="print:break-before-page print:break-inside-avoid"
        >
          <ReportCard
            title="7-Day Meal Plan"
            icon={<UtensilsCrossed className="w-4 h-4" />}
          >
            {/* Supplement pills banner */}
            <div className="flex gap-2 mb-3 flex-wrap">
              <div className="flex items-center gap-1.5 bg-gray-100 border border-gray-200 rounded-full px-3 py-1">
                <span className="text-xs">💊</span>
                <span className="text-xs italic text-violet-600 font-medium">
                  HN Digestion
                </span>
                <span className="text-xs text-violet-500">
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
                <span className="text-xs italic text-blue-700 font-medium">
                  HN Drink
                </span>
                <span className="text-xs text-blue-600">— Before exercise</span>
              </div>
            </div>

            {/* Timing strip */}
            {formData.wake_up_time && (
              <div className="text-xs text-violet-600 bg-violet-50 border border-violet-200 rounded-lg px-3 py-2 mb-4 flex flex-wrap gap-x-4 gap-y-1">
                <span className="font-semibold text-violet-600">
                  ⏰ Meal Times:
                </span>
                <span>
                  🌅 Breakfast:{" "}
                  <strong className="text-violet-600">
                    {timeMap.breakfast || "—"}
                  </strong>
                </span>
                <span>
                  🍎 Mid-Morning:{" "}
                  <strong className="text-violet-600">
                    {timeMap.midSnack || "—"}
                  </strong>
                </span>
                <span>
                  🍽️ Lunch:{" "}
                  <strong className="text-violet-600">
                    {timeMap.lunch || "—"}
                  </strong>
                </span>
                <span>
                  🫘 Evening:{" "}
                  <strong className="text-violet-600">
                    {timeMap.eveningSnack || "—"}
                  </strong>
                </span>
                <span>
                  🌙 Dinner:{" "}
                  <strong className="text-violet-600">
                    {timeMap.dinner || "—"}
                  </strong>
                </span>
              </div>
            )}

            {/* Day Cards — 1 card per day */}
            <div className="space-y-3">
              {DAYS_OF_WEEK.map((day, dayIdx) => {
                const opt = MEAL_OPTIONS[dayIdx];
                const flavour = HN_SHAKE_FLAVOURS[dayIdx];
                const eveningSnack =
                  EVENING_SNACKS[dayIdx % EVENING_SNACKS.length];
                const midSnackGrams = Math.round(formData.weight * 10);
                const dayLabels = [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ];
                const isRewardDay = dayIdx === 6;
                const shuffledFruits = seededShuffle(
                  FRUIT_COMBOS,
                  getVegSeed(formData.name, formData.weight),
                );

                return (
                  <div
                    key={day}
                    data-ocid={`result.day_plan.item.${dayIdx + 1}`}
                    className={`rounded-xl border overflow-hidden print:break-inside-avoid ${isRewardDay ? "border-amber-400 shadow-md" : "border-violet-200 shadow-sm"}`}
                  >
                    {/* Day header bar */}
                    <div
                      className={`px-3 py-2 flex items-center gap-2 ${isRewardDay ? "bg-gradient-to-r from-amber-400 to-orange-400" : "bg-violet-600"}`}
                    >
                      <span className="text-white font-extrabold text-sm">
                        {dayLabels[dayIdx]}
                      </span>
                      {isRewardDay && (
                        <span className="text-white text-xs font-bold ml-auto">
                          🏆 REWARD DAY!
                        </span>
                      )}
                    </div>
                    {/* Meal columns */}
                    <div className="grid grid-cols-1 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 bg-white print:bg-white print:grid-cols-5">
                      {/* Breakfast */}
                      <div className="px-2 py-2">
                        <div className="text-[10px] font-bold text-violet-500 uppercase tracking-wide mb-1">
                          🥤 Breakfast
                        </div>
                        <div className="text-xs font-semibold text-violet-700">
                          HN Shake — {flavour}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5">
                          230 kcal · C:24g P:19.75g F:3g
                        </div>
                      </div>
                      {/* Mid-Morning */}
                      <div className="px-2 py-2">
                        <div className="text-[10px] font-bold text-green-600 uppercase tracking-wide mb-1">
                          🍎 Mid-Morning
                        </div>
                        {dayIdx % 2 === 0 ? (
                          <>
                            <div className="text-xs font-semibold text-green-700">
                              {Math.round(midSnackGrams / 2)}g Fruits
                            </div>
                            <div className="text-[10px] text-gray-500 mt-0.5 italic">
                              {shuffledFruits[dayIdx % FRUIT_COMBOS.length]}
                            </div>
                            <div className="text-[10px] text-green-600 mt-0.5">
                              + 2 Egg Whites
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-xs font-semibold text-green-700">
                              {Math.round(midSnackGrams / 2)}g Sprouts + Veg
                            </div>
                            <div className="text-[10px] text-green-600 mt-0.5">
                              + 2 Egg Whites
                            </div>
                          </>
                        )}
                      </div>
                      {/* Lunch */}
                      <div
                        className={`px-2 py-2 ${isRewardDay ? "bg-amber-50" : ""}`}
                      >
                        <div className="text-[10px] font-bold text-orange-500 uppercase tracking-wide mb-1">
                          🍽️ Lunch
                        </div>
                        {isRewardDay ? (
                          <div className="text-center">
                            <div className="text-xs font-extrabold text-amber-600 animate-pulse">
                              🏆 REWARD MEAL! 🎉
                            </div>
                            <div className="text-[10px] text-orange-600 mt-0.5">
                              Have your favourite meal — you earned it! 💪
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="text-xs font-semibold text-orange-700">
                              Rice 100g + Chapati 2pc
                            </div>
                            <div className="text-[10px] text-gray-600 mt-0.5">
                              {opt.dal} · {lunchVegs[dayIdx]} · Salad 300g ·
                              Dahi 100g
                            </div>
                          </>
                        )}
                      </div>
                      {/* Evening Snack */}
                      <div className="px-2 py-2">
                        <div className="text-[10px] font-bold text-rose-500 uppercase tracking-wide mb-1">
                          🫘 Evening
                        </div>
                        <div className="text-xs font-semibold text-rose-700">
                          {eveningSnack.name}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5">
                          {eveningSnack.cal} kcal · HN Tea
                        </div>
                      </div>
                      {/* Dinner */}
                      <div className="px-2 py-2">
                        <div className="text-[10px] font-bold text-blue-500 uppercase tracking-wide mb-1">
                          🌙 Dinner
                        </div>
                        <div className="text-xs font-semibold text-blue-700">
                          Rice 100g + Chapati 2pc
                        </div>
                        <div className="text-[10px] text-gray-600 mt-0.5">
                          {opt.dal} (80g) · {dinnerVegs[dayIdx]} (80g) · Salad
                          240g · Dahi 80g
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ReportCard>
        </motion.div>

        {/* ── DAILY WELLNESS — DO NOT CHANGE ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.38 }}
          className="bg-white rounded-2xl border border-gray-200 p-3 shadow-sm"
          data-ocid="result.daily_wellness.section"
        >
          <h2 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
            <span className="text-lg">🌿</span>
            Daily Wellness
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Hydration */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-2 py-1.5 flex items-center gap-2 print:bg-gray-50 print:border-gray-200">
              <span className="text-base flex-shrink-0">💧</span>
              <span className="text-xs font-semibold text-blue-700 flex-shrink-0 print:text-gray-800">
                Hydration
              </span>
              <span className="text-sm font-bold text-gray-900 ml-auto">
                {(formData.weight / 18).toFixed(1)}{" "}
                <span className="text-xs font-normal text-gray-500">L/day</span>
              </span>
            </div>
            {/* Walking */}
            <div className="bg-violet-50 border border-violet-200 rounded-lg px-2 py-1.5 flex items-center gap-2 print:bg-gray-50 print:border-gray-200">
              <span className="text-base flex-shrink-0">🚶</span>
              <span className="text-xs font-semibold text-violet-700 flex-shrink-0 print:text-gray-800">
                Daily Walking
              </span>
              <span className="text-sm font-bold text-gray-900 ml-auto">
                {Math.round(formData.weight * 110).toLocaleString()}{" "}
                <span className="text-xs font-normal text-gray-500">
                  steps/day
                </span>
              </span>
            </div>
            {/* Exercise */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg px-2 py-1.5 flex items-center gap-2 print:bg-gray-50 print:border-gray-200">
              <span className="text-base flex-shrink-0">🏋️</span>
              <span className="text-xs font-semibold text-orange-700 flex-shrink-0 print:text-gray-800">
                Exercise
              </span>
              <span className="text-sm font-bold text-gray-900 ml-auto">
                {Math.round((formData.weight * 45) / 60)}{" "}
                <span className="text-xs font-normal text-gray-500">
                  min/day
                </span>
              </span>
            </div>
            {/* Sleep */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg px-2 py-1.5 flex items-center gap-2 print:bg-gray-50 print:border-gray-200">
              <span className="text-base flex-shrink-0">🌙</span>
              <span className="text-xs font-semibold text-purple-700 flex-shrink-0 print:text-gray-800">
                Sleep
              </span>
              <span className="text-sm font-bold text-gray-900 ml-auto">
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
                          : formData.age <= 64
                            ? "7–9"
                            : "7–8"}{" "}
                <span className="text-xs font-normal text-gray-500">
                  hrs/night
                </span>
              </span>
            </div>

            {/* Protein */}
            <div className="bg-rose-50 border border-rose-200 rounded-lg px-2 py-1.5 flex items-center gap-2 print:bg-gray-50 print:border-gray-200">
              <span className="text-base flex-shrink-0">🥩</span>
              <span className="text-xs font-semibold text-rose-700 flex-shrink-0 print:text-gray-800">
                Protein
              </span>
              <span className="text-sm font-bold text-gray-900 ml-auto">
                {formData.protein_target > 0
                  ? formData.protein_target
                  : Math.round(1.2 * formData.weight)}{" "}
                <span className="text-xs font-normal text-gray-500">g/day</span>
              </span>
            </div>

            {/* Carbohydrates */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5 flex items-center gap-2 print:bg-gray-50 print:border-gray-200">
              <span className="text-base flex-shrink-0">🌾</span>
              <span className="text-xs font-semibold text-amber-700 flex-shrink-0 print:text-gray-800">
                Carbs
              </span>
              <span className="text-sm font-bold text-gray-900 ml-auto">
                {formData.carbs_target > 0
                  ? formData.carbs_target
                  : Math.round(
                      (0.4 *
                        (formData.tdee_manual > 0
                          ? formData.tdee_manual
                          : plan.tdee)) /
                        4,
                    )}{" "}
                <span className="text-xs font-normal text-gray-500">g/day</span>
              </span>
            </div>

            {/* Dietary Fat */}
            <div className="bg-violet-50 border border-violet-200 rounded-lg px-2 py-1.5 flex items-center gap-2 print:bg-gray-50 print:border-gray-200">
              <span className="text-base flex-shrink-0">🥑</span>
              <span className="text-xs font-semibold text-violet-700 flex-shrink-0 print:text-gray-800">
                Fat
              </span>
              <span className="text-sm font-bold text-gray-900 ml-auto">
                {formData.fat_target > 0
                  ? formData.fat_target
                  : Math.round(
                      (0.25 *
                        (formData.bmr_manual > 0
                          ? formData.bmr_manual
                          : plan.bmr)) /
                        9,
                    )}{" "}
                <span className="text-xs font-normal text-gray-500">g/day</span>
              </span>
            </div>

            {/* Dietary Fibre */}
            <div className="bg-green-50 border border-green-200 rounded-lg px-2 py-1.5 flex items-center gap-2 print:bg-gray-50 print:border-gray-200">
              <span className="text-base flex-shrink-0">🥦</span>
              <span className="text-xs font-semibold text-green-700 flex-shrink-0 print:text-gray-800">
                Fibre
              </span>
              <span className="text-sm font-bold text-gray-900 ml-auto">
                25–40{" "}
                <span className="text-xs font-normal text-gray-500">g/day</span>
              </span>
            </div>

            {/* Meditation */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg px-2 py-1.5 flex items-center gap-2 print:bg-gray-50 print:border-gray-200">
              <span className="text-base flex-shrink-0">🧘</span>
              <span className="text-xs font-semibold text-purple-700 flex-shrink-0 print:text-gray-800">
                Meditation
              </span>
              <span className="text-sm font-bold text-gray-900 ml-auto">
                10{" "}
                <span className="text-xs font-normal text-gray-500">
                  mins/day
                </span>
              </span>
            </div>

            {/* Spiritual Wellness */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5 flex items-center gap-2 print:bg-gray-50 print:border-gray-200">
              <span className="text-base flex-shrink-0">🙏</span>
              <span className="text-xs font-semibold text-amber-700 flex-shrink-0 print:text-gray-800">
                Worship & Gratitude
              </span>
              <span className="text-sm font-bold text-gray-900 ml-auto">
                10{" "}
                <span className="text-xs font-normal text-gray-500">
                  mins/day
                </span>
              </span>
            </div>
          </div>
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
                    className="bg-violet-50 text-violet-600 border border-violet-200 rounded-full px-3 py-1 text-sm font-semibold"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <p className="text-sm text-violet-600">
                Your supplement stack has been considered in generating your
                meal plan. Take supplements as directed and consult a healthcare
                provider for personalized supplement advice.
              </p>
            </ReportCard>
          </motion.div>
        )}

        {/* ── PERSONAL COACH ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.46 }}
        >
          <ReportCard
            title="Get Your Personal Coach"
            icon={<MessageCircle className="w-4 h-4" />}
          >
            <div className="text-center mb-2">
              <div className="text-2xl mb-1">👨‍⚕️</div>
              <p className="text-sm text-violet-600 max-w-sm mx-auto">
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
                className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-[#25D366] hover:bg-[#1ebe5a] text-white font-semibold transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                Chat with My Coach on WhatsApp
              </a>
            ) : (
              <div className="p-2 rounded-xl bg-violet-50 border border-violet-200 text-sm text-violet-700 text-center">
                Ask the friend who referred you to HN Coach for personal
                coaching guidance.
              </div>
            )}
          </ReportCard>
        </motion.div>

        {/* ── REFERRAL SECTION ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.44 }}
          data-ocid="result.referral.section"
        >
          <ReportCard
            title="Refer &amp; Earn"
            icon={<Share2 className="w-4 h-4" />}
          >
            {/* Promo Banner */}
            <div className="bg-gradient-to-r from-violet-600 to-emerald-600 rounded-xl p-2 mb-3 text-white text-center">
              <div className="text-lg mb-0.5">🎁</div>
              <div className="font-bold text-sm leading-tight">
                Refer &amp; Earn Full Refund!
              </div>
              <div className="text-sm text-white mt-1">
                Help <strong>2 friends</strong> download their HN Coach report
                and get a <strong>100% full refund</strong>.
              </div>
            </div>

            {formData.user_whatsapp ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={referralLink}
                    data-ocid="result.referral.input"
                    className="flex-1 text-xs rounded-lg border border-violet-200 bg-white px-3 py-2 font-mono text-violet-700 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    data-ocid="result.referral.secondary_button"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-violet-200 bg-violet-50 text-violet-700 text-xs font-semibold hover:bg-violet-100 transition-colors"
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
                    `Hey! I just got my personalized diet plan from HN Coach. Generate yours here: ${referralLink}`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-ocid="result.referral.primary_button"
                  className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-[#25D366] hover:bg-[#1ebe5a] text-white font-semibold transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Share on WhatsApp
                </a>

                <div className="text-center py-2 bg-violet-50 rounded-xl border border-violet-200">
                  <div className="text-xs text-violet-600 font-semibold uppercase tracking-wide mb-1">
                    Friends Referred
                  </div>
                  <div className="text-xl font-bold text-violet-600">
                    {referralCount}
                    <span className="text-base font-normal text-violet-600">
                      {" "}
                      / 2 for full refund
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden mx-4">
                    <div
                      className="h-full bg-violet-600 rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (referralCount / 2) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
                {referralCount >= 2 && (
                  <div className="mt-3 mx-2 p-3 rounded-xl bg-gradient-to-r from-violet-600 to-green-500 text-white text-center text-sm font-semibold shadow">
                    🎉 Goal Achieved! Share more &amp; earn more with us by
                    spreading awareness!
                  </div>
                )}
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-violet-50 border border-violet-200 text-sm text-violet-700 text-center">
                Add your WhatsApp number when generating a report to get your
                unique referral link.
              </div>
            )}
          </ReportCard>
        </motion.div>

        {/* Trust signal */}
        <div className="border-t border-violet-200 pt-4 pb-6 text-center space-y-1">
          <p className="text-xs text-violet-500 max-w-xl mx-auto">
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
      className={`bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm print:shadow-none print:border print:border-gray-200 print:break-inside-avoid ${
        className || ""
      }`}
    >
      <div className="border-l-4 border-violet-500 px-3 py-2">
        {title && (
          <div className="flex items-center gap-2 mb-2">
            {icon && <span className="text-violet-600 shrink-0">{icon}</span>}
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-800">
              <span className="text-violet-600 mr-1.5">—</span>
              {title}
            </h2>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

function _ReportField({
  label,
  value,
}: {
  label: string;
  value: string | ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-gray-100 py-0.5 last:border-b-0">
      <span className="bg-violet-50 text-violet-700 text-xs font-semibold uppercase rounded-full px-3 py-1 min-w-[100px] text-center shrink-0">
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
    <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
            <UtensilsCrossed className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
              {label}
            </div>
            {timeLabel && (
              <div className="text-xs text-violet-600 font-semibold">
                {timeLabel}
              </div>
            )}
            <div className="font-semibold text-gray-900 text-sm">
              {meal.name}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="font-bold text-gray-900 text-sm">
              {meal.calories} kcal
            </div>
            <div className="text-xs text-gray-500">
              P{meal.protein}g · C{meal.carbs}g · F{meal.fats}g
            </div>
          </div>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4">
          <Separator className="mb-3" />
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">
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
    <div className="bg-white rounded-xl border border-violet-200 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-md bg-green-100 dark:bg-green-900/50 flex items-center justify-center shrink-0">
            <span className="text-base">🍎</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-green-700 dark:text-green-600 font-medium uppercase tracking-wide">
              Mid Morning Snack
            </div>
            {timeLabel && (
              <div className="text-xs text-violet-600 font-semibold">
                {timeLabel}
              </div>
            )}
            <div className="font-semibold text-gray-900 text-sm mt-0.5">
              Fruits &amp; Sprouts Salad
            </div>
          </div>
        </div>
        <div className="mt-3 rounded-lg overflow-hidden border border-violet-200">
          <img
            src="/assets/generated/fruits-sprouts-salad.dim_600x400.jpg"
            alt="Fruits and sprouts salad"
            className="w-full h-40 object-cover"
          />
        </div>
        <div className="mt-3 p-3 bg-green-100 dark:bg-green-900/40 rounded-lg">
          <p className="text-sm font-semibold text-green-800 dark:text-green-200">
            Total:{" "}
            <span className="text-violet-600 font-bold">
              {grams}g (1% of body weight)
            </span>
          </p>
          <div className="mt-2 space-y-1">
            <p className="text-xs text-green-700 dark:text-green-700 font-semibold">
              🍎{" "}
              <span className="font-bold">{Math.round(grams / 2)}g Fruits</span>
            </p>
            <p className="text-xs text-green-700 dark:text-green-700 font-semibold">
              🌱{" "}
              <span className="font-bold">
                {Math.round(grams / 2)}g Sprouts + Raw Vegetables
              </span>
            </p>
            <p className="text-xs text-green-700 dark:text-green-700 font-semibold">
              🍵 + HN Tea
            </p>
          </div>
          <p className="text-xs text-green-700 dark:text-green-700 mt-1 font-medium">
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
          <div className="w-6 h-6 rounded-md bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
            <span className="text-base">🫘</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-amber-700 dark:text-amber-600 font-medium uppercase tracking-wide">
              Evening Snack
            </div>
            {timeLabel && (
              <div className="text-xs text-violet-600 font-semibold">
                {timeLabel}
              </div>
            )}
            <div className="font-semibold text-gray-900 text-sm mt-0.5">
              {snack.name}
            </div>
          </div>
        </div>
        <div className="mt-3 p-3 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
          <p className="text-xs text-amber-700 dark:text-amber-700">
            {snack.cal} kcal · {snack.desc}
          </p>
          <p className="text-xs font-semibold text-amber-800 dark:text-amber-200 mt-1">
            Hot HN Tea (2 spoons) — every day
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
