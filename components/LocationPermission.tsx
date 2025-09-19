import React, { useState } from 'react';

interface LocationPermissionProps {
  onSuccess: (coords: GeolocationCoordinates) => void;
  onSkip: () => void;
}

const LocationPermission: React.FC<LocationPermissionProps> = ({ onSuccess, onSkip }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRequestLocation = () => {
        setIsLoading(true);
        setError(null);
        if (!navigator.geolocation) {
            setError("사용하시는 브라우저가 위치 정보 서비스를 지원하지 않습니다.");
            setIsLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                onSuccess(position.coords);
            },
            (err) => {
                setError(`위치를 가져올 수 없습니다: ${err.message}. 수동으로 선택해주세요.`);
                setIsLoading(false);
                // Automatically skip after a delay so user can read the error
                setTimeout(() => {
                    onSkip();
                }, 2500);
            }
        );
    };

    return (
        <div className="p-8 bg-white rounded-2xl shadow-2xl space-y-6 text-center animate-fade-in max-w-lg mx-auto">
             <i className="fas fa-map-marker-alt text-5xl text-indigo-500 mb-4"></i>
            <h1 className="text-3xl font-extrabold text-slate-800">날씨 자동 감지</h1>
            <p className="text-slate-600">
                최적의 추천을 위해 현재 위치를 사용하여 날씨 정보를 자동으로 가져오도록 허용해주세요.
            </p>
            {error && <p className="text-red-500 text-sm bg-red-100 p-3 rounded-lg">{error}</p>}
            <div className="pt-4 space-y-3 sm:space-y-0 sm:flex sm:gap-4">
                <button
                    onClick={handleRequestLocation}
                    disabled={isLoading}
                    className="w-full px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all transform hover:scale-105 disabled:bg-slate-400 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            가져오는 중...
                        </>
                    ) : (
                       "내 위치 사용"
                    )}
                </button>
                 <button
                    onClick={onSkip}
                    disabled={isLoading}
                    className="w-full px-8 py-3 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-300 transition-all"
                >
                    건너뛰고 직접 선택
                </button>
            </div>
        </div>
    );
};

export default LocationPermission;