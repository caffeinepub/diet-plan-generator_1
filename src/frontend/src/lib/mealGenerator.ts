import type { DayPlan, MacronutrientBreakdown, Meal } from "../backend.d";

interface MealTemplate {
  name: string;
  ingredients: string[];
  contains: string[];
  type: "breakfast" | "lunch" | "dinner" | "snack";
}

const mealDatabase: MealTemplate[] = [
  // BREAKFASTS
  {
    name: "Greek Yogurt Parfait",
    ingredients: [
      "Greek yogurt",
      "granola",
      "mixed berries",
      "honey",
      "chia seeds",
    ],
    contains: ["dairy", "gluten", "nuts"],
    type: "breakfast",
  },
  {
    name: "Avocado Toast with Poached Eggs",
    ingredients: [
      "whole grain bread",
      "avocado",
      "poached eggs",
      "cherry tomatoes",
      "red pepper flakes",
    ],
    contains: ["gluten", "eggs"],
    type: "breakfast",
  },
  {
    name: "Oatmeal with Banana and Walnuts",
    ingredients: [
      "rolled oats",
      "banana",
      "walnuts",
      "cinnamon",
      "almond milk",
      "maple syrup",
    ],
    contains: ["gluten", "nuts"],
    type: "breakfast",
  },
  {
    name: "Smoothie Bowl",
    ingredients: [
      "banana",
      "frozen spinach",
      "protein powder",
      "chia seeds",
      "blueberries",
      "coconut flakes",
    ],
    contains: ["soy"],
    type: "breakfast",
  },
  {
    name: "Scrambled Eggs with Vegetables",
    ingredients: [
      "eggs",
      "bell peppers",
      "baby spinach",
      "feta cheese",
      "olive oil",
    ],
    contains: ["eggs", "dairy"],
    type: "breakfast",
  },
  {
    name: "Chia Seed Pudding",
    ingredients: ["chia seeds", "coconut milk", "mango", "kiwi", "maple syrup"],
    contains: [],
    type: "breakfast",
  },
  {
    name: "Protein Power Smoothie",
    ingredients: [
      "protein powder",
      "banana",
      "almond milk",
      "spinach",
      "peanut butter",
    ],
    contains: ["nuts", "soy"],
    type: "breakfast",
  },
  {
    name: "Quinoa Breakfast Bowl",
    ingredients: [
      "quinoa",
      "almond milk",
      "mixed berries",
      "sliced almonds",
      "maple syrup",
    ],
    contains: ["nuts"],
    type: "breakfast",
  },
  {
    name: "Overnight Oats",
    ingredients: [
      "rolled oats",
      "chia seeds",
      "oat milk",
      "banana",
      "fresh strawberries",
    ],
    contains: ["gluten"],
    type: "breakfast",
  },
  {
    name: "Veggie Omelette",
    ingredients: [
      "eggs",
      "mushrooms",
      "cherry tomatoes",
      "spinach",
      "fresh herbs",
    ],
    contains: ["eggs"],
    type: "breakfast",
  },
  {
    name: "Sweet Potato Breakfast Hash",
    ingredients: [
      "sweet potato",
      "eggs",
      "black beans",
      "avocado",
      "salsa",
      "cilantro",
    ],
    contains: ["eggs"],
    type: "breakfast",
  },
  {
    name: "Brown Rice Porridge",
    ingredients: [
      "brown rice",
      "coconut milk",
      "medjool dates",
      "cinnamon",
      "cardamom",
    ],
    contains: [],
    type: "breakfast",
  },
  {
    name: "Cottage Cheese Bowl",
    ingredients: [
      "cottage cheese",
      "fresh pineapple",
      "walnuts",
      "honey",
      "fresh mint",
    ],
    contains: ["dairy", "nuts"],
    type: "breakfast",
  },
  {
    name: "Almond Flour Pancakes",
    ingredients: [
      "almond flour",
      "eggs",
      "banana",
      "coconut oil",
      "fresh berries",
    ],
    contains: ["eggs", "nuts"],
    type: "breakfast",
  },
  {
    name: "Acai Berry Bowl",
    ingredients: [
      "acai packet",
      "frozen banana",
      "granola",
      "fresh berries",
      "honey",
      "coconut flakes",
    ],
    contains: ["gluten", "nuts"],
    type: "breakfast",
  },

  // LUNCHES
  {
    name: "Grilled Chicken Salad",
    ingredients: [
      "grilled chicken breast",
      "mixed greens",
      "cherry tomatoes",
      "cucumber",
      "olive oil",
      "lemon",
    ],
    contains: ["meat"],
    type: "lunch",
  },
  {
    name: "Quinoa Buddha Bowl",
    ingredients: [
      "quinoa",
      "roasted chickpeas",
      "roasted vegetables",
      "tahini dressing",
      "avocado",
    ],
    contains: ["sesame"],
    type: "lunch",
  },
  {
    name: "Red Lentil Soup",
    ingredients: [
      "red lentils",
      "carrots",
      "celery",
      "cumin",
      "turmeric",
      "vegetable broth",
    ],
    contains: [],
    type: "lunch",
  },
  {
    name: "Turkey and Avocado Wrap",
    ingredients: [
      "turkey breast",
      "whole grain wrap",
      "avocado",
      "romaine lettuce",
      "tomato",
      "Dijon mustard",
    ],
    contains: ["meat", "gluten"],
    type: "lunch",
  },
  {
    name: "Baked Salmon Plate",
    ingredients: [
      "salmon fillet",
      "brown rice",
      "steamed asparagus",
      "lemon",
      "dill",
      "olive oil",
    ],
    contains: ["fish"],
    type: "lunch",
  },
  {
    name: "Mediterranean Chickpea Salad",
    ingredients: [
      "chickpeas",
      "cucumber",
      "cherry tomatoes",
      "kalamata olives",
      "feta",
      "lemon dressing",
    ],
    contains: ["dairy"],
    type: "lunch",
  },
  {
    name: "Tofu Stir Fry with Brown Rice",
    ingredients: [
      "firm tofu",
      "broccoli",
      "snap peas",
      "bell peppers",
      "tamari sauce",
      "brown rice",
    ],
    contains: ["soy"],
    type: "lunch",
  },
  {
    name: "Black Bean Tacos",
    ingredients: [
      "black beans",
      "corn tortillas",
      "fresh salsa",
      "guacamole",
      "shredded cabbage",
      "lime",
    ],
    contains: [],
    type: "lunch",
  },
  {
    name: "Tuna and White Bean Salad",
    ingredients: [
      "canned tuna",
      "cannellini beans",
      "celery",
      "red onion",
      "olive oil",
      "parsley",
    ],
    contains: ["fish"],
    type: "lunch",
  },
  {
    name: "Vegetable Lentil Curry",
    ingredients: [
      "green lentils",
      "sweet potato",
      "spinach",
      "coconut milk",
      "curry spices",
      "basmati rice",
    ],
    contains: [],
    type: "lunch",
  },
  {
    name: "Chicken and Vegetable Soup",
    ingredients: [
      "chicken breast",
      "carrots",
      "celery",
      "onion",
      "fresh herbs",
      "low-sodium broth",
    ],
    contains: ["meat"],
    type: "lunch",
  },
  {
    name: "Egg Salad on Greens",
    ingredients: [
      "hard-boiled eggs",
      "mixed greens",
      "avocado",
      "lemon juice",
      "Dijon mustard",
    ],
    contains: ["eggs"],
    type: "lunch",
  },
  {
    name: "Falafel Bowl",
    ingredients: [
      "baked falafel",
      "brown rice",
      "cucumber",
      "cherry tomatoes",
      "hummus",
      "lemon tahini",
    ],
    contains: ["gluten", "sesame"],
    type: "lunch",
  },
  {
    name: "Grilled Shrimp Salad",
    ingredients: [
      "grilled shrimp",
      "avocado",
      "mixed greens",
      "cucumber",
      "lime dressing",
    ],
    contains: ["shellfish"],
    type: "lunch",
  },
  {
    name: "Caprese with Whole Grain Bread",
    ingredients: [
      "fresh mozzarella",
      "heirloom tomatoes",
      "fresh basil",
      "whole grain bread",
      "balsamic glaze",
    ],
    contains: ["dairy", "gluten"],
    type: "lunch",
  },

  // DINNERS
  {
    name: "Herb-Roasted Chicken with Sweet Potato",
    ingredients: [
      "chicken breast",
      "sweet potato",
      "broccoli",
      "garlic",
      "rosemary",
      "olive oil",
    ],
    contains: ["meat"],
    type: "dinner",
  },
  {
    name: "Grilled Salmon with Roasted Vegetables",
    ingredients: [
      "salmon fillet",
      "roasted zucchini",
      "cherry tomatoes",
      "lemon",
      "fresh dill",
    ],
    contains: ["fish"],
    type: "dinner",
  },
  {
    name: "Chickpea and Spinach Curry",
    ingredients: [
      "chickpeas",
      "fresh spinach",
      "crushed tomatoes",
      "coconut milk",
      "garam masala",
      "basmati rice",
    ],
    contains: [],
    type: "dinner",
  },
  {
    name: "Lean Beef Stir Fry",
    ingredients: [
      "lean beef strips",
      "broccoli",
      "snap peas",
      "carrots",
      "low-sodium soy sauce",
      "brown rice",
    ],
    contains: ["meat", "soy"],
    type: "dinner",
  },
  {
    name: "Turkey Meatballs with Zucchini Noodles",
    ingredients: [
      "ground turkey",
      "zucchini noodles",
      "marinara sauce",
      "garlic",
      "fresh basil",
    ],
    contains: ["meat", "eggs"],
    type: "dinner",
  },
  {
    name: "Red Lentil Dal with Basmati Rice",
    ingredients: [
      "red lentils",
      "tomatoes",
      "onion",
      "ginger",
      "cumin",
      "turmeric",
      "brown rice",
    ],
    contains: [],
    type: "dinner",
  },
  {
    name: "Baked Cod with Quinoa",
    ingredients: [
      "cod fillet",
      "quinoa",
      "roasted asparagus",
      "lemon",
      "garlic",
      "capers",
    ],
    contains: ["fish"],
    type: "dinner",
  },
  {
    name: "Stuffed Bell Peppers",
    ingredients: [
      "bell peppers",
      "ground turkey",
      "quinoa",
      "crushed tomatoes",
      "Italian herbs",
    ],
    contains: ["meat"],
    type: "dinner",
  },
  {
    name: "Eggplant and Tomato Bake",
    ingredients: [
      "eggplant",
      "heirloom tomatoes",
      "fresh mozzarella",
      "basil",
      "olive oil",
      "garlic",
    ],
    contains: ["dairy"],
    type: "dinner",
  },
  {
    name: "Mediterranean Chicken Kebabs",
    ingredients: [
      "chicken breast",
      "zucchini",
      "bell peppers",
      "onion",
      "lemon",
      "Mediterranean spices",
    ],
    contains: ["meat"],
    type: "dinner",
  },
  {
    name: "Black Bean and Sweet Potato Bowl",
    ingredients: [
      "black beans",
      "roasted sweet potato",
      "avocado",
      "corn",
      "lime",
      "cilantro",
    ],
    contains: [],
    type: "dinner",
  },
  {
    name: "Tofu and Vegetable Curry",
    ingredients: [
      "firm tofu",
      "mixed vegetables",
      "coconut milk",
      "red curry paste",
      "lime",
      "jasmine rice",
    ],
    contains: ["soy"],
    type: "dinner",
  },
  {
    name: "Baked Chicken Thighs with Roasted Potatoes",
    ingredients: [
      "chicken thighs",
      "baby potatoes",
      "green beans",
      "garlic",
      "paprika",
      "olive oil",
    ],
    contains: ["meat"],
    type: "dinner",
  },
  {
    name: "Mushroom and Lentil Shepherd's Pie",
    ingredients: [
      "puy lentils",
      "mixed mushrooms",
      "sweet potato mash",
      "onion",
      "thyme",
      "vegetable broth",
    ],
    contains: [],
    type: "dinner",
  },
  {
    name: "Seared Tuna with Sesame Noodles",
    ingredients: [
      "seared tuna steak",
      "soba noodles",
      "edamame",
      "sesame oil",
      "ginger",
      "soy sauce",
    ],
    contains: ["fish", "soy", "sesame", "gluten"],
    type: "dinner",
  },

  // SNACKS
  {
    name: "Apple with Almond Butter",
    ingredients: ["apple", "almond butter"],
    contains: ["nuts"],
    type: "snack",
  },
  {
    name: "Greek Yogurt with Berries",
    ingredients: ["Greek yogurt", "mixed berries", "honey"],
    contains: ["dairy"],
    type: "snack",
  },
  {
    name: "Mixed Nuts and Dried Fruit",
    ingredients: ["walnuts", "almonds", "cashews", "dried cranberries"],
    contains: ["nuts"],
    type: "snack",
  },
  {
    name: "Rice Cakes with Hummus",
    ingredients: ["brown rice cakes", "hummus", "cucumber slices"],
    contains: ["sesame"],
    type: "snack",
  },
  {
    name: "Protein Shake",
    ingredients: ["protein powder", "almond milk", "banana", "ice"],
    contains: ["soy"],
    type: "snack",
  },
  {
    name: "Veggies and Hummus",
    ingredients: [
      "celery sticks",
      "carrot sticks",
      "bell pepper strips",
      "hummus",
    ],
    contains: ["sesame"],
    type: "snack",
  },
  {
    name: "Hard-Boiled Eggs",
    ingredients: ["eggs", "sea salt", "black pepper"],
    contains: ["eggs"],
    type: "snack",
  },
  {
    name: "Fresh Fruit Salad",
    ingredients: ["strawberries", "kiwi", "mango", "pineapple", "fresh mint"],
    contains: [],
    type: "snack",
  },
  {
    name: "Edamame",
    ingredients: ["edamame", "sea salt"],
    contains: ["soy"],
    type: "snack",
  },
  {
    name: "Cottage Cheese with Cucumber",
    ingredients: ["cottage cheese", "cucumber", "fresh dill", "black pepper"],
    contains: ["dairy"],
    type: "snack",
  },
  {
    name: "Dark Chocolate and Walnuts",
    ingredients: ["dark chocolate (70%+)", "walnuts"],
    contains: ["nuts"],
    type: "snack",
  },
  {
    name: "Banana with Peanut Butter",
    ingredients: ["banana", "peanut butter"],
    contains: ["nuts"],
    type: "snack",
  },
  {
    name: "Avocado on Rice Crackers",
    ingredients: ["avocado", "rice crackers", "lemon juice", "sea salt"],
    contains: [],
    type: "snack",
  },
  {
    name: "Roasted Chickpeas",
    ingredients: ["chickpeas", "olive oil", "cumin", "paprika"],
    contains: [],
    type: "snack",
  },
];

function getRestrictedIngredients(
  preferences: string[],
  allergies: string[],
): string[] {
  const restricted: string[] = [];

  const isVegan = preferences.includes("Vegan");
  const isVegetarian = preferences.includes("Vegetarian") || isVegan;
  const isGlutenFree = preferences.includes("Gluten-Free");
  const isDairyFree = preferences.includes("Dairy-Free");
  const isPaleo = preferences.includes("Paleo");
  const isKeto = preferences.includes("Keto");

  if (isVegetarian) restricted.push("meat");
  if (isVegan) restricted.push("dairy", "eggs");
  if (isGlutenFree) restricted.push("gluten");
  if (isDairyFree) restricted.push("dairy");
  if (isPaleo) restricted.push("gluten", "dairy", "soy");
  if (isKeto) restricted.push("gluten");

  const allergyMap: Record<string, string> = {
    Nuts: "nuts",
    Shellfish: "shellfish",
    Eggs: "eggs",
    Soy: "soy",
    "Wheat/Gluten": "gluten",
    Fish: "fish",
    Milk: "dairy",
    Sesame: "sesame",
  };

  for (const allergy of allergies) {
    const mapped = allergyMap[allergy];
    if (mapped) restricted.push(mapped);
  }

  return [...new Set(restricted)];
}

function filterMeals(
  type: "breakfast" | "lunch" | "dinner" | "snack",
  restricted: string[],
): MealTemplate[] {
  const pool = mealDatabase.filter(
    (m) => m.type === type && !m.contains.some((c) => restricted.includes(c)),
  );
  // Fallback: if no meals match, return type-only filtered (no dietary restriction)
  if (pool.length === 0) {
    return mealDatabase.filter((m) => m.type === type);
  }
  return pool;
}

function createMeal(
  template: MealTemplate,
  mealCalories: number,
  macros: MacronutrientBreakdown,
  dailyCalories: number,
): Meal {
  const ratio = mealCalories / dailyCalories;
  return {
    name: template.name,
    ingredients: template.ingredients,
    calories: Math.round(mealCalories),
    protein: Math.round(macros.protein * ratio),
    carbs: Math.round(macros.carbs * ratio),
    fats: Math.round(macros.fats * ratio),
  };
}

export function generateWeeklyPlan(
  dailyCalories: number,
  macros: MacronutrientBreakdown,
  mealsPerDay: number,
  preferences: string[],
  allergies: string[],
): DayPlan[] {
  const restricted = getRestrictedIngredients(preferences, allergies);

  const breakfasts = filterMeals("breakfast", restricted);
  const lunches = filterMeals("lunch", restricted);
  const dinners = filterMeals("dinner", restricted);
  const snacks = filterMeals("snack", restricted);

  const snackCount = mealsPerDay <= 3 ? 1 : 2;

  // Calorie distribution: breakfast 25%, lunch 30%, dinner 35%, snacks share 10-15%
  const snackCalorieTotal = dailyCalories * (snackCount === 1 ? 0.1 : 0.15);
  const mainCaloriesTotal = dailyCalories - snackCalorieTotal;
  const breakfastCal = mainCaloriesTotal * 0.29;
  const lunchCal = mainCaloriesTotal * 0.35;
  const dinnerCal = mainCaloriesTotal * 0.36;
  const snackCal = snackCalorieTotal / snackCount;

  return Array.from({ length: 7 }, (_, day) => ({
    breakfast: createMeal(
      breakfasts[day % breakfasts.length],
      breakfastCal,
      macros,
      dailyCalories,
    ),
    lunch: createMeal(
      lunches[day % lunches.length],
      lunchCal,
      macros,
      dailyCalories,
    ),
    dinner: createMeal(
      dinners[day % dinners.length],
      dinnerCal,
      macros,
      dailyCalories,
    ),
    snacks: Array.from({ length: snackCount }, (_, i) =>
      createMeal(
        snacks[(day * snackCount + i) % snacks.length],
        snackCal,
        macros,
        dailyCalories,
      ),
    ),
  }));
}
