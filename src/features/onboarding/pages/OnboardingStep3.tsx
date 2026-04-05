import { useNavigate } from 'react-router-dom';
import { Users, User, HelpCircle } from 'lucide-react';
import { useOnboardingStore } from '../../../store/onboardingStore';
import OnboardingLayout from '../components/OnboardingLayout';
import StepCard from '../components/StepCard';

const CLASS_TYPES = [
  { value: 'small_group', label: '소수 정예', desc: '친구들과 함께 배우면 좋아요', icon: Users },
  { value: 'one_on_one', label: '1:1 맞춤', desc: '혼자 집중해서 배우고 싶어요', icon: User },
  { value: 'no_preference', label: '상관없어요', desc: '좋은 학원이면 돼요', icon: HelpCircle },
] as const;

const TEACHING_STYLES = [
  { value: 'fun', label: '재미·활동 위주', desc: '놀면서 자연스럽게' },
  { value: 'systematic', label: '체계적·학업 위주', desc: '문법, 독해 중심으로' },
  { value: 'balanced', label: '절충형', desc: '재미와 실력 둘 다' },
] as const;

export default function OnboardingStep3() {
  const navigate = useNavigate();
  const { data, updateData } = useOnboardingStore();

  const canProceed = data.classType && data.teachingStyle;

  return (
    <OnboardingLayout
      step={3}
      subtitle="아이에게 맞는 학습 방식"
      title="어떤 수업 스타일을 선호하세요?"
      description="선호하는 수업 방식에 맞는 학원을 추천해드려요."
    >
      {/* Class Type */}
      <div className="mb-8">
        <p className="text-sm font-medium text-slate-700 mb-3">수업 형태</p>
        <div className="grid grid-cols-3 gap-3">
          {CLASS_TYPES.map((c) => {
            const Icon = c.icon;
            return (
              <StepCard
                key={c.value}
                selected={data.classType === c.value}
                onClick={() => updateData({ classType: c.value })}
                className="p-4 text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-2">
                  <Icon size={22} className="text-slate-600" />
                </div>
                <p className="font-semibold text-slate-900 text-sm">{c.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{c.desc}</p>
              </StepCard>
            );
          })}
        </div>
      </div>

      {/* Teaching Style */}
      <div className="mb-10">
        <p className="text-sm font-medium text-slate-700 mb-3">선호하는 지도 방식</p>
        <div className="space-y-3">
          {TEACHING_STYLES.map((t) => (
            <StepCard
              key={t.value}
              selected={data.teachingStyle === t.value}
              onClick={() => updateData({ teachingStyle: t.value })}
            >
              <div>
                <p className="font-semibold text-slate-900">{t.label}</p>
                <p className="text-sm text-slate-500 mt-0.5">{t.desc}</p>
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
          onClick={() => navigate('/onboarding/4')}
          disabled={!canProceed}
          className="flex-1 py-4 rounded-2xl font-semibold text-white bg-primary disabled:bg-slate-300 disabled:cursor-not-allowed transition-all hover:enabled:bg-primary/90 active:enabled:scale-[0.99]"
        >
          다음
        </button>
      </div>
    </OnboardingLayout>
  );
}
