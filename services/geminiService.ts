import { GoogleGenAI, Type } from "@google/genai";
import type { UserPreferences, Recommendation, FoodItem, UserProfile } from '../types';
import { FAMILIAR_THRESHOLD } from '../constants';
import { FOOD_DATA } from '../data/foodData';

// The API key is expected to be available as an environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const filterCandidates = (
    allFoods: FoodItem[],
    preferences: UserPreferences
): FoodItem[] => {
    const { weather, mealTime, cuisine } = preferences;
    return allFoods.filter(food => {
        const weatherMatch = food.weather_suits.split(',').includes(weather);
        const mealMatch = food.meal_times.split(',').includes(mealTime);
        const cuisineMatch =
            cuisine.length === 0 ||
            cuisine.includes("상관없음") ||
            cuisine.includes(food.cuisine_group);
        return weatherMatch && mealMatch && cuisineMatch;
    });
};

const recommendationResponseSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.STRING, description: "추천된 음식의 고유 ID" },
            reason: { type: Type.STRING, description: "이 음식을 개인 맞춤으로 추천하는 이유" },
        },
    },
};

export const getFoodRecommendations = async (
    preferences: UserPreferences,
    userProfile: UserProfile
): Promise<Recommendation[]> => {

    const candidateFoods = filterCandidates(FOOD_DATA, preferences);
    
    if (candidateFoods.length === 0) {
        throw new Error("선택하신 조건에 맞는 음식을 찾을 수 없습니다. 다른 조건으로 시도해보세요.");
    }
    
    const candidatesWithScores = candidateFoods.map(food => ({
        ...food,
        familiarityScore: userProfile.familiarity[food.id] ?? food.familiarity_default
    }));
    
    const prompt = `
        사용자 프로필:
        - 새로운 음식 선호도 (pNovel): ${userProfile.pNovel.toFixed(2)} (0.0=익숙한것만, 1.0=새로운것만)

        추천 후보 음식 목록 (JSON 형식):
        ${JSON.stringify(candidatesWithScores.map(c => ({ id: c.id, name_ko: c.name_ko, tags: c.tags, familiarityScore: c.familiarityScore.toFixed(2) })), null, 2)}
        
        **절대 규칙:**
        1.  **총 3개의 음식**을 추천해야 한다. 추천 메뉴의 ID는 절대 중복되면 안 된다.
        2.  추천 조합은 **'익숙한 음식' 2개와 '새로운 음식' 1개**로 구성하는 것을 최우선으로 한다.
            - '익숙함'의 기준은 familiarityScore가 ${FAMILIAR_THRESHOLD} 이상인 경우다.
            - 만약 '새로운 음식' 후보가 없다면, '익숙한 음식' 3개를 추천한다.
            - 만약 '익숙한 음식' 후보가 2개 미만이라면, 가능한 만큼 선택하고 나머지를 '새로운 음식'으로 채워 총 3개를 맞춘다.
        3.  각 추천에 대해, 사용자의 현재 상황(${preferences.weather}, ${preferences.mealTime})과 음식의 특징(tags)을 연결하여 개인화된 추천 이유를 한 문장으로 생성해야 한다.
        4.  결과는 반드시 지정된 JSON 스키마로만 반환하고, 다른 텍스트는 절대 추가하지 않는다.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: recommendationResponseSchema,
                temperature: 0.8,
            },
        });

        const jsonText = response.text.trim().replace(/^```json\s*|```$/g, '');
        const results: { id: string; reason: string }[] = JSON.parse(jsonText);
        
        if (!Array.isArray(results) || results.length === 0) {
             throw new Error("AI가 유효한 추천 목록을 생성하지 못했습니다.");
        }

        const recommendations: Recommendation[] = results.map(result => {
            const foodItem = FOOD_DATA.find(f => f.id === result.id);
            if (!foodItem) {
                throw new Error(`AI가 데이터베이스에 없는 음식 ID(${result.id})를 반환했습니다.`);
            }
            const familiarityScore = userProfile.familiarity[foodItem.id] ?? foodItem.familiarity_default;
            return {
                ...foodItem,
                reason: result.reason,
                familiarityBand: familiarityScore >= FAMILIAR_THRESHOLD ? 'familiar' : 'novel',
            };
        });
        
        return recommendations;

    } catch (error) {
        console.error("Error getting recommendations from Gemini API:", error);
        throw new Error("음식 추천을 받아오는 데 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
};

export const generateImageForFood = async (foodName: string, description: string): Promise<string> => {
    const prompt = `a delicious, commercially styled photo of '${foodName}', ${description}. Centered, on a clean table, natural lighting, high quality, shallow depth of field. No text, no logos, no people.`;

    try {
         const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
            throw new Error("AI가 이미지를 생성하지 못했습니다.");
        }
    } catch (error) {
        console.error(`Error generating image for ${foodName}:`, error);
        // Return a placeholder or re-throw
        return "https://via.placeholder.com/512";
    }
}