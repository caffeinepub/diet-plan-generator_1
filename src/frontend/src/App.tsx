import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import type { DietPlan } from "./backend.d";
import DietForm from "./components/DietForm";
import DietResult from "./components/DietResult";
import type { FormData } from "./types/diet";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const LS_KEY = "hn_coach_last_report";
const LS_PAID_KEY = "hn_coach_paid";
const LS_DOWNLOAD_COUNT_KEY = "hncoach_download_count";

type AppView = "form" | "payment" | "result";

function getDownloadCount(): number {
  try {
    return Number.parseInt(localStorage.getItem(LS_DOWNLOAD_COUNT_KEY) || "53");
  } catch (_) {
    return 53;
  }
}

function getCurrentPrice(): number {
  const count = getDownloadCount();
  return count <= 100 ? 101 : 299;
}

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
  const [view, setView] = useState<AppView>("form");
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [pendingPlan, setPendingPlan] = useState<DietPlan | null>(null);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(getCurrentPrice);

  useEffect(() => {
    setCurrentPrice(getCurrentPrice());
  }, []);

  function handlePlanGenerated(plan: DietPlan, data: FormData) {
    // Reset paid flag for new report
    try {
      localStorage.removeItem(LS_PAID_KEY);
    } catch (_) {}
    setPendingPlan(plan);
    setPendingFormData(data);
    // Save report immediately so it can be shown after payment
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
        setDietPlan(plan);
        setFormData(savedFormData);
        setView("result");
      }
    } catch (_) {}
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

    const price = currentPrice;
    const options = {
      key: "rzp_live_SNoVPUAavv60C9",
      amount: price * 100,
      currency: "INR",
      name: "HN Coach",
      description: "Personalized Diet Plan",
      image: "/assets/uploads/IMG-20260226-WA0000-2.jpg",
      handler: () => {
        // Payment successful
        try {
          localStorage.setItem(LS_PAID_KEY, "true");
          const count = getDownloadCount();
          localStorage.setItem(LS_DOWNLOAD_COUNT_KEY, String(count + 1));
        } catch (_) {}
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
        color: "#0d9488",
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
        />
      )}
      {view === "payment" && (
        <div
          className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #0f0c29 0%, #302b63 40%, #0f3460 70%, #0d7377 100%)",
          }}
        >
          {/* Floating sparkles */}
          <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
            {["✨", "⭐", "🌟", "💫", "✨", "⭐", "🌟", "💫", "✨", "🌟"].map(
              (s, i) => (
                <span
                  // biome-ignore lint/suspicious/noArrayIndexKey: static decorative list
                  key={i}
                  className="absolute text-xl animate-bounce opacity-60"
                  style={{
                    left: `${8 + i * 9}%`,
                    top: `${10 + (i % 4) * 20}%`,
                    animationDelay: `${i * 0.3}s`,
                    animationDuration: `${2 + (i % 3) * 0.8}s`,
                  }}
                >
                  {s}
                </span>
              ),
            )}
          </div>

          <div className="w-full max-w-lg relative z-10">
            {/* Top badge */}
            <div className="flex justify-center mb-4">
              <span className="bg-yellow-400 text-yellow-900 font-black text-sm px-5 py-2 rounded-full animate-pulse shadow-lg shadow-yellow-400/40 uppercase tracking-wider">
                ⏰ Limited Early Bird Price — Only a few spots left!
              </span>
            </div>

            {/* Main card */}
            <div
              className="rounded-3xl overflow-hidden shadow-2xl"
              style={{
                background: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              {/* Header */}
              <div
                className="px-8 py-8 text-center"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)",
                }}
              >
                <div className="text-5xl mb-3">🎉</div>
                <h2 className="text-3xl font-black text-white leading-tight mb-2">
                  Your Personalized Diet Plan
                  <br />
                  <span
                    className="text-transparent bg-clip-text"
                    style={{
                      backgroundImage:
                        "linear-gradient(90deg, #facc15, #fb923c)",
                    }}
                  >
                    is Ready!
                  </span>
                </h2>
                <p className="text-white/70 text-sm">
                  Join{" "}
                  <span className="text-yellow-300 font-bold">53+ people</span>{" "}
                  who transformed their health with HN Coach
                </p>
              </div>

              <div className="px-8 py-8 space-y-6">
                {/* Price display */}
                <div className="text-center">
                  <div className="text-white/60 text-sm mb-2 uppercase tracking-widest">
                    Your Investment Today
                  </div>
                  <div className="flex items-center justify-center gap-4 mb-3">
                    <span className="text-gray-400 line-through text-2xl font-bold">
                      ₹1,000
                    </span>
                    <span
                      className="text-6xl font-black"
                      style={{
                        color: "#facc15",
                        textShadow: "0 0 30px rgba(250,204,21,0.6)",
                      }}
                    >
                      ₹{currentPrice}
                    </span>
                  </div>
                  <span
                    className="inline-block font-black text-sm px-4 py-2 rounded-full"
                    style={{
                      background: "linear-gradient(90deg, #ef4444, #f97316)",
                      color: "white",
                    }}
                  >
                    🔥 YOU SAVE ₹{1000 - currentPrice}! —{" "}
                    {currentPrice === 101
                      ? "Early Bird Special"
                      : "Limited Time"}
                  </span>
                </div>

                {/* FREE Bonus box */}
                <div
                  className="rounded-2xl p-5 text-center"
                  style={{
                    background: "rgba(250,204,21,0.08)",
                    border: "2px solid rgba(250,204,21,0.5)",
                    boxShadow: "0 0 20px rgba(250,204,21,0.15)",
                  }}
                >
                  <div className="text-2xl mb-1">🎁</div>
                  <div className="text-yellow-300 font-black text-base mb-1">
                    BONUS: FREE Weekly Coaching Call
                  </div>
                  <div className="text-white/60 text-sm">
                    1-on-1 guidance from our HN Coach team •{" "}
                    <span className="line-through text-white/40">
                      Worth ₹999
                    </span>{" "}
                    <span className="text-yellow-300 font-bold">
                      Yours FREE!
                    </span>
                  </div>
                </div>

                {/* What you get */}
                <div className="space-y-3">
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
                        className="mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-black"
                        style={{
                          background:
                            "linear-gradient(135deg, #10b981, #059669)",
                          color: "white",
                        }}
                      >
                        ✓
                      </span>
                      <div>
                        <div className="text-white font-bold text-sm">
                          {title}
                        </div>
                        <div className="text-white/50 text-xs">{sub}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button
                  type="button"
                  data-ocid="payment.primary_button"
                  onClick={handleProceedToPay}
                  disabled={isPaymentLoading}
                  className="w-full py-5 rounded-2xl text-white font-black text-xl shadow-2xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    background: isPaymentLoading
                      ? "#6b7280"
                      : "linear-gradient(135deg, #f97316, #ef4444)",
                    boxShadow: isPaymentLoading
                      ? "none"
                      : "0 0 40px rgba(249,115,22,0.5), 0 8px 32px rgba(239,68,68,0.4)",
                    animation: isPaymentLoading
                      ? "none"
                      : "ctaPulse 2s ease-in-out infinite",
                  }}
                >
                  {isPaymentLoading ? (
                    <span className="flex items-center justify-center gap-3">
                      <span className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    `🔥 Get My Diet Plan Now — ₹${currentPrice}`
                  )}
                </button>

                {/* Trust signals */}
                <div className="flex items-center justify-center gap-4 flex-wrap text-white/50 text-xs">
                  <span>🔒 100% Secure</span>
                  <span>⚡ Instant Access</span>
                  <span>✅ Satisfaction Guaranteed</span>
                </div>

                <button
                  type="button"
                  data-ocid="payment.cancel_button"
                  onClick={() => setView("form")}
                  className="w-full py-2 text-white/30 hover:text-white/60 text-sm transition-colors text-center"
                >
                  ← Go back
                </button>
              </div>
            </div>
          </div>

          <style>{`
            @keyframes ctaPulse {
              0%, 100% { transform: scale(1); box-shadow: 0 0 40px rgba(249,115,22,0.5), 0 8px 32px rgba(239,68,68,0.4); }
              50% { transform: scale(1.02); box-shadow: 0 0 60px rgba(249,115,22,0.8), 0 12px 40px rgba(239,68,68,0.6); }
            }
          `}</style>
        </div>
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
