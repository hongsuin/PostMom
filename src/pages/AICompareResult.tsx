import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, CheckCircle, ArrowLeft, AlertCircle, Award, BookOpen, Users, Target, Lightbulb } from 'lucide-react';
import { useOnboardingStore } from '../store/onboardingStore';
import { useCompareStore } from '../store/compareStore';
import { LEARNING_TYPES } from '../data/learningTypes';
import { getSupabaseBrowserClient } from '../lib/supabase';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
const GUIDE_ICONS = [BookOpen, Users, Target];

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const learningType = onboarding.learningType;
  const typeData = learningType ? LEARNING_TYPES[learningType] : null;

  const TABS = ['AI 추천', '자녀 장점', '선택 기준'];

  function handleTabChange(idx: number) {
    scrollRef.current?.scrollTo({ top: 0 });
    setActiveTab(idx);
  }

  useEffect(() => {
    if (typeData && selectedAcademies.length >= 2) {
      fetchCompare();
    }
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
        body: JSON.stringify({
          academies: selectedAcademies,
          userProfile: {
            ...onboarding,
            learningTypeName: typeData?.name,
            learningTypeDesc: typeData?.desc,
            learningTypeStrengths: typeData?.strengths,
            learningTypeGuide: typeData?.guide,
            learningTypeCaution: typeData?.caution,
          },
        }),
      });
      if (!res.ok) throw new Error('서버 오류가 발생했습니다.');
      const data: AcademyResult[] = await res.json();
      setResults(data);
      localStorage.setItem('lastRecommendation', JSON.stringify({
        results: data.map(({ id, name, rating, matchScore }) => ({ id, name, rating, matchScore })),
        savedAt: new Date().toISOString(),
      }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'AI 분석 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }

  // 학습유형 미설정
  if (!typeData) {
    return (
      <div className="compare-scroll h-screen overflow-y-auto bg-slate-50 flex items-center justify-center" style={{ scrollbarWidth: 'none' }}>
        <style>{`.compare-scroll::-webkit-scrollbar { display: none; }`}</style>
        <div className="text-center max-w-sm px-6">
          <p className="text-4xl mb-4">🧠</p>
          <h2 className="text-lg font-bold text-slate-900 mb-2">학습 유형 분석이 필요해요</h2>
          <p className="text-sm text-slate-500 mb-6">
            학습 유형 테스트를 먼저 완료해야<br />맞춤 학원 추천 리포트를 볼 수 있어요.
          </p>
          <Link to="/learning-test" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors">
            학습 유형 테스트 하러 가기
          </Link>
          <button onClick={() => navigate(-1)} className="mt-3 flex items-center gap-1.5 mx-auto text-sm text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft size={14} /> 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="compare-scroll h-screen overflow-y-auto bg-slate-50" style={{ scrollbarWidth: 'none' }}>
      <style>{`.compare-scroll::-webkit-scrollbar { display: none; }`}</style>

      {/* ── 페이지 헤더 ── */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1400px] px-8 py-10 xl:px-12">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-primary transition-colors mb-4">
            <ArrowLeft size={15} /> 돌아가기
          </button>
          <p className="mb-1.5 text-sm font-semibold uppercase tracking-wider text-primary">AI 분석 결과</p>
          <h1 className="font-lora text-3xl font-semibold text-slate-900 xl:text-4xl">맞춤 학원 추천 리포트</h1>
          <p className="mt-2 text-slate-500">
            <span className="font-semibold text-slate-700">{typeData.emoji} {typeData.name}</span> 유형을 기반으로 최적의 학원을 추천해 드립니다
          </p>
        </div>
      </div>

      {/* ── 탭 바 ── */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-100">
        <div className="mx-auto max-w-[1400px] px-8 xl:px-12 flex">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => handleTabChange(i)}
              className={`relative py-3.5 mr-6 text-sm font-semibold transition-colors ${
                activeTab === i ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab}
              {activeTab === i && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-8 py-8 xl:px-12">
        <div className="flex gap-8">

          {/* ── 메인 콘텐츠 ── */}
          <div className="flex-1 min-w-0 space-y-8">

            {/* ① 자녀의 장점 */}
            {/* ① 자녀의 장점 */}
            {activeTab === 1 && (
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-7 h-7 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center shrink-0">1</div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">자녀의 학습 장점</h2>
                    <p className="text-sm text-slate-400">분석된 학습 유형과 강점이에요</p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-5 px-6 py-5 border-b border-slate-100">
                    <img src={typeData.image} alt={typeData.name} className="w-16 h-16 object-contain shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary mb-2">학습 유형 분석 완료</span>
                      <h3 className="text-lg font-bold text-slate-900 mb-0.5">{typeData.name}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{typeData.desc}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-px bg-slate-100">
                    {typeData.strengths.map((strength, i) => (
                      <div key={i} className="bg-white px-5 py-4">
                        <p className="text-[11px] font-semibold text-primary mb-1.5">강점 {i + 1}</p>
                        <p className="text-sm font-bold text-slate-900">{strength}</p>
                      </div>
                    ))}
                  </div>
                  <div className="px-6 py-4 flex items-start gap-3 bg-amber-50 border-t border-amber-100">
                    <Lightbulb size={15} className="text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-amber-700 leading-relaxed">
                      <span className="font-semibold">참고해주세요 · </span>{typeData.caution}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* ② 학원 선택 기준 */}
            {activeTab === 2 && (
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-7 h-7 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center shrink-0">2</div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">장점을 극대화할 학원 선택 기준</h2>
                    <p className="text-sm text-slate-400">{typeData.name} 유형에게 맞는 학원 환경이에요</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {typeData.guide.map((criterion, i) => {
                    const Icon = GUIDE_ICONS[i] ?? BookOpen;
                    return (
                      <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon size={18} className="text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-sm font-semibold text-slate-900">추천 기준 {i + 1}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">추천</span>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed">{criterion}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-start gap-4 opacity-75">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      <AlertCircle size={18} className="text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-sm font-semibold text-slate-900">이런 환경은 피하세요</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">주의</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{typeData.caution}</p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ③ 추천 학원 */}
            {activeTab === 0 && (
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-7 h-7 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center shrink-0">3</div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">선택한 학원 AI 비교 결과</h2>
                    <p className="text-sm text-slate-400">{typeData.name} 유형 기준으로 POSTMOM AI가 분석했어요</p>
                  </div>
                </div>
                {selectedAcademies.length < 2 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
                    <p className="text-2xl mb-3">🏫</p>
                    <p className="text-sm font-semibold text-slate-700 mb-1">비교할 학원을 2개 이상 선택해주세요</p>
                    <p className="text-xs text-slate-400 mb-5">학원 비교 화면에서 2~3개의 학원을 선택하면<br />유형에 맞게 AI가 심층 분석해 드려요</p>
                    <Link to="/compare" className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors">
                      학원 선택하러 가기
                    </Link>
                  </div>
                ) : isLoading ? (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 flex flex-col items-center gap-5">
                    <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <div className="text-center">
                      <p className="text-sm font-semibold text-slate-700">POSTMOM AI가 학원을 분석하고 있습니다</p>
                      <p className="text-xs text-slate-400 mt-1">{typeData.name} 유형 기준으로 비교 중...</p>
                    </div>
                    <div className="w-full max-w-sm flex flex-col gap-2">
                      {selectedAcademies.map((a, i) => (
                        <div key={a.id} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-2.5 border border-slate-100">
                          <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                          <span className="text-sm font-medium text-slate-700 truncate">{a.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                    <p className="text-sm text-red-600 mb-3">{error}</p>
                    <button onClick={fetchCompare} className="text-sm font-semibold text-primary underline">다시 시도하기</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {results.map((academy, idx) => (
                      <div key={academy.id} className={`bg-white rounded-2xl border shadow-sm p-6 ${idx === 0 ? 'border-primary/40 shadow-primary/10' : 'border-slate-200'}`}>
                        {idx === 0 && (
                          <div className="flex items-center gap-2 mb-4">
                            <CheckCircle size={15} className="text-primary" />
                            <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">{typeData.name} 유형에 가장 적합</span>
                          </div>
                        )}
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-lora font-semibold text-xl text-slate-900 mb-1">{academy.name}</h3>
                            <div className="flex items-center gap-1.5">
                              <Star size={13} className="text-yellow-400 fill-yellow-400" />
                              <span className="text-sm font-semibold text-slate-700">{academy.rating}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-primary leading-none">{academy.matchScore}%</div>
                            <div className="text-xs text-slate-400 mt-1">적합도</div>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-sm font-semibold text-slate-900 mb-3">AI 추천 이유</h4>
                            <ul className="space-y-2">
                              {academy.reasons.map((r, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                  <CheckCircle size={13} className="text-primary mt-0.5 shrink-0" />
                                  <span>{r}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-slate-900 mb-3">세부 적합도</h4>
                            <div className="space-y-3">
                              {[
                                { label: '커리큘럼 적합도', score: academy.curriculumFit },
                                { label: '강의 품질', score: academy.teachingQuality },
                                { label: '가격 적합도', score: academy.priceFit },
                                { label: '거리 적합도', score: academy.distanceFit },
                              ].map(({ label, score }) => (
                                <div key={label}>
                                  <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                                    <span>{label}</span>
                                    <span className="font-semibold text-slate-700">{score}%</span>
                                  </div>
                                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-primary/70 to-primary rounded-full" style={{ width: `${score}%` }} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="mt-5 pt-4 border-t border-slate-100">
                          <Link to={`/consult/${academy.id}`} className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors shadow-sm shadow-primary/30">
                            무료 상담 받기
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-3 mt-6 pb-8">
                  <button onClick={() => navigate('/compare')} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary transition-colors">
                    <ArrowLeft size={15} /> 학원 다시 선택
                  </button>
                  <Link to="/academies" className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors">
                    학원 전체보기
                  </Link>
                </div>
              </section>
            )}
          </div>

          {/* ── 사이드 패널 ── */}
          <aside className="hidden w-72 shrink-0 lg:block xl:w-80">
            <div className="sticky top-8 space-y-4">

              

              {results.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 px-6 py-4">
                    <h2 className="font-semibold text-slate-900">AI 추천 순위</h2>
                    <p className="mt-0.5 text-xs text-slate-400">적합도 기준</p>
                  </div>
                  <div className="p-5 space-y-2">
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
              )}

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
                <p className="text-sm font-semibold text-slate-900 mb-1">다른 유형으로 분석하려면?</p>
                <p className="text-xs text-slate-400 mb-3">마이페이지에서 학습 유형을 변경할 수 있어요</p>
                <Link to="/mypage" className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary transition-all">
                  마이페이지로 이동
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
