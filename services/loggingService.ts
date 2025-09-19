import type { UserProfile, FoodItem, Recommendation, Feedback, UserPreferences } from '../types';

interface LogEntry {
    user_id: string;
    dish_id: string;
    timestamp: number;
    weather: string;
    meal_time: string;
    decision: 'choose' | 'pass' | 'save';
    like: boolean | null;
    familiarFlag: '익숙' | '처음';
    reasonTags: string[];
    contextTags: string[];
    f_before: number;
    f_after: number;
    p_novel_before: number;
    p_novel_after: number;
}


/**
 * Constructs and logs a detailed feedback event.
 * In a real application, this would send the log to a server for analysis.
 * For this app, it logs the structured object to the browser console.
 */
export const logFeedbackEvent = (
    userProfile: UserProfile,
    recommendation: Recommendation,
    feedback: Feedback,
    preferences: UserPreferences,
    beforeState: { f_before: number, p_novel_before: number },
    afterState: { f_after: number, p_novel_after: number }
): void => {
    
    const logEntry: LogEntry = {
        user_id: userProfile.userId,
        dish_id: recommendation.id,
        timestamp: Math.floor(Date.now() / 1000),
        weather: preferences.weather,
        meal_time: preferences.mealTime,
        decision: feedback.decision,
        like: feedback.like ?? null,
        familiarFlag: recommendation.familiarityBand === 'familiar' ? '익숙' : '처음',
        reasonTags: recommendation.tags,
        contextTags: [], // Not implemented in the current UI
        f_before: parseFloat(beforeState.f_before.toFixed(4)),
        f_after: parseFloat(afterState.f_after.toFixed(4)),
        p_novel_before: parseFloat(beforeState.p_novel_before.toFixed(4)),
        p_novel_after: parseFloat(afterState.p_novel_after.toFixed(4)),
    };

    console.log("--- FEEDBACK EVENT LOG ---");
    console.log(JSON.stringify(logEntry, null, 2));
    console.log("--------------------------");
};
