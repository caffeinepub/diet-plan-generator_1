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
  // Step 3 - Activity Level
  activity_level:
    | "sedentary"
    | "lightly_active"
    | "moderately_active"
    | "very_active"
    | "extra_active";
  // Step 4 - Dietary Preferences
  dietary_preferences: string[];
  // Step 5 - Food Allergies
  food_allergies: string[];
  other_allergies: string;
  // Step 6 - Meal Frequency
  meals_per_day: number;
  meal_gap: number; // hours between meals: 3, 4, or 5
  // Step 7 - Water Intake
  water_intake: number;
  // Step 8 - Health Conditions
  health_conditions: string[];
  // Step 9 - Sleep
  sleep_hours: number;
  bed_time: string;
  wake_up_time: string;
  // Macros from wellness assessment
  protein_target: number;
  fat_target: number;
  carbs_target: number;
  // Step 10 - Stress
  stress_level: "low" | "moderate" | "high" | "very_high";
  // Step 11 - Supplements
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
  activity_level: "moderately_active",
  dietary_preferences: [],
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
  supplements: [],
  other_supplements: "",
};
