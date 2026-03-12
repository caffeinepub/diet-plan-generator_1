import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  Apple,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Heart,
  Leaf,
  Loader2,
  Lock,
  Moon,
  Salad,
  Target,
  User,
  UtensilsCrossed,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { DietPlan } from "../backend.d";
import { useActor } from "../hooks/useActor";
import {
  generateDietPlan,
  mapToActivityLevel,
  mapToGender,
  mapToGoal,
  mapToStressLevel,
} from "../lib/dietCalculator";
import type { FormData } from "../types/diet";
import { defaultFormData } from "../types/diet";

const TOTAL_STEPS = 8;

const STEP_META = [
  { title: "Personal Details", subtitle: "Tell us about yourself", icon: User },
  {
    title: "Health Goal",
    subtitle: "What do you want to achieve?",
    icon: Target,
  },
  {
    title: "Goal Targets",
    subtitle: "How much do you want to achieve?",
    icon: Target,
  },
  {
    title: "Meal Frequency",
    subtitle: "Select your meal gap preference",
    icon: UtensilsCrossed,
  },
  {
    title: "Present Health Condition",
    subtitle: "Any medical conditions to consider?",
    icon: Heart,
  },
  {
    title: "Sleep Schedule",
    subtitle: "Your sleep timings",
    icon: Moon,
  },
  {
    title: "Nutrition Targets",
    subtitle: "Your macro targets from wellness report",
    icon: Salad,
  },
  {
    title: "BMR & TDEE",
    subtitle: "Enter your metabolic rate values",
    icon: Activity,
  },
];

interface Props {
  onComplete: (plan: DietPlan, data: FormData) => void;
  onViewPreviousReport?: () => void;
}

export default function DietForm({ onComplete, onViewPreviousReport }: Props) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<FormData>(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasPreviousReport] = useState(() => {
    try {
      return !!localStorage.getItem("hn_coach_last_report");
    } catch (_) {
      return false;
    }
  });
  const { actor } = useActor();

  // Track referral from URL param on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refParam = urlParams.get("ref");
    if (refParam && /^[6-9]\d{9}$/.test(refParam)) {
      setData((prev) => ({ ...prev, referrer_whatsapp: refParam }));
      // Increment referrer count (once per session)
      const key = `hncoach_referrals_${refParam}`;
      const current = Number.parseInt(localStorage.getItem(key) || "0");
      if (!sessionStorage.getItem(`counted_${refParam}`)) {
        localStorage.setItem(key, String(current + 1));
        sessionStorage.setItem(`counted_${refParam}`, "1");
      }
    }
  }, []);

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function toggleArrayItem(key: keyof FormData, item: string) {
    const arr = data[key] as string[];
    if (item === "None") {
      update(key as any, arr.includes("None") ? [] : (["None"] as any));
      return;
    }
    const withoutNone = arr.filter((x) => x !== "None");
    const next = withoutNone.includes(item)
      ? withoutNone.filter((x) => x !== item)
      : [...withoutNone, item];
    update(key as any, next as any);
  }

  function validateStep(): boolean {
    const errs: Record<string, string> = {};
    if (step === 1) {
      if (!data.name.trim()) errs.name = "Name is required";
      if (data.age < 10 || data.age > 100)
        errs.age = "Age must be between 10 and 100";
      if (data.height < 100 || data.height > 250)
        errs.height = "Height must be between 100 and 250 cm";
      if (data.weight < 30 || data.weight > 300)
        errs.weight = "Weight must be between 30 and 300 kg";
    }
    // Step 3 – Goal targets
    if (step === 3) {
      if (
        (data.goal === "weight_loss" || data.goal === "muscle_gain") &&
        (data.target_weight_kg <= 0 || Number.isNaN(data.target_weight_kg))
      ) {
        errs.target_weight_kg = "Please enter your target weight (kg)";
      }
    }
    // Step 5 – Health conditions required
    if (step === 5) {
      if (data.health_conditions.length === 0) {
        errs.health_conditions =
          "Please select at least one option (or select None)";
      }
    }
    // Step 7 – Macro targets required
    if (step === 7) {
      if (!data.protein_target || data.protein_target <= 0)
        errs.protein_target = "Please enter your protein target";
      if (!data.carbs_target || data.carbs_target <= 0)
        errs.carbs_target = "Please enter your carbs target";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function goNext() {
    if (!validateStep()) return;
    if (step < TOTAL_STEPS) {
      setDirection(1);
      setStep((s) => s + 1);
    }
  }

  function goBack() {
    if (step > 1) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  }

  async function handleGenerate() {
    if (!validateStep()) return;
    setIsGenerating(true);
    try {
      const profileId = `profile_${Date.now()}`;
      const plan = generateDietPlan(data, profileId);

      if (actor) {
        try {
          const allAllergies = data.food_allergies_text
            ? data.food_allergies_text
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : [];
          const allSupplements = [
            ...data.supplements,
            ...(data.other_supplements
              ? data.other_supplements
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
              : []),
          ];

          const profile = {
            id: profileId,
            name: data.name,
            age: BigInt(data.age),
            gender: mapToGender(data.gender),
            height: data.height,
            weight: data.weight,
            goal: mapToGoal(data.goal),
            activity_level: mapToActivityLevel(data.activity_level),
            dietary_preferences: data.dietary_preferences,
            food_allergies: allAllergies,
            meals_per_day: BigInt(data.meals_per_day),
            water_intake: data.water_intake,
            health_conditions: data.health_conditions,
            sleep_hours: data.sleep_hours,
            stress_level: mapToStressLevel(data.stress_level),
            supplements: allSupplements,
          };

          await Promise.all([
            actor.addProfile(profile),
            actor.addDietPlan(plan),
          ]);
        } catch (backendErr) {
          console.warn("Backend save failed (non-blocking):", backendErr);
        }
      }

      onComplete(plan, data);
    } catch (err) {
      console.error(err);
      toast.error(
        "Something went wrong generating your plan. Please try again.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100;
  const meta = STEP_META[step - 1];
  const StepIcon = meta.icon;

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 60 : -60,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
      x: dir > 0 ? -60 : 60,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50/60 to-teal-50/40 dark:from-background dark:via-secondary/30 dark:to-accent/20 flex flex-col">
      {/* Header */}
      <header className="no-print border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <img
              src="/assets/uploads/IMG-20260226-WA0000-2.jpg"
              alt="HN Coach Logo"
              className="w-10 h-10 rounded-full object-cover shadow-sm"
            />
            <div>
              <span className="font-display font-bold text-lg text-foreground">
                HN Coach
              </span>
              <div className="text-xs text-muted-foreground leading-none">
                Diet & Nutrition Plan
              </div>
            </div>
            <Badge variant="secondary" className="ml-auto">
              Step {step} of {TOTAL_STEPS}
            </Badge>
          </div>
          <Progress
            data-ocid="form.progress_bar"
            value={progress}
            className="h-2"
          />
        </div>
      </header>

      {/* Form Content */}
      <main className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {/* Step Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
              <StepIcon className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
              {meta.title}
            </h1>
            <p className="text-muted-foreground mt-1">{meta.subtitle}</p>
          </div>

          {/* Animated Step Content */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              data-ocid="form.step.panel"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="bg-card/95 backdrop-blur-sm rounded-2xl border border-border/80 p-6 sm:p-8 shadow-lg shadow-green-100/50 dark:shadow-none"
            >
              {step === 1 && (
                <Step1 data={data} errors={errors} update={update} />
              )}
              {step === 2 && <Step2 data={data} update={update} />}
              {step === 3 && <StepGoalTargets data={data} update={update} />}

              {step === 4 && <Step6 data={data} update={update} />}
              {step === 5 && (
                <Step8
                  data={data}
                  update={update}
                  toggleArrayItem={toggleArrayItem}
                />
              )}
              {step === 6 && <Step9 data={data} update={update} />}
              {step === 7 && <Step10 data={data} update={update} />}

              {step === 8 && <StepBmrTdee data={data} update={update} />}
            </motion.div>
          </AnimatePresence>

          {/* View Previous Report */}
          {step === 1 && hasPreviousReport && onViewPreviousReport && (
            <div className="mt-4 text-center">
              <button
                type="button"
                data-ocid="home.view_previous_report_button"
                onClick={onViewPreviousReport}
                className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium underline underline-offset-4 transition-colors"
              >
                <span>📋</span> View Previous Report
              </button>
            </div>
          )}

          {/* Error messages */}
          {Object.keys(errors).length > 0 && (
            <div className="mt-4 bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 space-y-1">
              {Object.values(errors).map((err) => (
                <p key={err} className="text-sm text-destructive font-medium">
                  {err}
                </p>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 no-print">
            <Button
              data-ocid="form.back_button"
              variant="outline"
              onClick={goBack}
              disabled={step === 1 || isGenerating}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>

            {step < TOTAL_STEPS ? (
              <Button
                data-ocid="form.next_button"
                onClick={goNext}
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                data-ocid="form.generate_button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="gap-2 bg-primary hover:bg-primary/90 px-6"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Leaf className="w-4 h-4" />
                    Generate My Diet Plan
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// ── Step Components ────────────────────────────────────────────────────────────

interface StepProps {
  data: FormData;
  errors?: Record<string, string>;
  update: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
  toggleArrayItem?: (key: keyof FormData, item: string) => void;
}

function HeightInput({ data, errors = {}, update }: StepProps) {
  const [unit, setUnit] = useState<"cm" | "feet">("cm");
  const [feet, setFeet] = useState<number>(5);
  const [inches, setInches] = useState<number>(6);

  function handleUnitChange(newUnit: "cm" | "feet") {
    setUnit(newUnit);
    if (newUnit === "feet") {
      // Convert current cm to feet/inches
      const totalInches = data.height / 2.54;
      const f = Math.floor(totalInches / 12);
      const i = Math.round(totalInches % 12);
      setFeet(f || 5);
      setInches(i || 6);
    } else {
      // Convert feet/inches to cm
      const cm = Math.round(feet * 30.48 + inches * 2.54);
      update("height", cm);
    }
  }

  function handleFeetChange(val: number) {
    setFeet(val);
    const cm = Math.round(val * 30.48 + inches * 2.54);
    update("height", cm);
  }

  function handleInchesChange(val: number) {
    setInches(val);
    const cm = Math.round(feet * 30.48 + val * 2.54);
    update("height", cm);
  }

  return (
    <div className="space-y-2">
      <Label>Height</Label>
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          data-ocid="height.unit.select"
          onClick={() => handleUnitChange("cm")}
          className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${unit === "cm" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
        >
          cm
        </button>
        <button
          type="button"
          data-ocid="height.unit.select"
          onClick={() => handleUnitChange("feet")}
          className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${unit === "feet" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
        >
          Feet &amp; Inches
        </button>
      </div>
      {unit === "cm" ? (
        <Input
          id="height"
          data-ocid="height.cm.input"
          type="number"
          min={100}
          max={250}
          placeholder="e.g. 170"
          value={data.height || ""}
          onChange={(e) => update("height", Number(e.target.value))}
          className={errors.height ? "border-destructive" : ""}
        />
      ) : (
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              data-ocid="height.feet.input"
              type="number"
              min={3}
              max={8}
              placeholder="Feet"
              value={feet}
              onChange={(e) => handleFeetChange(Number(e.target.value))}
              className={errors.height ? "border-destructive" : ""}
            />
            <span className="text-xs text-muted-foreground mt-1 block">
              feet
            </span>
          </div>
          <div className="flex-1">
            <Input
              data-ocid="height.inches.input"
              type="number"
              min={0}
              max={11}
              placeholder="Inches"
              value={inches}
              onChange={(e) => handleInchesChange(Number(e.target.value))}
              className={errors.height ? "border-destructive" : ""}
            />
            <span className="text-xs text-muted-foreground mt-1 block">
              inches
            </span>
          </div>
        </div>
      )}
      {unit === "feet" && data.height > 0 && (
        <p className="text-xs text-muted-foreground">≈ {data.height} cm</p>
      )}
      {errors.height && (
        <p className="text-sm text-destructive">{errors.height}</p>
      )}
    </div>
  );
}

function DownloadCountBar() {
  const [count, setCount] = useState(53);

  useEffect(() => {
    const stored = localStorage.getItem("hncoach_download_count");
    let current = stored ? Number.parseInt(stored, 10) : 53;
    if (!localStorage.getItem("hncoach_visited")) {
      current = current + 1;
      localStorage.setItem("hncoach_visited", "1");
      localStorage.setItem("hncoach_download_count", String(current));
    }
    setCount(current);
  }, []);

  const total = 1000;
  const pct = Math.min((count / total) * 100, 100);
  const earlyBirdActive = count <= 100;

  return (
    <div className="rounded-2xl overflow-hidden shadow-md mb-5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500">
      <div className="px-4 pt-3 pb-2 text-white">
        <div className="flex items-center justify-between mb-1">
          <span className="font-bold text-base tracking-wide">
            🔥 {count.toLocaleString()} Plans Generated!
          </span>
          <span className="text-xs bg-white/20 rounded-full px-2 py-0.5 font-semibold">
            {total - count} slots left at discounted price
          </span>
        </div>
        {/* Progress Bar */}
        <div className="relative h-4 bg-white/30 rounded-full overflow-hidden mb-2">
          <div
            className="absolute left-0 top-0 h-full bg-white rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
          {/* Milestone markers */}
          <div
            className="absolute top-0 h-full w-0.5 bg-yellow-300"
            style={{ left: "10%" }}
          />
        </div>
        {/* Price milestones */}
        <div className="flex items-center gap-2 flex-wrap text-sm">
          <span className="line-through text-white/60 font-medium">₹1,000</span>
          <span className="text-white/40">→</span>
          {earlyBirdActive ? (
            <>
              <span className="bg-green-400 text-green-900 font-bold rounded-full px-3 py-0.5 text-xs animate-pulse">
                🎉 First 100: ₹101 only!
              </span>
              <span className="text-white/60 text-xs">After 100: ₹299</span>
            </>
          ) : (
            <>
              <span className="text-green-300 line-through text-xs">
                ₹101 (sold out)
              </span>
              <span className="bg-blue-400 text-blue-900 font-bold rounded-full px-3 py-0.5 text-xs">
                Current Price: ₹299
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Step1({ data, errors = {}, update }: StepProps) {
  return (
    <div className="space-y-5">
      {/* Surprise offer banner - Premium Design */}
      <div
        className="relative overflow-hidden rounded-2xl shadow-xl"
        style={{
          background:
            "linear-gradient(135deg, #7c3aed 0%, #db2777 50%, #f97316 100%)",
        }}
      >
        {/* Shimmer overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 animate-shimmer" />
        {/* FREE corner ribbon */}
        <div
          className="absolute top-0 right-0 w-0 h-0"
          style={{
            borderLeft: "60px solid transparent",
            borderTop: "60px solid #facc15",
          }}
        />
        <div
          className="absolute top-1 right-1 text-xs font-black text-purple-900 rotate-45 translate-x-1 -translate-y-1"
          style={{ fontSize: "9px" }}
        >
          FREE!
        </div>
        <div className="relative p-5 text-center">
          {/* EXCLUSIVE OFFER badge */}
          <div className="inline-block bg-yellow-400 text-purple-900 text-xs font-black px-3 py-1 rounded-full tracking-widest uppercase mb-3 shadow-md">
            ✨ Exclusive Offer ✨
          </div>
          <div className="text-3xl mb-2">✨ 🎁 ✨</div>
          <p className="font-black text-white text-base leading-snug drop-shadow-lg mb-1">
            Buy your diet plan &amp; get a FREE weekly tracking call!
          </p>
          <p className="text-yellow-200 text-sm font-semibold drop-shadow">
            Worth ₹999 — absolutely FREE for you 🎉
          </p>
        </div>
      </div>
      <DownloadCountBar />
      <div className="mb-4 rounded-xl overflow-hidden">
        <img
          src="/assets/generated/fit-india-banner.dim_800x200.jpg"
          alt="Fit India Movement - Supporting Wellness for All"
          className="w-full object-cover h-36"
        />
        <div className="bg-gradient-to-r from-orange-50 via-white to-green-50 border border-orange-100 rounded-b-xl px-4 py-2 text-center text-sm font-medium text-gray-700">
          🇮🇳 HN Coach proudly supports{" "}
          <span className="text-orange-600 font-semibold">
            Fit India Movement
          </span>{" "}
          — Wellness for Every Indian
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          data-ocid="personal.name_input"
          placeholder="e.g. Sarah Johnson"
          value={data.name}
          onChange={(e) => update("name", e.target.value)}
          className={errors.name ? "border-destructive" : ""}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            data-ocid="personal.age_input"
            type="number"
            min={10}
            max={100}
            value={data.age}
            onChange={(e) => update("age", Number(e.target.value))}
            className={errors.age ? "border-destructive" : ""}
          />
          {errors.age && (
            <p className="text-sm text-destructive">{errors.age}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Gender</Label>
          <div
            data-ocid="personal.gender.radio"
            className="grid grid-cols-2 gap-2"
          >
            {(["male", "female"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => update("gender", g)}
                className={`p-2.5 rounded-lg border-2 text-sm font-medium capitalize transition-all ${
                  data.gender === g
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <HeightInput data={data} errors={errors} update={update} />

        <div className="space-y-2">
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            data-ocid="personal.weight_input"
            type="number"
            min={30}
            max={300}
            value={data.weight}
            onChange={(e) => update("weight", Number(e.target.value))}
            className={errors.weight ? "border-destructive" : ""}
          />
          {errors.weight && (
            <p className="text-sm text-destructive">{errors.weight}</p>
          )}
        </div>
      </div>

      {/* User's WhatsApp Number */}
      <div className="space-y-2">
        <Label htmlFor="user_whatsapp">Your WhatsApp Number</Label>
        <Input
          id="user_whatsapp"
          data-ocid="personal.user_whatsapp_input"
          type="tel"
          placeholder="Your WhatsApp number (10 digits)"
          value={data.user_whatsapp}
          onChange={(e) =>
            update(
              "user_whatsapp",
              e.target.value.replace(/\D/g, "").slice(0, 10),
            )
          }
        />
        <p className="text-xs text-muted-foreground">
          Your referral link will be generated using this number.
        </p>
      </div>

      {/* Referrer WhatsApp */}
      <div className="space-y-2">
        <Label
          htmlFor="referrer_whatsapp"
          className="flex items-center gap-1.5"
        >
          Who referred you to HN Coach?
          <span className="text-xs text-muted-foreground font-normal">
            (Optional)
          </span>
        </Label>
        <div className="relative">
          <Input
            id="referrer_whatsapp"
            data-ocid="personal.referrer_whatsapp_input"
            type="tel"
            placeholder="Referrer's WhatsApp number (10 digits)"
            value={data.referrer_whatsapp}
            readOnly={!!data.referrer_whatsapp}
            onChange={(e) => {
              if (!data.referrer_whatsapp) {
                update(
                  "referrer_whatsapp",
                  e.target.value.replace(/\D/g, "").slice(0, 10),
                );
              }
            }}
            className={
              data.referrer_whatsapp
                ? "pr-24 bg-green-50 border-green-300 text-green-800"
                : ""
            }
          />
          {data.referrer_whatsapp && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-green-100 border border-green-300 rounded-md px-2 py-0.5">
              <Lock className="w-3 h-3 text-green-600" />
              <span className="text-xs font-semibold text-green-700">
                Verified
              </span>
            </div>
          )}
        </div>
        {data.referrer_whatsapp && (
          <p className="text-xs text-green-700 flex items-center gap-1">
            ✅ Referred by +91 {data.referrer_whatsapp}
          </p>
        )}
        {!data.referrer_whatsapp && (
          <p className="text-xs text-muted-foreground">
            Enter the WhatsApp number of the person who invited you.
          </p>
        )}
      </div>
    </div>
  );
}

const GOALS = [
  {
    value: "weight_loss" as const,
    label: "Weight Loss",
    desc: "Reduce body fat with a calorie deficit",
    emoji: "🏃",
  },
  {
    value: "muscle_gain" as const,
    label: "Muscle Gain",
    desc: "Build lean muscle with a calorie surplus",
    emoji: "💪",
  },
  {
    value: "maintenance" as const,
    label: "Maintenance",
    desc: "Maintain current weight and improve health",
    emoji: "⚖️",
  },
  {
    value: "body_recomposition" as const,
    label: "Body Recomposition",
    desc: "Lose fat and gain muscle simultaneously",
    emoji: "🔄",
  },
];

function Step2({ data, update }: StepProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl overflow-hidden mb-4 -mt-2">
        <img
          src="/assets/generated/form-health-goal.dim_400x200.png"
          alt="Step illustration"
          className="w-full h-32 object-cover object-center"
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {GOALS.map((g, i) => (
          <button
            key={g.value}
            type="button"
            data-ocid={`goal.item.${i + 1}`}
            onClick={() => update("goal", g.value)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              data.goal === g.value
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/40 hover:bg-secondary/50"
            }`}
          >
            <div className="text-2xl mb-2">{g.emoji}</div>
            <div className="font-semibold text-foreground">{g.label}</div>
            <div className="text-sm text-muted-foreground mt-0.5">{g.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepGoalTargets({ data, update }: StepProps) {
  const isLoss = data.goal === "weight_loss";
  const isGain = data.goal === "muscle_gain";

  return (
    <div className="space-y-6">
      <div className="rounded-xl overflow-hidden mb-4 -mt-2">
        <img
          src="/assets/generated/form-goal-targets.dim_400x200.png"
          alt="Step illustration"
          className="w-full h-32 object-cover object-center"
        />
      </div>
      {isLoss && (
        <>
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <p className="text-sm text-orange-700">
              Tell us your weight loss targets so we can calculate your goal
              timeline.
            </p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="target_weight_kg">
                How many kgs do you want to lose?
              </Label>
              <div className="relative">
                <Input
                  id="target_weight_kg"
                  data-ocid="goal_targets.weight_input"
                  type="number"
                  min={1}
                  max={100}
                  placeholder="e.g. 10"
                  value={data.target_weight_kg || ""}
                  onChange={(e) =>
                    update("target_weight_kg", Number(e.target.value))
                  }
                  className="pr-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  kg
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="target_belly_inches">
                How many inches do you want to lose from belly fat?
              </Label>
              <div className="relative">
                <Input
                  id="target_belly_inches"
                  data-ocid="goal_targets.belly_input"
                  type="number"
                  min={0}
                  max={30}
                  placeholder="e.g. 4"
                  value={data.target_belly_inches || ""}
                  onChange={(e) =>
                    update("target_belly_inches", Number(e.target.value))
                  }
                  className="pr-16"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  inches
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {isGain && (
        <>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-sm text-green-700">
              Tell us your weight gain target so we can calculate your goal
              timeline.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="target_weight_kg">
              How many kgs do you want to gain?
            </Label>
            <div className="relative">
              <Input
                id="target_weight_kg"
                data-ocid="goal_targets.weight_input"
                type="number"
                min={1}
                max={50}
                placeholder="e.g. 5"
                value={data.target_weight_kg || ""}
                onChange={(e) =>
                  update("target_weight_kg", Number(e.target.value))
                }
                className="pr-10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                kg
              </span>
            </div>
          </div>
        </>
      )}

      {!isLoss && !isGain && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
          <div className="text-3xl mb-3">⚖️</div>
          <p className="text-sm text-blue-700 font-medium">
            Your goal is{" "}
            <strong>
              {data.goal === "maintenance"
                ? "Maintenance"
                : "Body Recomposition"}
            </strong>
            .
          </p>
          <p className="text-sm text-blue-600 mt-1">
            No specific weight target needed — click Next to continue.
          </p>
        </div>
      )}
    </div>
  );
}

function StepBmrTdee({ data, update }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl overflow-hidden mb-4 -mt-2">
        <img
          src="/assets/generated/form-bmr.dim_400x200.png"
          alt="Step illustration"
          className="w-full h-32 object-cover object-center"
        />
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-700">
          To know your BMR/TDEE, check your wellness assessment report. Enter
          your BMR and TDEE values from your{" "}
          <strong>Wellness Assessment Report</strong> below.
        </p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bmr_manual">
            BMR — Basal Metabolic Rate (kcal/day)
          </Label>
          <div className="relative">
            <Input
              id="bmr_manual"
              data-ocid="bmr_tdee.bmr_input"
              type="number"
              min={800}
              max={5000}
              placeholder="e.g. 1650"
              value={data.bmr_manual || ""}
              onChange={(e) => update("bmr_manual", Number(e.target.value))}
              className="pr-16"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              kcal
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Calories your body burns at complete rest.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tdee_manual">
            TDEE — Total Daily Energy Expenditure (kcal/day)
          </Label>
          <div className="relative">
            <Input
              id="tdee_manual"
              data-ocid="bmr_tdee.tdee_input"
              type="number"
              min={1000}
              max={8000}
              placeholder="e.g. 2200"
              value={data.tdee_manual || ""}
              onChange={(e) => update("tdee_manual", Number(e.target.value))}
              className="pr-16"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              kcal
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Total calories burned including your daily activities.
          </p>
        </div>
      </div>
      {(data.bmr_manual > 0 || data.tdee_manual > 0) && (
        <div className="bg-primary/5 rounded-xl p-4 grid grid-cols-2 gap-3 text-center">
          <div>
            <div className="text-xl font-bold text-blue-600">
              {data.bmr_manual || "—"}
            </div>
            <div className="text-xs text-muted-foreground">BMR (kcal)</div>
          </div>
          <div>
            <div className="text-xl font-bold text-orange-600">
              {data.tdee_manual || "—"}
            </div>
            <div className="text-xs text-muted-foreground">TDEE (kcal)</div>
          </div>
        </div>
      )}
    </div>
  );
}

const MEAL_GAP_OPTIONS = [
  { value: 3, label: "3 Hours Gap", desc: "Eat every 3 hours", emoji: "⏰" },
  { value: 4, label: "4 Hours Gap", desc: "Eat every 4 hours", emoji: "🕐" },
  { value: 5, label: "5 Hours Gap", desc: "Eat every 5 hours", emoji: "🕔" },
];

function Step6({ data, update }: StepProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl overflow-hidden mb-4 -mt-2">
        <img
          src="/assets/generated/form-meal-frequency.dim_400x200.png"
          alt="Step illustration"
          className="w-full h-32 object-cover object-center"
        />
      </div>
      <p className="text-sm text-muted-foreground">
        Select how long you prefer to wait between meals:
      </p>
      <div className="grid grid-cols-3 gap-4" data-ocid="meal_gap.select">
        {MEAL_GAP_OPTIONS.map((opt, i) => (
          <button
            key={opt.value}
            type="button"
            data-ocid={`meal_gap.item.${i + 1}`}
            onClick={() => update("meal_gap", opt.value)}
            className={`p-5 rounded-xl border-2 text-center transition-all ${
              data.meal_gap === opt.value
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/40 hover:bg-secondary/50"
            }`}
          >
            <div className="text-3xl mb-2">{opt.emoji}</div>
            <div className="text-2xl font-bold text-foreground">
              {opt.value}h
            </div>
            <div className="text-sm font-medium text-foreground mt-1">
              {opt.label}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {opt.desc}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

const HEALTH_CONDITIONS = [
  "None",
  "Uric Acid",
  "Joint Pain",
  "Breath Issue",
  "Sleep Disorders",
  "Stress / Depression / Anxiety",
  "Diabetes (Type 2)",
  "Hypertension",
  "High Cholesterol",
  "PCOS",
  "Thyroid Disorder",
  "Heart Disease",
];

function Step8({ data, toggleArrayItem }: StepProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl overflow-hidden mb-4 -mt-2">
        <img
          src="/assets/generated/form-health-condition.dim_400x200.png"
          alt="Step illustration"
          className="w-full h-32 object-cover object-center"
        />
      </div>
      <p className="text-sm font-medium text-foreground">
        Select your present health conditions:
      </p>

      <div className="grid sm:grid-cols-2 gap-3">
        {HEALTH_CONDITIONS.map((condition, i) => (
          <div
            key={condition}
            data-ocid={`conditions.checkbox.${i + 1}`}
            className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-secondary/50 cursor-pointer transition-colors"
          >
            <Checkbox
              checked={data.health_conditions.includes(condition)}
              onCheckedChange={() =>
                toggleArrayItem?.("health_conditions", condition)
              }
            />
            <span className="text-sm font-medium">{condition}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Step9({ data, update }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl overflow-hidden mb-4 -mt-2">
        <img
          src="/assets/generated/form-sleep-schedule.dim_400x200.png"
          alt="Step illustration"
          className="w-full h-32 object-cover object-center"
        />
      </div>
      <div className="space-y-4">
        <p className="text-sm font-medium text-foreground">Sleep timings</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bed_time">Bed Time</Label>
            <Input
              id="bed_time"
              data-ocid="sleep.bed_time_input"
              type="time"
              value={data.bed_time}
              onChange={(e) => update("bed_time", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wake_up_time">Wake Up Time</Label>
            <Input
              id="wake_up_time"
              data-ocid="sleep.wake_up_input"
              type="time"
              value={data.wake_up_time}
              onChange={(e) => update("wake_up_time", e.target.value)}
            />
          </div>
        </div>
        {data.bed_time &&
          data.wake_up_time &&
          (() => {
            const [bh, bm] = data.bed_time.split(":").map(Number);
            const [wh, wm] = data.wake_up_time.split(":").map(Number);
            let diff = wh * 60 + wm - (bh * 60 + bm);
            if (diff < 0) diff += 24 * 60;
            const hours = Math.floor(diff / 60);
            const mins = diff % 60;
            return (
              <div className="bg-primary/5 rounded-xl p-3 text-sm text-center">
                <span className="text-muted-foreground">Sleep duration: </span>
                <strong className="text-primary">
                  {hours}h {mins > 0 ? `${mins}m` : ""}
                </strong>
              </div>
            );
          })()}
      </div>
    </div>
  );
}

function Step10({ data, update }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl overflow-hidden mb-4 -mt-2">
        <img
          src="/assets/generated/form-nutrition.dim_400x200.png"
          alt="Step illustration"
          className="w-full h-32 object-cover object-center"
        />
      </div>
      <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-xl p-4">
        <Apple className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
        <p className="text-sm text-green-700">
          Enter your macro targets as recommended in your{" "}
          <strong>Wellness Assessment Report</strong>. To know your nutrition
          requirement, check your wellness assessment report.
        </p>
      </div>
      <p className="text-sm font-medium text-foreground">
        Daily macro targets (grams)
      </p>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="protein_target">Protein (g)</Label>
          <Input
            id="protein_target"
            data-ocid="macros.protein_input"
            type="number"
            min={0}
            placeholder="e.g. 120"
            value={data.protein_target || ""}
            onChange={(e) => update("protein_target", Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fat_target">Fat (g)</Label>
          <Input
            id="fat_target"
            data-ocid="macros.fat_input"
            type="number"
            min={0}
            placeholder="e.g. 60"
            value={data.fat_target || ""}
            onChange={(e) => update("fat_target", Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="carbs_target">Carbs (g)</Label>
          <Input
            id="carbs_target"
            data-ocid="macros.carbs_input"
            type="number"
            min={0}
            placeholder="e.g. 250"
            value={data.carbs_target || ""}
            onChange={(e) => update("carbs_target", Number(e.target.value))}
          />
        </div>
      </div>
      <div className="bg-primary/5 rounded-xl p-4 grid grid-cols-3 gap-3 text-center">
        <div>
          <div className="text-xl font-bold text-green-600">
            {data.protein_target || "—"}g
          </div>
          <div className="text-xs text-muted-foreground">Protein</div>
        </div>
        <div>
          <div className="text-xl font-bold text-amber-600">
            {data.fat_target || "—"}g
          </div>
          <div className="text-xs text-muted-foreground">Fat</div>
        </div>
        <div>
          <div className="text-xl font-bold text-blue-600">
            {data.carbs_target || "—"}g
          </div>
          <div className="text-xs text-muted-foreground">Carbs</div>
        </div>
      </div>
    </div>
  );
}
