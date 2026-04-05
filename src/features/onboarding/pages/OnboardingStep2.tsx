import { useNavigate } from 'react-router-dom';
import { Target } from 'lucide-react';
import type { PriorityKey } from '../../../store/onboardingStore';
import { useOnboardingStore } from '../../../store/onboardingStore';
import OnboardingLayout from '../components/OnboardingLayout';
import StepCard from '../components/StepCard';

const PRIORITIES: { key: PriorityKey; label: string; desc: string }[] = [
  { key: 'fun_enjoyment', label: '재미있게 다니는 게 중요해요', desc: '아이가 즐거워해야 해요' },
  { key: 'skill_improvement', label: '실력이 눈에 보이게 늘었으면', desc: '체감되는 성장' },
  { key: 'grade_test_performance', label: '성적·시험 점수가 최우선', desc: '내신·수능 대비' },
  { key: 'teacher_kindness_passion', label: '친절하고 열정적인 선생님', desc: '믿고 맡길 수 있는 분' },
  { key: 'detailed_feedback', label: '꼼꼼한 피드백과 관리', desc: '부족한 부분 챙겨주는' },
  { key: 'structured_curriculum', label: '체계적인 커리큘럼', desc: '단계별로 탄탄하게' },
  { key: 'confidence_interest', label: '자신감과 흥미를 키우고 싶어요', desc: '영어에 대한 두려움 줄이기' },
  { key: 'personalized_teaching', label: '아이 맞춤 지도', desc: '눈높이에 맞는 수업' },
];

export default function OnboardingStep2() {
  const navigate = useNavigate();
  const { data, updateData } = useOnboardingStore();
  const { priorities } = data;

  const togglePriority = (key: PriorityKey) => {
    const idx = priorities.indexOf(key);
    if (idx >= 0) {
      updateData({ priorities: priorities.filter((p) => p !== key) });
      return;
    }
    if (priorities.length >= 3) return;
    updateData({ priorities: [...priorities, key] });
  };

  const getRank = (key: PriorityKey) => {
    const i = priorities.indexOf(key);
    return i >= 0 ? i + 1 : null;
  };

  const canProceed = priorities.length >= 1; // At least 1, ideally 3

  return (
    <OnboardingLayout
      step={2}
      subtitle="가장 중요한 3가지를 골라주세요"
      title="학원 고를 때 무엇이 중요하세요?"
      description="1, 2, 3순서대로 선택하면 AI가 비중을 두고 분석해요."
    >
      <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-amber-50 border border-amber-100">
        <Target size={18} className="text-amber-600 shrink-0" />
        <p className="text-sm text-amber-800">
          {priorities.length}/3 선택됨 · 탭한 순서가 우선순위예요
        </p>
      </div>

      <div className="space-y-3 mb-10">
        {PRIORITIES.map((p) => {
          const rank = getRank(p.key);
          const selected = rank !== null;
          return (
            <StepCard
              key={p.key}
              selected={selected}
              onClick={() => togglePriority(p.key)}
            >
              <div className="flex items-center gap-3">
                {selected ? (
                  <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg shrink-0">
                    {rank}
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    <span className="text-slate-400 text-sm">
                      {priorities.length < 3 ? '+' : ''}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900">{p.label}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{p.desc}</p>
                </div>
              </div>
            </StepCard>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex-1 py-4 rounded-2xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          이전
        </button>
        <button
          onClick={() => navigate('/onboarding/3')}
          disabled={!canProceed}
          className="flex-1 py-4 rounded-2xl font-semibold text-white bg-primary disabled:bg-slate-300 disabled:cursor-not-allowed transition-all hover:enabled:bg-primary/90 active:enabled:scale-[0.99]"
        >
          다음
        </button>
      </div>
    </OnboardingLayout>
  );
}
