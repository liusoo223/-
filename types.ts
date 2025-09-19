/**
 * This file defines the core TypeScript types and interfaces used across the application.
 */

// Represents the user's selectable preferences in the main form.
export interface UserPreferences {
  weather: string;
  mealTime: string;
  cuisine: string[];
}

// Represents the structure of a single food item in our dataset.
export interface FoodItem {
  id: string;
  name_ko: string;
  name_en: string;
  cuisine_group: string;
  dish_type: string;
  serving_temp: 'hot' | 'cold' | 'ambient';
  weather_suits: string; // Comma-separated tags
  meal_times: string; // Comma-separated tags
  familiarity_default: number;
  description_ko: string;
  tags: string[]; // Specific attribute tags like '국물', '매운맛'
}

// Represents the user's complete personalization profile, which is learned over time.
export interface UserProfile {
  userId: string;
  // A map from a food item's ID to its learned familiarity score (0.0 to 1.0).
  familiarity: { [foodId: string]: number };
  // The user's learned preference for novelty (probability, e.g., 0.05 to 0.20).
  pNovel: number;
  // TODO: Future extension for learned weights of specific food tags.
  featureWeights: { [tag: string]: number };
  // TODO: Future extension for tracking user context statistics.
  contextStats: { [context: string]: number };
}

// Represents a single food recommendation returned by the AI.
// It includes the core food data plus AI-generated context.
export interface Recommendation extends FoodItem {
  reason: string;
  familiarityBand: 'familiar' | 'novel';
}

// Represents the structure of the simulated weather API response.
export interface WeatherApiResponse {
    temp_c: number;
    precip_mm: number;
    wind_mps: number;
    condition: string;
}

// Represents the feedback object used by the personalization engine.
export interface Feedback {
    decision: 'choose' | 'pass' | 'save';
    like?: boolean | null;
    familiarFlag?: '익숙' | '처음';
    reasonTags?: string[];
    contextTags?: string[];
}
