/**
 * This file contains constant values used throughout the application,
 * such as options for UI selectors and parameters for the personalization engine.
 */

// UI Options
export const WEATHER_OPTIONS = ["맑음", "바람", "비", "눈", "더움", "추움"];
export const MEAL_TIME_OPTIONS = ["아침", "점심", "저녁", "야식"];
export const CUISINE_OPTIONS = ["한식", "양식", "중식", "일식", "기타", "상관없음"];


// Personalization Engine Constants

// The threshold for a food item to be considered "familiar".
export const FAMILIAR_THRESHOLD = 0.6;

// The default probability of recommending a "novel" food item (10%).
export const DEFAULT_P_NOVEL = 0.10;

// Learning rate for positive feedback (choosing/liking an item).
export const ALPHA = 0.15;

// Penalty applied for negative feedback (passing/disliking an item).
export const ALPHA_PASS = -0.05;

// Bonus applied when a user tries a novel food for the first time and doesn't dislike it.
export const BONUS_TRY_NEW = 0.10;

// Learning rate for adjusting feature (tag) weights based on feedback.
export const ETA = 0.05;

// Learning rate for adjusting the user's personal novelty preference (pNovel).
export const BETA = 0.05;
