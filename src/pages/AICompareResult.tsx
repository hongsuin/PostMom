import { Link, useNavigate } from 'react-router-dom';
import { Star, CheckCircle, ArrowLeft, TrendingUp, LayoutGrid } from 'lucide-react';
import { useOnboardingStore } from '../store/onboardingStore';

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

const mockResults: AcademyResult[] = [
  {
    id: 'naver-심슨어학원위례캠퍼스',
    name: '심슨어학원 위례캠퍼스',
    rating: 4.8,
    matchScore: 92,
    reasons: ['통학 거리 12분으로 조건 충족', '숙제 관리 강점 → 학습 습관 개선에 적합', '예산 범위 내 (월 30만원)', '문제해결력 향상 프로그램 보유'],
    curriculumFit: 95, teachingQuality: 90, priceFit: 88, distanceFit: 92
  },
  {
    id: 'naver-아발론랭콘위례캠퍼스',
    name: '아발론랭콘 위례캠퍼스',
    rating: 4.6,
    matchScore: 85,
    reasons: ['통학 거리 18분으로 가까운 편', '개별 맞춤 커리큘럼 제공', '예산 범위 내 (월 28만원)', '학습 목표 달성률 높음'],
    curriculumFit: 88, teachingQuality: 85, priceFit: 90, distanceFit: 78
  },
  {
    id: 'naver-리드101영어학원위례점',
    name: '리드101영어학원 위례점',
    rating: 4.7,
    matchScore: 78,
    reasons: ['통학 거리 25분으로 약간 먼 편', '실력 향상 프로그램 우수', '예산 범위 내 (월 32만원)', '소규모 클래스 운영'],
    curriculumFit: 82, teachingQuality: 88, priceFit: 85, distanceFit: 65
  }
];

const GRADE_LABELS: Record<string, string> = { elementary: '초등학생', middle: '중학생', high: '고등학생' };
const LEVEL_LABELS: Record<string, string> = { beginner: '기초', average: '보통', advanced: '상급' };

export default function AICompareResult() {
  const navigate = useNavigate();
  const { data } = useOnboardingStore();

  const summaryParts: string[] = [];
  if (data.childGrade) summaryParts.push(GRADE_LABELS[data.childGrade] || data.childGrade);
  if (data.englishLevel) summaryParts.push(`${LEVEL_LABELS[data.englishLevel] || data.englishLevel} 수준`);
  if (data.budgetRange) summaryParts.push('예산 조건 반영');
  if (data.distance) summaryParts.push('거리 조건 반영');
  const summaryText = summaryParts.length > 0
    ? summaryParts.join(' / ') + ' 기반으로 1,136개 학부모 리뷰를 분석했습니다.'
    : '1,136개 학부모 리뷰를 분석했습니다.';

  return (
    <div className="min-h-screen relative overflow-hidden">
      <video autoPlay loop muted playsInline className="absolute inset-0 h-full w-full object-cover">
        <source src="/correctvideo.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50/90 to-white/90" />

      <div className="relative z-10 max-w-[480px] mx-auto min-h-screen">
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
              우선순위에 맞춰 3개 학원을 비교하여 가장 적합한 옵션을 추천해 드립니다.
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

          {/* 학원 카드들 */}
          {mockResults.map((academy, idx) => (
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
        </div>
      </div>
    </div>
  );
}
