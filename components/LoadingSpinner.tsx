import React from 'react';

const LoadingSpinner: React.FC = () => {
    const messages = [
        "미식의 우주와 교신 중...",
        "맛있는 제안을 끓이는 중...",
        "오늘의 맛 예보를 확인 중...",
        "완벽한 메뉴를 준비하는 중...",
        "셰프에게 추천 메뉴를 묻는 중...",
    ];

    const [message, setMessage] = React.useState(messages[0]);

    React.useEffect(() => {
        const intervalId = setInterval(() => {
            setMessage(prevMessage => {
                const currentIndex = messages.indexOf(prevMessage);
                const nextIndex = (currentIndex + 1) % messages.length;
                return messages[nextIndex];
            });
        }, 2500);

        return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-6 text-center">
            <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
            </div>
            <p className="text-lg font-semibold text-slate-700 animate-pulse">{message}</p>
        </div>
    );
};

export default LoadingSpinner;