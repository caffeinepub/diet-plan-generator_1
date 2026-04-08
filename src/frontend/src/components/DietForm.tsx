import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Apple,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Loader2,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import {
  generateDietPlan,
  mapToActivityLevel,
  mapToGender,
  mapToGoal,
  mapToStressLevel,
} from "../lib/dietCalculator";
import type { DietPlan } from "../types/backend-types";
import type { FormData } from "../types/diet";
import { defaultFormData } from "../types/diet";
import AdminPanel from "./AdminPanel";

const TOTAL_STEPS = 8;

interface Props {
  onComplete: (plan: DietPlan, data: FormData) => void;
  onViewPreviousReport?: () => void;
  hasPreviousReport?: boolean;
}

export default function DietForm({
  onComplete,
  onViewPreviousReport,
  hasPreviousReport,
}: Props) {
  const [step, setStep] = useState(1);
  const [showAdmin, setShowAdmin] = useState(false);
  const logoClickCount = useRef(0);
  const logoClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleLogoClick() {
    logoClickCount.current += 1;
    if (logoClickTimer.current) clearTimeout(logoClickTimer.current);
    if (logoClickCount.current >= 3) {
      logoClickCount.current = 0;
      setShowAdmin(true);
    } else {
      logoClickTimer.current = setTimeout(() => {
        logoClickCount.current = 0;
      }, 500);
    }
  }
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<FormData>(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const { actor } = useActor();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refParam = urlParams.get("ref");
    if (refParam && /^[6-9]\d{9}$/.test(refParam)) {
      setData((prev) => ({ ...prev, referrer_whatsapp: refParam }));
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
    if (step === 3) {
      if (
        (data.goal === "weight_loss" || data.goal === "muscle_gain") &&
        (data.target_weight_kg <= 0 || Number.isNaN(data.target_weight_kg))
      ) {
        errs.target_weight_kg = "Please enter your target weight (kg)";
      }
    }
    if (step === 5) {
      if (data.health_conditions.length === 0) {
        errs.health_conditions =
          "Please select at least one option (or select None)";
      }
    }
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

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <div
      className="min-h-screen flex flex-col mesh-bg relative"
      style={{
        background:
          "linear-gradient(145deg, #020617 0%, #0f0728 45%, #1e1048 100%)",
      }}
    >
      <div className="mesh-orb" />

      {/* View Previous Report - Sticky Top Banner */}
      {step === 1 && hasPreviousReport && onViewPreviousReport && (
        <div
          className="no-print sticky top-0 z-50 px-4 pt-3 pb-1"
          style={{
            background: "rgba(2,6,23,0.95)",
            backdropFilter: "blur(12px)",
          }}
        >
          <button
            type="button"
            data-ocid="home.view_previous_report_button"
            onClick={onViewPreviousReport}
            className="w-full flex items-center justify-between gap-3 rounded-xl px-4 py-3 transition-all hover:brightness-110 active:scale-[0.99] group"
            style={{
              background:
                "linear-gradient(135deg, rgba(250,204,21,0.12) 0%, rgba(217,119,6,0.18) 100%)",
              border: "1.5px solid rgba(250,204,21,0.55)",
              boxShadow:
                "0 0 18px rgba(250,204,21,0.18), inset 0 1px 0 rgba(250,204,21,0.12)",
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-base"
                style={{
                  background: "rgba(250,204,21,0.18)",
                  border: "1px solid rgba(250,204,21,0.35)",
                }}
              >
                📋
              </div>
              <div className="min-w-0">
                <div
                  className="text-xs font-black leading-tight"
                  style={{ color: "#facc15" }}
                >
                  Welcome Back!
                </div>
                <div
                  className="text-[11px] font-medium truncate"
                  style={{ color: "#fde68a" }}
                >
                  View your previous diet plan — Access FREE
                </div>
              </div>
            </div>
            <div
              className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-black transition-all group-hover:gap-2"
              style={{
                background: "linear-gradient(135deg, #d97706, #f59e0b)",
                color: "#1a0533",
              }}
            >
              Open{" "}
              <span className="group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </div>
          </button>
        </div>
      )}

      {showAdmin && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black/90 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setShowAdmin(false)}
            className="fixed top-4 right-4 z-[60] hover:bg-white/20 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold transition-colors"
            style={{
              background: "rgba(129,140,248,0.15)",
              border: "1px solid rgba(129,140,248,0.25)",
            }}
          >
            ✕
          </button>
          <AdminPanel />
        </div>
      )}

      {/* Status bar gradient */}
      <div className="status-bar-gradient no-print" />

      {/* Header */}
      <header
        className="no-print border-b sticky top-0 z-10 backdrop-blur-2xl"
        style={{
          background: "rgba(2,6,23,0.88)",
          borderColor: "rgba(129,140,248,0.1)",
        }}
      >
        <div className="max-w-2xl mx-auto px-4 py-3.5">
          <div className="flex items-center gap-3 mb-1">
            <button
              type="button"
              onClick={handleLogoClick}
              aria-label="Open admin panel"
              className="cursor-pointer select-none p-0 border-0 bg-transparent"
            >
              <img
                src="/assets/uploads/IMG-20260226-WA0000-2.jpg"
                alt="HN Coach Logo"
                className="w-10 h-10 rounded-full object-cover"
                style={{
                  boxShadow:
                    "0 0 0 2px rgba(129,140,248,0.3), 0 0 12px rgba(129,140,248,0.15)",
                }}
              />
            </button>
            <div>
              <span
                className="font-display font-bold text-lg"
                style={{ color: "#f1f5f9", letterSpacing: "-0.02em" }}
              >
                HN Coach
              </span>
              <div
                className="text-[9px] uppercase tracking-widest leading-none font-medium"
                style={{ color: "#64748b" }}
              >
                Certified Nutrition Platform
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {/* Step dots */}
              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: static step indicators
                    key={i}
                    className={`step-dot ${i + 1 === step ? "active" : i + 1 < step ? "done" : ""}`}
                  />
                ))}
              </div>
              <Badge
                variant="secondary"
                className="text-xs"
                style={{
                  background: "rgba(129,140,248,0.12)",
                  color: "#a5b4fc",
                  border: "1px solid rgba(129,140,248,0.2)",
                }}
              >
                {step} / {TOTAL_STEPS}
              </Badge>
            </div>
          </div>
          {/* Progress bar 2026 */}
          <div className="progress-2026 mt-2">
            <div
              className="progress-2026-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Trust bar — only on step 1 */}
        {step === 1 && (
          <div className="trust-bar no-print">
            <div className="trust-badge">
              <Lock className="w-3 h-3" style={{ color: "#818cf8" }} />
              <span>256-bit SSL Encrypted</span>
            </div>
            <div className="trust-badge-dot" />
            <div className="trust-badge">
              <CheckCircle2 className="w-3 h-3" style={{ color: "#4ade80" }} />
              <span>Verified Nutrition Platform</span>
            </div>
            <div className="trust-badge-dot" />
            <div className="trust-badge">
              <ShieldCheck className="w-3 h-3" style={{ color: "#fbbf24" }} />
              <span>Razorpay Secured Payments</span>
            </div>
          </div>
        )}
      </header>

      {/* Form Content */}
      <main className="flex-1 flex items-start justify-center px-4 py-8 relative z-[1]">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              data-ocid="form.step.panel"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="rounded-2xl p-6 sm:p-8 glass-card float-3d"
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

          {/* Error messages */}
          {Object.keys(errors).length > 0 && (
            <div
              className="mt-4 rounded-xl px-4 py-3 space-y-1"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.25)",
              }}
            >
              {Object.values(errors).map((err) => (
                <p
                  key={err}
                  className="text-sm font-medium"
                  style={{ color: "#f87171" }}
                >
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
              style={{
                background: "rgba(15,7,40,0.6)",
                borderColor: "rgba(129,140,248,0.2)",
                color: "#94a3b8",
              }}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>

            {step < TOTAL_STEPS ? (
              <Button
                data-ocid="form.next_button"
                onClick={goNext}
                className="gap-2 neo-button border-0"
                style={{ fontWeight: 700, letterSpacing: "-0.01em" }}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                data-ocid="form.generate_button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="gap-2 neo-button border-0 px-6"
                style={{ fontWeight: 700 }}
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

function StepHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-lg font-bold mb-5 section-accent"
      style={{ color: "#e2e8f0", letterSpacing: "-0.02em" }}
    >
      {children}
    </h2>
  );
}

function FieldLabel({
  children,
  htmlFor,
}: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-[13px] font-medium mb-1.5"
      style={{ color: "#94a3b8" }}
    >
      {children}
    </label>
  );
}

function HeightInput({ data, errors = {}, update }: StepProps) {
  const [unit, setUnit] = useState<"cm" | "feet">("cm");
  const [feet, setFeet] = useState<number>(5);
  const [inches, setInches] = useState<number>(6);

  function handleUnitChange(newUnit: "cm" | "feet") {
    setUnit(newUnit);
    if (newUnit === "feet") {
      const totalInches = data.height / 2.54;
      const f = Math.floor(totalInches / 12);
      const i = Math.round(totalInches % 12);
      setFeet(f || 5);
      setInches(i || 6);
    } else {
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
      <FieldLabel>Height</FieldLabel>
      <div className="flex gap-2 mb-2">
        {(["cm", "feet"] as const).map((u) => (
          <button
            key={u}
            type="button"
            data-ocid="height.unit.select"
            onClick={() => handleUnitChange(u)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={{
              background:
                unit === u ? "rgba(129,140,248,0.15)" : "rgba(15,23,42,0.6)",
              border:
                unit === u
                  ? "1px solid rgba(129,140,248,0.4)"
                  : "1px solid rgba(129,140,248,0.15)",
              color: unit === u ? "#a5b4fc" : "#64748b",
            }}
          >
            {u === "feet" ? "Feet & Inches" : "cm"}
          </button>
        ))}
      </div>
      {unit === "cm" ? (
        <input
          id="height"
          data-ocid="height.cm.input"
          type="number"
          min={100}
          max={250}
          placeholder="e.g. 170"
          value={data.height || ""}
          onChange={(e) => update("height", Number(e.target.value))}
          className={`w-full rounded-lg px-3 py-2.5 text-sm form-input-2026 ${errors.height ? "border-red-500/50" : ""}`}
        />
      ) : (
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              data-ocid="height.feet.input"
              type="number"
              min={3}
              max={8}
              placeholder="Feet"
              value={feet}
              onChange={(e) => handleFeetChange(Number(e.target.value))}
              className="w-full rounded-lg px-3 py-2.5 text-sm form-input-2026"
            />
            <span className="text-xs mt-1 block" style={{ color: "#818cf8" }}>
              feet
            </span>
          </div>
          <div className="flex-1">
            <input
              data-ocid="height.inches.input"
              type="number"
              min={0}
              max={11}
              placeholder="Inches"
              value={inches}
              onChange={(e) => handleInchesChange(Number(e.target.value))}
              className="w-full rounded-lg px-3 py-2.5 text-sm form-input-2026"
            />
            <span className="text-xs mt-1 block" style={{ color: "#818cf8" }}>
              inches
            </span>
          </div>
        </div>
      )}
      {unit === "feet" && data.height > 0 && (
        <p className="text-xs" style={{ color: "#64748b" }}>
          ≈ {data.height} cm
        </p>
      )}
      {errors.height && (
        <p className="text-sm" style={{ color: "#f87171" }}>
          {errors.height}
        </p>
      )}
    </div>
  );
}

function Step1({ data, errors = {}, update }: StepProps) {
  return (
    <div className="space-y-5">
      {/* Unified Offer Card */}
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          background:
            "linear-gradient(135deg, rgba(15,7,40,0.9) 0%, rgba(79,70,229,0.2) 100%)",
          border: "1px solid rgba(129,140,248,0.2)",
          boxShadow: "0 0 30px rgba(99,102,241,0.1)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 animate-shimmer" />
        {/* Gold ribbon */}
        <div
          className="absolute top-0 right-0 w-0 h-0"
          style={{
            borderLeft: "55px solid transparent",
            borderTop: "55px solid #facc15",
          }}
        />
        <div
          className="absolute top-1.5 right-1.5 text-[8px] font-black rotate-45 translate-x-0.5 -translate-y-0.5"
          style={{ color: "#1a0533" }}
        >
          FREE!
        </div>
        <div className="relative p-5 text-center">
          <div
            className="inline-block text-[10px] font-black px-3 py-1 rounded-full tracking-widest uppercase mb-3"
            style={{
              background: "rgba(250,204,21,0.15)",
              border: "1px solid rgba(250,204,21,0.35)",
              color: "#fcd34d",
            }}
          >
            ✨ Exclusive Offer ✨
          </div>
          <div className="text-2xl mb-2">✨ 🎁 ✨</div>
          <p className="font-black text-white text-sm leading-snug mb-1">
            Buy your diet plan &amp; get a FREE weekly tracking call!
          </p>
          <p className="text-sm font-semibold" style={{ color: "#fcd34d" }}>
            Worth ₹999 — absolutely FREE for you 🎉
          </p>
        </div>
      </div>

      <div className="mb-4 rounded-xl overflow-hidden">
        <img
          src="/assets/generated/fit-india-banner.dim_800x200.jpg"
          alt="Fit India Movement - Supporting Wellness for All"
          className="w-full object-cover h-36"
        />
        <div
          className="px-4 py-2 text-center text-sm font-medium"
          style={{
            background: "rgba(15,7,40,0.7)",
            border: "1px solid rgba(129,140,248,0.1)",
            borderTop: "none",
            color: "#94a3b8",
          }}
        >
          🇮🇳 HN Coach proudly supports{" "}
          <span className="font-semibold" style={{ color: "#f97316" }}>
            Fit India Movement
          </span>{" "}
          — Wellness for Every Indian
        </div>
      </div>

      <StepHeading>Personal Information</StepHeading>

      <div className="space-y-2">
        <FieldLabel htmlFor="name">Full Name</FieldLabel>
        <input
          id="name"
          data-ocid="personal.name_input"
          placeholder="e.g. Rahul Sharma"
          value={data.name}
          onChange={(e) => update("name", e.target.value)}
          className={`w-full rounded-lg px-3 py-2.5 text-sm form-input-2026 ${errors.name ? "border-red-500/50" : ""}`}
        />
        {errors.name && (
          <p className="text-sm" style={{ color: "#f87171" }}>
            {errors.name}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <FieldLabel htmlFor="age">Age</FieldLabel>
          <input
            id="age"
            data-ocid="personal.age_input"
            type="number"
            min={10}
            max={100}
            value={data.age}
            onChange={(e) => update("age", Number(e.target.value))}
            className={`w-full rounded-lg px-3 py-2.5 text-sm form-input-2026 ${errors.age ? "border-red-500/50" : ""}`}
          />
          {errors.age && (
            <p className="text-sm" style={{ color: "#f87171" }}>
              {errors.age}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <FieldLabel>Gender</FieldLabel>
          <div
            data-ocid="personal.gender.radio"
            className="grid grid-cols-2 gap-2"
          >
            {(["male", "female"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => update("gender", g)}
                className="p-2.5 rounded-lg text-sm font-medium capitalize transition-all"
                style={{
                  background:
                    data.gender === g
                      ? "rgba(129,140,248,0.15)"
                      : "rgba(15,23,42,0.6)",
                  border:
                    data.gender === g
                      ? "1.5px solid rgba(129,140,248,0.5)"
                      : "1px solid rgba(129,140,248,0.15)",
                  color: data.gender === g ? "#a5b4fc" : "#64748b",
                }}
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
          <FieldLabel htmlFor="weight">Weight (kg)</FieldLabel>
          <input
            id="weight"
            data-ocid="personal.weight_input"
            type="number"
            min={30}
            max={300}
            value={data.weight}
            onChange={(e) => update("weight", Number(e.target.value))}
            className={`w-full rounded-lg px-3 py-2.5 text-sm form-input-2026 ${errors.weight ? "border-red-500/50" : ""}`}
          />
          {errors.weight && (
            <p className="text-sm" style={{ color: "#f87171" }}>
              {errors.weight}
            </p>
          )}
        </div>
      </div>

      {/* WhatsApp Number */}
      <div className="space-y-2">
        <FieldLabel htmlFor="user_whatsapp">Your WhatsApp Number</FieldLabel>
        <input
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
          className="w-full rounded-lg px-3 py-2.5 text-sm form-input-2026"
        />
        <p className="text-xs" style={{ color: "#64748b" }}>
          Your referral link will be generated using this number.
        </p>
      </div>

      {/* Referrer WhatsApp */}
      <div className="space-y-2">
        <FieldLabel htmlFor="referrer_whatsapp">
          Who referred you to HN Coach?{" "}
          <span className="font-normal" style={{ color: "#64748b" }}>
            (Optional)
          </span>
        </FieldLabel>
        <div className="relative">
          <input
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
            className={`w-full rounded-lg px-3 py-2.5 text-sm form-input-2026 ${data.referrer_whatsapp ? "pr-24" : ""}`}
            style={
              data.referrer_whatsapp
                ? {
                    borderColor: "rgba(74,222,128,0.4)",
                    background: "rgba(74,222,128,0.06)",
                  }
                : {}
            }
          />
          {data.referrer_whatsapp && (
            <div
              className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-md px-2 py-0.5"
              style={{
                background: "rgba(74,222,128,0.12)",
                border: "1px solid rgba(74,222,128,0.3)",
              }}
            >
              <Lock className="w-3 h-3" style={{ color: "#4ade80" }} />
              <span
                className="text-xs font-semibold"
                style={{ color: "#4ade80" }}
              >
                Verified
              </span>
            </div>
          )}
        </div>
        {data.referrer_whatsapp && (
          <p
            className="text-xs flex items-center gap-1"
            style={{ color: "#4ade80" }}
          >
            ✅ Referred by +91 {data.referrer_whatsapp}
          </p>
        )}
        {!data.referrer_whatsapp && (
          <p className="text-xs" style={{ color: "#64748b" }}>
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
      <StepHeading>What's Your Goal?</StepHeading>
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
            className="p-4 rounded-xl text-left transition-all"
            style={{
              background:
                data.goal === g.value
                  ? "rgba(99,102,241,0.12)"
                  : "rgba(15,23,42,0.5)",
              border:
                data.goal === g.value
                  ? "1.5px solid rgba(129,140,248,0.5)"
                  : "1px solid rgba(129,140,248,0.12)",
              boxShadow:
                data.goal === g.value
                  ? "0 0 12px rgba(99,102,241,0.15)"
                  : "none",
            }}
          >
            <div className="text-2xl mb-2">{g.emoji}</div>
            <div
              className="font-semibold text-sm"
              style={{ color: data.goal === g.value ? "#a5b4fc" : "#e2e8f0" }}
            >
              {g.label}
            </div>
            <div className="text-xs mt-0.5" style={{ color: "#64748b" }}>
              {g.desc}
            </div>
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
      <StepHeading>Set Your Target</StepHeading>
      <div className="rounded-xl overflow-hidden mb-4 -mt-2">
        <img
          src="/assets/generated/form-goal-targets.dim_400x200.png"
          alt="Step illustration"
          className="w-full h-32 object-cover object-center"
        />
      </div>
      {isLoss && (
        <>
          <div
            className="rounded-xl p-4"
            style={{
              background: "rgba(249,115,22,0.08)",
              border: "1px solid rgba(249,115,22,0.2)",
            }}
          >
            <p className="text-sm" style={{ color: "#fdba74" }}>
              Tell us your weight loss targets so we can calculate your goal
              timeline.
            </p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <FieldLabel htmlFor="target_weight_kg">
                How many kgs do you want to lose?
              </FieldLabel>
              <div className="relative">
                <input
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
                  className="w-full rounded-lg px-3 py-2.5 pr-10 text-sm form-input-2026"
                />
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
                  style={{ color: "#64748b" }}
                >
                  kg
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="target_belly_inches">
                Inches to lose from belly fat?
              </FieldLabel>
              <div className="relative">
                <input
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
                  className="w-full rounded-lg px-3 py-2.5 pr-16 text-sm form-input-2026"
                />
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
                  style={{ color: "#64748b" }}
                >
                  inches
                </span>
              </div>
            </div>
          </div>
        </>
      )}
      {isGain && (
        <>
          <div
            className="rounded-xl p-4"
            style={{
              background: "rgba(74,222,128,0.06)",
              border: "1px solid rgba(74,222,128,0.2)",
            }}
          >
            <p className="text-sm" style={{ color: "#86efac" }}>
              Tell us your weight gain target so we can calculate your goal
              timeline.
            </p>
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="target_weight_kg">
              How many kgs do you want to gain?
            </FieldLabel>
            <div className="relative">
              <input
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
                className="w-full rounded-lg px-3 py-2.5 pr-10 text-sm form-input-2026"
              />
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
                style={{ color: "#64748b" }}
              >
                kg
              </span>
            </div>
          </div>
        </>
      )}
      {!isLoss && !isGain && (
        <div
          className="rounded-xl p-6 text-center"
          style={{
            background: "rgba(129,140,248,0.06)",
            border: "1px solid rgba(129,140,248,0.15)",
          }}
        >
          <div className="text-3xl mb-3">⚖️</div>
          <p className="text-sm font-medium" style={{ color: "#a5b4fc" }}>
            Your goal is{" "}
            <strong>
              {data.goal === "maintenance"
                ? "Maintenance"
                : "Body Recomposition"}
            </strong>
            .
          </p>
          <p className="text-sm mt-1" style={{ color: "#64748b" }}>
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
      <StepHeading>BMR & TDEE Values</StepHeading>
      <div className="rounded-xl overflow-hidden mb-4 -mt-2">
        <img
          src="/assets/generated/form-bmr.dim_400x200.png"
          alt="Step illustration"
          className="w-full h-32 object-cover object-center"
        />
      </div>
      <div
        className="rounded-xl p-4"
        style={{
          background: "rgba(129,140,248,0.06)",
          border: "1px solid rgba(129,140,248,0.15)",
        }}
      >
        <p className="text-sm" style={{ color: "#a5b4fc" }}>
          To know your BMR/TDEE, check your wellness assessment report. Enter
          your BMR and TDEE values from your{" "}
          <strong style={{ color: "#c7d2fe" }}>
            Wellness Assessment Report
          </strong>{" "}
          below.
        </p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <FieldLabel htmlFor="bmr_manual">
            BMR — Basal Metabolic Rate (kcal/day)
          </FieldLabel>
          <div className="relative">
            <input
              id="bmr_manual"
              data-ocid="bmr_tdee.bmr_input"
              type="number"
              min={800}
              max={5000}
              placeholder="e.g. 1650"
              value={data.bmr_manual || ""}
              onChange={(e) => update("bmr_manual", Number(e.target.value))}
              className="w-full rounded-lg px-3 py-2.5 pr-16 text-sm form-input-2026"
            />
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
              style={{ color: "#64748b" }}
            >
              kcal
            </span>
          </div>
          <p className="text-xs" style={{ color: "#64748b" }}>
            Calories your body burns at complete rest.
          </p>
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="tdee_manual">
            TDEE — Total Daily Energy Expenditure (kcal/day)
          </FieldLabel>
          <div className="relative">
            <input
              id="tdee_manual"
              data-ocid="bmr_tdee.tdee_input"
              type="number"
              min={1000}
              max={8000}
              placeholder="e.g. 2200"
              value={data.tdee_manual || ""}
              onChange={(e) => update("tdee_manual", Number(e.target.value))}
              className="w-full rounded-lg px-3 py-2.5 pr-16 text-sm form-input-2026"
            />
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
              style={{ color: "#64748b" }}
            >
              kcal
            </span>
          </div>
          <p className="text-xs" style={{ color: "#64748b" }}>
            Total calories burned including your daily activities.
          </p>
        </div>
      </div>
      {(data.bmr_manual > 0 || data.tdee_manual > 0) && (
        <div
          className="rounded-xl p-4 grid grid-cols-2 gap-3 text-center"
          style={{
            background: "rgba(15,23,42,0.5)",
            border: "1px solid rgba(129,140,248,0.12)",
          }}
        >
          <div>
            <div className="text-xl font-bold gradient-text-vi">
              {data.bmr_manual || "—"}
            </div>
            <div className="text-xs" style={{ color: "#64748b" }}>
              BMR (kcal)
            </div>
          </div>
          <div>
            <div className="text-xl font-bold" style={{ color: "#fb923c" }}>
              {data.tdee_manual || "—"}
            </div>
            <div className="text-xs" style={{ color: "#64748b" }}>
              TDEE (kcal)
            </div>
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
      <StepHeading>Meal Frequency</StepHeading>
      <div className="rounded-xl overflow-hidden mb-4 -mt-2">
        <img
          src="/assets/generated/form-meal-frequency.dim_400x200.png"
          alt="Step illustration"
          className="w-full h-32 object-cover object-center"
        />
      </div>
      <p className="text-sm" style={{ color: "#94a3b8" }}>
        Select how long you prefer to wait between meals:
      </p>
      <div className="grid grid-cols-3 gap-4" data-ocid="meal_gap.select">
        {MEAL_GAP_OPTIONS.map((opt, i) => (
          <button
            key={opt.value}
            type="button"
            data-ocid={`meal_gap.item.${i + 1}`}
            onClick={() => update("meal_gap", opt.value)}
            className="p-4 rounded-xl text-center transition-all"
            style={{
              background:
                data.meal_gap === opt.value
                  ? "rgba(99,102,241,0.12)"
                  : "rgba(15,23,42,0.5)",
              border:
                data.meal_gap === opt.value
                  ? "1.5px solid rgba(129,140,248,0.5)"
                  : "1px solid rgba(129,140,248,0.12)",
              boxShadow:
                data.meal_gap === opt.value
                  ? "0 0 12px rgba(99,102,241,0.15)"
                  : "none",
            }}
          >
            <div className="text-2xl mb-1.5">{opt.emoji}</div>
            <div
              className="text-xl font-bold"
              style={{
                color: data.meal_gap === opt.value ? "#a5b4fc" : "#e2e8f0",
              }}
            >
              {opt.value}h
            </div>
            <div
              className="text-xs font-medium mt-0.5"
              style={{ color: "#94a3b8" }}
            >
              {opt.label}
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: "#64748b" }}>
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
      <StepHeading>Health Conditions</StepHeading>
      <div className="rounded-xl overflow-hidden mb-4 -mt-2">
        <img
          src="/assets/generated/form-health-condition.dim_400x200.png"
          alt="Step illustration"
          className="w-full h-32 object-cover object-center"
        />
      </div>
      <p className="text-sm font-medium" style={{ color: "#e2e8f0" }}>
        Select your present health conditions:
      </p>
      <div className="grid sm:grid-cols-2 gap-2">
        {HEALTH_CONDITIONS.map((condition, i) => (
          <div
            key={condition}
            data-ocid={`conditions.checkbox.${i + 1}`}
            className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors"
            style={{
              background: data.health_conditions.includes(condition)
                ? "rgba(99,102,241,0.1)"
                : "rgba(15,23,42,0.4)",
              border: data.health_conditions.includes(condition)
                ? "1px solid rgba(129,140,248,0.3)"
                : "1px solid rgba(129,140,248,0.08)",
            }}
            onClick={() => toggleArrayItem?.("health_conditions", condition)}
            onKeyDown={(e) =>
              e.key === "Enter" &&
              toggleArrayItem?.("health_conditions", condition)
            }
          >
            <Checkbox
              checked={data.health_conditions.includes(condition)}
              onCheckedChange={() =>
                toggleArrayItem?.("health_conditions", condition)
              }
            />
            <span className="text-sm font-medium" style={{ color: "#e2e8f0" }}>
              {condition}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Step9({ data, update }: StepProps) {
  return (
    <div className="space-y-6">
      <StepHeading>Sleep Schedule</StepHeading>
      <div className="rounded-xl overflow-hidden mb-4 -mt-2">
        <img
          src="/assets/generated/form-sleep-schedule.dim_400x200.png"
          alt="Step illustration"
          className="w-full h-32 object-cover object-center"
        />
      </div>
      <div className="space-y-4">
        <p className="text-sm font-medium" style={{ color: "#e2e8f0" }}>
          Sleep timings
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <FieldLabel htmlFor="bed_time">Bed Time</FieldLabel>
            <input
              id="bed_time"
              data-ocid="sleep.bed_time_input"
              type="time"
              value={data.bed_time}
              onChange={(e) => update("bed_time", e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 text-sm form-input-2026"
            />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="wake_up_time">Wake Up Time</FieldLabel>
            <input
              id="wake_up_time"
              data-ocid="sleep.wake_up_input"
              type="time"
              value={data.wake_up_time}
              onChange={(e) => update("wake_up_time", e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 text-sm form-input-2026"
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
              <div
                className="rounded-xl p-3 text-sm text-center"
                style={{
                  background: "rgba(129,140,248,0.06)",
                  border: "1px solid rgba(129,140,248,0.12)",
                }}
              >
                <span style={{ color: "#94a3b8" }}>Sleep duration: </span>
                <strong className="gradient-text-vi">
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
      <StepHeading>Daily Macro Targets</StepHeading>
      <div className="rounded-xl overflow-hidden mb-4 -mt-2">
        <img
          src="/assets/generated/form-nutrition.dim_400x200.png"
          alt="Step illustration"
          className="w-full h-32 object-cover object-center"
        />
      </div>
      <div
        className="flex items-start gap-2 rounded-xl p-4"
        style={{
          background: "rgba(74,222,128,0.06)",
          border: "1px solid rgba(74,222,128,0.15)",
        }}
      >
        <Apple
          className="w-4 h-4 mt-0.5 shrink-0"
          style={{ color: "#4ade80" }}
        />
        <p className="text-sm" style={{ color: "#86efac" }}>
          Enter your macro targets as recommended in your{" "}
          <strong style={{ color: "#a7f3d0" }}>
            Wellness Assessment Report
          </strong>
          . To know your nutrition requirement, check your wellness assessment
          report.
        </p>
      </div>
      <p className="text-sm font-medium" style={{ color: "#e2e8f0" }}>
        Daily macro targets (grams)
      </p>
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            id: "protein_target",
            label: "Protein (g)",
            key: "protein_target" as const,
            ph: "e.g. 120",
          },
          {
            id: "fat_target",
            label: "Fat (g)",
            key: "fat_target" as const,
            ph: "e.g. 60",
          },
          {
            id: "carbs_target",
            label: "Carbs (g)",
            key: "carbs_target" as const,
            ph: "e.g. 250",
          },
        ].map(({ id, label, key, ph }) => (
          <div key={id} className="space-y-2">
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            <input
              id={id}
              data-ocid={`macros.${key}_input`}
              type="number"
              min={0}
              placeholder={ph}
              value={data[key] || ""}
              onChange={(e) => update(key, Number(e.target.value))}
              className="w-full rounded-lg px-3 py-2.5 text-sm form-input-2026"
            />
          </div>
        ))}
      </div>
      <div
        className="rounded-xl p-4 grid grid-cols-3 gap-3 text-center"
        style={{
          background: "rgba(15,23,42,0.5)",
          border: "1px solid rgba(129,140,248,0.1)",
        }}
      >
        <div>
          <div className="text-xl font-bold" style={{ color: "#86efac" }}>
            {data.protein_target || "—"}g
          </div>
          <div className="text-xs" style={{ color: "#64748b" }}>
            Protein
          </div>
        </div>
        <div>
          <div className="text-xl font-bold" style={{ color: "#fbbf24" }}>
            {data.fat_target || "—"}g
          </div>
          <div className="text-xs" style={{ color: "#64748b" }}>
            Fat
          </div>
        </div>
        <div>
          <div className="text-xl font-bold gradient-text-vi">
            {data.carbs_target || "—"}g
          </div>
          <div className="text-xs" style={{ color: "#64748b" }}>
            Carbs
          </div>
        </div>
      </div>
    </div>
  );
}
