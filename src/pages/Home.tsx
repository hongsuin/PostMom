import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

const EASE = [0.16, 1, 0.3, 1] as const;

const NAV_LINKS = [
  { label: '학원 찾기', to: '/academies' },
  { label: 'AI 비교', to: '/compare' },
  { label: '커뮤니티', to: '/community' },
  { label: '이용 안내', to: '/#how' },
];

const STATS = [
  { value: '1,200+', label: '등록 학부모' },
  { value: '350+', label: '제휴 학원' },
  { value: '1,136+', label: '실제 후기' },
  { value: '98%', label: '만족도' },
];

const FEATURES = [
  {
    icon: '📊',
    title: 'AI 비교 분석',
    desc: '학부모 리뷰 1,136개를 기반으로 AI가 학원을 심층 비교하고 아이에게 맞는 학원을 추천해드립니다.',
    badge: 'AI 기술',
  },
  {
    icon: '🎯',
    title: '맞춤 학원 추천',
    desc: '학년, 과목, 예산, 통학 거리 등 세부 조건을 반영해 우리 아이에게 딱 맞는 학원을 찾아드립니다.',
    badge: '개인화',
  },
  {
    icon: '💬',
    title: '커뮤니티 후기',
    desc: '광고가 아닌 실제 학부모의 솔직한 후기를 통해 학원 분위기와 교육 방식을 미리 경험해보세요.',
    badge: '신뢰 기반',
  },
  {
    icon: '📅',
    title: '상담·레벨테스트 예약',
    desc: '마음에 드는 학원을 찾았다면 앱 안에서 바로 상담 예약과 레벨테스트 신청까지 한 번에 해결하세요.',
    badge: '원스톱',
  },
  {
    icon: '📍',
    title: '지역별 탐색',
    desc: '위례, 분당, 송파 등 우리 동네 학원을 지도 기반으로 쉽게 찾고 비교할 수 있습니다.',
    badge: '위치 기반',
  },
  {
    icon: '🔔',
    title: '입학 알림',
    desc: '관심 학원의 모집 일정과 이벤트를 실시간으로 받아보세요. 놓치는 기회 없이 빠르게 대응하세요.',
    badge: '알림',
  },
];

const STEPS = [
  {
    num: '01',
    title: '아이 정보 입력',
    desc: '학년, 과목, 레벨, 예산, 통학 거리 등 우리 아이의 상황을 5단계로 입력합니다.',
    detail: '3분이면 충분합니다',
  },
  {
    num: '02',
    title: 'AI 학원 추천',
    desc: '입력한 조건을 기반으로 AI가 최적화된 학원 리스트를 뽑아드립니다.',
    detail: '평균 추천 학원 수: 8개',
  },
  {
    num: '03',
    title: '상세 비교·선택',
    desc: '관심 학원 최대 3개를 고르면 AI가 강점/약점/추천 이유를 비교 분석합니다.',
    detail: '1:1 심층 비교 가능',
  },
  {
    num: '04',
    title: '상담 & 예약',
    desc: '마음에 드는 학원에 바로 상담 예약 또는 레벨테스트를 신청할 수 있습니다.',
    detail: '실시간 예약 확인',
  },
];

const REVIEWS = [
  {
    name: '김○○ 학부모',
    region: '위례',
    grade: '초등 4학년',
    text: '영어 학원 3군데를 비교했는데 AI 분석이 너무 꼼꼼했어요. 결국 추천받은 학원 등록했고 아이가 너무 좋아해요!',
    rating: 5,
  },
  {
    name: '박○○ 학부모',
    region: '송파',
    grade: '초등 6학년',
    text: '다른 커뮤니티 후기는 광고 같아서 믿기 어려웠는데, PostMom은 실제 사용자 리뷰라 신뢰가 갔습니다.',
    rating: 5,
  },
  {
    name: '이○○ 학부모',
    region: '분당',
    grade: '중등 1학년',
    text: '레벨테스트 예약까지 앱에서 한 번에 해결했어요. 예전엔 전화로 일일이 물어봐야 했는데 정말 편리해졌네요.',
    rating: 5,
  },
];

export default function Home() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="w-full font-inter bg-white">
      {/* ── NAVIGATION ─────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-8 py-4 xl:px-12">
          {/* Logo */}
          <Link to="/" className="font-lora text-2xl font-semibold tracking-tight text-white">
            PostMom
          </Link>

          {/* Nav links (desktop) */}
          <nav className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="text-sm font-medium text-white/70 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth + CTA */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden text-sm font-medium text-white/70 transition-colors hover:text-white lg:block"
            >
              로그인
            </Link>
            <Link
              to="/onboarding/1"
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 shadow-md transition-all hover:bg-slate-100 hover:scale-[1.03] active:scale-[0.97]"
            >
              무료로 시작하기
            </Link>

            {/* Hamburger (mobile) */}
            <button
              className="flex flex-col justify-center items-center gap-1.5 p-1 lg:hidden"
              onClick={() => setDrawerOpen(true)}
              aria-label="메뉴 열기"
            >
              <span className="block h-0.5 w-6 bg-white" />
              <span className="block h-0.5 w-6 bg-white" />
              <span className="block h-0.5 w-6 bg-white" />
            </button>
          </div>
        </div>
      </header>

      {/* Overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Left Drawer */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-xl transition-transform duration-300 ease-in-out ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <Link
            to="/"
            className="font-lora text-xl font-semibold tracking-tight text-slate-900"
            onClick={() => setDrawerOpen(false)}
          >
            PostMom
          </Link>
          <button
            onClick={() => setDrawerOpen(false)}
            aria-label="메뉴 닫기"
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col px-4 py-6 gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              onClick={() => setDrawerOpen(false)}
              className="flex items-center rounded-lg px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-100 px-4 py-5">
          <Link
            to="/login"
            onClick={() => setDrawerOpen(false)}
            className="block w-full rounded-lg border border-slate-200 py-2.5 text-center text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            로그인
          </Link>
        </div>
      </aside>

      {/* ── HERO ────────────────────────────────────────── */}
      <section className="relative min-h-screen w-full overflow-hidden bg-slate-900">
        {/* Video background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/correctvideo.mp4" type="video/mp4" />
        </video>

        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 50%, rgba(15,10,40,0.65) 100%)',
          }}
        />

        {/* Hero content */}
        <div className="relative z-10 mx-auto flex min-h-screen max-w-[1400px] items-center px-8 pb-20 pt-28 xl:px-12">
          <div className="grid w-full grid-cols-1 items-center gap-16 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_480px]">
            {/* Left: headline + CTAs */}
            <div>
              <motion.div
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-sm"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                <span className="text-xs font-medium text-white/80">
                  현재 350+ 학원 파트너와 함께합니다
                </span>
              </motion.div>

              <motion.h1
                className="font-lora text-5xl font-semibold leading-[1.1] tracking-tight text-white xl:text-6xl 2xl:text-7xl"
                initial={{ opacity: 0, y: 24, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
              >
                우리 아이에게 맞는
                <br />
                학원 선택,
                <br />
                이제는{' '}
                데이터로.
              </motion.h1>

              <motion.p
                className="mt-6 max-w-xl text-lg leading-relaxed text-white/70"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: EASE, delay: 0.25 }}
              >
                광고보다 실제 후기, 감보다 비교 데이터.
                <br />
                PostMom으로 지역·학년·과목·예산에
                맞는 학원을 실제 데이터로 비교하고 <br/>상담까지 경험해보세요
              </motion.p>

              <motion.div
                className="mt-10 flex flex-wrap items-center gap-4"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: EASE, delay: 0.38 }}
              >
                <Link
                  to="/onboarding/1"
                  className="rounded-full bg-white px-8 py-4 text-base font-semibold text-slate-900 shadow-xl transition-all hover:scale-[1.03] hover:bg-slate-50 active:scale-[0.97]"
                >
                  POSTMOM 비교 무료로 시작 →
                </Link>
                <Link
                  to="/academies"
                  className="liquid-glass rounded-full px-8 py-4 text-base font-medium text-white transition-all hover:scale-[1.03] active:scale-[0.97]"
                >
                  우리 동네 학원 찾기
                </Link>
              </motion.div>

              {/* Trust badges */}
              <motion.div
                className="mt-8 flex flex-wrap items-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.52 }}
              >
                {['실제 학부모 후기 기반', 'AI 비교 분석', '상담·레벨테스트 예약 연결'].map(
                  (chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-white/15 bg-white/8 px-4 py-1.5 text-xs font-medium text-white/75 backdrop-blur-sm"
                    >
                      ✓ {chip}
                    </span>
                  )
                )}
              </motion.div>
            </div>

            {/* Right: glass card */}
            <motion.div
              className="liquid-glass hidden rounded-3xl p-7 text-white lg:block"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.3 }}
            >
              <div className="mb-5 flex items-center justify-between">
                <h3 className="font-lora text-lg font-medium">AI 추천 미리보기</h3>
                <span className="rounded-full bg-green-800/20 px-3 py-1 text-xs font-medium text-white/400">
                  분석 완료
                </span>
              </div>

              <div className="space-y-3.5">
                {[
                  ['지역', '위례'],
                  ['학년', '초등 4학년'],
                  ['과목', '영어'],
                  ['예산', '월 40만원 이하'],
                  ['중요 기준', '밀착케어 / 후기 신뢰도'],
                ].map(([label, val]) => (
                  <div
                    key={label}
                    className="flex justify-between border-b border-white/12 pb-3 text-sm"
                  >
                    <span className="text-white/60">{label}</span>
                    <span className="font-medium">{val}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl bg-white/8 p-4 space-y-2.5">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
                  추천 결과
                </p>
                {['위례 YBM 어학원 ★★★★★', '위례 파고다 주니어 ★★★★☆', '위례 정상어학원 ★★★★☆'].map(
                  (academy) => (
                    <div
                      key={academy}
                      className="flex items-center gap-2 rounded-xl bg-white/8 px-3 py-2 text-sm"
                    >
                      <span className="h-2 w-2 rounded-full bg-purple-400 flex-shrink-0" />
                      {academy}
                    </div>
                  )
                )}
              </div>

              <Link
                to="/onboarding/1"
                className="mt-5 block w-full rounded-2xl bg-white/15 py-3 text-center text-sm font-semibold text-white transition-all hover:bg-white/22"
              >
                우리 아이 맞춤 분석 시작하기 →
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2">
          <div
            className="h-12 w-px"
            style={{
              background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.4), transparent)',
            }}
          />
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
            scroll
          </span>
        </div>
      </section>

      {/* ── STATS BAR ───────────────────────────────────── */}
      <section className="border-b border-slate-100 bg-white py-12">
        <div className="mx-auto max-w-[1400px] px-8 xl:px-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-lora text-4xl font-semibold text-slate-900 xl:text-5xl">
                  {stat.value}
                </p>
                <p className="mt-1.5 text-sm font-medium text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────── */}
      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-[1400px] px-8 xl:px-12">
          {/* Header */}
          <div className="mb-16 max-w-2xl">
            <span className="mb-3 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              핵심 기능
            </span>
            <h2 className="font-lora text-4xl font-semibold text-slate-900 xl:text-5xl">
              왜 PostMom을
              <br />
              선택할까요?
            </h2>
            <p className="mt-4 text-lg text-slate-500">
              실제 데이터와 AI 기술로 학원 선택의 불확실성을 없애드립니다.
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {FEATURES.map((feat) => (
              <div
                key={feat.title}
                className="group rounded-2xl border border-slate-200 bg-white p-7 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="mb-5 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-2xl">
                    {feat.icon}
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    {feat.badge}
                  </span>
                </div>
                <h3 className="mb-2.5 text-lg font-semibold text-slate-900">{feat.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────── */}
      <section id="how" className="bg-white py-24">
        <div className="mx-auto max-w-[1400px] px-8 xl:px-12">
          {/* Header */}
          <div className="mb-16 text-center">
            <span className="mb-3 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              이용 방법
            </span>
            <h2 className="font-lora text-4xl font-semibold text-slate-900 xl:text-5xl">
              단 4단계로 끝납니다
            </h2>
            <p className="mt-4 text-lg text-slate-500">
              복잡한 학원 탐색, PostMom이 빠르고 정확하게 해결해드립니다.
            </p>
          </div>

          {/* Steps */}
          <div className="relative grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
            {/* Connector line (desktop) */}
            <div className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent xl:block" />

            {STEPS.map((step) => (
              <div key={step.num} className="relative flex flex-col">
                {/* Step number */}
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-white shadow-lg shadow-primary/30">
                  {step.num}
                </div>

                <h3 className="mb-2 text-lg font-semibold text-slate-900">{step.title}</h3>
                <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-500">{step.desc}</p>
                <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                  <span className="h-1 w-1 rounded-full bg-primary" />
                  {step.detail}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-14 text-center">
            <Link
              to="/onboarding/1"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:scale-[1.03] hover:opacity-90 active:scale-[0.97]"
            >
              지금 바로 시작하기 →
            </Link>
          </div>
        </div>
      </section>

      {/* ── REVIEWS ─────────────────────────────────────── */}
      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-[1400px] px-8 xl:px-12">
          {/* Header */}
          <div className="mb-16 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="mb-3 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                실제 후기
              </span>
              <h2 className="font-lora text-4xl font-semibold text-slate-900 xl:text-5xl">
                학부모들의 이야기
              </h2>
            </div>
            <Link
              to="/community"
              className="self-start rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-primary hover:text-primary md:self-auto"
            >
              모든 후기 보기 →
            </Link>
          </div>

          {/* Review cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {REVIEWS.map((review) => (
              <div
                key={review.name}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"
              >
                {/* Stars */}
                <div>
                  <div className="mb-4 flex gap-0.5 text-yellow-400">
                    {'★'.repeat(review.rating)}
                  </div>
                  <p className="text-sm leading-relaxed text-slate-700">"{review.text}"</p>
                </div>

                {/* Author */}
                <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                    {review.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{review.name}</p>
                    <p className="text-xs text-slate-400">
                      {review.region} · {review.grade}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────── */}
      <section className="relative overflow-hidden bg-slate-900 py-28">
        {/* Decorative blobs */}
        <div
          className="pointer-events-none absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full opacity-25 blur-3xl"
          style={{ background: 'radial-gradient(circle, hsl(250 95% 65%) 0%, transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, hsl(250 95% 65%) 0%, transparent 70%)' }}
        />

        <div className="relative mx-auto max-w-[800px] px-8 text-center xl:px-12">
          <span className="mb-4 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white/70">
            무료로 시작 · 카드 불필요
          </span>
          <h2 className="font-lora text-4xl font-semibold text-white xl:text-5xl">
            지금 바로 시작하세요
          </h2>
          <p className="mt-5 text-lg text-white/60">
            PostMom과 함께 우리 아이의 미래를 준비하세요.
            <br />
            3분이면 AI 맞춤 학원 비교 결과를 받아볼 수 있습니다.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/onboarding/1"
              className="rounded-full bg-white px-10 py-4 text-base font-semibold text-slate-900 shadow-xl transition-all hover:scale-[1.03] hover:bg-slate-50 active:scale-[0.97]"
            >
              AI 비교 무료로 시작하기
            </Link>
            <Link
              to="/academies"
              className="rounded-full border border-white/25 px-10 py-4 text-base font-medium text-white/85 backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/8 hover:scale-[1.03]"
            >
              학원 둘러보기
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-white py-14">
        <div className="mx-auto max-w-[1400px] px-8 xl:px-12">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-[2fr_1fr_1fr_1fr]">
            {/* Brand */}
            <div>
              <Link to="/" className="font-lora text-2xl font-semibold text-slate-900">
                PostMom
              </Link>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-500">
                학부모가 데이터로 학원을 고르는 시대. PostMom은 AI와 커뮤니티로 더 나은
                교육 선택을 돕습니다.
              </p>
              <div className="mt-5 flex gap-3">
                {['블로그', '인스타', '카카오'].map((social) => (
                  <span
                    key={social}
                    className="cursor-pointer rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:border-primary hover:text-primary"
                  >
                    {social}
                  </span>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                서비스
              </p>
              <ul className="space-y-2.5 text-sm text-slate-500">
                {['학원 찾기', 'AI 비교', '커뮤니티 후기', '상담 예약'].map((item) => (
                  <li key={item}>
                    <span className="cursor-pointer transition-colors hover:text-slate-900">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                회사
              </p>
              <ul className="space-y-2.5 text-sm text-slate-500">
                {['회사 소개', '채용', '파트너 학원', '언론 보도'].map((item) => (
                  <li key={item}>
                    <span className="cursor-pointer transition-colors hover:text-slate-900">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                고객 지원
              </p>
              <ul className="space-y-2.5 text-sm text-slate-500">
                {['자주 묻는 질문', '이용 약관', '개인정보 처리방침', '문의하기'].map((item) => (
                  <li key={item}>
                    <span className="cursor-pointer transition-colors hover:text-slate-900">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-6 text-xs text-slate-400 sm:flex-row">
            <p>© 2026 PostMom. All rights reserved.</p>
            <p>서울특별시 송파구 위례성대로 · 사업자등록번호: 000-00-00000</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
