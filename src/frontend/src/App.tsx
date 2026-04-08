import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import DietForm from "./components/DietForm";
import DietResult from "./components/DietResult";
import { createActorWithConfig } from "./config";
import type { DietPlan } from "./types/backend-types";
import { defaultFormData } from "./types/diet";
import type { FormData } from "./types/diet";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const LS_KEY = "hn_coach_last_report";
const LS_PAID_KEY = "hn_coach_paid";
const FIXED_PRICE = 499;

type AppView = "form" | "payment" | "result";

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function App() {
  return <MainApp />;
}

function MainApp() {
  const [view, setView] = useState<AppView>("form");
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [pendingPlan, setPendingPlan] = useState<DietPlan | null>(null);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [hasPreviousReport, setHasPreviousReport] = useState(() => {
    try {
      return !!localStorage.getItem("hn_coach_last_report");
    } catch (_) {
      return false;
    }
  });

  function handlePlanGenerated(plan: DietPlan, data: FormData) {
    try {
      localStorage.removeItem(LS_PAID_KEY);
    } catch (_) {}
    setPendingPlan(plan);
    setPendingFormData(data);
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ plan, formData: data }));
    } catch (_) {}
    setView("payment");
  }

  function handleStartOver() {
    setDietPlan(null);
    setFormData(null);
    setPendingPlan(null);
    setPendingFormData(null);
    setView("form");
  }

  function handleViewPreviousReport() {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const { plan, formData: savedFormData } = JSON.parse(saved);
        const mergedFormData = { ...defaultFormData, ...savedFormData };
        setDietPlan(plan);
        setFormData(mergedFormData);
        setView("result");
      }
    } catch (_) {
      try {
        localStorage.removeItem(LS_KEY);
      } catch (_e) {}
    }
  }

  async function handleProceedToPay() {
    setIsPaymentLoading(true);
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      alert(
        "Could not load payment gateway. Please check your internet connection and try again.",
      );
      setIsPaymentLoading(false);
      return;
    }

    const price = FIXED_PRICE;
    const options = {
      key: "rzp_live_SNoVPUAavv60C9",
      amount: price * 100,
      currency: "INR",
      name: "HN Coach",
      description: "Personalized Diet Plan",
      image: "/assets/uploads/IMG-20260226-WA0000-2.jpg",
      handler: () => {
        try {
          localStorage.setItem(LS_PAID_KEY, "true");
          setHasPreviousReport(true);
        } catch (_) {}

        try {
          const reports = JSON.parse(
            localStorage.getItem("hn_coach_reports") || "[]",
          );
          reports.push({
            id: Date.now().toString(),
            name: pendingFormData?.name || "",
            whatsapp: pendingFormData?.user_whatsapp || "",
            referredBy: pendingFormData?.referrer_whatsapp || "",
            goal: pendingFormData?.goal || "",
            amount: price,
            paidAt: new Date().toISOString(),
            rewardPaid: false,
          });
          localStorage.setItem("hn_coach_reports", JSON.stringify(reports));
        } catch (_) {}

        createActorWithConfig()
          .then((actor) =>
            actor.addAdminReport({
              id: Date.now().toString(),
              name: pendingFormData?.name || "",
              whatsapp: pendingFormData?.user_whatsapp || "",
              referredBy: pendingFormData?.referrer_whatsapp || "",
              goal: pendingFormData?.goal || "",
              amount: price,
              paidAt: new Date().toISOString(),
              rewardPaid: false,
            }),
          )
          .catch(() => {});

        setDietPlan(pendingPlan);
        setFormData(pendingFormData);
        setView("result");
        setIsPaymentLoading(false);
      },
      modal: {
        ondismiss: () => {
          setIsPaymentLoading(false);
          setView("form");
        },
      },
      prefill: {
        contact: pendingFormData?.user_whatsapp || "",
      },
      theme: {
        color: "#6366f1",
      },
    };

    setIsPaymentLoading(false);
    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster richColors position="top-right" />
      {view === "form" && (
        <DietForm
          onComplete={handlePlanGenerated}
          onViewPreviousReport={handleViewPreviousReport}
          hasPreviousReport={hasPreviousReport}
        />
      )}
      {view === "payment" && (
        <PaymentPage
          isPaymentLoading={isPaymentLoading}
          onPay={handleProceedToPay}
          onBack={() => setView("form")}
          fixedPrice={FIXED_PRICE}
        />
      )}
      {view === "result" && dietPlan && formData && (
        <DietResult
          plan={dietPlan}
          formData={formData}
          onStartOver={handleStartOver}
        />
      )}
    </div>
  );
}

interface PaymentPageProps {
  isPaymentLoading: boolean;
  onPay: () => void;
  onBack: () => void;
  fixedPrice: number;
}

function PaymentPage({
  isPaymentLoading,
  onPay,
  onBack,
  fixedPrice,
}: PaymentPageProps) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden mesh-bg"
      style={{
        background:
          "linear-gradient(145deg, #020617 0%, #0f0728 40%, #1e1048 75%, #2d1b69 100%)",
      }}
    >
      {/* Mesh orb */}
      <div className="mesh-orb" />

      {/* Subtle floating particles */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        {["✦", "✧", "✦", "✧", "✦", "✧", "✦", "✧"].map((s, i) => (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: static decorative list
            key={i}
            className="absolute text-indigo2-400 animate-sparkle"
            style={{
              left: `${10 + i * 11}%`,
              top: `${8 + (i % 4) * 22}%`,
              fontSize: "10px",
              opacity: 0.3,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + (i % 3) * 1.2}s`,
            }}
          >
            {s}
          </span>
        ))}
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* "Limited Offer" badge */}
        <div className="flex justify-center mb-5">
          <span
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest"
            style={{
              background:
                "linear-gradient(135deg, rgba(129,140,248,0.2), rgba(99,102,241,0.15))",
              border: "1px solid rgba(129,140,248,0.3)",
              color: "#a5b4fc",
            }}
          >
            <span className="w-2 h-2 rounded-full bg-indigo2-400 animate-pulse inline-block" />
            Limited Early Bird Price
          </span>
        </div>

        {/* Main card */}
        <div className="glass-card-light rounded-3xl overflow-hidden">
          {/* Header */}
          <div
            className="px-7 py-7 text-center relative"
            style={{
              background:
                "linear-gradient(135deg, rgba(129,140,248,0.12) 0%, rgba(99,102,241,0.06) 100%)",
              borderBottom: "1px solid rgba(129,140,248,0.1)",
            }}
          >
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
              style={{
                background:
                  "linear-gradient(135deg, rgba(129,140,248,0.2), rgba(99,102,241,0.15))",
                border: "1px solid rgba(129,140,248,0.25)",
              }}
            >
              <span className="text-2xl">🎉</span>
            </div>
            <h2
              className="text-2xl font-black leading-tight mb-2"
              style={{ color: "#f1f5f9", letterSpacing: "-0.02em" }}
            >
              Your Personalized Diet Plan
              <br />
              <span className="gradient-text-gold">is Ready!</span>
            </h2>
            <p className="text-sm" style={{ color: "#94a3b8" }}>
              Join{" "}
              <span className="font-bold" style={{ color: "#fbbf24" }}>
                99+ people
              </span>{" "}
              who transformed their health with HN Coach
            </p>
          </div>

          <div className="px-7 py-7 space-y-5">
            {/* Price display */}
            <div className="text-center">
              <div
                className="text-xs uppercase tracking-widest mb-2"
                style={{ color: "#64748b" }}
              >
                Your Investment Today
              </div>
              <div
                className="rounded-2xl px-6 py-4 mb-3"
                style={{
                  background: "rgba(250,204,21,0.06)",
                  border: "1px solid rgba(250,204,21,0.2)",
                }}
              >
                <div className="flex items-center justify-center gap-4 mb-2">
                  <span
                    className="line-through text-xl font-bold"
                    style={{ color: "#475569" }}
                  >
                    ₹1,999
                  </span>
                  <span
                    className="text-5xl font-black"
                    style={{
                      color: "#facc15",
                      textShadow: "0 0 25px rgba(250,204,21,0.5)",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    ₹{fixedPrice}
                  </span>
                </div>
                <span
                  className="inline-block font-bold text-xs px-3 py-1 rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(239,68,68,0.8), rgba(249,115,22,0.8))",
                    color: "white",
                  }}
                >
                  🔥 YOU SAVE ₹{1999 - fixedPrice} — Early Bird Special
                </span>
              </div>
            </div>

            {/* FREE Bonus box */}
            <div
              className="rounded-xl p-4 text-center"
              style={{
                background: "rgba(250,204,21,0.06)",
                border: "1px solid rgba(250,204,21,0.2)",
              }}
            >
              <div className="text-xl mb-1">🎁</div>
              <div
                className="font-black text-sm mb-1"
                style={{ color: "#fcd34d" }}
              >
                BONUS: FREE Weekly Coaching Call
              </div>
              <div className="text-xs" style={{ color: "#64748b" }}>
                1-on-1 guidance from our HN Coach team ·{" "}
                <span className="line-through" style={{ color: "#475569" }}>
                  Worth ₹999
                </span>{" "}
                <span className="font-bold" style={{ color: "#fcd34d" }}>
                  Yours FREE!
                </span>
              </div>
            </div>

            {/* What you get */}
            <div className="space-y-2.5">
              {[
                [
                  "7-Day Personalized Diet Plan",
                  "Tailored to your body & goals",
                ],
                [
                  "Macro & Micro Nutrient Targets",
                  "Scientifically calculated RDAs",
                ],
                ["Daily Wellness Goals", "Hydration, steps, sleep & more"],
                ["Referral & Earn Program", "Help friends, earn rewards"],
              ].map(([title, sub]) => (
                <div key={title} className="flex items-start gap-3">
                  <span
                    className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black"
                    style={{
                      background: "linear-gradient(135deg, #4ade80, #22c55e)",
                      color: "white",
                    }}
                  >
                    ✓
                  </span>
                  <div>
                    <div
                      className="font-semibold text-sm"
                      style={{ color: "#e2e8f0" }}
                    >
                      {title}
                    </div>
                    <div className="text-xs" style={{ color: "#64748b" }}>
                      {sub}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <button
              type="button"
              data-ocid="payment.primary_button"
              onClick={onPay}
              disabled={isPaymentLoading}
              className="w-full py-4 rounded-2xl text-white font-black text-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed pay-cta-pulse"
              style={{
                background: isPaymentLoading
                  ? "#374151"
                  : "linear-gradient(135deg, #f97316, #ef4444)",
                boxShadow: isPaymentLoading
                  ? "none"
                  : "0 0 35px rgba(249,115,22,0.5), 0 8px 28px rgba(239,68,68,0.4)",
                letterSpacing: "-0.01em",
              }}
            >
              {isPaymentLoading ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                `🔥 Pay Securely ₹${fixedPrice} — Get My Plan`
              )}
            </button>

            {/* Security line */}
            <p className="text-center text-xs" style={{ color: "#475569" }}>
              🔒 Your payment is 256-bit SSL encrypted
            </p>

            {/* Trust badges row */}
            <div
              className="rounded-xl px-4 py-3"
              style={{
                background: "rgba(129,140,248,0.05)",
                border: "1px solid rgba(129,140,248,0.1)",
              }}
            >
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">🔒</span>
                  <span
                    className="text-xs font-medium"
                    style={{ color: "#94a3b8" }}
                  >
                    100% Secure
                  </span>
                </div>
                <div className="w-px h-3 bg-slate-700" />
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">💳</span>
                  <span
                    className="text-xs font-medium"
                    style={{ color: "#94a3b8" }}
                  >
                    Razorpay Secured
                  </span>
                </div>
                <div className="w-px h-3 bg-slate-700" />
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">⚡</span>
                  <span
                    className="text-xs font-medium"
                    style={{ color: "#94a3b8" }}
                  >
                    Instant Access
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              data-ocid="payment.cancel_button"
              onClick={onBack}
              className="w-full py-2 text-sm transition-colors text-center"
              style={{ color: "#475569" }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.color = "#94a3b8";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.color = "#475569";
              }}
            >
              ← Go back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
