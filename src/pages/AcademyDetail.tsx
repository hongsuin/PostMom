import { useParams, Link, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  MapPin, Star, Users, BookOpen, Award, DollarSign,
  Car, CheckCircle, Heart, Shield, ChevronLeft, Clock, Phone, Pencil, X
} from 'lucide-react';
import { academies } from '../data/mockData';
import { getSupabaseBrowserClient } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import { getUserType } from '../types/user';
import type { UserType } from '../types/user';
import { REVIEW_KEYWORDS } from '../data/reviewKeywords';
import UserTypeBadge from '../components/UserTypeBadge';
import { useReviewStore, calcAvgRating } from '../store/reviewStore';
import type { LocalReview } from '../store/reviewStore';

// ── 타입 ──────────────────────────────────────────────────────────
type Review = {
  id?: string;
  author: string;
  text: string;
  rating: number;
  keywords: string[];
  userType?: UserType;
  createdAt?: string;
};

// ── 섹션 카드 ─────────────────────────────────────────────────────
function SectionCard({ title, icon, children, action }: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
          <span className="text-primary">{icon}</span>
          {title}
        </h2>
        {action}
      </div>
      {children}
    </div>
  );
}

// ── 별점 입력 ─────────────────────────────────────────────────────
function StarRating({ value, hover, onSet, onHover, onLeave }: {
  value: number;
  hover: number;
  onSet: (n: number) => void;
  onHover: (n: number) => void;
  onLeave: () => void;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onSet(star)}
          onMouseEnter={() => onHover(star)}
          onMouseLeave={onLeave}
          className="text-2xl transition-transform hover:scale-110 focus:outline-none"
        >
          <span className={(hover || value) >= star ? 'text-yellow-400' : 'text-slate-200'}>
            ★
          </span>
        </button>
      ))}
      {value > 0 && (
        <span className="ml-1.5 self-center text-sm font-medium text-slate-500">
          {['', '별로예요', '그저 그래요', '보통이에요', '좋아요', '최고예요'][value]}
        </span>
      )}
    </div>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────
export default function AcademyDetail() {
  const { id } = useParams<{ id: string }>();
  const academy = academies.find((a) => a.id === id);

  const [session, setSession] = useState<Session | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { addReview, getReviews, fetchReviews, isLoading } = useReviewStore();

  // 폼 상태
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  // 페이지 진입 시 Supabase에서 리뷰 로드
  useEffect(() => {
    if (id) fetchReviews(id);
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // 학원 데이터 없으면 리다이렉트
  if (!academy) return <Navigate to="/academies" replace />;

  const userType = getUserType(session);
  const isLoggedIn = !!session;
  const dbReviews = getReviews(academy.id);
  const reviewsLoading = isLoading(academy.id);
  const allReviews: Review[] = [...(academy.reviews as Review[]), ...(dbReviews as Review[])];
  const keywords = REVIEW_KEYWORDS[userType] ?? REVIEW_KEYWORDS.student;

  // 전체 리뷰 기반 동적 평균 별점 (소수점 1자리)
  const avgRating = calcAvgRating(academy.reviews, dbReviews, academy.rating);

  const toggleKeyword = (kw: string) => {
    setSelectedKeywords(prev =>
      prev.includes(kw) ? prev.filter(k => k !== kw) : [...prev, kw]
    );
  };

  const handleSubmit = async () => {
    setSubmitError('');
    if (rating === 0) { setSubmitError('별점을 선택해주세요'); return; }
    if (reviewText.trim().length < 10) { setSubmitError('후기를 10자 이상 작성해주세요'); return; }

    const authorName =
      session?.user?.user_metadata?.full_name ??
      session?.user?.user_metadata?.name ??
      session?.user?.email?.split('@')[0] ??
      '익명';

    const newReview: LocalReview = {
      author: authorName,
      text: reviewText.trim(),
      rating,
      keywords: selectedKeywords,
      userType,
    };

    setSubmitting(true);
    try {
      await addReview(academy.id, newReview, session?.user?.id);
      setSubmitSuccess(true);
      setShowForm(false);
      // 폼 초기화
      setRating(0);
      setHoverRating(0);
      setReviewText('');
      setSelectedKeywords([]);
      // 성공 메시지 3초 후 사라짐
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (e) {
      setSubmitError('저장 중 오류가 발생했어요. 다시 시도해주세요.');
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary via-primary/80 to-primary/60 text-white">
        <div className="mx-auto max-w-[1400px] px-8 py-10 xl:px-12">
          <Link
            to="/academies"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/70 transition-colors hover:text-white"
          >
            <ChevronLeft size={16} />
            학원 목록으로
          </Link>

          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                  {academy.subject}
                </span>
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-green-200">
                  ✓ AI 추천
                </span>
              </div>

              <h1 className="font-lora text-3xl font-semibold xl:text-4xl">{academy.name}</h1>
              <p className="mt-2 text-lg text-white/80">{academy.summary}</p>

              <div className="mt-4 flex flex-wrap items-center gap-5 text-sm text-white/80">
                <div className="flex items-center gap-1.5">
                  <Star size={14} className="fill-yellow-300 text-yellow-300" />
                  <span className="font-semibold text-white">{avgRating}</span>
                  <span>({allReviews.length}개 리뷰)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} />
                  {academy.location}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={14} />
                  {academy.schedule.split(',')[0]}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {academy.tags.map((t) => (
                  <span key={t} className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-[1400px] px-8 py-8 xl:px-12">
        <div className="flex gap-8">
          {/* ── LEFT COLUMN ── */}
          <div className="flex-1 min-w-0 space-y-5 pb-28 lg:pb-0">
            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {[
                { icon: <Users size={16} />, label: '대상 학년', value: academy.targetGrade },
                { icon: <BookOpen size={16} />, label: '과목', value: academy.subject },
                { icon: <Award size={16} />, label: '반 정원', value: academy.classSize },
                { icon: <Star size={16} />, label: '수업 방식', value: academy.teachingStyle },
                { icon: <DollarSign size={16} />, label: '월 비용', value: academy.monthlyCost },
                { icon: <Car size={16} />, label: '주차', value: academy.parking ? '가능' : '불가' },
              ].map(({ icon, label, value }) => (
                <div key={label} className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                  <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {icon}
                  </div>
                  <p className="text-xs text-slate-400">{label}</p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-900">{value}</p>
                </div>
              ))}
            </div>

            {/* Curriculum */}
            <SectionCard title="커리큘럼" icon={<BookOpen size={18} />}>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                {[
                  { label: '초등 과정', items: academy.curriculum.elementary },
                  { label: '중등 과정', items: academy.curriculum.middle },
                  { label: '고등 과정', items: academy.curriculum.high },
                ].map(({ label, items }) => (
                  <div key={label}>
                    <h3 className="mb-3 text-sm font-semibold text-slate-700">{label}</h3>
                    <ul className="space-y-2">
                      {items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <CheckCircle size={13} className="mt-0.5 shrink-0 text-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="mt-6 border-t border-slate-100 pt-5">
                <p className="mb-4 text-sm font-semibold text-slate-700">학습 흐름</p>
                <div className="flex items-center gap-2">
                  {academy.learningFlow.map((step, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="flex flex-col items-center text-center">
                        <div className="mb-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {i + 1}
                        </div>
                        <span className="text-xs text-slate-500">{step}</span>
                      </div>
                      {i < academy.learningFlow.length - 1 && (
                        <div className="mb-5 h-px w-6 flex-shrink-0 bg-slate-200" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>

            {/* Teachers */}
            <SectionCard title={`강사진 (${academy.teacherCount}명)`} icon={<Users size={18} />}>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {academy.teacherProfiles.map((teacher, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-base font-bold text-primary">
                      {teacher.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{teacher.name}</p>
                      <p className="text-xs text-slate-500">
                        {teacher.experience} · {teacher.specialty}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* ── 리뷰 섹션 ── */}
            <SectionCard
              title={`후기 (${allReviews.length})`}
              icon={<Heart size={18} />}
              action={
                isLoggedIn ? (
                  <button
                    onClick={() => setShowForm(v => !v)}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                      showForm
                        ? 'bg-slate-100 text-slate-500'
                        : 'bg-primary text-white hover:bg-primary/90'
                    }`}
                  >
                    {showForm ? <><X size={13} /> 취소</> : <><Pencil size={13} /> 후기 작성</>}
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="text-xs text-primary font-medium hover:underline"
                  >
                    로그인 후 작성 가능
                  </Link>
                )
              }
            >
              {/* 작성 성공 토스트 */}
              {submitSuccess && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                  <CheckCircle size={15} className="shrink-0" />
                  후기가 등록되었어요! 감사합니다 😊
                </div>
              )}

              {/* ── 리뷰 작성 폼 ── */}
              {showForm && (
                <div className="mb-6 rounded-2xl border-2 border-primary/20 bg-primary/5 p-5 space-y-5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                      {(session?.user?.user_metadata?.full_name ?? session?.user?.email ?? '?')[0]}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-800">
                        {session?.user?.user_metadata?.full_name ?? session?.user?.email?.split('@')[0] ?? '익명'}
                      </span>
                      <UserTypeBadge userType={userType} size="md" />
                    </div>
                  </div>

                  {/* 별점 */}
                  <div>
                    <p className="mb-2 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      별점 <span className="text-red-400">*</span>
                    </p>
                    <StarRating
                      value={rating}
                      hover={hoverRating}
                      onSet={setRating}
                      onHover={setHoverRating}
                      onLeave={() => setHoverRating(0)}
                    />
                  </div>

                  {/* 키워드 선택 */}
                  {keywords.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        키워드 선택 <span className="text-slate-400 font-normal normal-case">(복수 선택 가능)</span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {keywords.map((kw) => (
                          <button
                            key={kw}
                            type="button"
                            onClick={() => toggleKeyword(kw)}
                            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                              selectedKeywords.includes(kw)
                                ? 'border-primary bg-primary text-white'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-primary hover:text-primary'
                            }`}
                          >
                            {selectedKeywords.includes(kw) ? '✓ ' : ''}{kw}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 후기 텍스트 */}
                  <div>
                    <p className="mb-2 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      후기 <span className="text-red-400">*</span>
                    </p>
                    <textarea
                      value={reviewText}
                      onChange={e => setReviewText(e.target.value)}
                      placeholder="학원에 대한 솔직한 후기를 남겨주세요. (10자 이상)"
                      rows={4}
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm
                        leading-relaxed text-slate-700 placeholder-slate-400
                        focus:border-primary focus:outline-none transition-colors"
                    />
                    <p className="mt-1 text-right text-xs text-slate-400">{reviewText.length}자</p>
                  </div>

                  {submitError && (
                    <p className="text-xs text-red-500">{submitError}</p>
                  )}

                  {/* 제출 버튼 */}
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => { setShowForm(false); setSubmitError(''); }}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors disabled:opacity-40"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={handleSubmit}
                      className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors disabled:opacity-60"
                    >
                      {submitting && (
                        <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      )}
                      {submitting ? '저장 중...' : '등록하기'}
                    </button>
                  </div>
                </div>
              )}

              {/* 키워드 요약 태그 */}
              <div className="mb-5 flex flex-wrap gap-2">
                {academy.reviewKeywords.map((keyword, i) => (
                  <span key={i} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {keyword}
                  </span>
                ))}
              </div>

              {/* 리뷰 목록 */}
              <div className="space-y-5">
                {reviewsLoading && (
                  <div className="flex items-center justify-center gap-2 py-6 text-sm text-slate-400">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-primary" />
                    후기를 불러오는 중...
                  </div>
                )}
                {!reviewsLoading && allReviews.length === 0 && (
                  <p className="text-center text-sm text-slate-400 py-6">
                    아직 후기가 없어요. 첫 번째 후기를 남겨보세요!
                  </p>
                )}
                {allReviews.map((review, i) => (
                  <div key={review.id ?? i} className="border-b border-slate-100 pb-5 last:border-0 last:pb-0">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {review.author[0]}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-semibold text-slate-800">{review.author}</span>
                            <UserTypeBadge userType={review.userType} />
                          </div>
                          {review.createdAt && (
                            <span className="text-xs text-slate-400">
                              {new Date(review.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex text-yellow-400 text-sm">
                        {'★'.repeat(review.rating)}
                        <span className="text-slate-200">{'★'.repeat(5 - review.rating)}</span>
                      </div>
                    </div>
                    <p className="mb-2.5 pl-10 text-sm leading-relaxed text-slate-600">{review.text}</p>
                    {review.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pl-10">
                        {review.keywords.map((keyword, j) => (
                          <span key={j} className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* 연락처 & 위치 (mobile) */}
            <div className="lg:hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="mb-4 text-sm font-semibold text-slate-800">연락처 & 위치</p>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2.5 text-slate-600">
                  <Phone size={14} className="mt-0.5 shrink-0 text-primary" />
                  {academy.phone}
                </div>
                <div className="flex items-start gap-2.5 text-slate-600">
                  <MapPin size={14} className="mt-0.5 shrink-0 text-primary" />
                  {academy.address}
                </div>
                <div className="flex items-start gap-2.5 text-slate-600">
                  <Clock size={14} className="mt-0.5 shrink-0 text-primary" />
                  <span className="leading-relaxed">{academy.schedule}</span>
                </div>
              </div>
              <div className="mt-4 flex h-28 items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-400">
                지도 영역
              </div>
            </div>

            {/* 수강료 (mobile) */}
            <div className="lg:hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="mb-4 text-sm font-semibold text-slate-800">수강료 안내</p>
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">월 수강료</span>
                  <span className="font-bold text-primary">{academy.priceRange}</span>
                </div>
                {academy.additionalCosts.map((cost, i) => (
                  <div key={i} className="flex items-center justify-between text-slate-500">
                    <span>{cost.item}</span>
                    <span>{cost.cost}</span>
                  </div>
                ))}
                <div className="flex items-start gap-2 border-t border-slate-100 pt-3">
                  <Shield size={13} className="mt-0.5 shrink-0 text-green-500" />
                  <p className="text-xs text-slate-500">{academy.refundPolicy}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <aside className="hidden w-72 shrink-0 lg:block xl:w-80">
            <div className="sticky top-24 space-y-4">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="bg-primary/8 px-6 py-4">
                  <p className="text-sm font-semibold text-slate-900">상담 & 레벨테스트 예약</p>
                  <p className="mt-0.5 text-xs text-slate-500">빠른 예약으로 자리를 확보하세요</p>
                </div>
                <div className="p-5 space-y-3">
                  <Link
                    to={`/consult/${academy.id}`}
                    className="flex w-full items-center justify-center rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-md shadow-primary/25 transition-all hover:opacity-90 hover:scale-[1.02]"
                  >
                    상담 신청하기
                  </Link>
                  <Link
                    to={`/leveltest/${academy.id}`}
                    className="flex w-full items-center justify-center rounded-xl bg-slate-900 py-3.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 hover:scale-[1.02]"
                  >
                    레벨테스트 신청
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="mb-4 text-sm font-semibold text-slate-800">연락처 & 위치</p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2.5 text-slate-600">
                    <Phone size={14} className="mt-0.5 shrink-0 text-primary" />
                    {academy.phone}
                  </div>
                  <div className="flex items-start gap-2.5 text-slate-600">
                    <MapPin size={14} className="mt-0.5 shrink-0 text-primary" />
                    {academy.address}
                  </div>
                  <div className="flex items-start gap-2.5 text-slate-600">
                    <Clock size={14} className="mt-0.5 shrink-0 text-primary" />
                    <span className="leading-relaxed">{academy.schedule}</span>
                  </div>
                </div>
                <div className="mt-4 flex h-28 items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-400">
                  지도 영역
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="mb-4 text-sm font-semibold text-slate-800">수강료 안내</p>
                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">월 수강료</span>
                    <span className="font-bold text-primary">{academy.priceRange}</span>
                  </div>
                  {academy.additionalCosts.map((cost, i) => (
                    <div key={i} className="flex items-center justify-between text-slate-500">
                      <span>{cost.item}</span>
                      <span>{cost.cost}</span>
                    </div>
                  ))}
                  <div className="flex items-start gap-2 border-t border-slate-100 pt-3">
                    <Shield size={13} className="mt-0.5 shrink-0 text-green-500" />
                    <p className="text-xs text-slate-500">{academy.refundPolicy}</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* MOBILE BOTTOM CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
        <div className="mx-auto flex max-w-lg gap-3">
          <Link
            to={`/consult/${academy.id}`}
            className="flex flex-1 items-center justify-center rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-md shadow-primary/25 transition-all hover:opacity-90"
          >
            상담 신청하기
          </Link>
          <Link
            to={`/leveltest/${academy.id}`}
            className="flex flex-1 items-center justify-center rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition-all hover:bg-slate-800"
          >
            레벨테스트 신청
          </Link>
        </div>
      </div>
    </div>
  );
}
