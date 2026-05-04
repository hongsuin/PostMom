import { Link, useNavigate } from 'react-router-dom';
import { Zap, Sparkles, Star, MapPin, Check, X, CheckCircle } from 'lucide-react';
import { academies } from '../data/mockData';
import { useState } from 'react';
import { useCompareStore } from '../store/compareStore';
import { useOnboardingStore } from '../store/onboardingStore';
import { LEARNING_TYPES } from '../data/learningTypes';

const SUBJECT_COLORS: Record<string, string> = {
  수학: 'bg-blue-50 text-blue-700',
  영어: 'bg-green-50 text-green-700',
  과학: 'bg-orange-50 text-orange-700',
};

export default function AICompare() {
  const navigate = useNavigate();
  const setCompare = useCompareStore((s) => s.setSelected);
  const { data: onboarding } = useOnboardingStore();
  const [selected, setSelected] = useState<string[]>([]);

  const learningType = onboarding.learningType;
  const typeData = learningType ? LEARNING_TYPES[learningType] : null;

  function handleCompare() {
    if (selected.length < 2) return;
    const selectedAcademies = academies.filter((a) => selected.includes(a.id));
    setCompare(selected, selectedAcademies);
    navigate('/compare/result');
  }

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < 3
        ? [...prev, id]
        : prev
    );
  };

  const selectedAcademies = academies.filter((a) => selected.includes(a.id));
  const canCompare = selected.length >= 2;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page hero */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1400px] px-8 py-10 xl:px-12">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-1.5 text-sm font-semibold uppercase tracking-wider text-primary">
                AI 비교
              </p>
              <h1 className="font-lora text-3xl font-semibold text-slate-900 xl:text-4xl">
                학원 AI 비교 분석
              </h1>
              <p className="mt-2 text-slate-500">
                최대 3개 학원을 선택하면 AI가 강점·약점·추천 이유를 심층 분석합니다
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-3">
              <Sparkles size={16} className="text-primary" />
              <span className="text-sm font-medium text-primary">
                {selected.length}/3 선택됨
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-8 py-8 xl:px-12">
        <div className="flex gap-8">
          {/* ── LEFT: ACADEMY SELECTION ──────────────────── */}
          <div className="flex-1 min-w-0">
            <p className="mb-5 text-sm font-medium text-slate-500">
              비교할 학원을 선택하세요 (2~3개)
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {academies.map((a) => {
                const isSelected = selected.includes(a.id);
                const isDisabled = !isSelected && selected.length >= 3;

                return (
                  <button
                    key={a.id}
                    onClick={() => !isDisabled && toggle(a.id)}
                    disabled={isDisabled}
                    className={`group relative flex flex-col rounded-2xl border-2 p-5 text-left transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                        : isDisabled
                        ? 'cursor-not-allowed border-slate-200 bg-slate-100 opacity-50'
                        : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md'
                    }`}
                  >
                    {/* Selection indicator */}
                    <div
                      className={`absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                        isSelected
                          ? 'border-primary bg-primary'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check size={13} className="text-white" strokeWidth={3} />}
                    </div>

                    {/* Subject badge */}
                    <span
                      className={`mb-3 inline-block self-start rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        SUBJECT_COLORS[a.subject] ?? 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {a.subject}
                    </span>

                    <h3 className="pr-8 text-base font-semibold text-slate-900">{a.name}</h3>
                    <p className="mt-1 text-sm text-slate-500 line-clamp-2">{a.description}</p>

                    {/* Tags */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {a.tags.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
                      <span className="flex items-center gap-1 text-slate-400">
                        <MapPin size={11} /> {a.location}
                      </span>
                      <div className="flex items-center gap-1 text-slate-700">
                        <Star size={11} className="fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{a.rating}</span>
                        <span className="text-slate-400">({a.reviewCount})</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Onboarding CTA */}
            <div className="mt-8 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/8 to-purple-500/8 p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">
                    어떤 학원이 맞는지 모르겠다면?
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    AI 맞춤 추천으로 우리 아이에게 최적화된 학원 리스트를 받아보세요
                  </p>
                </div>
                <Link
                  to="/onboarding/1"
                  className="shrink-0 rounded-xl border border-primary bg-white px-6 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-white"
                >
                  ✨ AI 맞춤 추천 받기
                </Link>
              </div>
            </div>
          </div>

          {/* ── RIGHT: COMPARE PANEL ─────────────────────── */}
          <aside className="hidden w-72 shrink-0 lg:block xl:w-80">
            <div className="sticky top-24">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-4">
                  <h2 className="font-semibold text-slate-900">선택된 학원</h2>
                  <p className="mt-0.5 text-xs text-slate-400">최소 2개 선택 후 AI 비교 시작</p>
                </div>

                <div className="p-6">
                  {/* Selected list */}
                  <div className="mb-5 space-y-2.5">
                    {[0, 1, 2].map((i) => {
                      const academy = selectedAcademies[i];
                      return (
                        <div
                          key={i}
                          className={`flex items-center gap-3 rounded-xl p-3 ${
                            academy ? 'bg-primary/5' : 'border border-dashed border-slate-200 bg-slate-50'
                          }`}
                        >
                          <div
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                              academy
                                ? 'bg-primary text-white'
                                : 'bg-slate-200 text-slate-400'
                            }`}
                          >
                            {i + 1}
                          </div>
                          {academy ? (
                            <div className="flex flex-1 items-center justify-between min-w-0">
                              <p className="truncate text-sm font-medium text-slate-800">
                                {academy.name}
                              </p>
                              <button
                                onClick={() => toggle(academy.id)}
                                className="ml-2 shrink-0 rounded-full p-0.5 text-slate-400 hover:bg-red-50 hover:text-red-400 transition-colors"
                              >
                                <X size={13} />
                              </button>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400">학원을 선택하세요</p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Progress bar */}
                  <div className="mb-5">
                    <div className="mb-1.5 flex justify-between text-xs text-slate-400">
                      <span>선택 진행도</span>
                      <span>{selected.length}/3</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${(selected.length / 3) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* 우리 아이 정보 추가 */}
                  {typeData ? (
                    <div className="mb-2 flex w-full flex-col gap-1.5">
                      <div className="flex items-center gap-2 rounded-xl bg-primary/5 border border-primary/20 px-4 py-3">
                        <CheckCircle size={15} className="text-primary shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-primary">학습 유형 분석 완료</p>
                          <p className="text-xs text-slate-500 truncate"> {typeData.name}</p>
                        </div>
                        <Link to="/learning-test" className="text-[11px] text-slate-400 hover:text-primary transition-colors shrink-0">
                          재검사
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <Link
                      to="/onboarding/1"
                      className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl border border-primary py-3.5 text-sm font-semibold text-primary transition-all hover:bg-primary/5"
                    >
                      <Sparkles size={15} />
                      우리 아이 정보 추가
                    </Link>
                  )}

                  {/* Compare CTA */}
                  <button
                    onClick={handleCompare}
                    disabled={!canCompare}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-all ${
                      canCompare
                        ? 'bg-primary text-white shadow-md shadow-primary/30 hover:opacity-90 hover:scale-[1.02]'
                        : 'cursor-not-allowed bg-slate-100 text-slate-400'
                    }`}
                  >
                    <Zap size={15} />
                    AI 비교 분석 시작
                  </button>

                  {!canCompare && (
                    <p className="mt-2.5 text-center text-xs text-slate-400">
                      {2 - selected.length}개 더 선택해주세요
                    </p>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      {selected.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white p-4 lg:hidden">
          <button
            onClick={handleCompare}
            disabled={!canCompare}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold ${
              canCompare
                ? 'bg-primary text-white'
                : 'bg-slate-200 text-slate-400'
            }`}
          >
            <Zap size={15} />
            AI 비교 시작 ({selected.length}/3)
          </button>
        </div>
      )}
    </div>
  );
}
