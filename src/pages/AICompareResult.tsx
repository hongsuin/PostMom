import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, CheckCircle, ArrowLeft, TrendingUp, LayoutGrid, Zap } from 'lucide-react';
import { useOnboardingStore } from '../store/onboardingStore';
import { useCompareStore } from '../store/compareStore';
import { getSupabaseBrowserClient } from '../lib/supabase';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

interface AcademyResult {
  id: string;
  name: string;
  rating: number;
  matchScore: number;
  reasons: string[];
  curriculumFit: number;
  teachingQuality: number;
  priceFit: number;
  distanceFit: number;
}

const GRADE_LABELS: Record<string, string> = { elementary: '초등학생', middle: '중학생', high: '고등학생' };
const LEVEL_LABELS: Record<string, string> = { beginner: '기초', average: '보통', advanced: '상급' };

async function getAuthHeader(): Promise<{ Authorization: string } | null> {
  const supabase = getSupabaseBrowserClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return null;
  return { Authorization: `Bearer ${token}` };
}

export default function AICompareResult() {
  const navigate = useNavigate();
  const { data: onboarding } = useOnboardingStore();
  const { selectedAcademies } = useCompareStore();

  const [results, setResults] = useState<AcademyResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const summaryParts: string[] = [];
  if (onboarding.childGrade) summaryParts.push(GRADE_LABELS[onboarding.childGrade] || onboarding.childGrade);
  if (onboarding.englishLevel) summaryParts.push(`${LEVEL_LABELS[onboarding.englishLevel] || onboarding.englishLevel} 수준`);
  if (onboarding.budgetRange) summaryParts.push('예산 조건 반영');
  if (onboarding.distance) summaryParts.push('거리 조건 반영');
  const summaryText = summaryParts.length > 0
    ? summaryParts.join(' / ') + ' 기반으로 학원을 분석했습니다.'
    : '선택하신 학원을 AI가 분석했습니다.';

  useEffect(() => {
    if (selectedAcademies.length < 2) {
      navigate('/compare');
      return;
    }
    fetchCompare();
  }, []);

  async function fetchCompare() {
    setIsLoading(true);
    setError(null);
    try {
      const headers = await getAuthHeader();
      if (!headers) { setError('로그인이 필요합니다.'); return; }
      const res = await fetch(`${SERVER_URL}/api/compare`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ academies: selectedAcademies, userProfile: onboarding }),
      });
      if (!res.ok) throw new Error('서버 오류가 발생했습니다.');
      setResults(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'AI 분석 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="compare-scroll min-h-screen overflow-y-auto bg-slate-50" style={{ scrollbarWidth: 'none' }}>
      <style>{`.compare-scroll::-webkit-scrollbar { display: none; }`}</style>

      {/* Header — matches AICompare */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1400px] px-8 py-10 xl:px-12">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <button
                onClick={() => navigate('/compare')}
                className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-primary transition-colors mb-3"
              >
                <ArrowLeft size={15} />
                학원 비교로 돌아가기
              </button>
              <p className="mb-1.5 text-sm font-semibold uppercase tracking-wider text-primary">AI 비교 결과</p>
              <h1 className="font-lora text-3xl font-semibold text-slate-900 xl:text-4xl">학원 AI 비교 분석</h1>
              <p className="mt-2 text-slate-500">{summaryText}</p>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-3 self-start md:self-auto">
              <TrendingUp size={16} className="text-primary" />
              <span className="text-sm font-medium text-primary">{selectedAcademies.length}개 학원 분석</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-8 py-8 xl:px-12">

        {/* 로딩 */}
        {isLoading && (
          <div className="flex gap-8">
            {/* 로딩 메인 */}
            <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-12 flex flex-col items-center gap-6">
              <div className="w-14 h-14 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <div className="text-center">
                <p className="text-base font-semibold text-slate-700">AI가 학원을 분석하고 있습니다</p>
                <p className="text-sm text-slate-400 mt-1">잠시만 기다려주세요...</p>
              </div>
            </div>
            {/* 선택된 학원 사이드 */}
            <aside className="hidden w-72 shrink-0 lg:block xl:w-80">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
                <h2 className="font-semibold text-slate-900 mb-4">분석 중인 학원</h2>
                <div className="flex flex-col gap-2.5">
                  {selectedAcademies.map((a, i) => (
                    <div key={a.id} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                      <span className="w-6 h-6 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                      <span className="text-sm font-medium text-slate-700 truncate">{a.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* 에러 */}
        {!isLoading && error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-lg mx-auto">
            <p className="text-sm text-red-600 mb-3">{error}</p>
            <button onClick={fetchCompare} className="text-sm font-semibold text-primary underline">
              다시 시도하기
            </button>
          </div>
        )}

        {/* 결과 */}
        {!isLoading && !error && results.length > 0 && (
          <div className="flex gap-8">
            {/* 카드 목록 */}
            <div className="flex-1 min-w-0 flex flex-col gap-5">
              {results.map((academy, idx) => (
                <div
                  key={academy.id}
                  className={`bg-white rounded-2xl border shadow-sm p-6 transition-all ${idx === 0 ? 'border-primary/30 shadow-primary/10' : 'border-slate-200'}`}
                >
                  {idx === 0 && (
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle size={15} className="text-primary" />
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">AI 추천 1위</span>
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <h3 className="font-lora font-semibold text-xl text-slate-900 mb-1">{academy.name}</h3>
                      <div className="flex items-center gap-1.5">
                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-semibold text-slate-700">{academy.rating}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">{academy.matchScore}%</div>
                      <div className="text-xs text-slate-500 mt-0.5">적합도</div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* AI 추천 이유 */}
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 mb-3">AI 추천 이유</h4>
                      <ul className="space-y-2">
                        {academy.reasons.map((reason, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                            <CheckCircle size={13} className="text-green-500 mt-0.5 shrink-0" />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 세부 비교 */}
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 mb-3">세부 비교</h4>
                      <div className="space-y-3">
                        {[
                          { label: '커리큘럼 적합도', score: academy.curriculumFit },
                          { label: '강의 품질', score: academy.teachingQuality },
                          { label: '가격 적합도', score: academy.priceFit },
                          { label: '거리 적합도', score: academy.distanceFit },
                        ].map(({ label, score }) => (
                          <div key={label}>
                            <div className="flex justify-between text-xs text-slate-500 mb-1">
                              <span>{label}</span>
                              <span className="font-medium text-slate-700">{score}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-primary/70 to-primary rounded-full transition-all duration-500"
                                style={{ width: `${score}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-5 border-t border-slate-100">
                    <Link
                      to={`/consult/${academy.id}`}
                      className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
                    >
                      무료 상담 받기
                    </Link>
                  </div>
                </div>
              ))}

              {/* 하단 버튼 */}
              <div className="flex gap-3 pt-2 pb-6">
                <button
                  onClick={() => navigate('/compare')}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary transition-colors"
                >
                  <ArrowLeft size={15} />
                  다시 선택하기
                </button>
                <Link
                  to="/academies"
                  className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
                >
                  <LayoutGrid size={15} />
                  학원 전체보기
                </Link>
              </div>
            </div>

            {/* 사이드 패널 */}
            <aside className="hidden w-72 shrink-0 lg:block xl:w-80">
              <div className="sticky top-8 space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 px-6 py-4">
                    <h2 className="font-semibold text-slate-900">분석된 학원</h2>
                    <p className="mt-0.5 text-xs text-slate-400">적합도 기준 순위</p>
                  </div>
                  <div className="p-6 space-y-2.5">
                    {results.map((a, i) => (
                      <div key={a.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 ${i === 0 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}>{i + 1}</span>
                          <span className="text-sm font-medium text-slate-700 truncate">{a.name}</span>
                        </div>
                        <span className="text-sm font-bold text-primary shrink-0">{a.matchScore}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl bg-slate-100 p-4 text-xs text-slate-500 leading-relaxed">
                  <p className="mb-1 font-semibold text-slate-700">💡 분석 기준</p>
                  <ul className="space-y-1">
                    <li>· 커리큘럼 및 학습 목표 부합도</li>
                    <li>· 강의 품질 및 교사 역량</li>
                    <li>· 예산 및 가격 적합성</li>
                    <li>· 거리 및 접근성</li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/8 to-purple-500/8 p-5">
                  <p className="font-semibold text-slate-900 text-sm mb-1">더 정확한 추천을 원하세요?</p>
                  <p className="text-xs text-slate-500 mb-3">우리 아이 정보를 입력하면 맞춤 분석을 제공합니다</p>
                  <Link
                    to="/onboarding/1"
                    className="flex items-center justify-center gap-2 rounded-xl border border-primary bg-white px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary hover:text-white transition-all"
                  >
                    <Zap size={14} />
                    맞춤 분석 받기
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
