import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ExternalLink, LoaderCircle } from 'lucide-react';
import type { CommunityRegion } from '../data/mockData';
import { getSupabaseBrowserClient } from '../lib/supabase';
import { getCommunityBrowserId, useCommunityStore } from '../store/communityStore';

const TEMPLATE_TEXT =
  '후기 찾아보다가 이 학원 블로그도 발견했어요. 커리큘럼이나 분위기 참고하실 분들께 도움이 될까 해서 공유합니다.';

const REGIONS: CommunityRegion[] = ['위례', '태평'];

function isValidUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export default function CommunityWrite() {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const addPost = useCommunityStore((state) => state.addPost);
  const updatePost = useCommunityStore((state) => state.updatePost);
  const fetchPostById = useCommunityStore((state) => state.fetchPostById);
  const post = useCommunityStore((state) => (id ? state.getPostById(id) : null));

  const [form, setForm] = useState({
    region: '위례' as CommunityRegion,
    title: '',
    content: '',
    linkUrl: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [canEdit, setCanEdit] = useState(!isEditMode);
  const [loadingPost, setLoadingPost] = useState(isEditMode);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoadingPost(true);
      const loadedPost = post ?? (await fetchPostById(id));

      const supabase = getSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const browserId = getCommunityBrowserId();

      const editable =
        !!loadedPost &&
        ((!!session?.user?.id && loadedPost.userId === session.user.id) ||
          (!session?.user?.id &&
            !!loadedPost.browserId &&
            loadedPost.browserId === browserId));

      setCanEdit(editable);

      if (loadedPost) {
        setForm({
          region: loadedPost.region,
          title: loadedPost.title,
          content: loadedPost.content,
          linkUrl: loadedPost.link?.url ?? '',
        });
      }

      setLoadingPost(false);
    };

    void load();
  }, [fetchPostById, id, post]);

  const linkLabel = useMemo(() => {
    if (!isValidUrl(form.linkUrl)) return '';
    return new URL(form.linkUrl).hostname.replace(/^www\./, '');
  }, [form.linkUrl]);

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.region) nextErrors.region = '지역을 선택해 주세요.';
    if (!form.title.trim()) nextErrors.title = '제목을 입력해 주세요.';
    if (!form.content.trim()) nextErrors.content = '본문을 입력해 주세요.';
    if (form.linkUrl.trim() && !isValidUrl(form.linkUrl.trim())) {
      nextErrors.linkUrl = 'http:// 또는 https:// 로 시작하는 링크를 입력해 주세요.';
    }

    return nextErrors;
  };

  const handleSubmit = async () => {
    if (isEditMode && !canEdit) return;

    const nextErrors = validate();
    setErrors(nextErrors);
    setSubmitError('');

    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const saved =
        isEditMode && id
          ? await updatePost({
              postId: id,
              region: form.region,
              title: form.title,
              content: form.content,
              linkUrl: form.linkUrl,
            })
          : await addPost({
              region: form.region,
              title: form.title,
              content: form.content,
              linkUrl: form.linkUrl,
            });

      navigate(`/community/${saved.id}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '게시글 저장 중 오류가 발생했습니다.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <Link
            to="/community"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900"
          >
            <ChevronLeft size={16} />
            커뮤니티로 돌아가기
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-8">
        {loadingPost && (
          <div className="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
            게시글 정보를 불러오는 중이에요.
          </div>
        )}

        {isEditMode && !loadingPost && !canEdit && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            본인이 작성한 글만 수정할 수 있어요.
          </div>
        )}

        <div className="mb-6">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Community Write
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">
            {isEditMode ? '커뮤니티 글 수정' : '커뮤니티 글 작성'}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            위례 또는 태평 지역 정보를 자유롭게 공유해 주세요. 로그인하지 않아도 글을 작성할 수 있어요.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-6">
              <div>
                <p className="mb-3 text-sm font-semibold text-slate-900">지역 선택</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {REGIONS.map((region) => {
                    const selected = form.region === region;
                    return (
                      <button
                        key={region}
                        type="button"
                        onClick={() => setForm((current) => ({ ...current, region }))}
                        disabled={isEditMode && !canEdit}
                        className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                          selected
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        <p className="text-sm font-semibold">{region}</p>
                        <p className="mt-1 text-xs text-slate-400">이 지역 커뮤니티에 노출돼요.</p>
                      </button>
                    );
                  })}
                </div>
                {errors.region && <p className="mt-2 text-xs text-red-500">{errors.region}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">제목</label>
                <input
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, title: event.target.value }))
                  }
                  disabled={isEditMode && !canEdit}
                  placeholder="예: 태평 쪽 영어학원 정보 공유해요"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-slate-50"
                />
                {errors.title && <p className="mt-2 text-xs text-red-500">{errors.title}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">본문</label>
                <textarea
                  value={form.content}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, content: event.target.value }))
                  }
                  disabled={isEditMode && !canEdit}
                  placeholder="후기, 분위기, 상담 경험 등을 자유롭게 적어 주세요."
                  rows={10}
                  className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-slate-50"
                />
                {errors.content && <p className="mt-2 text-xs text-red-500">{errors.content}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">학원 블로그 링크</label>
                <input
                  value={form.linkUrl}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, linkUrl: event.target.value }))
                  }
                  disabled={isEditMode && !canEdit}
                  placeholder="https://blog.naver.com/..."
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-slate-50"
                />
                {errors.linkUrl && <p className="mt-2 text-xs text-red-500">{errors.linkUrl}</p>}
                {linkLabel && (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                    <ExternalLink size={12} />
                    {linkLabel} 링크가 함께 노출됩니다.
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-primary/20 bg-primary/5 p-5">
              <p className="text-sm font-semibold text-slate-900">기본 템플릿</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{TEMPLATE_TEXT}</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">작성 팁</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-500">
                <li>지역은 위례 또는 태평 중 하나만 선택해 주세요.</li>
                <li>학원 블로그 링크는 선택 사항이에요.</li>
                <li>저장 후 상세 페이지에서 링크 카드가 함께 보여집니다.</li>
              </ul>
            </div>

            {submitError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {submitError}
              </div>
            )}

            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={isSubmitting || (isEditMode && !canEdit)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting && <LoaderCircle size={16} className="animate-spin" />}
              {isEditMode ? '게시글 수정하기' : '게시글 등록하기'}
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}
