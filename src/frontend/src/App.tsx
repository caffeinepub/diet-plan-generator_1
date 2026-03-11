import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import type { DietPlan } from "./backend.d";
import DietForm from "./components/DietForm";
import DietResult from "./components/DietResult";
import type { FormData } from "./types/diet";

const LS_KEY = "hn_coach_last_report";

type AppView = "form" | "result";

export default function App() {
  const [view, setView] = useState<AppView>("form");
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);

  function handlePlanGenerated(plan: DietPlan, data: FormData) {
    setDietPlan(plan);
    setFormData(data);
    setView("result");
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ plan, formData: data }));
    } catch (_) {}
  }

  function handleStartOver() {
    setDietPlan(null);
    setFormData(null);
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

  return (
    <div className="min-h-screen bg-background">
      <Toaster richColors position="top-right" />
      {view === "form" ? (
        <DietForm
          onComplete={handlePlanGenerated}
          onViewPreviousReport={handleViewPreviousReport}
        />
      ) : (
        dietPlan &&
        formData && (
          <DietResult
            plan={dietPlan}
            formData={formData}
            onStartOver={handleStartOver}
          />
        )
      )}
    </div>
  );
}
