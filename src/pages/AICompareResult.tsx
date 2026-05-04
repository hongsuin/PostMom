import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, CheckCircle, ArrowLeft, TrendingUp, LayoutGrid } from 'lucide-react';
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
      if (!headers) {
        setError('로그인이 필요합니다.');
        return;
      }
      const res = await fetch(`${SERVER_URL}/api/compare`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          academies: selectedAcademies,
          userProfile: onboarding,
        }),
      });
      if (!res.ok) throw new Error('서버 오류가 발생했습니다.');
      const data: AcademyResult[] = await res.json();
      setResults(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'AI 분석 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="compare-scroll h-screen overflow-y-auto relative" style={{ scrollbarWidth: 'none' }}>
      <video autoPlay loop muted playsInline className="fixed inset-0 h-full w-full object-cover -z-10">
        <source src="/correctvideo.mp4" type="video/mp4" />
      </video>
      <div className="fixed inset-0 bg-gradient-to-b from-slate-50/90 to-white/90 -z-10" />

      <div className="relative z-10 max-w-[480px] mx-auto">
        {/* Header */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-primary/20 z-40 px-5 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate('/compare')}
            className="hover:bg-primary/10 rounded-full p-1.5 transition-colors"
          >
            <ArrowLeft size={20} className="text-primary" />
          </button>
          <span className="font-semibold text-slate-900">AI 비교 결과</span>
        </header>

        <div className="px-5 py-6 space-y-4">
          {/* AI 분석 요약 */}
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-5 text-white shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={18} />
              <span className="font-semibold text-sm">AI 분석 요약</span>
            </div>
            <p className="text-sm leading-relaxed opacity-90">
              {summaryText}
              <br />
              우선순위에 맞춰 {selectedAcademies.length}개 학원을 비교하여 가장 적합한 옵션을 추천해 드립니다.
            </p>
          </div>

          {/* 이전 화면으로 버튼 */}
          <button
            onClick={() => navigate('/compare')}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors"
          >
            <ArrowLeft size={15} />
            학원 비교 화면으로 돌아가기
          </button>

          {/* 로딩 */}
          {isLoading && (
            <div className="flex flex-col items-center gap-4 py-16">
              <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-700">AI가 학원을 분석하고 있습니다</p>
                <p className="text-xs text-slate-400 mt-1">잠시만 기다려주세요...</p>
              </div>
            </div>
          )}

          {/* 에러 */}
          {!isLoading && error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
              <p className="text-sm text-red-600 mb-3">{error}</p>
              <button
                onClick={fetchCompare}
                className="text-sm font-semibold text-primary underline"
              >
                다시 시도하기
              </button>
            </div>
          )}

          {/* 학원 카드들 */}
          {!isLoading && !error && results.map((academy, idx) => (
            <div
              key={academy.id}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-white/60"
            >
              {idx === 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle size={15} className="text-primary" />
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">AI 추천 1위</span>
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-lora font-semibold text-lg text-slate-900 mb-1">{academy.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star size={13} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-semibold text-slate-700">{academy.rating}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{academy.matchScore}%</div>
                  <div className="text-xs text-slate-500">적합도</div>
                </div>
              </div>

              {/* AI 추천 이유 */}
              <div className="mb-5">
                <h4 className="text-sm font-semibold text-slate-900 mb-2">AI 추천 이유</h4>
                <ul className="space-y-1.5">
                  {academy.reasons.map((reason, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle size={13} className="text-green-500 mt-0.5 shrink-0" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 세부 비교 */}
              <div className="space-y-2.5 mb-5">
                <h4 className="text-sm font-semibold text-slate-900">세부 비교</h4>
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

              <Link
                to={`/consult/${academy.id}`}
                className="block w-full text-center bg-primary text-white py-3.5 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-colors"
              >
                무료 상담 받기
              </Link>
            </div>
          ))}

          {/* 하단 네비게이션 버튼 */}
          {!isLoading && (
            <div className="grid grid-cols-2 gap-3 pt-2 pb-4">
              <button
                onClick={() => navigate('/compare')}
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary transition-colors"
              >
                <ArrowLeft size={15} />
                다시 선택하기
              </button>
              <Link
                to="/academies"
                className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
              >
                <LayoutGrid size={15} />
                학원 전체보기
              </Link>
            </div>
          )}
        </div>
      </div>
      <style>{`
        .compare-scroll::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
