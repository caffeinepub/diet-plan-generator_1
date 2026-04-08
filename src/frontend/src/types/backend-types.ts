// Custom HN Coach types — separate from the generated backend.d.ts
// This file defines the domain types used across the frontend.

export interface Meal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  ingredients: string[];
}

export interface DayPlan {
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snacks: Meal[];
}

export interface MacronutrientBreakdown {
  protein: number;
  carbs: number;
  fats: number;
}

export interface DietPlan {
  bmr: number;
  tdee: number;
  daily_calories: number;
  hydration_recommendation: number;
  macros: MacronutrientBreakdown;
  health_tips: string[];
  weekly_plan: DayPlan[];
  profile_id: string;
}

// Enum types used by dietCalculator
export enum Gender {
  male = "male",
  female = "female",
}

export enum HealthGoal {
  weight_loss = "weight_loss",
  muscle_gain = "muscle_gain",
  maintenance = "maintenance",
  body_recomposition = "body_recomposition",
}

export enum ActivityLevel {
  sedentary = "sedentary",
  lightly_active = "lightly_active",
  moderately_active = "moderately_active",
  very_active = "very_active",
  extra_active = "extra_active",
}

export enum StressLevel {
  low = "low",
  moderate = "moderate",
  high = "high",
  very_high = "very_high",
}
