import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const MESSAGES = [
  '위례·성남 1,136개 학부모 리뷰를 분석하고 있어요...',
  '아이 프로필에 맞는 학원을 찾고 있어요...',
  '우선순위에 따라 AI가 가중치를 적용 중이에요...',
  '거의 다 됐어요...',
];

const LOADING_DURATION_MS = 3500;

export default function OnboardingLoading() {
  const navigate = useNavigate();
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => Math.min(i + 1, MESSAGES.length - 1));
    }, LOADING_DURATION_MS / MESSAGES.length);

    const timeout = setTimeout(() => {
      navigate('/compare/result');
    }, LOADING_DURATION_MS);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col items-center justify-center px-6">
      {/* Animated logo/icon */}
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
          <Sparkles size={36} className="text-primary" />
        </div>
        <div className="absolute inset-0 w-20 h-20 rounded-2xl border-2 border-primary/30 animate-ping opacity-20" />
      </div>

      <h2 className="text-xl font-bold text-slate-900 mb-2">
        PostMom AI가 분석 중이에요
      </h2>
      <p className="text-sm text-slate-500 text-center max-w-xs mb-8">
        {MESSAGES[messageIndex]}
      </p>

      {/* Progress bar */}
      <div className="w-full max-w-[200px] h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${((messageIndex + 1) / MESSAGES.length) * 100}%`,
          }}
        />
      </div>

      <p className="text-xs text-slate-400 mt-6">
        실제 학부모님 리뷰 기반 분석
      </p>
    </div>
  );
}
