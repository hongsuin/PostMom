import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, RotateCcw } from 'lucide-react';
import { LEARNING_TYPES, TYPE_KEY_LIST } from '../data/learningTypes';
import type { TypeKey } from '../data/learningTypes';
import { useOnboardingStore } from '../store/onboardingStore';
import { useLearningTypeAnimStore } from '../store/learningTypeAnimStore';

// ── 설문 문항 ───────────────────────────────────────────────────────
const QUESTIONS = [
  {
    id: 1,
    question: '아이가 공부를 열심히 하는 가장 큰 이유는 무엇인가요?',
    options: [
      { label: '시험 점수나 순위를 올리고 싶어서', type: 'competitive' as TypeKey },
      { label: '궁금한 게 생겨서 알고 싶어서', type: 'explorer' as TypeKey },
      { label: '꾸준히 하다 보니 습관이 돼서', type: 'systematic' as TypeKey },
      { label: '친구들과 같이 하는 게 재밌어서', type: 'social' as TypeKey },
      { label: '스스로 목표를 세우고 달성하고 싶어서', type: 'independent' as TypeKey },
    ],
  },
  {
    id: 2,
    question: '모르는 문제를 만났을 때 아이의 반응은?',
    options: [
      { label: '끝까지 붙잡고 어떻게든 풀어냄', type: 'competitive' as TypeKey },
      { label: '왜 틀렸는지 원리부터 이해하려 함', type: 'explorer' as TypeKey },
      { label: '비슷한 문제를 반복해서 익히려 함', type: 'systematic' as TypeKey },
      { label: '선생님이나 친구에게 바로 물어봄', type: 'social' as TypeKey },
      { label: '스스로 검색하거나 자료를 찾아봄', type: 'independent' as TypeKey },
    ],
  },
  {
    id: 3,
    question: '아이가 가장 힘들어하는 상황은?',
    options: [
      { label: '성적이 기대보다 낮게 나왔을 때', type: 'competitive' as TypeKey },
      { label: '왜 그런지 이해가 안 될 때', type: 'explorer' as TypeKey },
      { label: '갑자기 수업 방식이나 순서가 바뀔 때', type: 'systematic' as TypeKey },
      { label: '혼자서만 공부해야 할 때', type: 'social' as TypeKey },
      { label: '내가 원하는 방식을 강요받을 때', type: 'independent' as TypeKey },
    ],
  },
  {
    id: 4,
    question: '아이가 선호하는 수업 방식은?',
    options: [
      { label: '레벨 테스트·경시대회 등 도전이 있는 수업', type: 'competitive' as TypeKey },
      { label: '개념을 자세히 설명해주는 이해 중심 수업', type: 'explorer' as TypeKey },
      { label: '매일 일정하게 반복하는 체계적인 수업', type: 'systematic' as TypeKey },
      { label: '소그룹으로 함께 토론하는 수업', type: 'social' as TypeKey },
      { label: '내 페이스에 맞게 조절할 수 있는 수업', type: 'independent' as TypeKey },
    ],
  },
  {
    id: 5,
    question: '학원에서 가장 중요하게 생각하는 것은?',
    options: [
      { label: '성취도와 결과를 확인할 수 있는 피드백', type: 'competitive' as TypeKey },
      { label: '선생님과 자유롭게 소통할 수 있는 환경', type: 'explorer' as TypeKey },
      { label: '커리큘럼이 일관되고 진도 관리가 확실한 곳', type: 'systematic' as TypeKey },
      { label: '친근한 선생님과 활기찬 학원 분위기', type: 'social' as TypeKey },
      { label: '스스로 공부할 수 있는 자습 공간과 자율성', type: 'independent' as TypeKey },
    ],
  },
];

// ── 결과 계산 ──────────────────────────────────────────────────────
function calcResult(answers: TypeKey[]): TypeKey {
  const score: Record<TypeKey, number> = {
    competitive: 0,
    explorer: 0,
    systematic: 0,
    social: 0,
    independent: 0,
  };
  answers.forEach((t) => score[t]++);
  return (Object.keys(score) as TypeKey[]).reduce((a, b) =>
    score[a] >= score[b] ? a : b
  );
}

// ── 인트로 애니메이션 카드 ─────────────────────────────────────────
function IntroScreen({ onStart }: { onStart: () => void }) {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  // 1.8초마다 유형 순환
  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % TYPE_KEY_LIST.length);
        setVisible(true);
      }, 220);
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  const t = LEARNING_TYPES[TYPE_KEY_LIST[idx]];

  // 각 유형별 그로우 색상 (Tailwind 미지원이므로 inline)
  const glowColors: Record<string, string> = {
    competitive: '251,191,36',   // yellow-400
    explorer:    '96,165,250',   // blue-400
    systematic:  '74,222,128',   // green-400
    social:      '192,132,252',  // purple-400
    independent: '251,113,133',  // rose-400
  };
  const glow = glowColors[TYPE_KEY_LIST[idx]];

  return (
    <div className="max-w-lg mx-auto px-5 pt-10 pb-24 min-h-screen flex flex-col">
      {/* 헤더 */}
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-1">
          학습 유형 테스트
        </p>
        <h1 className="font-lora text-2xl font-semibold text-slate-900 leading-tight">
          우리 아이 학습 성향 분석
        </h1>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
          5가지 질문으로 아이의 학습 성향을 파악하고, 성향에 맞는 학원 선택 가이드를 받아보세요.
        </p>
        <p className="mt-1.5 text-xs text-primary/80 font-medium">
          검사 결과는 프로필에 저장하여 학원 추천에 활용할 수 있어요.
        </p>
      </div>

      {/* 애니메이션 섹션 */}
      <div className="flex-1 flex flex-col items-center justify-center py-8">
        <p className="text-sm text-slate-500 mb-6 font-medium tracking-wide">
          우리 아이는 어떤 학습 유형일까요?
        </p>

        {/* 사이클링 카드 */}
        <div className="relative w-full">
          {/* 배경 글로우 (블러 레이어) */}
          <div
            className="absolute inset-0 rounded-3xl blur-2xl scale-95 translate-y-2 transition-all duration-700"
            style={{
              background: `radial-gradient(ellipse at center, rgba(${glow},0.45), rgba(${glow},0.1))`,
            }}
          />

          {/* 메인 카드 */}
          <div
            className={`relative rounded-3xl bg-gradient-to-br ${t.color} p-8 text-white shadow-2xl overflow-hidden`}
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0) scale(1)' : 'translateY(6px) scale(0.98)',
              transition: 'opacity 0.22s ease, transform 0.22s ease',
            }}
          >
            {/* 배경 장식 원 */}
            <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/10" />
            <div className="absolute -right-3 -bottom-10 w-24 h-24 rounded-full bg-white/10" />

            <div className="relative text-center">
              {/* 이모지 */}
              <div className="text-7xl mb-4 drop-shadow-lg">{t.emoji}</div>

              {/* 유형명 */}
              <h2 className="font-lora text-2xl font-bold mb-2 drop-shadow">{t.name}</h2>

              {/* 한 줄 설명 */}
              <p className="text-sm text-white/85 leading-relaxed line-clamp-2 px-2">
                {t.desc}
              </p>

              {/* 강점 배지 */}
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {t.strengths.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm"
                  >
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 유형 인디케이터 점 */}
        <div className="flex gap-2 mt-5">
          {TYPE_KEY_LIST.map((key, i) => (
            <div
              key={key}
              className="rounded-full transition-all duration-400"
              style={{
                width: i === idx ? '20px' : '8px',
                height: '8px',
                background:
                  i === idx
                    ? `rgba(${glow},0.9)`
                    : 'rgba(148,163,184,0.4)',
                transition: 'all 0.4s ease',
              }}
            />
          ))}
        </div>

        <p className="mt-3 text-xs text-slate-400">
          5가지 유형 · 테스트를 시작하면 알 수 있어요
        </p>
      </div>

      {/* 시작 버튼 */}
      <div className="flex flex-col gap-3">
        <button
          onClick={onStart}
          className="w-full rounded-2xl bg-primary py-4 text-base font-semibold text-white shadow-sm transition-all hover:opacity-90 hover:scale-[1.01] active:scale-[0.99]"
        >
          테스트 시작하기 →
        </button>
        <p className="text-center text-xs text-slate-400">약 1분 소요 · 총 5문항</p>
      </div>
    </div>
  );
}

// ── 공통 배경 레이아웃 ─────────────────────────────────────────────
function VideoBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/correctvideo.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50/90 to-white/90" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ── 메인 컴포넌트 ──────────────────────────────────────────────────
export default function LearningTypeTest() {
  const navigate = useNavigate();
  const { data, updateData } = useOnboardingStore();
  const { setPending } = useLearningTypeAnimStore();
  const savedType = data.learningType;

  const [step, setStep] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<TypeKey[]>([]);
  const [resultType, setResultType] = useState<TypeKey | null>(null);
  const [selectedType, setSelectedType] = useState<TypeKey | null>(null);
  const [saved, setSaved] = useState(false);

  const handleAnswer = (type: TypeKey) => {
    const next = [...answers, type];
    if (current + 1 < QUESTIONS.length) {
      setAnswers(next);
      setCurrent((c) => c + 1);
    } else {
      const r = calcResult(next);
      setResultType(r);
      setSelectedType(r);
      setStep('result');
    }
  };

  const handleSave = () => {
    if (!selectedType) return;
    updateData({ learningType: selectedType });
    setSaved(true);
    setPending(selectedType, 'save');
    window.scrollTo(0, 0);
    navigate('/academies');
  };

  const handleSkip = () => {
    if (selectedType) setPending(selectedType, 'skip');
    window.scrollTo(0, 0);
    navigate('/academies');
  };

  const reset = () => {
    setStep('intro');
    setCurrent(0);
    setAnswers([]);
    setResultType(null);
    setSelectedType(null);
    setSaved(false);
  };

  // ── INTRO ──────────────────────────────────────────────────────
  if (step === 'intro') {
    return (
      <VideoBackground>
        <IntroScreen onStart={() => setStep('quiz')} />
      </VideoBackground>
    );
  }

  // ── QUIZ ──────────────────────────────────────────────────────
  if (step === 'quiz') {
    const q = QUESTIONS[current];
    return (
      <VideoBackground>
        <div className="max-w-lg mx-auto px-5 pt-10 pb-24 min-h-screen overflow-y-auto">
          {/* 진행 바 (온보딩 스타일) */}
          <div className="mb-10">
            <div className="flex gap-1.5 mb-2">
              {QUESTIONS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    i < current
                      ? 'bg-primary'
                      : i === current
                      ? 'bg-primary/60'
                      : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-slate-400">
              {current + 1}/{QUESTIONS.length}
            </p>
          </div>

          {/* 질문 */}
          <div className="mb-8">
            <p className="text-sm text-slate-500 mb-1">질문 {current + 1}</p>
            <h2 className="font-lora text-xl font-semibold text-slate-900 leading-snug">
              {q.question}
            </h2>
          </div>

          {/* 선택지 (StepCard 스타일) */}
          <div className="space-y-3 animate-fade-in">
            {q.options.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleAnswer(opt.type)}
                className="w-full text-left p-4 sm:p-5 rounded-2xl border-2 border-slate-200 bg-white transition-all duration-200 hover:border-primary/50 hover:shadow-md hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">{opt.label}</span>
                  <ChevronRight size={16} className="shrink-0 text-slate-300 transition-colors" />
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={reset}
            className="mt-8 flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            <RotateCcw size={13} /> 처음으로
          </button>
        </div>
      </VideoBackground>
    );
  }

  // ── RESULT ──────────────────────────────────────────────────────
  if (step === 'result' && resultType && selectedType) {
    const displayData = LEARNING_TYPES[selectedType];
    const isSameAsSaved = savedType !== '' && selectedType === savedType;
    const hasSaved = savedType !== '';

    return (
      <VideoBackground>
        <div className="max-w-4xl mx-auto px-5 pt-10 pb-24 min-h-screen overflow-y-auto">
          {/* 헤더 */}
          <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-1">
            분석 완료
          </p>
          <h1 className="font-lora text-2xl font-semibold text-slate-900 leading-tight mb-6">
            우리 아이 학습 유형
          </h1>

          <div className="grid gap-5 lg:grid-cols-3">
            {/* ── 좌측: 결과 카드 ── */}
            <div className="lg:col-span-2 space-y-4">
              {/* 메인 유형 카드 */}
              <div
                className={`rounded-3xl bg-gradient-to-br ${displayData.color} p-7 text-white shadow-lg transition-all duration-300`}
              >
                <div className="mb-3 text-5xl">{displayData.emoji}</div>
                <h2 className="font-lora text-2xl font-semibold mb-2">{displayData.name}</h2>
                <p className="text-white/90 leading-relaxed text-sm">{displayData.desc}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {displayData.strengths.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium"
                    >
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* 학원 선택 가이드 */}
              <div
                className={`rounded-2xl border ${displayData.border} bg-white p-5 transition-all duration-300`}
              >
                <h3 className={`font-semibold text-sm mb-3 ${displayData.text}`}>
                  📌 이런 학원을 찾아보세요
                </h3>
                <ul className="space-y-2.5">
                  {displayData.guide.map((g, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white bg-gradient-to-br ${displayData.color}`}
                      >
                        {i + 1}
                      </span>
                      {g}
                    </li>
                  ))}
                </ul>
                <div className="mt-3 rounded-xl bg-white/70 px-3 py-2.5 text-xs text-slate-500 leading-relaxed">
                  ⚠️ <span className="font-medium">주의:</span> {displayData.caution}
                </div>
              </div>
            </div>

            {/* ── 우측: 유형 목록 + 프로필 저장 ── */}
            <div className="space-y-4">
              {/* 5가지 유형 목록 */}
              <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-3 text-sm">5가지 유형 보기</h3>
                <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                  유형을 눌러 결과를 확인하고 프로필에 저장할 수 있어요.
                </p>
                <div className="space-y-1.5">
                  {TYPE_KEY_LIST.map((key) => {
                    const t = LEARNING_TYPES[key];
                    const isSelected = key === selectedType;
                    const isResult = key === resultType;
                    const isSaved = key === savedType;

                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedType(key)}
                        className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
                          isSelected
                            ? `bg-white border ${t.border} font-semibold ${t.text}`
                            : 'text-slate-500 hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <span className="text-lg shrink-0">{t.emoji}</span>
                        <span className="flex-1 text-left">{t.name}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          {isSaved && (
                            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
                              저장됨
                            </span>
                          )}
                          {isResult && (
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium bg-gradient-to-r ${t.color} text-white`}
                            >
                              우리 아이
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 프로필 저장 패널 */}
              <div className="rounded-2xl border border-primary/20 bg-white/80 backdrop-blur-sm p-5 space-y-3 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">프로필에 저장하기</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  선택한 유형을 프로필에 추가하면 학원 추천 시 반영돼요.
                </p>

                {isSameAsSaved ? (
                  // 이미 같은 유형이 저장된 경우
                  <div className="w-full rounded-xl bg-slate-100 py-3 text-center text-sm font-medium text-slate-400 cursor-default">
                    현재 저장된 유형이에요
                  </div>
                ) : (
                  // 저장 or 변경 버튼
                  <button
                    onClick={handleSave}
                    disabled={saved}
                    className={`w-full rounded-xl py-3 text-center text-sm font-semibold text-white transition-all ${
                      saved
                        ? 'bg-green-400 cursor-default'
                        : 'bg-primary hover:opacity-90 active:scale-[0.98]'
                    }`}
                  >
                    {saved
                      ? '저장 완료!'
                      : hasSaved
                      ? `${displayData.name}으로 변경하기 →`
                      : `${displayData.name}을 프로필에 추가하기 →`}
                  </button>
                )}

                <button
                  onClick={handleSkip}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 text-center text-sm font-medium text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors"
                >
                  {hasSaved ? '변경하지 않기' : '프로필에 추가하지 않기'}
                </button>
              </div>

              {/* 다시 테스트 */}
              <button
                onClick={reset}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white/80 py-3 text-sm text-slate-400 hover:text-slate-600 transition-colors"
              >
                <RotateCcw size={13} /> 다시 테스트하기
              </button>
            </div>
          </div>
        </div>
      </VideoBackground>
    );
  }

  return null;
}
