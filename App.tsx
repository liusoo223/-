import React, { useState, useEffect, useCallback } from 'react';
import LocationPermission from './components/LocationPermission';
import RecommendationForm from './components/RecommendationForm';
import LoadingSpinner from './components/LoadingSpinner';
import RecommendationResult from './components/RecommendationResult';
import FamiliaritySetup from './components/FamiliaritySetup';
import { getAutomaticWeather } from './services/weatherService';
import { getFoodRecommendations } from './services/geminiService';
import { loadUserProfile, saveUserProfile, initializeFamiliarity, updateUserProfileAfterFeedback } from './lib/personalization';
import { logFeedbackEvent } from './services/loggingService';
import { WEATHER_OPTIONS, MEAL_TIME_OPTIONS, CUISINE_OPTIONS } from './constants';
import type { UserPreferences, Recommendation, UserProfile, Feedback } from './types';
import { FOOD_DATA } from './data/foodData';

type AppState = 'initial_load' | 'familiarity_setup' | 'location' | 'form' | 'loading' | 'results' | 'error';

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>('initial_load');
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [currentPreferences, setCurrentPreferences] = useState<UserPreferences | null>(null);
    const [initialWeather, setInitialWeather] = useState<string | null>(null);
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const profile = loadUserProfile();
        setUserProfile(profile);
        if (localStorage.getItem('foodUserProfile') === null) {
            setAppState('familiarity_setup');
        } else {
            setAppState('location');
        }
    }, []);

    const handleLocationSuccess = async (coords: GeolocationCoordinates) => {
        setAppState('loading');
        try {
            const weather = await getAutomaticWeather(coords);
            setInitialWeather(weather);
        } catch (error) {
            console.error("Failed to get weather automatically:", error);
        }
        setAppState('form');
    };

    const handleLocationSkip = () => setAppState('form');

    const handleFamiliarityComplete = (familiarFoodIds: string[]) => {
        if (userProfile) {
            const updatedProfile = initializeFamiliarity(userProfile, familiarFoodIds);
            setUserProfile(updatedProfile);
            saveUserProfile(updatedProfile);
        }
        setAppState('location');
    };

    const handleSubmit = async (preferences: UserPreferences) => {
        if (!userProfile) return;
        setAppState('loading');
        setCurrentPreferences(preferences);
        setErrorMessage(null);
        try {
            const results = await getFoodRecommendations(preferences, userProfile);
            setRecommendations(results);
            setAppState('results');
        } catch (error) {
            const message = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
            setErrorMessage(message);
            setAppState('error');
        }
    };
    
    const handleFeedback = useCallback((recommendation: Recommendation, feedback: Feedback) => {
        if (!userProfile || !currentPreferences) return;

        const { updatedProfile, beforeState } = updateUserProfileAfterFeedback(userProfile, recommendation, feedback);
        
        const afterState = {
            f_after: updatedProfile.familiarity[recommendation.id],
            p_novel_after: updatedProfile.pNovel
        };
        
        logFeedbackEvent(userProfile, recommendation, feedback, currentPreferences, beforeState, afterState);
        
        setUserProfile(updatedProfile);
        saveUserProfile(updatedProfile);

    }, [userProfile, currentPreferences]);

    const handleReset = () => {
        // Treat this as a "pass" on all currently visible recommendations
        if (recommendations && currentPreferences) {
            recommendations.forEach(rec => handleFeedback(rec, { decision: 'pass' }));
        }
        setRecommendations([]);
        setErrorMessage(null);
        setAppState('form');
    };

    const renderContent = () => {
        switch (appState) {
            case 'initial_load':
                return <LoadingSpinner />;
            case 'familiarity_setup':
                return <FamiliaritySetup onComplete={handleFamiliarityComplete} />;
            case 'location':
                return <LocationPermission onSuccess={handleLocationSuccess} onSkip={handleLocationSkip} />;
            case 'form':
                return (
                    <RecommendationForm
                        weatherOptions={WEATHER_OPTIONS}
                        mealTimeOptions={MEAL_TIME_OPTIONS}
                        cuisineOptions={CUISINE_OPTIONS}
                        onSubmit={handleSubmit}
                        initialWeather={initialWeather}
                    />
                );
            case 'loading':
                return <LoadingSpinner />;
            case 'results':
                return <RecommendationResult recommendations={recommendations} onReset={handleReset} onFeedback={handleFeedback} />;
            case 'error':
                 return (
                    <div className="text-center p-8 bg-white rounded-2xl shadow-2xl animate-fade-in">
                        <h2 className="text-2xl font-bold text-red-600 mb-4">오류 발생</h2>
                        <p className="text-slate-600 mb-6">{errorMessage}</p>
                        <button
                            onClick={handleReset}
                            className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300"
                        >
                            다시 시도하기
                        </button>
                    </div>
                 );
            default:
                return <p>Invalid application state.</p>;
        }
    };

    return (
        <div className="bg-slate-100 min-h-screen flex items-center justify-center p-4 font-sans">
            <main className="w-full max-w-4xl mx-auto">
                {renderContent()}
            </main>
        </div>
    );
};

export default App;
