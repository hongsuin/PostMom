import { useParams, Link } from 'react-router-dom';
import { Heart, MessageCircle, ChevronRight, ChevronLeft, Star, Send, Tag } from 'lucide-react';
import { communityPosts, academies } from '../data/mockData';

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

const MOCK_COMMENTS = [
  {
    author: '맘스클럽',
    text: '저도 비슷한 경험이 있어요. 정말 추천드려요!',
    date: '2시간 전',
    likes: 3,
  },
  {
    author: '위례학부모',
    text: '상담은 어떻게 받으셨나요? 저도 알아보고 있는데 도움이 될 것 같아서요.',
    date: '5시간 전',
    likes: 1,
  },
];

export default function CommunityPost() {
  const { id } = useParams();
  const post = communityPosts.find((p) => p.id === id);

  if (!post) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-400">
        게시글을 찾을 수 없습니다.
      </div>
    );
  }

  const mentionedAcademies = academies.filter((a) =>
    post.mentionedAcademies.includes(a.id)
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sub-header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1400px] px-8 py-4 xl:px-12">
          <Link
            to="/community"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900"
          >
            <ChevronLeft size={16} />
            커뮤니티로 돌아가기
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-8 py-8 xl:px-12">
        <div className="flex gap-8">
          {/* ── MAIN ─────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* Post body */}
            <article className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              {/* Tags */}
              <div className="mb-4 flex flex-wrap gap-2">
                {post.tags.map((t) => (
                  <span
                    key={t}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      TAG_COLORS[t] ?? 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* Title */}
              <h1 className="font-lora text-2xl font-semibold leading-snug text-slate-900 xl:text-3xl">
                {post.title}
              </h1>

              {/* Author + date */}
              <div className="mt-3 mb-6 flex items-center gap-3 border-b border-slate-100 pb-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                  {post.author[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{post.author}</p>
                  <p className="text-xs text-slate-400">{post.date}</p>
                </div>
              </div>

              {/* Content */}
              <div className="prose prose-slate max-w-none">
                <p className="text-base leading-relaxed text-slate-700">{post.content}</p>
              </div>

              {/* Reactions */}
              <div className="mt-8 flex items-center gap-4 border-t border-slate-100 pt-5">
                <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-500 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-500">
                  <Heart size={15} />
                  좋아요 {post.likes}
                </button>
                <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-500 transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary">
                  <MessageCircle size={15} />
                  댓글 {post.comments}
                </button>
              </div>
            </article>

            {/* Comments */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-base font-semibold text-slate-900">
                댓글 {post.comments}
              </h2>

              <div className="mb-6 space-y-4">
                {MOCK_COMMENTS.map((c, i) => (
                  <div
                    key={i}
                    className="flex gap-3 border-b border-slate-100 pb-4 last:border-0"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                      {c.author[0]}
                    </div>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-800">{c.author}</span>
                        <span className="text-xs text-slate-400">{c.date}</span>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-600">{c.text}</p>
                      <button className="mt-1.5 flex items-center gap-1 text-xs text-slate-400 hover:text-red-400 transition-colors">
                        <Heart size={11} /> {c.likes}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comment input */}
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                  나
                </div>
                <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 focus-within:border-primary focus-within:bg-white transition-all">
                  <input
                    placeholder="댓글을 입력하세요..."
                    className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                  />
                  <button className="shrink-0 rounded-lg bg-primary p-1.5 text-white transition-all hover:opacity-85">
                    <Send size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── SIDEBAR ──────────────────────────────────── */}
          <aside className="hidden w-64 shrink-0 lg:block xl:w-72">
            <div className="sticky top-24 space-y-4">
              {/* Mentioned academies */}
              {mentionedAcademies.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="mb-4 text-sm font-semibold text-slate-800">언급된 학원</p>
                  <div className="space-y-2">
                    {mentionedAcademies.map((a) => (
                      <Link
                        key={a.id}
                        to={`/academies/${a.id}`}
                        className="group flex items-center justify-between rounded-xl border border-slate-100 p-3 transition-all hover:border-primary/30 hover:bg-primary/4"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-800 group-hover:text-primary transition-colors">
                            {a.name}
                          </p>
                          <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
                            <span>{a.location} · {a.subject}</span>
                          </div>
                          <div className="mt-1 flex items-center gap-1 text-xs">
                            <Star size={10} className="fill-yellow-400 text-yellow-400" />
                            <span className="font-medium text-slate-600">{a.rating}</span>
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-primary transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Tag size={14} className="text-primary" />
                  <p className="text-sm font-semibold text-slate-800">게시글 태그</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((t) => (
                    <span
                      key={t}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                        TAG_COLORS[t] ?? 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      # {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* AI Compare CTA */}
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
                <p className="mb-1 text-sm font-semibold text-slate-900">
                  이 학원 AI 비교해볼까요?
                </p>
                <p className="mb-3 text-xs text-slate-500">
                  언급된 학원의 강점·약점을 AI로 상세히 비교해드립니다
                </p>
                <Link
                  to="/compare"
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-semibold text-white transition-all hover:opacity-90"
                >
                  ⚡ AI 비교 분석하기
                </Link>
              </div>

              {/* Back to list */}
              <Link
                to="/community"
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-3 text-sm text-slate-500 transition-all hover:border-primary/30 hover:text-primary"
              >
                <ChevronLeft size={14} />
                커뮤니티 목록 보기
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
