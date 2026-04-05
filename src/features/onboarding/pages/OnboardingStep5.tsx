import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useOnboardingStore } from '../../../store/onboardingStore';
import OnboardingLayout from '../components/OnboardingLayout';
import StepCard from '../components/StepCard';

const TRUST_OPTIONS = [
  {
    value: 'child_enjoys',
    label: '아이가 학원 가는 걸 좋아해요',
    desc: '억지로 보내고 싶지 않아요',
  },
  {
    value: 'see_improvement',
    label: '실제로 실력이 늘어나는 게 보여요',
    desc: '눈에 보이는 결과',
  },
  {
    value: 'teacher_communication',
    label: '선생님이 잘 소통해주셔요',
    desc: '상담·피드백이 신뢰감을 줘요',
  },
  {
    value: 'proven_results',
    label: '검증된 실적·성과',
    desc: '다른 학부모 후기나 결과가 확실해요',
  },
];

export default function OnboardingStep5() {
  const navigate = useNavigate();
  const { data, updateData } = useOnboardingStore();

  const canProceed = !!data.trustFactor;

  const handleComplete = () => {
    navigate('/onboarding/loading');
  };

  return (
    <OnboardingLayout
      step={5}
      subtitle="마지막 질문이에요"
      title="학원을 믿고 맡기려면 무엇이 중요해요?"
      description="가장 마음에 와닿는 한 가지를 골라주세요."
    >
      <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-rose-50 border border-rose-100">
        <Heart size={18} className="text-rose-500 shrink-0" />
        <p className="text-sm text-rose-800">
          학부모님의 솔직한 마음이 가장 좋은 추천 기준이에요
        </p>
      </div>

      <div className="space-y-3 mb-10">
        {TRUST_OPTIONS.map((t) => (
          <StepCard
            key={t.value}
            selected={data.trustFactor === t.value}
            onClick={() => updateData({ trustFactor: t.value })}
          >
            <div>
              <p className="font-semibold text-slate-900">{t.label}</p>
              <p className="text-sm text-slate-500 mt-0.5">{t.desc}</p>
            </div>
          </StepCard>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex-1 py-4 rounded-2xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          이전
        </button>
        <button
          onClick={handleComplete}
          disabled={!canProceed}
          className="flex-1 py-4 rounded-2xl font-semibold text-white bg-primary disabled:bg-slate-300 disabled:cursor-not-allowed transition-all hover:enabled:bg-primary/90 active:enabled:scale-[0.99]"
        >
          AI 추천 받기
        </button>
      </div>
    </OnboardingLayout>
  );
}
