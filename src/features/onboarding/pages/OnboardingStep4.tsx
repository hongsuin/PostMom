import { useNavigate } from 'react-router-dom';
import { MapPin, Wallet } from 'lucide-react';
import { useOnboardingStore } from '../../../store/onboardingStore';
import OnboardingLayout from '../components/OnboardingLayout';
import StepCard from '../components/StepCard';

const BUDGETS = [
  { value: 'under_200', label: '월 20만원 미만' },
  { value: '200_300', label: '월 20~30만원' },
  { value: '300_400', label: '월 30~40만원' },
  { value: '400_500', label: '월 40~50만원' },
  { value: 'over_500', label: '월 50만원 이상' },
];

const DISTANCES = [
  { value: 'walking', label: '걸어서 도보', desc: '5분 이내' },
  { value: '10min', label: '10분 이내', desc: '차·대중교통' },
  { value: '20min', label: '20분 이내', desc: '조금 멀어도 괜찮아요' },
  { value: 'no_limit', label: '상관없어요', desc: '좋은 학원이면 돼요' },
];

export default function OnboardingStep4() {
  const navigate = useNavigate();
  const { data, updateData } = useOnboardingStore();

  const canProceed = data.budgetRange && data.distance;

  return (
    <OnboardingLayout
      step={4}
      subtitle="실제 선택에 필요한 정보"
      title="예산과 거리 선호를 알려주세요"
      description="추천 결과를 더 현실적으로 맞춰드려요."
    >
      {/* Budget */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Wallet size={18} className="text-slate-600" />
          <p className="text-sm font-medium text-slate-700">월 예산 (1인 기준)</p>
        </div>
        <div className="space-y-2">
          {BUDGETS.map((b) => (
            <StepCard
              key={b.value}
              selected={data.budgetRange === b.value}
              onClick={() => updateData({ budgetRange: b.value })}
              className="py-3"
            >
              <p className="font-medium text-slate-900">{b.label}</p>
            </StepCard>
          ))}
        </div>
      </div>

      {/* Distance */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <MapPin size={18} className="text-slate-600" />
          <p className="text-sm font-medium text-slate-700">이동 거리</p>
        </div>
        <div className="space-y-2">
          {DISTANCES.map((d) => (
            <StepCard
              key={d.value}
              selected={data.distance === d.value}
              onClick={() => updateData({ distance: d.value })}
            >
              <div>
                <p className="font-medium text-slate-900">{d.label}</p>
                <p className="text-sm text-slate-500">{d.desc}</p>
              </div>
            </StepCard>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex-1 py-4 rounded-2xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          이전
        </button>
        <button
          onClick={() => navigate('/onboarding/5')}
          disabled={!canProceed}
          className="flex-1 py-4 rounded-2xl font-semibold text-white bg-primary disabled:bg-slate-300 disabled:cursor-not-allowed transition-all hover:enabled:bg-primary/90 active:enabled:scale-[0.99]"
        >
          다음
        </button>
      </div>
    </OnboardingLayout>
  );
}
