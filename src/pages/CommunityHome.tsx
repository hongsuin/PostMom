import { Link } from 'react-router-dom';
import { MessageCircle, Heart, Pencil, TrendingUp, Tag, ChevronRight } from 'lucide-react';
import { communityPosts } from '../data/mockData';

const POPULAR_TAGS = ['수학', '영어', '과학', '위례', '분당', '후기', '비교', '선행', '중학교'];

const TAG_COLORS: Record<string, string> = {
  수학: 'bg-blue-50 text-blue-700',
  영어: 'bg-green-50 text-green-700',
  과학: 'bg-orange-50 text-orange-700',
  위례: 'bg-purple-50 text-purple-700',
  분당: 'bg-pink-50 text-pink-700',
  후기: 'bg-yellow-50 text-yellow-700',
  비교: 'bg-cyan-50 text-cyan-700',
  선행: 'bg-red-50 text-red-700',
  중학교: 'bg-indigo-50 text-indigo-700',
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
}

export default function CommunityHome() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page hero */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1400px] px-8 py-10 xl:px-12">
          <div className="flex items-end justify-between">
            <div>
              <p className="mb-1.5 text-sm font-semibold uppercase tracking-wider text-primary">
                커뮤니티
              </p>
              <h1 className="font-lora text-3xl font-semibold text-slate-900 xl:text-4xl">
                학부모 후기 & 이야기
              </h1>
              <p className="mt-2 text-slate-500">
                실제 학부모들의 솔직한 후기와 학원 정보를 공유하는 공간입니다
              </p>
            </div>
            <button className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-md shadow-primary/25 transition-all hover:opacity-90 hover:scale-[1.02]">
              <Pencil size={15} />
              글 작성하기
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-8 py-8 xl:px-12">
        <div className="flex gap-8">
          {/* ── MAIN: POST LIST ───────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-4">
            {communityPosts.map((post) => (
              <Link
                key={post.id}
                to={`/community/${post.id}`}
                className="group block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              >
                {/* Top: Tags + date */}
                <div className="mb-3 flex items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map((t) => (
                      <span
                        key={t}
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          TAG_COLORS[t] ?? 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">
                    {formatDate(post.date)}
                  </span>
                </div>

                {/* Title */}
                <h3 className="mb-2 text-base font-semibold text-slate-900 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>

                {/* Content preview */}
                <p className="mb-4 text-sm leading-relaxed text-slate-500 line-clamp-2">
                  {post.content}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-1.5 text-sm text-slate-500">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {post.author[0]}
                    </div>
                    <span className="font-medium text-slate-700">{post.author}</span>
                  </div>

                  <div className="flex items-center gap-5 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 transition-colors group-hover:text-red-400">
                      <Heart size={13} />
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-1.5 transition-colors group-hover:text-primary">
                      <MessageCircle size={13} />
                      {post.comments}
                    </span>
                    <span className="flex items-center gap-1 font-medium text-slate-500 group-hover:text-primary transition-colors">
                      읽기
                      <ChevronRight size={13} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}

            {/* Load more */}
            <button className="w-full rounded-2xl border border-dashed border-slate-300 py-4 text-sm font-medium text-slate-400 transition-colors hover:border-primary/40 hover:text-primary">
              더 많은 후기 불러오기
            </button>
          </div>

          {/* ── SIDEBAR ──────────────────────────────────── */}
          <aside className="hidden w-64 shrink-0 lg:block xl:w-72">
            <div className="sticky top-24 space-y-5">
              {/* Write CTA */}
              <div className="rounded-2xl bg-gradient-to-br from-primary to-purple-600 p-6 text-white">
                <p className="mb-1 font-semibold">학원 후기를 공유해주세요</p>
                <p className="mb-4 text-sm text-white/75">
                  내 경험이 다른 학부모에게 큰 도움이 됩니다
                </p>
                <button className="w-full rounded-xl bg-white py-2.5 text-sm font-semibold text-primary transition-all hover:bg-white/90">
                  후기 작성하기
                </button>
              </div>

              {/* Stats */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="mb-4 flex items-center gap-2">
                  <TrendingUp size={15} className="text-primary" />
                  <p className="text-sm font-semibold text-slate-800">커뮤니티 현황</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['총 후기', '1,136개'],
                    ['이번 주', '47개'],
                    ['활성 회원', '320명'],
                    ['평균 평점', '4.7★'],
                  ].map(([label, val]) => (
                    <div key={label} className="rounded-xl bg-slate-50 p-3 text-center">
                      <p className="text-base font-bold text-slate-900">{val}</p>
                      <p className="text-xs text-slate-400">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Popular tags */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Tag size={15} className="text-primary" />
                  <p className="text-sm font-semibold text-slate-800">인기 태그</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_TAGS.map((tag) => (
                    <button
                      key={tag}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all hover:scale-[1.04] ${
                        TAG_COLORS[tag] ?? 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      # {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Compare CTA */}
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
                <p className="mb-1 text-sm font-semibold text-slate-900">
                  후기 보고 마음에 드는 학원이 있나요?
                </p>
                <p className="mb-3 text-xs text-slate-500">
                  AI 비교로 우리 아이에게 맞는지 확인해보세요
                </p>
                <Link
                  to="/compare"
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-semibold text-white transition-all hover:opacity-90"
                >
                  <span>⚡</span>
                  AI 비교 분석하기
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
