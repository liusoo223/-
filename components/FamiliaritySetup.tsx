import React, { useState } from 'react';
import { FOOD_DATA } from '../data/foodData';

interface FamiliaritySetupProps {
  onComplete: (familiarFoodIds: string[]) => void;
}

const FamiliaritySetup: React.FC<FamiliaritySetupProps> = ({ onComplete }) => {
    const [selectedFoodIds, setSelectedFoodIds] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const handleToggleFood = (foodId: string) => {
        setSelectedFoodIds(prev =>
            prev.includes(foodId)
                ? prev.filter(id => id !== foodId)
                : [...prev, foodId]
        );
    };

    const handleSave = () => {
        onComplete(selectedFoodIds);
    };
    
    const handleSkip = () => {
        // Pass an empty array if the user skips.
        onComplete([]);
    };

    const filteredFoods = FOOD_DATA.filter(food => 
        food.name_ko.toLowerCase().includes(searchTerm.toLowerCase()) ||
        food.name_en.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 bg-white rounded-2xl shadow-2xl space-y-6 animate-fade-in max-w-2xl mx-auto">
            <div className="text-center">
                <h1 className="text-3xl font-extrabold text-slate-800">취향 알려주기 (1/1)</h1>
                <p className="mt-2 text-slate-600">
                    자주 드시는 익숙한 음식을 모두 선택해주세요. 더 취향에 맞는 새로운 메뉴를 찾아드릴게요!
                </p>
            </div>
            
            <div className="relative">
                <i className="fa fa-search absolute top-1/2 left-4 transform -translate-y-1/2 text-slate-400"></i>
                <input
                    type="text"
                    placeholder="음식 검색 (예: 김치찌개, pasta...)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            <div className="max-h-60 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex flex-wrap gap-3 p-2">
                    {filteredFoods.length > 0 ? filteredFoods.map(food => (
                        <button
                            key={food.id}
                            onClick={() => handleToggleFood(food.id)}
                            className={`px-4 py-2 rounded-full font-semibold text-sm transition-all duration-200 border-2 ${
                                selectedFoodIds.includes(food.id)
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                            }`}
                        >
                            {food.name_ko}
                        </button>
                    )) : <p className="text-slate-500 text-center w-full">검색 결과가 없습니다.</p>}
                </div>
            </div>

            <div className="pt-2 flex gap-4">
                 <button 
                    onClick={handleSkip}
                    className="w-full py-3 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-300 transition-all"
                >
                    건너뛰기
                </button>
                <button 
                    onClick={handleSave}
                    className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-transform transform hover:scale-105"
                >
                    저장하고 계속하기 ({selectedFoodIds.length}개 선택됨)
                </button>
            </div>
        </div>
    );
};

export default FamiliaritySetup;
