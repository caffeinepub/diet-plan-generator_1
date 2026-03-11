import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Meal {
    carbs: number;
    fats: number;
    calories: number;
    name: string;
    ingredients: Array<string>;
    protein: number;
}
export interface MacronutrientBreakdown {
    carbs: number;
    fats: number;
    protein: number;
}
export interface DietPlan {
    bmr: number;
    daily_calories: number;
    tdee: number;
    hydration_recommendation: number;
    macros: MacronutrientBreakdown;
    health_tips: Array<string>;
    weekly_plan: Array<DayPlan>;
    profile_id: string;
}
export interface DietProfile {
    id: string;
    age: bigint;
    weight: number;
    height: number;
    supplements: Array<string>;
    meals_per_day: bigint;
    sleep_hours: number;
    health_conditions: Array<string>;
    goal: HealthGoal;
    water_intake: number;
    name: string;
    dietary_preferences: Array<string>;
    activity_level: ActivityLevel;
    stress_level: StressLevel;
    gender: Gender;
    food_allergies: Array<string>;
}
export interface DayPlan {
    breakfast: Meal;
    lunch: Meal;
    snacks: Array<Meal>;
    dinner: Meal;
}
export enum ActivityLevel {
    lightly_active = "lightly_active",
    sedentary = "sedentary",
    extra_active = "extra_active",
    very_active = "very_active",
    moderately_active = "moderately_active"
}
export enum Gender {
    female = "female",
    male = "male"
}
export enum HealthGoal {
    body_recomposition = "body_recomposition",
    muscle_gain = "muscle_gain",
    weight_loss = "weight_loss",
    maintenance = "maintenance"
}
export enum StressLevel {
    low = "low",
    high = "high",
    very_high = "very_high",
    moderate = "moderate"
}
export interface backendInterface {
    addDietPlan(plan: DietPlan): Promise<void>;
    addProfile(profile: DietProfile): Promise<void>;
    deleteWrapper(arg0: string): Promise<string>;
    getAllDietPlans(): Promise<Array<DietPlan>>;
    getAllProfiles(): Promise<Array<DietProfile>>;
    getDietPlan(profile_id: string): Promise<DietPlan>;
    getProfile(id: string): Promise<DietProfile>;
}
