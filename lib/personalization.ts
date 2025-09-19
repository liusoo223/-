import { FOOD_DATA } from '../data/foodData';
import type { UserProfile, FoodItem, Feedback } from '../types';
import { 
    DEFAULT_P_NOVEL, 
    ALPHA, 
    ALPHA_PASS, 
    BONUS_TRY_NEW, 
    BETA, 
    FAMILIAR_THRESHOLD 
} from '../constants';

const PROFILE_KEY = 'foodUserProfile';

const clamp = (x: number, lo = 0, hi = 1): number => Math.max(lo, Math.min(hi, x));

/**
 * Creates a default user profile.
 */
const createDefaultProfile = (): UserProfile => {
    const familiarity: { [key: string]: number } = {};
    FOOD_DATA.forEach(item => {
        // Initially, the learned familiarity is the same as the default.
        familiarity[item.id] = item.familiarity_default;
    });

    return {
        userId: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        familiarity,
        pNovel: DEFAULT_P_NOVEL,
        featureWeights: {},
        contextStats: {},
    };
};


/**
 * Loads the user profile from localStorage or creates a new one.
 */
export const loadUserProfile = (): UserProfile => {
    try {
        const data = localStorage.getItem(PROFILE_KEY);
        if (data) {
            const profile = JSON.parse(data);
            // Simple validation to ensure it's a profile
            if (profile.userId && profile.familiarity) {
                return profile;
            }
        }
        const defaultProfile = createDefaultProfile();
        saveUserProfile(defaultProfile);
        return defaultProfile;

    } catch (error) {
        console.error("Error loading user profile:", error);
        return createDefaultProfile();
    }
};

/**
 * Saves the user profile to localStorage.
 */
export const saveUserProfile = (profile: UserProfile): void => {
    try {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (error) {
        console.error("Error saving user profile:", error);
    }
};

/**
 * Updates the user profile based on feedback for a specific dish.
 * This function implements the core learning logic.
 * @returns The updated user profile and the state before the update for logging.
 */
export const updateUserProfileAfterFeedback = (
    currentUserProfile: UserProfile,
    dish: FoodItem,
    feedback: Feedback
): { updatedProfile: UserProfile; beforeState: { f_before: number, p_novel_before: number } } => {

    const profile = JSON.parse(JSON.stringify(currentUserProfile)); // Deep copy to avoid mutation
    
    const id = dish.id;
    const f0 = profile.familiarity[id] ?? dish.familiarity_default;
    const pNovel0 = profile.pNovel ?? DEFAULT_P_NOVEL;

    let signal = 0;

    if (feedback.decision === "choose") {
        signal += ALPHA;
        if (feedback.like === false) signal += ALPHA_PASS; // Penalty if chosen but disliked
        // Use the app's knowledge of the item's familiarity band for the bonus
        if (f0 < FAMILIAR_THRESHOLD) signal += BONUS_TRY_NEW;
    } else if (feedback.decision === "pass") {
        signal += ALPHA_PASS;
    }

    // Update menu familiarity
    const f1 = clamp(f0 + signal);
    profile.familiarity[id] = f1;

    // Update novelty preference
    const isNovel = f0 < FAMILIAR_THRESHOLD;
    if (feedback.decision === "choose" && isNovel && feedback.like !== false) {
        profile.pNovel = clamp(pNovel0 + BETA, 0.05, 0.20);
    } else if (feedback.decision === "pass" && isNovel) {
        profile.pNovel = clamp(pNovel0 - BETA, 0.05, 0.20);
    }
    
    // NOTE: Feature weight and context tag updates are planned for future extension.

    return {
        updatedProfile: profile,
        beforeState: { f_before: f0, p_novel_before: pNovel0 }
    };
};

/**
 * Initializes the familiarity scores based on user's initial setup selection.
 */
export const initializeFamiliarity = (profile: UserProfile, familiarFoodIds: string[]): UserProfile => {
    const updatedProfile = { ...profile };
    
    Object.keys(updatedProfile.familiarity).forEach(foodId => {
        if (familiarFoodIds.includes(foodId)) {
            updatedProfile.familiarity[foodId] = 0.9; // High familiarity
        } else {
            // Reset to default or a low value for others
            const foodItem = FOOD_DATA.find(f => f.id === foodId);
            updatedProfile.familiarity[foodId] = foodItem ? foodItem.familiarity_default : 0.2;
        }
    });
    
    return updatedProfile;
};
