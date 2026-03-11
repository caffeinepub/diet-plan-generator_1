import type { DietPlan } from "../backend.d";

export interface FormData {
  // Step 1 - Personal Details
  name: string;
  age: number;
  gender: "male" | "female";
  height: number;
  weight: number;
  // Step 2 - Health Goal
  goal: "weight_loss" | "muscle_gain" | "maintenance" | "body_recomposition";
  // Step 3 - Goal Targets (conditional on goal)
  target_weight_kg: number; // kgs to lose (weight_loss) or gain (muscle_gain)
  target_belly_inches: number; // belly fat inches to lose (weight_loss only)
  // Step 4 - Activity Level
  activity_level:
    | "sedentary"
    | "lightly_active"
    | "moderately_active"
    | "very_active"
    | "extra_active";
  // Step 5 - Dietary Preferences
  dietary_preferences: string[];
  // Step 6 - Food Allergies (free text)
  food_allergies_text: string;
  // kept for backward compat with backend save
  food_allergies: string[];
  other_allergies: string;
  // Step 7 - Meal Frequency
  meals_per_day: number;
  meal_gap: number; // hours between meals: 3, 4, or 5
  // Step 8 - Water Intake
  water_intake: number;
  // Step 9 - Health Conditions
  health_conditions: string[];
  // Step 10 - Sleep
  sleep_hours: number;
  bed_time: string;
  wake_up_time: string;
  // Step 11 - Nutrition Targets (macros from wellness report)
  protein_target: number;
  fat_target: number;
  carbs_target: number;
  // Step 12 - Stress
  stress_level: "low" | "moderate" | "high" | "very_high";
  // Step 13 - BMR & TDEE (manual entry)
  bmr_manual: number;
  tdee_manual: number;
  // Step 14 - Supplements
  supplements: string[];
  other_supplements: string;
}

export type { DietPlan };

export const defaultFormData: FormData = {
  name: "",
  age: 25,
  gender: "male",
  height: 170,
  weight: 70,
  goal: "maintenance",
  target_weight_kg: 0,
  target_belly_inches: 0,
  activity_level: "moderately_active",
  dietary_preferences: [],
  food_allergies_text: "",
  food_allergies: [],
  other_allergies: "",
  meals_per_day: 3,
  meal_gap: 4,
  water_intake: 2,
  health_conditions: [],
  sleep_hours: 7,
  bed_time: "22:00",
  wake_up_time: "06:00",
  protein_target: 0,
  fat_target: 0,
  carbs_target: 0,
  stress_level: "moderate",
  bmr_manual: 0,
  tdee_manual: 0,
  supplements: [],
  other_supplements: "",
};
