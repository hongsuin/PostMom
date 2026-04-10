import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, MapPin, Clock, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { academies } from '../data/mockData';

const SUBJECTS = ['전체', '수학', '영어']; //새 과목 생기면 여기에 추가
const LOCATIONS = ['전체 지역', '위례', '송파', '하남']; //새 지역 여기 추가
const SORT_OPTIONS = ['평점 높은 순', '리뷰 많은 순', '가격 낮은 순'];

const SUBJECT_COLORS: Record<string, string> = {
  수학: 'bg-blue-50 text-blue-700 border-blue-200',
  영어: 'bg-green-50 text-green-700 border-green-200',
  과학: 'bg-orange-50 text-orange-700 border-orange-200',
};

export default function AcademyList() {
  const [search, setSearch] = useState('');
  const [activeSubject, setActiveSubject] = useState('전체');
  const [activeLocation, setActiveLocation] = useState('전체 지역');
  const [sortBy, setSortBy] = useState('평점 높은 순');

  const filtered = academies.filter((a) => {
    const matchSearch =
      a.name.includes(search) || a.description.includes(search);
    const matchSubject = activeSubject === '전체' || a.subject === activeSubject;
    const matchLocation =
      activeLocation === '전체 지역' || a.location === activeLocation;
    return matchSearch && matchSubject && matchLocation;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Hero */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1400px] px-8 py-10 xl:px-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-1.5 text-sm font-semibold uppercase tracking-wider text-primary">
                학원 탐색
              </p>
              <h1 className="font-lora text-3xl font-semibold text-slate-900 xl:text-4xl">
                우리 동네 학원 찾기
              </h1>
              <p className="mt-2 text-slate-500">
                지역·과목·평점으로 필터링하고 AI 비교까지 한 번에
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="학원 이름 또는 키워드 검색"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-8 py-8 xl:px-12">
        <div className="flex gap-8">
          {/* ── SIDEBAR FILTERS ─────────────────────────── */}
          <aside className="hidden w-56 shrink-0 lg:block xl:w-64">
            <div className="sticky top-24 space-y-6">
              {/* Subject filter */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  과목
                </p>
                <div className="flex flex-col gap-1.5">
                  {SUBJECTS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setActiveSubject(s)}
                      className={`w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-all ${
                        activeSubject === s
                          ? 'bg-primary text-white shadow-sm shadow-primary/30'
                          : 'text-slate-600 hover:bg-white hover:text-slate-900'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location filter */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  지역
                </p>
                <div className="flex flex-col gap-1.5">
                  {LOCATIONS.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => setActiveLocation(loc)}
                      className={`w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-all ${
                        activeLocation === loc
                          ? 'bg-primary text-white shadow-sm shadow-primary/30'
                          : 'text-slate-600 hover:bg-white hover:text-slate-900'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-200 pt-4">
                <Link
                  to="/onboarding/1"
                  className="flex items-center justify-center gap-2 rounded-xl bg-primary/10 px-4 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary/15"
                >
                  P·M 맞춤 추천 받기
                </Link>
              </div>
            </div>
          </aside>

          {/* ── MAIN CONTENT ─────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Top bar */}
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-900">{filtered.length}개</span> 학원
              </p>
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={14} className="text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mobile subject tabs */}
            <div className="mb-5 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {SUBJECTS.map((s) => (
                <button
                  key={s}
                  onClick={() => setActiveSubject(s)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    activeSubject === s
                      ? 'bg-primary text-white'
                      : 'border border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Academy cards grid */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 py-20 text-center">
                <p className="text-lg font-semibold text-slate-400">검색 결과가 없습니다</p>
                <p className="mt-1 text-sm text-slate-400">다른 조건으로 검색해보세요</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((academy) => (
                  <Link
                    key={academy.id}
                    to={`/academies/${academy.id}`}
                    className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                  >
                    {/* Header row */}
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <span
                          className={`mb-2 inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                            SUBJECT_COLORS[academy.subject] ??
                            'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {academy.subject}
                        </span>
                        <h3 className="text-base font-semibold text-slate-900 group-hover:text-primary transition-colors">
                          {academy.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1 rounded-lg bg-yellow-50 px-2.5 py-1.5">
                        <Star size={13} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-bold text-slate-800">{academy.rating}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-500 line-clamp-2">
                      {academy.description}
                    </p>

                    {/* Tags */}
                    <div className="mb-4 flex flex-wrap gap-1.5">
                      {academy.tags.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-primary/8 px-2.5 py-1 text-xs font-medium text-primary"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-slate-100 pt-4">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <MapPin size={11} />
                            {academy.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={11} />
                            {academy.priceRange}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 font-medium text-slate-500 group-hover:text-primary transition-colors">
                          상세보기
                          <ChevronRight size={13} />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
