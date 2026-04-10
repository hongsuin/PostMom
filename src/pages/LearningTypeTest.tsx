import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, RotateCcw } from 'lucide-react';

// ── 5가지 학습 유형 ────────────────────────────────────────────────
const TYPES = {
  competitive: {
    key: 'competitive',
    emoji: '🏆',
    name: '경쟁 성취형',
    desc: '점수와 순위로 동기부여 받는 타입이에요. 목표가 뚜렷하고 지는 걸 싫어하는 만큼 도전 의식이 강해요.',
    strengths: ['명확한 목표 설정', '강한 승부욕', '결과 지향적'],
    guide: [
      '레벨반 구분이 명확하고 시험 대비 커리큘럼이 체계적인 학원',
      '경시대회·수능 특강 등 도전적인 과정이 있는 학원',
      '성취도 피드백을 주기적으로 제공하는 학원',
    ],
    caution: '지나친 경쟁 압박 환경은 번아웃을 유발할 수 있어요.',
    color: 'from-yellow-400 to-orange-400',
    bgLight: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-700',
  },
  explorer: {
    key: 'explorer',
    emoji: '🔍',
    name: '탐구 사고형',
    desc: '암기보다 이해를 중시하고 "왜 그런지"를 알아야 직성이 풀리는 타입이에요. 질문이 많고 원리 파악 후 응용하는 것을 즐겨요.',
    strengths: ['깊이 있는 이해력', '창의적 문제 해결', '높은 탐구 의욕'],
    guide: [
      '개념 설명 중심의 토론·발문식 수업을 하는 학원',
      '선생님과 자유롭게 질문·소통이 가능한 학원',
      '단순 암기보다 사고력·논리력을 키우는 학원',
    ],
    caution: '단순 반복 주입식 수업 환경에서는 흥미를 잃을 수 있어요.',
    color: 'from-blue-400 to-cyan-400',
    bgLight: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
  },
  systematic: {
    key: 'systematic',
    emoji: '📋',
    name: '체계 반복형',
    desc: '규칙적인 루틴 속에서 꾸준히 반복하며 실력을 쌓는 타입이에요. 예측 가능한 환경을 선호하고 성실한 학습 태도를 갖고 있어요.',
    strengths: ['꾸준한 학습 지속력', '높은 완성도', '안정적인 성장'],
    guide: [
      '커리큘럼이 체계적이고 진도 관리가 명확한 학원',
      '숙제·피드백이 일정하게 제공되는 학원',
      '장기 과정으로 학생을 꾸준히 관리하는 학원',
    ],
    caution: '갑작스러운 커리큘럼 변경이나 선생님 교체에 민감할 수 있어요.',
    color: 'from-green-400 to-emerald-400',
    bgLight: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
  },
  social: {
    key: 'social',
    emoji: '👥',
    name: '사교 협동형',
    desc: '친구들과 함께할 때 시너지가 극대화되는 타입이에요. 경쟁보다 협력을 즐기고, 학원 분위기와 선생님과의 관계에 큰 영향을 받아요.',
    strengths: ['소통 능력', '협력 학습 효과', '긍정적인 에너지'],
    guide: [
      '소수 정예 그룹 수업으로 친밀감을 형성할 수 있는 학원',
      '선생님이 친근하고 분위기가 밝은 학원',
      '팀 프로젝트·그룹 활동이 포함된 학원',
    ],
    caution: '혼자 하는 자습 위주 학원이나 경쟁 분위기가 강한 곳은 위축될 수 있어요.',
    color: 'from-purple-400 to-pink-400',
    bgLight: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
  },
  independent: {
    key: 'independent',
    emoji: '🎯',
    name: '자기주도형',
    desc: '스스로 계획을 세우고 자기 속도에 맞게 공부하는 타입이에요. 관심 분야를 깊이 파고들고 타인의 간섭을 불편해해요.',
    strengths: ['높은 자기 관리력', '깊이 있는 집중력', '내적 동기 강함'],
    guide: [
      '진도를 자율적으로 조절할 수 있는 학원',
      '1:1 또는 개인 맞춤 커리큘럼을 제공하는 학원',
      '자습실과 개인 학습 공간이 마련된 학원',
    ],
    caution: '진도를 강제하거나 일괄 관리하는 학원 방식은 역효과를 낼 수 있어요.',
    color: 'from-rose-400 to-red-400',
    bgLight: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-700',
  },
} as const;

type TypeKey = keyof typeof TYPES;

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

export default function LearningTypeTest() {
  const [step, setStep] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<TypeKey[]>([]);
  const [result, setResult] = useState<TypeKey | null>(null);

  const handleAnswer = (type: TypeKey) => {
    const next = [...answers, type];
    if (current + 1 < QUESTIONS.length) {
      setAnswers(next);
      setCurrent((c) => c + 1);
    } else {
      const r = calcResult(next);
      setResult(r);
      setStep('result');
    }
  };

  const reset = () => {
    setStep('intro');
    setCurrent(0);
    setAnswers([]);
    setResult(null);
  };

  const progress = ((current) / QUESTIONS.length) * 100;
  const typeData = result ? TYPES[result] : null;

  // ── INTRO ────────────────────────────────────────────────────────
  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-[1400px] px-8 py-10 xl:px-12">
          <div className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
            학습 유형 테스트
          </div>
          <h1 className="font-lora text-3xl font-semibold text-slate-900 xl:text-4xl">
            우리 아이 학습 성향 분석
          </h1>
          <p className="mt-3 max-w-xl text-slate-500">
            5가지 질문으로 아이의 학습 성향을 파악하고, 성향에 맞는 학원 선택 가이드를 받아보세요.
          </p>

          {/* 유형 미리보기 */}
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {(Object.values(TYPES) as typeof TYPES[TypeKey][]).map((t) => (
              <div
                key={t.key}
                className={`rounded-2xl border ${t.border} ${t.bgLight} p-5`}
              >
                <div className="mb-2 text-3xl">{t.emoji}</div>
                <p className={`font-semibold ${t.text}`}>{t.name}</p>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed line-clamp-2">{t.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <button
              onClick={() => setStep('quiz')}
              className="rounded-full bg-primary px-10 py-4 text-base font-semibold text-white shadow-sm transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
            >
              테스트 시작하기 →
            </button>
            <p className="text-sm text-slate-400">약 1분 소요 · 총 5문항</p>
          </div>
        </div>
      </div>
    );
  }

  // ── QUIZ ────────────────────────────────────────────────────────
  if (step === 'quiz') {
    const q = QUESTIONS[current];
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-[800px] px-8 py-10 xl:px-12">

          {/* 진행바 */}
          <div className="mb-2 flex items-center justify-between text-sm text-slate-400">
            <span>{current + 1} / {QUESTIONS.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="mb-8 h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* 질문 */}
          <h2 className="font-lora text-2xl font-semibold text-slate-900 mb-8">
            {q.question}
          </h2>

          {/* 선택지 */}
          <div className="space-y-3">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(opt.type)}
                className="group w-full rounded-2xl border-2 border-slate-200 bg-white px-6 py-5 text-left text-sm font-medium text-slate-700 transition-all hover:border-primary hover:bg-primary/5 hover:text-primary hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99]"
              >
                <div className="flex items-center justify-between">
                  <span>{opt.label}</span>
                  <ChevronRight size={16} className="shrink-0 text-slate-300 transition-colors group-hover:text-primary" />
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
      </div>
    );
  }

  // ── RESULT ──────────────────────────────────────────────────────
  if (step === 'result' && typeData) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-[1400px] px-8 py-10 xl:px-12">
          <p className="mb-1.5 text-sm font-semibold uppercase tracking-wider text-primary">
            분석 완료
          </p>
          <h1 className="font-lora text-3xl font-semibold text-slate-900 xl:text-4xl">
            우리 아이 학습 유형
          </h1>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">

            {/* 메인 결과 카드 */}
            <div className="lg:col-span-2 space-y-5">
              <div className={`rounded-3xl bg-gradient-to-br ${typeData.color} p-8 text-white shadow-lg`}>
                <div className="mb-4 text-5xl">{typeData.emoji}</div>
                <h2 className="font-lora text-3xl font-semibold mb-3">{typeData.name}</h2>
                <p className="text-white/90 leading-relaxed text-base">{typeData.desc}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {typeData.strengths.map((s) => (
                    <span key={s} className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* 학원 선택 가이드 */}
              <div className={`rounded-2xl border ${typeData.border} ${typeData.bgLight} p-6`}>
                <h3 className={`font-semibold text-base mb-4 ${typeData.text}`}>
                  📌 이런 학원을 찾아보세요
                </h3>
                <ul className="space-y-3">
                  {typeData.guide.map((g, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white bg-gradient-to-br ${typeData.color}`}>
                        {i + 1}
                      </span>
                      {g}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 rounded-xl bg-white/70 px-4 py-3 text-xs text-slate-500 leading-relaxed">
                  ⚠️ <span className="font-medium">주의:</span> {typeData.caution}
                </div>
              </div>
            </div>

            {/* 사이드: 다른 유형 + CTA */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-4 text-sm">5가지 유형 보기</h3>
                <div className="space-y-2">
                  {(Object.values(TYPES) as typeof TYPES[TypeKey][]).map((t) => (
                    <div
                      key={t.key}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                        t.key === result
                          ? `${t.bgLight} ${t.border} border font-semibold ${t.text}`
                          : 'text-slate-500'
                      }`}
                    >
                      <span className="text-lg">{t.emoji}</span>
                      <span>{t.name}</span>
                      {t.key === result && (
                        <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-medium bg-gradient-to-r ${t.color} text-white`}>
                          우리 아이
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-3">
                <p className="text-sm font-semibold text-slate-900">다음 단계</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  성향에 맞는 학원을 AI가 직접 비교·분석해드려요
                </p>
                <Link
                  to="/academies"
                  className="block w-full rounded-xl bg-primary py-3 text-center text-sm font-semibold text-white transition-all hover:opacity-90"
                >
                  학원 찾아보기 →
                </Link>
                <Link
                  to="/compare"
                  className="block w-full rounded-xl border border-primary bg-white py-3 text-center text-sm font-semibold text-primary transition-all hover:bg-primary/5"
                >
                  AI 비교 분석하기 →
                </Link>
              </div>

              <button
                onClick={reset}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-3 text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                <RotateCcw size={13} /> 다시 테스트하기
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
