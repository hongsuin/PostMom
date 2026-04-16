import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  ExternalLink,
  Heart,
  MessageCircle,
  Pencil,
  Tag,
  TrendingUp,
} from 'lucide-react';
import type { CommunityPost } from '../data/mockData';
import UserProfileModal from '../components/UserProfileModal';
import UserTypeBadge from '../components/UserTypeBadge';
import { useCommunityStore } from '../store/communityStore';
import { useUserType } from '../hooks/useUserType';

const POPULAR_TAGS = ['수학', '영어', '과학', '후기', '비교', '상담', '중등'];

const TAG_COLORS: Record<string, string> = {
  수학: 'bg-sky-50 text-sky-700',
  영어: 'bg-emerald-50 text-emerald-700',
  과학: 'bg-amber-50 text-amber-700',
  후기: 'bg-violet-50 text-violet-700',
  비교: 'bg-rose-50 text-rose-700',
  상담: 'bg-teal-50 text-teal-700',
  중등: 'bg-orange-50 text-orange-700',
  정보공유: 'bg-slate-100 text-slate-700',
};

const REGION_STYLES: Record<string, string> = {
  위례: 'bg-primary/10 text-primary',
  태평: 'bg-orange-100 text-orange-700',
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
}

export default function CommunityHome() {
  const userType = useUserType();
  const isAcademy = userType === 'academy';
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const posts = useCommunityStore((state) => state.posts);
  const loading = useCommunityStore((state) => state.loading);
  const fetchPosts = useCommunityStore((state) => state.fetchPosts);

  useEffect(() => {
    void fetchPosts();
  }, [fetchPosts]);

  const openProfile = (post: CommunityPost, e: React.MouseEvent) => {
    if (!isAcademy) return;
    e.preventDefault();
    e.stopPropagation();
    setSelectedPost(post);
  };

  const openExternalLink = (url: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <UserProfileModal
        author={selectedPost?.author ?? ''}
        userType={selectedPost?.userType}
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        isAcademy={isAcademy}
      />

      <div className="min-h-screen bg-slate-50">
        <div className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-[1400px] px-8 py-10 xl:px-12">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="mb-1.5 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  Community
                </p>
                <h1 className="text-3xl font-semibold text-slate-900 xl:text-4xl">
                  지역별 학원 이야기
                </h1>
                <p className="mt-2 text-slate-500">
                  위례와 태평 학부모, 학생들이 직접 남기는 학원 정보와 분위기를 한눈에 볼 수 있어요.
                </p>
              </div>

              <Link
                to="/community/write"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-md shadow-primary/25 transition-all hover:scale-[1.02] hover:opacity-90"
              >
                <Pencil size={15} />
                글 작성하기
              </Link>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1400px] px-8 py-8 xl:px-12">
          <div className="flex gap-8">
            <div className="min-w-0 flex-1 space-y-4">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  to={`/community/${post.id}`}
                  className="group block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                >
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-1.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          REGION_STYLES[post.region] ?? 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {post.region}
                      </span>
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            TAG_COLORS[tag] ?? 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="shrink-0 text-xs text-slate-400">{formatDate(post.date)}</span>
                  </div>

                  <h3 className="mb-2 text-base font-semibold text-slate-900 transition-colors group-hover:text-primary">
                    {post.title}
                  </h3>

                  <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-slate-500">
                    {post.content}
                  </p>

                  <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={(event) => openProfile(post, event)}
                      className={`flex items-center gap-1.5 text-sm text-slate-500 ${
                        isAcademy ? 'cursor-pointer transition-opacity hover:opacity-75' : 'cursor-default'
                      }`}
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {post.author[0]}
                      </div>
                      <span className="font-medium text-slate-700">{post.author}</span>
                      <UserTypeBadge userType={post.userType} />
                    </button>

                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      {post.link && (
                        <button
                          type="button"
                          onClick={(event) => openExternalLink(post.link!.url, event)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 font-medium text-slate-500 transition hover:border-primary/30 hover:text-primary"
                        >
                          <ExternalLink size={12} />
                          블로그 보기
                        </button>
                      )}
                      <span className="flex items-center gap-1.5 transition-colors group-hover:text-red-400">
                        <Heart size={13} />
                        {post.likes}
                      </span>
                      <span className="flex items-center gap-1.5 transition-colors group-hover:text-primary">
                        <MessageCircle size={13} />
                        {post.comments}
                      </span>
                      <span className="flex items-center gap-1 font-medium text-slate-500 transition-colors group-hover:text-primary">
                        읽기
                        <ChevronRight size={13} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}

              {!loading && posts.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-400">
                  아직 등록된 글이 없어요. 첫 글을 남겨보세요.
                </div>
              )}

              <div className="rounded-2xl border border-dashed border-slate-300 py-4 text-center text-sm font-medium text-slate-400">
                {loading ? '게시글을 불러오는 중이에요.' : '최신 글이 모두 표시되고 있어요.'}
              </div>
            </div>

            <aside className="hidden w-64 shrink-0 lg:block xl:w-72">
              <div className="sticky top-24 space-y-5">
                <div className="rounded-2xl bg-gradient-to-br from-green-500 to-primary p-6 text-white">
                  <p className="mb-1 font-semibold">학원 정보 공유하기</p>
                  <p className="mb-4 text-sm text-white/80">
                    상담 경험, 후기, 블로그 링크까지 자유롭게 남길 수 있어요.
                  </p>
                  <Link
                    to="/community/write"
                    className="block rounded-xl bg-white py-2.5 text-center text-sm font-semibold text-primary transition-all hover:bg-white/90"
                  >
                    글 작성하기
                  </Link>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <TrendingUp size={15} className="text-primary" />
                    <p className="text-sm font-semibold text-slate-800">커뮤니티 현황</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ['전체 글', `${posts.length}개`],
                      ['링크 글', `${posts.filter((post) => post.link).length}개`],
                      ['위례', `${posts.filter((post) => post.region === '위례').length}개`],
                      ['태평', `${posts.filter((post) => post.region === '태평').length}개`],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl bg-slate-50 p-3 text-center">
                        <p className="text-base font-bold text-slate-900">{value}</p>
                        <p className="text-xs text-slate-400">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>

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

                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
                  <p className="mb-1 text-sm font-semibold text-slate-900">
                    후기 보다가 관심 학원이 생기셨나요?
                  </p>
                  <p className="mb-3 text-xs text-slate-500">
                    AI 비교로 우리 아이에게 맞는지 조금 더 빠르게 확인해볼 수 있어요.
                  </p>
                  <Link
                    to="/compare"
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-semibold text-white transition-all hover:opacity-90"
                  >
                    AI 비교 분석하기
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
