import React, { useState, useEffect } from 'react';
import type { Recommendation, Feedback } from '../types';
import { generateImageForFood } from '../services/geminiService';

interface RecommendationCardProps {
  recommendation: Recommendation;
  index: number;
  onFeedback: (feedback: Feedback) => void;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation, index, onFeedback }) => {
    const { name_ko, description_ko, reason, familiarityBand } = recommendation;
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoadingImage, setIsLoadingImage] = useState(true);
    const [feedbackGiven, setFeedbackGiven] = useState<'liked' | 'passed' | null>(null);

    useEffect(() => {
        let isCancelled = false;
        const fetchImage = async () => {
            setIsLoadingImage(true);
            const url = await generateImageForFood(name_ko, description_ko);
            if (!isCancelled) {
                setImageUrl(url);
                setIsLoadingImage(false);
            }
        };

        fetchImage();
        return () => { isCancelled = true; };
    }, [name_ko, description_ko]);

    const handleFeedback = (decision: 'choose' | 'pass', like?: boolean) => {
        if (feedbackGiven) return; // Prevent multiple feedback submissions
        
        setFeedbackGiven(decision === 'choose' ? 'liked' : 'passed');
        onFeedback({ decision, like });
    };

    const delay = `${index * 150}ms`;

    return (
        <div
            className={`flex flex-col bg-white rounded-xl shadow-lg border border-slate-200 transition-all duration-300 transform hover:scale-105 hover:shadow-xl animate-fade-in-up ${feedbackGiven === 'passed' ? 'opacity-50 scale-95' : ''}`}
            style={{ animationDelay: delay }}
        >
            <div className="relative w-full h-48">
                {isLoadingImage ? (
                    <div className="w-full h-full bg-slate-200 animate-pulse rounded-t-xl flex items-center justify-center">
                         <i className="fas fa-utensils text-3xl text-slate-400"></i>
                    </div>
                ) : (
                    <img src={imageUrl!} alt={name_ko} className="w-full h-full object-cover rounded-t-xl" />
                )}
                 <span className={`absolute top-3 right-3 px-3 py-1 text-xs font-bold text-white rounded-full ${familiarityBand === 'familiar' ? 'bg-blue-500' : 'bg-purple-500'}`}>
                    {familiarityBand === 'familiar' ? '익숙한 맛' : '새로운 도전'}
                </span>
            </div>

            <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">{name_ko}</h3>
                <p className="text-slate-600 mb-4 flex-grow">{description_ko}</p>
                
                <div className="bg-indigo-50 p-3 rounded-lg mb-4">
                    <p className="text-sm font-semibold text-indigo-700">
                        <i className="fas fa-lightbulb mr-2"></i>
                        추천 이유
                    </p>
                    <p className="text-slate-700 text-sm mt-1">{reason}</p>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-200 flex gap-3">
                    <button 
                        onClick={() => handleFeedback('pass', false)}
                        disabled={!!feedbackGiven}
                        className="w-full py-2 px-4 rounded-lg font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 disabled:bg-slate-100 disabled:text-slate-400 transition-colors"
                    >
                         <i className="fas fa-times mr-2"></i>
                         다른 메뉴 볼게요
                    </button>
                    <button
                        onClick={() => handleFeedback('choose', true)}
                        disabled={!!feedbackGiven}
                        className={`w-full py-2 px-4 rounded-lg font-bold text-white transition-all transform ${feedbackGiven === 'liked' ? 'bg-green-500' : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105'} disabled:bg-indigo-300 disabled:scale-100`}
                    >
                        <i className="fas fa-thumbs-up mr-2"></i>
                        {feedbackGiven === 'liked' ? '피드백 감사합니다!' : '맘에 들어요!'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecommendationCard;
