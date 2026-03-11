import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  Apple,
  Brain,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Heart,
  Leaf,
  Loader2,
  Moon,
  Pill,
  Salad,
  Target,
  User,
  UtensilsCrossed,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
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

const TOTAL_STEPS = 14;

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
  { title: "Activity Level", subtitle: "How active are you daily?", icon: Zap },
  {
    title: "Dietary Preferences",
    subtitle: "Select your dietary reference",
    icon: Leaf,
  },
  {
    title: "Food Allergies",
    subtitle: "Any foods you need to avoid?",
    icon: Apple,
  },
  {
    title: "Meal Frequency",
    subtitle: "Select your meal gap preference",
    icon: UtensilsCrossed,
  },
  {
    title: "Water Intake",
    subtitle: "Your daily hydration requirement",
    icon: Droplets,
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
    title: "Stress Level",
    subtitle: "How would you rate your stress?",
    icon: Brain,
  },
  {
    title: "BMR & TDEE",
    subtitle: "Enter your metabolic rate values",
    icon: Activity,
  },
  { title: "Supplements", subtitle: "What do you currently take?", icon: Pill },
];

interface Props {
  onComplete: (plan: DietPlan, data: FormData) => void;
}

export default function DietForm({ onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<FormData>(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const { actor } = useActor();

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
    // Step 5 – Dietary preference required
    if (step === 5) {
      if (data.dietary_preferences.length === 0) {
        errs.dietary_preferences = "Please select a dietary preference";
      }
    }
    // Step 8 – Water intake required
    if (step === 8) {
      if (!data.water_intake || data.water_intake <= 0) {
        errs.water_intake = "Please enter your daily water intake";
      }
    }
    // Step 9 – Health conditions required
    if (step === 9) {
      if (data.health_conditions.length === 0) {
        errs.health_conditions =
          "Please select at least one option (or select None)";
      }
    }
    // Step 11 – Macro targets required
    if (step === 11) {
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
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/20 flex flex-col">
      {/* Hero Banner - shown on step 1 only */}
      {step === 1 && (
        <div className="w-full">
          <img
            src="/assets/uploads/file_00000000b1f071fa852a880787585b1b-1.png"
            alt="Global Nutrition Philosophy"
            className="w-full object-cover max-h-64 sm:max-h-80"
          />
        </div>
      )}

      {/* Header */}
      <header className="no-print border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Leaf className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">
              NutriPlan
            </span>
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
              className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-green"
            >
              {step === 1 && (
                <Step1 data={data} errors={errors} update={update} />
              )}
              {step === 2 && <Step2 data={data} update={update} />}
              {step === 3 && <StepGoalTargets data={data} update={update} />}
              {step === 4 && <Step3 data={data} update={update} />}
              {step === 5 && (
                <Step4
                  data={data}
                  update={update}
                  toggleArrayItem={toggleArrayItem}
                />
              )}
              {step === 6 && <StepAllergies data={data} update={update} />}
              {step === 7 && <Step6 data={data} update={update} />}
              {step === 8 && <Step7 data={data} update={update} />}
              {step === 9 && (
                <Step8
                  data={data}
                  update={update}
                  toggleArrayItem={toggleArrayItem}
                />
              )}
              {step === 10 && <Step9 data={data} update={update} />}
              {step === 11 && <Step10 data={data} update={update} />}
              {step === 12 && <Step11 data={data} update={update} />}
              {step === 13 && <StepBmrTdee data={data} update={update} />}
              {step === 14 && (
                <Step12
                  data={data}
                  errors={errors}
                  toggleArrayItem={toggleArrayItem}
                  update={update}
                />
              )}
            </motion.div>
          </AnimatePresence>

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

function Step1({ data, errors = {}, update }: StepProps) {
  return (
    <div className="space-y-5">
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
        <div className="space-y-2">
          <Label htmlFor="height">Height (cm)</Label>
          <Input
            id="height"
            data-ocid="personal.height_input"
            type="number"
            min={100}
            max={250}
            value={data.height}
            onChange={(e) => update("height", Number(e.target.value))}
            className={errors.height ? "border-destructive" : ""}
          />
          {errors.height && (
            <p className="text-sm text-destructive">{errors.height}</p>
          )}
        </div>

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
  );
}

const ACTIVITY_LEVELS = [
  {
    value: "sedentary" as const,
    label: "Sedentary",
    desc: "Little or no exercise, desk job",
    emoji: "🪑",
  },
  {
    value: "lightly_active" as const,
    label: "Lightly Active",
    desc: "Light exercise 1-3 days/week",
    emoji: "🚶",
  },
  {
    value: "moderately_active" as const,
    label: "Moderately Active",
    desc: "Moderate exercise 3-5 days/week",
    emoji: "🏋️",
  },
  {
    value: "very_active" as const,
    label: "Very Active",
    desc: "Hard exercise 6-7 days/week",
    emoji: "🏃",
  },
  {
    value: "extra_active" as const,
    label: "Extra Active",
    desc: "Very hard exercise & physical job",
    emoji: "⚡",
  },
];

function Step3({ data, update }: StepProps) {
  return (
    <div className="space-y-3">
      {ACTIVITY_LEVELS.map((a, i) => (
        <button
          key={a.value}
          type="button"
          data-ocid={`activity.item.${i + 1}`}
          onClick={() => update("activity_level", a.value)}
          className={`w-full p-4 rounded-xl border-2 text-left flex items-center gap-4 transition-all ${
            data.activity_level === a.value
              ? "border-primary bg-primary/10"
              : "border-border hover:border-primary/40 hover:bg-secondary/50"
          }`}
        >
          <span className="text-2xl">{a.emoji}</span>
          <div>
            <div className="font-semibold text-foreground">{a.label}</div>
            <div className="text-sm text-muted-foreground">{a.desc}</div>
          </div>
          {data.activity_level === a.value && (
            <div className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <svg
                className="w-3 h-3 text-primary-foreground"
                fill="currentColor"
                viewBox="0 0 12 12"
                aria-hidden="true"
              >
                <path
                  d="M10 3L5 8.5 2 5.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

const DIETARY_PREFS = [
  {
    value: "Vegetarian",
    label: "Vegetarian",
    emoji: "🥗",
    desc: "No meat or seafood",
  },
  {
    value: "Non Vegetarian",
    label: "Non Vegetarian",
    emoji: "🍗",
    desc: "Includes meat, poultry & seafood",
  },
  {
    value: "Vegan",
    label: "Vegan",
    emoji: "🌱",
    desc: "No animal products at all",
  },
];

function Step4({ data, update }: StepProps) {
  const selected = data.dietary_preferences[0] ?? "";
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Select your dietary reference:
      </p>
      <div className="space-y-3">
        {DIETARY_PREFS.map((pref, i) => (
          <button
            key={pref.value}
            type="button"
            data-ocid={`dietary.item.${i + 1}`}
            onClick={() => update("dietary_preferences", [pref.value])}
            className={`w-full p-4 rounded-xl border-2 text-left flex items-center gap-4 transition-all ${
              selected === pref.value
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/40 hover:bg-secondary/50"
            }`}
          >
            <span className="text-2xl">{pref.emoji}</span>
            <div>
              <div className="font-semibold text-foreground">{pref.label}</div>
              <div className="text-sm text-muted-foreground">{pref.desc}</div>
            </div>
            {selected === pref.value && (
              <div className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-primary-foreground"
                  fill="currentColor"
                  viewBox="0 0 12 12"
                  aria-hidden="true"
                >
                  <path
                    d="M10 3L5 8.5 2 5.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepAllergies({ data, update }: StepProps) {
  return (
    <div className="space-y-5">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm text-amber-700">
          Type any foods you are allergic to or need to avoid. Separate multiple
          items with commas.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="food_allergies_text">
          Food Allergies / Foods to Avoid
        </Label>
        <Input
          id="food_allergies_text"
          data-ocid="allergies.input"
          placeholder="e.g. Peanuts, Shellfish, Milk, Gluten — or type None"
          value={data.food_allergies_text}
          onChange={(e) => update("food_allergies_text", e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Leave blank or type "None" if you have no food allergies.
        </p>
      </div>
      {data.food_allergies_text &&
        data.food_allergies_text.toLowerCase() !== "none" && (
          <div className="bg-primary/5 rounded-xl p-4 text-sm">
            <span className="font-medium text-foreground">Avoiding: </span>
            <span className="text-muted-foreground">
              {data.food_allergies_text}
            </span>
          </div>
        )}
    </div>
  );
}

function StepGoalTargets({ data, update }: StepProps) {
  const isLoss = data.goal === "weight_loss";
  const isGain = data.goal === "muscle_gain";

  return (
    <div className="space-y-6">
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
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-700">
          Enter your BMR and TDEE values from your{" "}
          <strong>Wellness Assessment Report</strong>. These will be displayed
          in your diet plan report.
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

function Step7({ data, update }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-700">
          Please enter your daily water intake requirement as mentioned in your{" "}
          <strong>Wellness Assessment Report</strong>.
        </p>
      </div>

      <div className="space-y-3">
        <Label htmlFor="water_intake">
          Daily Water Intake Requirement (Litres)
        </Label>
        <div className="relative">
          <Input
            id="water_intake"
            data-ocid="water.input"
            type="number"
            min={0.5}
            max={10}
            step={0.1}
            placeholder="e.g. 2.5"
            value={data.water_intake || ""}
            onChange={(e) => update("water_intake", Number(e.target.value))}
            className="pr-12"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
            L/day
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Enter the recommended water intake from your wellness assessment
          report (in litres).
        </p>
      </div>

      {data.water_intake > 0 && (
        <div className="bg-primary/5 rounded-xl p-4 flex items-center gap-3">
          <Droplets className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-foreground">
            Target:{" "}
            <strong className="text-primary">{data.water_intake} L</strong> of
            water per day
          </span>
        </div>
      )}
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
      <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-xl p-4">
        <Apple className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
        <p className="text-sm text-green-700">
          Enter your macro targets as recommended in your{" "}
          <strong>Wellness Assessment Report</strong>.
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

const STRESS_LEVELS = [
  {
    value: "low" as const,
    label: "Low",
    desc: "Relaxed, minimal daily stressors",
    emoji: "😌",
  },
  {
    value: "moderate" as const,
    label: "Moderate",
    desc: "Some stress, well-managed",
    emoji: "😐",
  },
  {
    value: "high" as const,
    label: "High",
    desc: "Frequently stressed",
    emoji: "😰",
  },
  {
    value: "very_high" as const,
    label: "Very High",
    desc: "Overwhelmed most of the time",
    emoji: "😫",
  },
];

function Step11({ data, update }: StepProps) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {STRESS_LEVELS.map((s, i) => (
        <button
          key={s.value}
          type="button"
          data-ocid={`stress.item.${i + 1}`}
          onClick={() => update("stress_level", s.value)}
          className={`p-4 rounded-xl border-2 text-left transition-all ${
            data.stress_level === s.value
              ? "border-primary bg-primary/10"
              : "border-border hover:border-primary/40 hover:bg-secondary/50"
          }`}
        >
          <div className="text-2xl mb-2">{s.emoji}</div>
          <div className="font-semibold text-foreground">{s.label}</div>
          <div className="text-sm text-muted-foreground mt-0.5">{s.desc}</div>
        </button>
      ))}
    </div>
  );
}

const SUPPLEMENT_OPTIONS = [
  "Protein Powder",
  "Creatine",
  "Multivitamin",
  "Omega-3",
  "Vitamin D",
  "Magnesium",
  "Zinc",
  "Pre-workout",
  "Calcium",
  "Digestion Enhancer",
];

function Step12({ data, errors = {}, toggleArrayItem, update }: StepProps) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Select any supplements you currently take:
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        {SUPPLEMENT_OPTIONS.map((supp, i) => (
          <div
            key={supp}
            data-ocid={`supplements.checkbox.${i + 1}`}
            className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-secondary/50 cursor-pointer transition-colors"
          >
            <Checkbox
              checked={data.supplements.includes(supp)}
              onCheckedChange={() => toggleArrayItem?.("supplements", supp)}
            />
            <span className="text-sm font-medium">{supp}</span>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="other_supplements">
          Other supplements (comma-separated)
        </Label>
        <Input
          id="other_supplements"
          data-ocid="supplements.other_input"
          placeholder="e.g. B12, Iron, CoQ10"
          value={data.other_supplements}
          onChange={(e) => update("other_supplements", e.target.value)}
        />
        {errors.other_supplements && (
          <p className="text-sm text-destructive">{errors.other_supplements}</p>
        )}
      </div>

      <div className="bg-primary/5 rounded-xl p-4 text-sm text-muted-foreground">
        🎉 You're almost done! Click <strong>Generate My Diet Plan</strong> to
        get your personalized weekly nutrition plan.
      </div>
    </div>
  );
}
