import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useOnboardingStore } from '../../../store/onboardingStore';
import OnboardingLayout from '../components/OnboardingLayout';
import StepCard from '../components/StepCard';

const GRADES = [
  { value: 'elementary', label: '초등학생', desc: '초1~6' },
  { value: 'middle', label: '중학생', desc: '중1~3' },
  { value: 'high', label: '고등학생', desc: '고1~3' },
] as const;

const LEVELS = [
  { value: 'beginner', label: '처음이에요', desc: '기초부터 시작하고 싶어요' },
  { value: 'average', label: '보통이에요', desc: '어느 정도 알고 있어요' },
  { value: 'advanced', label: '잘해요', desc: '심화·실력 유지가 목표예요' },
] as const;

const DIFFICULTIES = [
  { id: 'lacks_interest', label: '흥미가 없어요', emoji: '😐' },
  { id: 'low_confidence', label: '자신감이 없어요', emoji: '😔' },
  { id: 'weak_grammar', label: '문법이 어려워요', emoji: '📝' },
  { id: 'poor_vocabulary', label: '단어·어휘가 부족해요', emoji: '📖' },
  { id: 'test_performance', label: '시험 성적이 걱정돼요', emoji: '📋' },
];

export default function OnboardingStep1() {
  const navigate = useNavigate();
  const { data, updateData } = useOnboardingStore();

  const toggleDifficulty = (id: string) => {
    const next = data.difficulties.includes(id)
      ? data.difficulties.filter((d) => d !== id)
      : [...data.difficulties, id];
    updateData({ difficulties: next });
  };

  const canProceed = data.childGrade && data.englishLevel;

  return (
    <OnboardingLayout
      step={1}
      subtitle="AI가 아이를 이해하는 첫 걸음"
      title="우리 아이를 알려주세요"
      description="학원 추천의 정확도가 올라가요. 솔직하게 답해주세요."
    >
      {/* Grade */}
      <div className="mb-8">
        <p className="text-sm font-medium text-slate-700 mb-3">학년</p>
        <div className="grid grid-cols-3 gap-3">
          {GRADES.map((g) => (
            <StepCard
              key={g.value}
              selected={data.childGrade === g.value}
              onClick={() => updateData({ childGrade: g.value })}
              className="p-4 text-center"
            >
              <p className="font-semibold text-slate-900">{g.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{g.desc}</p>
            </StepCard>
          ))}
        </div>
      </div>

      {/* English Level */}
      <div className="mb-8">
        <p className="text-sm font-medium text-slate-700 mb-3">
          현재 영어 실력은 어느 정도인가요?
        </p>
        <div className="space-y-3">
          {LEVELS.map((l) => (
            <StepCard
              key={l.value}
              selected={data.englishLevel === l.value}
              onClick={() => updateData({ englishLevel: l.value })}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  <Sparkles size={18} className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{l.label}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{l.desc}</p>
                </div>
              </div>
            </StepCard>
          ))}
        </div>
      </div>

      {/* Difficulties */}
      <div className="mb-10">
        <p className="text-sm font-medium text-slate-700 mb-3">
          고민되는 점이 있나요? (복수 선택)
        </p>
        <div className="flex flex-wrap gap-2">
          {DIFFICULTIES.map((d) => {
            const selected = data.difficulties.includes(d.id);
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => toggleDifficulty(d.id)}
                className={`
                  inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium
                  transition-all duration-200
                  ${selected
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }
                `}
              >
                <span>{d.emoji}</span>
                <span>{d.label}</span>
              </button>
            );
          })}
        </div>
        {data.difficulties.length === 0 && (
          <p className="text-xs text-slate-400 mt-2">
            없으면 넘어가도 돼요
          </p>
        )}
      </div>

      {/* CTA */}
      <button
        onClick={() => navigate('/onboarding/2')}
        disabled={!canProceed}
        className="w-full py-4 rounded-2xl font-semibold text-white bg-primary disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-200 hover:enabled:bg-primary/90 active:enabled:scale-[0.99]"
      >
        다음
      </button>
    </OnboardingLayout>
  );
}
