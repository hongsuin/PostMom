import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Heart,
  MessageCircle,
  Send,
  Star,
  Tag,
} from 'lucide-react';
import { academies } from '../data/mockData';
import UserProfileModal from '../components/UserProfileModal';
import UserTypeBadge from '../components/UserTypeBadge';
import { useCommunityStore } from '../store/communityStore';
import { useUserType } from '../hooks/useUserType';
import type { UserType } from '../types/user';

const TAG_COLORS: Record<string, string> = {
  수학: 'bg-blue-50 text-blue-700',
  영어: 'bg-green-50 text-green-700',
  과학: 'bg-orange-50 text-orange-700',
  후기: 'bg-purple-50 text-purple-700',
  비교: 'bg-pink-50 text-pink-700',
  상담: 'bg-cyan-50 text-cyan-700',
  중등: 'bg-indigo-50 text-indigo-700',
  정보공유: 'bg-slate-100 text-slate-700',
};

const REGION_STYLES: Record<string, string> = {
  위례: 'bg-primary/10 text-primary',
  태평: 'bg-orange-100 text-orange-700',
};

const MOCK_COMMENTS = [
  {
    author: '맘스토크',
    text: '상담 분위기까지 같이 적어주셔서 도움이 많이 됐어요.',
    date: '2시간 전',
    likes: 3,
  },
  {
    author: '태평학부모',
    text: '링크 들어가 보니 커리큘럼 설명이 자세해서 참고하기 좋네요.',
    date: '5시간 전',
    likes: 1,
  },
];

export default function CommunityPost() {
  const { id } = useParams();
  const userType = useUserType();
  const isAcademy = userType === 'academy';
  const [modalUser, setModalUser] = useState<{ author: string; userType?: UserType } | null>(null);
  const [loading, setLoading] = useState(false);
  const fetchPosts = useCommunityStore((state) => state.fetchPosts);
  const fetchPostById = useCommunityStore((state) => state.fetchPostById);
  const post = useCommunityStore((state) => (id ? state.getPostById(id) : null));

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      await fetchPosts();
      await fetchPostById(id);
      setLoading(false);
    };

    void load();
  }, [fetchPostById, fetchPosts, id]);

  const openProfile = (author: string, nextUserType?: UserType) => {
    if (!isAcademy) return;
    setModalUser({ author, userType: nextUserType });
  };

  const mentionedAcademies = useMemo(() => {
    if (!post) return [];
    return academies.filter((academy) => post.mentionedAcademies.includes(academy.id));
  }, [post]);

  if (!post && loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-400">
        게시글을 불러오는 중이에요.
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-400">
        게시글을 찾을 수 없어요.
      </div>
    );
  }

  return (
    <>
      <UserProfileModal
        author={modalUser?.author ?? ''}
        userType={modalUser?.userType}
        isOpen={!!modalUser}
        onClose={() => setModalUser(null)}
        isAcademy={isAcademy}
      />

      <div className="min-h-screen bg-slate-50">
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
            <div className="min-w-0 flex-1 space-y-5">
              <article className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="mb-4 flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      REGION_STYLES[post.region] ?? 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {post.region}
                  </span>
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        TAG_COLORS[tag] ?? 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <h1 className="text-2xl font-semibold leading-snug text-slate-900 xl:text-3xl">
                  {post.title}
                </h1>

                <div className="mb-6 mt-3 flex items-center gap-3 border-b border-slate-100 pb-5">
                  <button
                    type="button"
                    onClick={() => openProfile(post.author, post.userType)}
                    className={`flex items-center gap-3 ${
                      isAcademy ? 'cursor-pointer transition-opacity hover:opacity-75' : 'cursor-default'
                    }`}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                      {post.author[0]}
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-800">{post.author}</p>
                        <UserTypeBadge userType={post.userType} />
                      </div>
                      <p className="text-xs text-slate-400">{post.date}</p>
                    </div>
                  </button>
                </div>

                <div className="prose prose-slate max-w-none">
                  <p className="text-base leading-relaxed whitespace-pre-wrap text-slate-700">
                    {post.content}
                  </p>
                </div>

                {post.link && (
                  <a
                    href={post.link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 transition hover:border-primary/30 hover:bg-primary/5"
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                        Academy Blog
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{post.link.title}</p>
                      <p className="mt-1 break-all text-xs text-slate-500">{post.link.url}</p>
                    </div>
                    <div className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                      블로그 보기
                      <ExternalLink size={14} />
                    </div>
                  </a>
                )}

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

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-base font-semibold text-slate-900">댓글 {post.comments}</h2>

                <div className="mb-6 space-y-4">
                  {MOCK_COMMENTS.map((comment, index) => (
                    <div
                      key={index}
                      className="flex gap-3 border-b border-slate-100 pb-4 last:border-0"
                    >
                      <button
                        type="button"
                        onClick={() => openProfile(comment.author)}
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 ${
                          isAcademy ? 'cursor-pointer transition-opacity hover:opacity-75' : 'cursor-default'
                        }`}
                      >
                        {comment.author[0]}
                      </button>
                      <div className="flex-1">
                        <div className="mb-1 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => openProfile(comment.author)}
                            className={`text-sm font-semibold text-slate-800 ${
                              isAcademy ? 'cursor-pointer transition-colors hover:text-primary' : 'cursor-default'
                            }`}
                          >
                            {comment.author}
                          </button>
                          <span className="text-xs text-slate-400">{comment.date}</span>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-600">{comment.text}</p>
                        <button className="mt-1.5 flex items-center gap-1 text-xs text-slate-400 transition-colors hover:text-red-400">
                          <Heart size={11} /> {comment.likes}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                    나
                  </div>
                  <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 transition-all focus-within:border-primary focus-within:bg-white">
                    <input
                      placeholder="댓글 기능은 곧 연결될 예정이에요."
                      className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                    />
                    <button className="shrink-0 rounded-lg bg-primary p-1.5 text-white transition-all hover:opacity-85">
                      <Send size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <aside className="hidden w-64 shrink-0 lg:block xl:w-72">
              <div className="sticky top-24 space-y-4">
                {mentionedAcademies.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="mb-4 text-sm font-semibold text-slate-800">언급된 학원</p>
                    <div className="space-y-2">
                      {mentionedAcademies.map((academy) => (
                        <Link
                          key={academy.id}
                          to={`/academies/${academy.id}`}
                          className="group flex items-center justify-between rounded-xl border border-slate-100 p-3 transition-all hover:border-primary/30 hover:bg-primary/5"
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-800 transition-colors group-hover:text-primary">
                              {academy.name}
                            </p>
                            <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
                              <span>
                                {academy.location} · {academy.subject}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center gap-1 text-xs">
                              <Star size={10} className="fill-yellow-400 text-yellow-400" />
                              <span className="font-medium text-slate-600">{academy.rating}</span>
                            </div>
                          </div>
                          <ChevronRight
                            size={14}
                            className="text-slate-300 transition-colors group-hover:text-primary"
                          />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <Tag size={14} className="text-primary" />
                    <p className="text-sm font-semibold text-slate-800">게시글 태그</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                          TAG_COLORS[tag] ?? 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        # {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
                  <p className="mb-1 text-sm font-semibold text-slate-900">
                    학원 비교도 함께 해보실래요?
                  </p>
                  <p className="mb-3 text-xs text-slate-500">
                    관심 있는 학원들의 장단점을 AI로 빠르게 비교해볼 수 있어요.
                  </p>
                  <Link
                    to="/compare"
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-semibold text-white transition-all hover:opacity-90"
                  >
                    AI 비교 분석하기
                  </Link>
                </div>

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
    </>
  );
}
