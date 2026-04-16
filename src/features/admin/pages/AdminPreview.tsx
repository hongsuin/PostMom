import { useNavigate } from 'react-router-dom';
import {
  MapPin, Star, Users, BookOpen, Award, DollarSign,
  Car, CheckCircle, Heart, Shield, Clock, Phone, X, Eye
} from 'lucide-react';
import { academies, myAcademy } from '../../../data/mockData';

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 flex items-center gap-2 text-base font-semibold text-slate-900">
        <span className="text-primary">{icon}</span>
        {title}
      </h2>
      {children}
    </div>
  );
}

export default function AdminPreview() {
  const navigate = useNavigate();

  // 운영 중인 학원 데이터를 academies에서 찾아옴 (이름 기준)
  const academy = academies.find(a => a.name === myAcademy.name) ?? academies[0];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── 미리보기 배너 ─────────────────────────────── */}
      <div className="sticky top-[57px] z-40 flex items-center justify-between border-b border-yellow-300 bg-yellow-50 px-8 py-3">
        <div className="flex items-center gap-2 text-sm font-medium text-yellow-800">
          <Eye size={16} />
          미리보기 모드 — 실제 유저에게 보이는 학원 상세 페이지입니다
        </div>
        <button
          onClick={() => navigate('/admin/profile')}
          className="flex items-center gap-1.5 rounded-lg bg-yellow-200 px-3 py-1.5 text-xs font-semibold text-yellow-900 transition-colors hover:bg-yellow-300"
        >
          <X size={13} />
          미리보기 닫기
        </button>
      </div>

      {/* ── HERO (유저 화면과 동일) ──────────────────── */}
      <div className="bg-gradient-to-br from-primary via-purple-600 to-indigo-700 text-white">
        <div className="mx-auto max-w-[1400px] px-8 py-10 xl:px-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                  {academy.subject}
                </span>
                <span className="rounded-full bg-green-500/30 px-3 py-1 text-xs font-medium text-green-200">
                  ✓ AI 추천
                </span>
              </div>
              <h1 className="font-lora text-3xl font-semibold xl:text-4xl">{academy.name}</h1>
              <p className="mt-2 text-lg text-white/80">{academy.summary}</p>
              <div className="mt-4 flex flex-wrap items-center gap-5 text-sm text-white/80">
                <div className="flex items-center gap-1.5">
                  <Star size={14} className="fill-yellow-300 text-yellow-300" />
                  <span className="font-semibold text-white">{academy.rating}</span>
                  <span>({academy.reviewCount}개 리뷰)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} />{academy.location}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={14} />{academy.schedule.split(',')[0]}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {academy.tags.map(t => (
                  <span key={t} className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT (유저 화면과 동일) ─────────── */}
      <div className="mx-auto max-w-[1400px] px-8 py-8 xl:px-12">
        <div className="flex gap-8">

          {/* LEFT COLUMN */}
          <div className="flex-1 min-w-0 space-y-5 pb-10">
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
                  <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</div>
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
                          <CheckCircle size={13} className="mt-0.5 shrink-0 text-primary" />{item}
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
                        <div className="mb-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</div>
                        <span className="text-xs text-slate-500">{step}</span>
                      </div>
                      {i < academy.learningFlow.length - 1 && <div className="mb-5 h-px w-6 flex-shrink-0 bg-slate-200" />}
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
                      <p className="text-xs text-slate-500">{teacher.experience} · {teacher.specialty}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Reviews */}
            <SectionCard title="학부모 후기" icon={<Heart size={18} />}>
              <div className="mb-5 flex flex-wrap gap-2">
                {academy.reviewKeywords.map((keyword, i) => (
                  <span key={i} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{keyword}</span>
                ))}
              </div>
              <div className="space-y-5">
                {academy.reviews.map((review, i) => (
                  <div key={i} className="border-b border-slate-100 pb-5 last:border-0 last:pb-0">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{review.author[0]}</div>
                        <span className="text-sm font-semibold text-slate-800">{review.author}</span>
                      </div>
                      <div className="flex text-yellow-400">{'★'.repeat(review.rating)}</div>
                    </div>
                    <p className="mb-2.5 pl-10 text-sm leading-relaxed text-slate-600">{review.text}</p>
                    <div className="flex gap-1.5 pl-10">
                      {review.keywords.map((keyword, j) => (
                        <span key={j} className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{keyword}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="hidden w-72 shrink-0 lg:block xl:w-80">
            <div className="sticky top-36 space-y-4">
              {/* CTA card */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="bg-primary/8 px-6 py-4">
                  <p className="text-sm font-semibold text-slate-900">상담 & 레벨테스트 예약</p>
                  <p className="mt-0.5 text-xs text-slate-500">빠른 예약으로 자리를 확보하세요</p>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex w-full cursor-default items-center justify-center rounded-xl bg-primary py-3.5 text-sm font-semibold text-white opacity-60">
                    상담 신청하기
                  </div>
                  <div className="flex w-full cursor-default items-center justify-center rounded-xl bg-slate-900 py-3.5 text-sm font-semibold text-white opacity-60">
                    레벨테스트 신청
                  </div>
                  <p className="text-center text-xs text-slate-400">미리보기 모드 — 버튼 비활성화</p>
                </div>
              </div>

              {/* Contact info */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="mb-4 text-sm font-semibold text-slate-800">연락처 & 위치</p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2.5 text-slate-600">
                    <Phone size={14} className="mt-0.5 shrink-0 text-primary" />{academy.phone}
                  </div>
                  <div className="flex items-start gap-2.5 text-slate-600">
                    <MapPin size={14} className="mt-0.5 shrink-0 text-primary" />{academy.address}
                  </div>
                  <div className="flex items-start gap-2.5 text-slate-600">
                    <Clock size={14} className="mt-0.5 shrink-0 text-primary" />
                    <span className="leading-relaxed">{academy.schedule}</span>
                  </div>
                </div>
                <div className="mt-4 flex h-28 items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-400">지도 영역</div>
              </div>

              {/* Pricing */}
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
    </div>
  );
}
