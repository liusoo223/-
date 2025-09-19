import React, { useState, useEffect } from 'react';
import type { UserPreferences } from '../types';

interface SelectInputProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  iconClass: string;
}

const SelectInput: React.FC<SelectInputProps> = ({ label, options, value, onChange, iconClass }) => (
    <div>
        <label className="block text-sm font-medium text-slate-600 mb-1 ml-1">{label}</label>
        <div className="relative">
            <i className={`fa ${iconClass} absolute top-1/2 left-3 transform -translate-y-1/2 text-slate-400`}></i>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none transition"
            >
                {options.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
        </div>
    </div>
);


interface RecommendationFormProps {
  weatherOptions: string[];
  mealTimeOptions: string[];
  cuisineOptions: string[];
  onSubmit: (preferences: UserPreferences) => void;
  initialWeather: string | null;
}

const RecommendationForm: React.FC<RecommendationFormProps> = ({ weatherOptions, mealTimeOptions, cuisineOptions, onSubmit, initialWeather }) => {
  const [weather, setWeather] = useState(initialWeather || weatherOptions[0]);
  const [mealTime, setMealTime] = useState(mealTimeOptions[1]);
  const [cuisine, setCuisine] = useState<string[]>([]);

  useEffect(() => {
    // Pre-select options for the user's specific request
    if (initialWeather === '비') {
        setMealTime('점심');
        setCuisine(['한식', '양식']);
    }
  }, [initialWeather]);

  const handleCuisineToggle = (option: string) => {
    if (option === '상관없음') {
        setCuisine([]);
        return;
    }
    setCuisine(prev => 
        prev.includes(option) 
        ? prev.filter(item => item !== option) 
        : [...prev, option]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ weather, mealTime, cuisine });
  };

  return (
    <div className="p-8 bg-white rounded-2xl shadow-2xl space-y-8 animate-fade-in">
        <div className="text-center">
            <h1 className="text-4xl font-extrabold text-slate-800">무엇이 먹고 싶으세요?</h1>
            <p className="mt-2 text-lg text-slate-500">날씨와 식사 시간을 알려주시면 완벽한 메뉴를 찾아드릴게요.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <SelectInput label="현재 날씨" options={weatherOptions} value={weather} onChange={setWeather} iconClass="fa-cloud-sun"/>
                  {initialWeather && (
                      <p className="text-xs text-indigo-600 mt-1 ml-1 flex items-center">
                          <i className="fas fa-magic mr-1"></i>
                          자동으로 감지됨
                      </p>
                  )}
                </div>
                <SelectInput label="식사 시간" options={mealTimeOptions} value={mealTime} onChange={setMealTime} iconClass="fa-clock"/>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-600 mb-2 ml-1">선호하는 음식 종류</label>
                <div className="flex flex-wrap gap-3">
                    {cuisineOptions.map(option => {
                        const isSelected = option === '상관없음' ? cuisine.length === 0 : cuisine.includes(option);
                        return (
                            <button
                                type="button"
                                key={option}
                                onClick={() => handleCuisineToggle(option)}
                                className={`px-4 py-2 rounded-full font-semibold text-sm transition-all duration-200 border-2 ${
                                    isSelected 
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                }`}
                            >
                                {option}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="pt-2">
                <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-transform transform hover:scale-105">
                    내 메뉴 찾기
                </button>
            </div>
        </form>
    </div>
  );
};

export default RecommendationForm;