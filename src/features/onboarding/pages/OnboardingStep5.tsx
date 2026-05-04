import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, CheckCircle2 } from 'lucide-react';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { getSupabaseBrowserClient } from '../../../lib/supabase';
import { syncUserProfile } from '../../../lib/syncUserProfile';
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

function SavedPopup({ onConfirm }: { onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl"
        style={{ animation: 'popup-in 0.3s cubic-bezier(0.16,1,0.3,1) forwards' }}
      >
        <style>{`
          @keyframes popup-in {
            from { opacity: 0; transform: scale(0.92) translateY(12px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

        {/* 아이콘 */}
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 size={36} className="text-primary" />
          </div>
        </div>

        {/* 텍스트 */}
        <h2 className="font-lora text-xl font-semibold text-slate-900 text-center mb-2">
          자녀 정보가 저장되었습니다
        </h2>
        <p className="text-sm text-slate-500 text-center leading-relaxed mb-8">
          입력하신 정보를 바탕으로<br />홈 카드에 표시됩니다.
        </p>

        {/* 확인 버튼 */}
        <button
          onClick={onConfirm}
          className="w-full py-3.5 rounded-2xl bg-primary text-white font-semibold text-base hover:bg-primary/90 transition-colors active:scale-[0.98]"
        >
          홈으로 이동
        </button>
      </div>
    </div>
  );
}

export default function OnboardingStep5() {
  const navigate = useNavigate();
  const { data, updateData } = useOnboardingStore();
  const [saving, setSaving] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const canProceed = !!data.trustFactor;

  const handleComplete = async () => {
    if (!canProceed || saving) return;
    setSaving(true);
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.updateUser({
        data: {
          onboarding: {
            childGrade: data.childGrade,
            englishLevel: data.englishLevel,
            difficulties: data.difficulties,
            priorities: data.priorities,
            classType: data.classType,
            teachingStyle: data.teachingStyle,
            budgetRange: data.budgetRange,
            distance: data.distance,
            trustFactor: data.trustFactor,
          },
        },
      });
      await syncUserProfile(data);
      setShowPopup(true);
    } catch {
      // 저장 실패해도 팝업은 표시
      setShowPopup(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {showPopup && (
        <SavedPopup onConfirm={() => navigate('/', { replace: true })} />
      )}

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
            disabled={!canProceed || saving}
            className="flex-1 py-4 rounded-2xl font-semibold text-white bg-primary disabled:bg-slate-300 disabled:cursor-not-allowed transition-all hover:enabled:bg-primary/90 active:enabled:scale-[0.99]"
          >
            {saving ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </OnboardingLayout>
    </>
  );
}
