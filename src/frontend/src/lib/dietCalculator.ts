import type { DietPlan, MacronutrientBreakdown } from "../backend.d";
import { ActivityLevel, Gender, HealthGoal, StressLevel } from "../backend.d";
import type { FormData } from "../types/diet";
import { generateWeeklyPlan } from "./mealGenerator";

export function calculateBMR(data: FormData): number {
  const { weight, height, age, gender } = data;
  if (gender === "male") {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  }
  return 10 * weight + 6.25 * height - 5 * age - 161;
}

export function calculateTDEE(
  bmr: number,
  activityLevel: FormData["activity_level"],
): number {
  const multipliers: Record<FormData["activity_level"], number> = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9,
  };
  return bmr * multipliers[activityLevel];
}

export function calculateDailyCalories(
  tdee: number,
  goal: FormData["goal"],
): number {
  const adjustments: Record<FormData["goal"], number> = {
    weight_loss: -500,
    muscle_gain: 300,
    maintenance: 0,
    body_recomposition: -200,
  };
  return tdee + adjustments[goal];
}

export function calculateMacros(
  dailyCalories: number,
  goal: FormData["goal"],
): MacronutrientBreakdown {
  const splits: Record<
    FormData["goal"],
    { protein: number; carbs: number; fat: number }
  > = {
    weight_loss: { protein: 0.35, carbs: 0.35, fat: 0.3 },
    muscle_gain: { protein: 0.3, carbs: 0.5, fat: 0.2 },
    maintenance: { protein: 0.25, carbs: 0.5, fat: 0.25 },
    body_recomposition: { protein: 0.35, carbs: 0.4, fat: 0.25 },
  };
  const split = splits[goal];
  return {
    protein: Math.round((dailyCalories * split.protein) / 4),
    carbs: Math.round((dailyCalories * split.carbs) / 4),
    fats: Math.round((dailyCalories * split.fat) / 9),
  };
}

export function calculateHydration(
  weight: number,
  activityLevel: FormData["activity_level"],
): number {
  let hydration = weight * 0.033;
  if (activityLevel === "very_active" || activityLevel === "extra_active") {
    hydration += 0.5;
  }
  return Math.round(hydration * 10) / 10;
}

export function generateHealthTips(
  goal: FormData["goal"],
  conditions: string[],
  activityLevel: FormData["activity_level"],
  stressLevel: FormData["stress_level"],
  sleepHours: number,
): string[] {
  const tips: string[] = [];

  // Universal
  tips.push(
    "Stay consistent with your meal timing to optimize metabolism and energy levels.",
  );
  tips.push(
    "Track your food intake for at least 2 weeks to build awareness of your eating habits.",
  );

  // Goal-based
  if (goal === "weight_loss") {
    tips.push(
      "Focus on whole, nutrient-dense foods high in fiber and lean protein to stay satiated longer.",
    );
    tips.push(
      "Eating slowly and mindfully can reduce overall calorie intake by up to 20% without feeling deprived.",
    );
  } else if (goal === "muscle_gain") {
    tips.push(
      "Consume protein within 30-60 minutes post-workout to maximize muscle protein synthesis.",
    );
    tips.push(
      "Progressive overload in resistance training is essential — gradually increase weights each week.",
    );
  } else if (goal === "body_recomposition") {
    tips.push(
      "Combine resistance training with a slight calorie deficit to simultaneously lose fat and gain muscle.",
    );
    tips.push(
      "Be patient — body recomposition is slower than pure weight loss but delivers superior long-term results.",
    );
  } else {
    tips.push(
      "Maintenance is about balance — focus on food quality and variety rather than strict calorie counting.",
    );
  }

  // Condition-based
  if (conditions.includes("Diabetes (Type 2)")) {
    tips.push(
      "Monitor blood glucose regularly. Distribute carbohydrates evenly across meals and choose low-GI options.",
    );
  }
  if (conditions.includes("Hypertension")) {
    tips.push(
      "Limit sodium to under 1,500mg/day. Include potassium-rich foods like bananas, sweet potatoes, and leafy greens.",
    );
  }
  if (conditions.includes("High Cholesterol")) {
    tips.push(
      "Increase soluble fiber from oats and legumes, and replace saturated fats with omega-3 rich foods.",
    );
  }
  if (conditions.includes("PCOS")) {
    tips.push(
      "A lower-carb, higher-protein diet can help manage PCOS symptoms. Prioritize anti-inflammatory foods.",
    );
  }
  if (conditions.includes("Thyroid Disorder")) {
    tips.push(
      "Ensure adequate iodine and selenium intake. Limit cruciferous vegetables when eaten raw in large amounts.",
    );
  }

  // Activity-based
  if (activityLevel === "sedentary") {
    tips.push(
      "Incorporating just 20-30 minutes of daily walking can significantly boost metabolism and cardiovascular health.",
    );
  } else if (
    activityLevel === "very_active" ||
    activityLevel === "extra_active"
  ) {
    tips.push(
      "With high training loads, prioritize recovery nutrition and schedule periodic deload weeks to prevent overtraining.",
    );
  }

  // Sleep
  if (sleepHours < 7) {
    tips.push(
      "Prioritize getting 7-9 hours of sleep. Poor sleep elevates cortisol and hunger hormones, sabotaging diet goals.",
    );
  } else {
    tips.push(
      "Your sleep schedule supports healthy hormone balance — keep it consistent even on weekends.",
    );
  }

  // Stress
  if (stressLevel === "high" || stressLevel === "very_high") {
    tips.push(
      "High stress elevates cortisol, promoting fat storage. Incorporate stress-management practices like meditation or deep breathing.",
    );
  }

  return tips.slice(0, 8);
}

export function generateDietPlan(data: FormData, profileId: string): DietPlan {
  const bmr = calculateBMR(data);
  const tdee = calculateTDEE(bmr, data.activity_level);
  const dailyCalories = calculateDailyCalories(tdee, data.goal);
  const macros = calculateMacros(dailyCalories, data.goal);
  const hydration = calculateHydration(data.weight, data.activity_level);
  const tips = generateHealthTips(
    data.goal,
    data.health_conditions,
    data.activity_level,
    data.stress_level,
    data.sleep_hours,
  );

  const allAllergies = [
    ...data.food_allergies,
    ...(data.other_allergies
      ? data.other_allergies.split(",").map((s) => s.trim())
      : []),
  ];

  const weeklyPlan = generateWeeklyPlan(
    dailyCalories,
    macros,
    data.meals_per_day,
    data.dietary_preferences,
    allAllergies,
  );

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    daily_calories: Math.round(dailyCalories),
    hydration_recommendation: hydration,
    macros,
    health_tips: tips,
    weekly_plan: weeklyPlan,
    profile_id: profileId,
  };
}

export function mapToGender(gender: FormData["gender"]): Gender {
  return gender === "male" ? Gender.male : Gender.female;
}

export function mapToGoal(goal: FormData["goal"]): HealthGoal {
  const map: Record<FormData["goal"], HealthGoal> = {
    weight_loss: HealthGoal.weight_loss,
    muscle_gain: HealthGoal.muscle_gain,
    maintenance: HealthGoal.maintenance,
    body_recomposition: HealthGoal.body_recomposition,
  };
  return map[goal];
}

export function mapToActivityLevel(
  level: FormData["activity_level"],
): ActivityLevel {
  const map: Record<FormData["activity_level"], ActivityLevel> = {
    sedentary: ActivityLevel.sedentary,
    lightly_active: ActivityLevel.lightly_active,
    moderately_active: ActivityLevel.moderately_active,
    very_active: ActivityLevel.very_active,
    extra_active: ActivityLevel.extra_active,
  };
  return map[level];
}

export function mapToStressLevel(
  stress: FormData["stress_level"],
): StressLevel {
  const map: Record<FormData["stress_level"], StressLevel> = {
    low: StressLevel.low,
    moderate: StressLevel.moderate,
    high: StressLevel.high,
    very_high: StressLevel.very_high,
  };
  return map[stress];
}
