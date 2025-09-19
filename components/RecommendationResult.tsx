import React from 'react';
import type { Recommendation, Feedback } from '../types';
import RecommendationCard from './RecommendationCard';

interface RecommendationResultProps {
  recommendations: Recommendation[];
  onReset: () => void;
  onFeedback: (recommendation: Recommendation, feedback: Feedback) => void;
}

const RecommendationResult: React.FC<RecommendationResultProps> = ({ recommendations, onReset, onFeedback }) => {
  if (!recommendations || recommendations.length === 0) {
    return (
        <div className="text-center p-8 bg-white rounded-2xl shadow-2xl animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">추천을 찾지 못했습니다.</h2>
            <p className="text-slate-500 mb-6">죄송합니다. 현재 조건에 맞는 메뉴를 찾을 수 없었습니다. 다른 옵션으로 시도해보세요.</p>
            <button
                onClick={onReset}
                className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-transform transform hover:scale-105"
            >
                다시 시도하기
            </button>
        </div>
    );
  }

  return (
    <div className="p-8 bg-slate-50 rounded-2xl shadow-inner animate-fade-in w-full max-w-4xl mx-auto">
        <div className="text-center mb-10">
            <h2 className="text-4xl font-extrabold text-slate-800">오늘의 추천 메뉴입니다!</h2>
            <p className="mt-2 text-lg text-slate-500">AI가 당신의 취향을 분석하여 찾은 완벽한 선택지입니다.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recommendations.map((rec, index) => (
                <RecommendationCard 
                    key={rec.id} 
                    recommendation={rec} 
                    index={index} 
                    onFeedback={(feedback) => onFeedback(rec, feedback)}
                />
            ))}
        </div>
        <div className="mt-12 text-center">
            <button
                onClick={onReset}
                className="px-8 py-3 bg-slate-600 text-white font-bold rounded-lg shadow-md hover:bg-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-300 transition-transform transform hover:scale-105"
            >
                <i className="fas fa-redo-alt mr-2"></i>
                다른 메뉴 찾아보기
            </button>
        </div>
    </div>
  );
};

export default RecommendationResult;
