import { Link, useNavigate } from 'react-router-dom';
import { Star, CheckCircle, ArrowLeft, BookOpen, Users, MessageSquare, Target, Clock, Award, AlertCircle } from 'lucide-react';

// ── 목업 데이터 (추후 learningTypeTest 결과로 교체) ──────────────────
const MOCK_CHILD = {
  badge: '학습 유형 분석 완료',
  title: '꼼꼼하고 체계적인 학습자예요',
  subtitle: '논리적 사고와 집중력이 가장 큰 장점이에요',
  traits: [
    { label: '학습 스타일', value: '체계적·순차적', desc: '단계별로 차근차근 배워요' },
    { label: '핵심 강점', value: '집중력', desc: '긴 시간 몰입할 수 있어요' },
    { label: '선호 수업', value: '소그룹', desc: '소규모에서 더 잘 배워요' },
    { label: '동기 유형', value: '성취형', desc: '목표 달성에서 동기를 얻어요' },
  ],
  description:
    '체계적인 학습자인 자녀는 논리적 사고와 꼼꼼함이 강점이에요. 명확한 커리큘럼과 단계별 피드백이 있는 환경에서 가장 잘 성장해요.',
};

const MOCK_CRITERIA = [
  { icon: BookOpen, title: '체계적인 커리큘럼', desc: '단계별로 구성된 명확한 학습 계획이 있는 학원이 잘 맞아요.', tag: '추천' },
  { icon: Users, title: '소규모 클래스', desc: '10명 이하의 소그룹 수업으로 집중도 높은 환경을 찾아보세요.', tag: '추천' },
  { icon: MessageSquare, title: '상세한 피드백', desc: '숙제 점검과 개별 피드백이 체계적인 학원이 효과적이에요.', tag: '추천' },
  { icon: Target, title: '목표 기반 학습', desc: '명확한 레벨과 성취 목표가 있는 프로그램을 선택하세요.', tag: '추천' },
  { icon: Clock, title: '비체계적 수업 방식', desc: '정해진 루틴 없이 매번 내용이 바뀌는 수업은 맞지 않아요.', tag: '주의' },
];

const MOCK_ACADEMIES = [
  {
    id: 'naver-심슨어학원위례캠퍼스',
    name: '심슨어학원 위례캠퍼스',
    location: '위례',
    rating: 4.8,
    matchScore: 94,
    tags: ['소규모', '체계적', '피드백 강점'],
    reasons: [
      '단계별 커리큘럼으로 체계적인 학습자에게 최적화된 환경이에요.',
      '소규모 클래스로 개별 집중 지도가 이루어져요.',
      '꼼꼼한 숙제 관리와 상세한 피드백이 강점이에요.',
      '목표 레벨 설정과 성취 기반 수업을 운영해요.',
    ],
    curriculumFit: 95, teachingQuality: 90, priceFit: 88, distanceFit: 92,
    monthlyCost: '월 30만원대',
  },
  {
    id: 'naver-아발론랭콘위례캠퍼스',
    name: '아발론랭콘 위례캠퍼스',
    location: '위례',
    rating: 4.6,
    matchScore: 87,
    tags: ['개별 맞춤', '목표 설정', '소그룹'],
    reasons: [
      '개인별 맞춤 커리큘럼으로 성취 지향형 학습자에게 잘 맞아요.',
      '명확한 레벨 체계로 목표 기반 학습이 가능해요.',
      '소그룹 수업으로 집중도 높은 환경을 제공해요.',
      '정기적인 테스트로 학습 성취도를 확인해요.',
    ],
    curriculumFit: 88, teachingQuality: 85, priceFit: 90, distanceFit: 78,
    monthlyCost: '월 28만원대',
  },
  {
    id: 'naver-리드101영어학원위례점',
    name: '리드101영어학원 위례점',
    location: '위례',
    rating: 4.7,
    matchScore: 79,
    tags: ['실력 향상', '체계적', '소규모'],
    reasons: [
      '논리적 독해 중심 수업으로 꼼꼼한 학습자의 강점을 살려요.',
      '초등부터 중등까지 연계된 커리큘럼을 운영해요.',
      '소규모 반 운영으로 집중적인 지도가 이루어져요.',
      '월 비용이 합리적이어서 경제적 부담이 적어요.',
    ],
    curriculumFit: 82, teachingQuality: 88, priceFit: 85, distanceFit: 65,
    monthlyCost: '월 32만원대',
  },
];
// ─────────────────────────────────────────────────────────────────────

export default function AICompareResult() {
  const navigate = useNavigate();

  return (
    <div
      className="compare-scroll h-screen overflow-y-auto bg-slate-50"
      style={{ scrollbarWidth: 'none' }}
    >
      <style>{`.compare-scroll::-webkit-scrollbar { display: none; }`}</style>

      {/* ── 페이지 헤더 ── */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1400px] px-8 py-10 xl:px-12">
          <button
            onClick={() => navigate('/compare')}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft size={15} />
            학원 비교로 돌아가기
          </button>
          <p className="mb-1.5 text-sm font-semibold uppercase tracking-wider text-primary">AI 분석 결과</p>
          <h1 className="font-lora text-3xl font-semibold text-slate-900 xl:text-4xl">
            맞춤 학원 추천 리포트
          </h1>
          <p className="mt-2 text-slate-500">학습 유형 분석을 바탕으로 최적의 학원을 추천해 드립니다</p>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-8 py-8 xl:px-12">
        <div className="flex gap-8">

          {/* ── 메인 콘텐츠 ── */}
          <div className="flex-1 min-w-0 space-y-8">

            {/* ① 자녀의 장점 */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-7 h-7 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center shrink-0">1</div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">자녀의 학습 장점</h2>
                  <p className="text-sm text-slate-400">분석된 학습 유형과 강점이에요</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* 타이틀 배너 */}
                <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-5">
                  <span className="inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/20 text-white mb-3">
                    {MOCK_CHILD.badge}
                  </span>
                  <h3 className="text-xl font-bold text-white mb-1">{MOCK_CHILD.title}</h3>
                  <p className="text-sm text-white/75">{MOCK_CHILD.subtitle}</p>
                </div>

                {/* 특성 그리드 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-100">
                  {MOCK_CHILD.traits.map((t) => (
                    <div key={t.label} className="bg-white px-5 py-4">
                      <p className="text-[11px] font-semibold text-primary mb-1">{t.label}</p>
                      <p className="text-sm font-bold text-slate-900 mb-0.5">{t.value}</p>
                      <p className="text-xs text-slate-400">{t.desc}</p>
                    </div>
                  ))}
                </div>

                {/* 설명 */}
                <div className="px-6 py-5 flex items-start gap-3">
                  <Award size={16} className="text-primary mt-0.5 shrink-0" />
                  <p className="text-sm text-slate-600 leading-relaxed">{MOCK_CHILD.description}</p>
                </div>
              </div>
            </section>

            {/* ② 학원 선택 기준 */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-7 h-7 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center shrink-0">2</div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">장점을 극대화할 학원 선택 기준</h2>
                  <p className="text-sm text-slate-400">이런 조건의 학원을 찾아보세요</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                {MOCK_CRITERIA.map((c) => {
                  const Icon = c.icon;
                  const isWarning = c.tag === '주의';
                  return (
                    <div
                      key={c.title}
                      className={`bg-white rounded-2xl border shadow-sm p-5 flex items-start gap-4 ${
                        isWarning ? 'border-slate-200 opacity-75' : 'border-slate-200'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isWarning ? 'bg-slate-100' : 'bg-primary/10'
                      }`}>
                        {isWarning
                          ? <AlertCircle size={18} className="text-slate-400" />
                          : <Icon size={18} className="text-primary" />
                        }
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-sm font-semibold text-slate-900">{c.title}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isWarning
                              ? 'bg-slate-100 text-slate-500'
                              : 'bg-primary/10 text-primary'
                          }`}>
                            {c.tag}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">{c.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ③ 추천 학원 */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-7 h-7 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center shrink-0">3</div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">자녀에게 맞는 학원 추천</h2>
                  <p className="text-sm text-slate-400">학습 유형 분석 기반으로 선별했어요</p>
                </div>
              </div>

              <div className="space-y-4">
                {MOCK_ACADEMIES.map((academy, idx) => (
                  <div
                    key={academy.id}
                    className={`bg-white rounded-2xl border shadow-sm p-6 ${
                      idx === 0 ? 'border-primary/40 shadow-primary/10' : 'border-slate-200'
                    }`}
                  >
                    {idx === 0 && (
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle size={15} className="text-primary" />
                        <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">AI 추천 1위</span>
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-5">
                      <div>
                        <p className="text-xs text-slate-400 mb-0.5">{academy.location}</p>
                        <h3 className="font-lora font-semibold text-xl text-slate-900 mb-1">{academy.name}</h3>
                        <div className="flex items-center gap-1.5">
                          <Star size={13} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-semibold text-slate-700">{academy.rating}</span>
                          <span className="text-xs text-slate-400 ml-1">{academy.monthlyCost}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-primary leading-none">{academy.matchScore}%</div>
                        <div className="text-xs text-slate-400 mt-1">적합도</div>
                      </div>
                    </div>

                    {/* 태그 */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {academy.tags.map((t) => (
                        <span key={t} className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">{t}</span>
                      ))}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* 추천 이유 */}
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

                      {/* 세부 비교 */}
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
                                <div
                                  className="h-full bg-gradient-to-r from-primary/70 to-primary rounded-full"
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
                        className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors shadow-sm shadow-primary/30"
                      >
                        상담 예약
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* 하단 버튼 */}
              <div className="flex gap-3 mt-6 pb-8">
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
                  학원 전체보기
                </Link>
              </div>
            </section>
          </div>

          {/* ── 사이드 패널 ── */}
          <aside className="hidden w-72 shrink-0 lg:block xl:w-80">
            <div className="sticky top-8 space-y-4">

              {/* 자녀 분석 요약 */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-4">
                  <h2 className="font-semibold text-slate-900">학습 유형 요약</h2>
                  <p className="mt-0.5 text-xs text-slate-400">{MOCK_CHILD.title}</p>
                </div>
                <div className="p-6 space-y-3">
                  {MOCK_CHILD.traits.map((t) => (
                    <div key={t.label} className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">{t.label}</span>
                      <span className="text-xs font-semibold text-slate-700">{t.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 추천 학원 순위 */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-4">
                  <h2 className="font-semibold text-slate-900">추천 학원 순위</h2>
                  <p className="mt-0.5 text-xs text-slate-400">적합도 기준</p>
                </div>
                <div className="p-6 space-y-2.5">
                  {MOCK_ACADEMIES.map((a, i) => (
                    <div key={a.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 ${
                          i === 0 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'
                        }`}>{i + 1}</span>
                        <span className="text-sm font-medium text-slate-700 truncate">{a.name}</span>
                      </div>
                      <span className="text-sm font-bold text-primary shrink-0">{a.matchScore}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 팁 */}
              <div className="rounded-xl bg-slate-100 p-4 text-xs text-slate-500 leading-relaxed">
                <p className="mb-1 font-semibold text-slate-700">💡 분석 기준</p>
                <ul className="space-y-1">
                  <li>· 커리큘럼 및 학습 목표 부합도</li>
                  <li>· 강의 품질 및 교사 역량</li>
                  <li>· 예산 및 가격 적합성</li>
                  <li>· 거리 및 접근성</li>
                </ul>
              </div>

              {/* 맞춤 추천 CTA */}
              <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/8 to-purple-500/8 p-5">
                <p className="font-semibold text-slate-900 text-sm mb-1">더 정확한 추천을 원하세요?</p>
                <p className="text-xs text-slate-500 mb-3">우리 아이 정보를 입력하면 맞춤 분석을 제공합니다</p>
                <Link
                  to="/onboarding/1"
                  className="flex items-center justify-center gap-2 rounded-xl border border-primary bg-white px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary hover:text-white transition-all"
                >
                  맞춤 분석 받기
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
