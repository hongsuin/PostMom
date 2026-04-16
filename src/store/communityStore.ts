import { create } from 'zustand';
import { communityPosts as mockCommunityPosts } from '../data/mockData';
import type { CommunityPost, CommunityRegion } from '../data/mockData';
import { getSupabaseBrowserClient } from '../lib/supabase';
import { getUserType } from '../types/user';

const COMMUNITY_BROWSER_ID_KEY = 'communityBrowserId';

interface CommunityInsertInput {
  region: CommunityRegion;
  title: string;
  content: string;
  linkUrl?: string;
}

interface CommunityUpdateInput {
  postId: string;
  region: CommunityRegion;
  title: string;
  content: string;
  linkUrl?: string;
}

interface CommunityLikeRow {
  id: string;
  post_id: string;
}

interface CommunityCountRow {
  post_id: string;
}

interface CommunityPostRow {
  id: string;
  author: string;
  user_id: string | null;
  browser_id: string | null;
  user_type: CommunityPost['userType'] | null;
  region: CommunityRegion;
  title: string;
  content: string;
  tags: string[] | null;
  mentioned_academies: string[] | null;
  link_url: string | null;
  link_title: string | null;
  likes: number | null;
  comments: number | null;
  created_at: string;
}

interface CommunityCommentRow {
  id: string;
  post_id: string;
  user_id: string | null;
  browser_id: string | null;
  author: string;
  user_type: CommunityPost['userType'] | null;
  content: string;
  created_at: string;
}

export interface CommunityComment {
  id: string;
  postId: string;
  author: string;
  userId?: string | null;
  browserId?: string | null;
  userType?: CommunityPost['userType'];
  content: string;
  createdAt: string;
}

interface CommunityStore {
  posts: CommunityPost[];
  commentsByPost: Record<string, CommunityComment[]>;
  likedPostIds: string[];
  loading: boolean;
  commentsLoadingByPost: Record<string, boolean>;
  hydrated: boolean;
  fetchPosts: () => Promise<void>;
  fetchPostById: (id: string) => Promise<CommunityPost | null>;
  fetchComments: (postId: string) => Promise<void>;
  addPost: (input: CommunityInsertInput) => Promise<CommunityPost>;
  updatePost: (input: CommunityUpdateInput) => Promise<CommunityPost>;
  deletePost: (postId: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<void>;
  deleteComment: (commentId: string, postId: string) => Promise<void>;
  toggleLike: (postId: string) => Promise<void>;
  getPostById: (id: string) => CommunityPost | null;
  getComments: (postId: string) => CommunityComment[];
  isPostLiked: (postId: string) => boolean;
}

function getBrowserId() {
  const saved = localStorage.getItem(COMMUNITY_BROWSER_ID_KEY);
  if (saved) return saved;

  const created = crypto.randomUUID();
  localStorage.setItem(COMMUNITY_BROWSER_ID_KEY, created);
  return created;
}

export function getCommunityBrowserId() {
  return getBrowserId();
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toISOString().slice(0, 10);
}

function getHostnameLabel(url: string) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    return `${hostname} 블로그`;
  } catch {
    return '학원 블로그';
  }
}

function mapRowToPost(row: CommunityPostRow): CommunityPost {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    author: row.author,
    userId: row.user_id,
    browserId: row.browser_id,
    userType: row.user_type ?? undefined,
    date: formatDate(row.created_at),
    createdAt: row.created_at,
    likes: row.likes ?? 0,
    comments: row.comments ?? 0,
    tags: row.tags ?? [],
    mentionedAcademies: row.mentioned_academies ?? [],
    region: row.region,
    link: row.link_url
      ? {
          url: row.link_url,
          title: row.link_title ?? getHostnameLabel(row.link_url),
        }
      : undefined,
  };
}

function mapRowToComment(row: CommunityCommentRow): CommunityComment {
  return {
    id: row.id,
    postId: row.post_id,
    author: row.author,
    userId: row.user_id,
    browserId: row.browser_id,
    userType: row.user_type ?? undefined,
    content: row.content,
    createdAt: row.created_at,
  };
}

function sortPosts(posts: CommunityPost[]) {
  return [...posts].sort((a, b) => {
    const timeA = new Date(a.createdAt ?? a.date).getTime();
    const timeB = new Date(b.createdAt ?? b.date).getTime();
    return timeB - timeA;
  });
}

function resolvePosts(remotePosts: CommunityPost[]) {
  return sortPosts(remotePosts);
}

function updatePostCounts(
  posts: CommunityPost[],
  postId: string,
  updater: (post: CommunityPost) => CommunityPost,
) {
  return posts.map((post) => (post.id === postId ? updater(post) : post));
}

async function fetchCurrentLikeRows(postIds: string[]) {
  if (postIds.length === 0) return [] as CommunityLikeRow[];

  const supabase = getSupabaseBrowserClient();
  const browserId = getBrowserId();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  let query = supabase.from('community_post_likes').select('id, post_id').in('post_id', postIds);

  if (session?.user?.id) {
    query = query.eq('user_id', session.user.id);
  } else {
    query = query.eq('browser_id', browserId);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[communityStore] fetchCurrentLikeRows error:', error.message);
    return [] as CommunityLikeRow[];
  }

  return (data ?? []) as CommunityLikeRow[];
}

function buildCountMap(rows: CommunityCountRow[]) {
  return rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.post_id] = (acc[row.post_id] ?? 0) + 1;
    return acc;
  }, {});
}

async function fetchEngagementCounts(postIds: string[]) {
  if (postIds.length === 0) {
    return {
      likeCounts: {} as Record<string, number>,
      commentCounts: {} as Record<string, number>,
    };
  }

  const supabase = getSupabaseBrowserClient();
  const [{ data: likeData, error: likeError }, { data: commentData, error: commentError }] =
    await Promise.all([
      supabase.from('community_post_likes').select('post_id').in('post_id', postIds),
      supabase.from('community_post_comments').select('post_id').in('post_id', postIds),
    ]);

  if (likeError) {
    console.error('[communityStore] fetchEngagementCounts likes error:', likeError.message);
  }

  if (commentError) {
    console.error('[communityStore] fetchEngagementCounts comments error:', commentError.message);
  }

  return {
    likeCounts: buildCountMap((likeData ?? []) as CommunityCountRow[]),
    commentCounts: buildCountMap((commentData ?? []) as CommunityCountRow[]),
  };
}

function applyEngagementCounts(
  posts: CommunityPost[],
  counts: { likeCounts: Record<string, number>; commentCounts: Record<string, number> },
) {
  return posts.map((post) => ({
    ...post,
    likes: counts.likeCounts[post.id] ?? 0,
    comments: counts.commentCounts[post.id] ?? 0,
  }));
}

export const useCommunityStore = create<CommunityStore>((set, get) => ({
  posts: sortPosts(mockCommunityPosts),
  commentsByPost: {},
  likedPostIds: [],
  loading: false,
  commentsLoadingByPost: {},
  hydrated: false,

  fetchPosts: async () => {
    if (get().loading) return;

    set({ loading: true });
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[communityStore] fetchPosts error:', error.message);
      set({ loading: false, hydrated: true, posts: [] });
      return;
    }

    const mapped = ((data ?? []) as CommunityPostRow[]).map(mapRowToPost);
    const basePosts = resolvePosts(mapped);
    const counts = await fetchEngagementCounts(basePosts.map((post) => post.id));
    const posts = applyEngagementCounts(basePosts, counts);
    const likeRows = await fetchCurrentLikeRows(posts.map((post) => post.id));

    set({
      posts,
      likedPostIds: likeRows.map((row) => row.post_id),
      loading: false,
      hydrated: true,
    });
  },

  fetchPostById: async (id) => {
    const existing = get().getPostById(id);
    if (existing) return existing;

    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('[communityStore] fetchPostById error:', error.message);
      return null;
    }

    if (!data) return null;

    const post = mapRowToPost(data as CommunityPostRow);
    const counts = await fetchEngagementCounts([post.id]);
    const countedPost = applyEngagementCounts([post], counts)[0];
    const likeRows = await fetchCurrentLikeRows([post.id]);

    set((state) => ({
      posts: resolvePosts([countedPost, ...state.posts.filter((item) => item.id !== post.id)]),
      likedPostIds: Array.from(new Set([...state.likedPostIds, ...likeRows.map((row) => row.post_id)])),
      hydrated: true,
    }));

    return countedPost;
  },

  fetchComments: async (postId) => {
    if (get().commentsLoadingByPost[postId]) return;

    set((state) => ({
      commentsLoadingByPost: { ...state.commentsLoadingByPost, [postId]: true },
    }));

    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('community_post_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[communityStore] fetchComments error:', error.message);
      set((state) => ({
        commentsLoadingByPost: { ...state.commentsLoadingByPost, [postId]: false },
      }));
      return;
    }

    const comments = ((data ?? []) as CommunityCommentRow[]).map(mapRowToComment);

    set((state) => ({
      commentsByPost: { ...state.commentsByPost, [postId]: comments },
      commentsLoadingByPost: { ...state.commentsLoadingByPost, [postId]: false },
      posts: updatePostCounts(state.posts, postId, (post) => ({
        ...post,
        comments: comments.length,
      })),
    }));
  },

  addPost: async (input) => {
    const supabase = getSupabaseBrowserClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const author =
      session?.user?.user_metadata?.nickname ??
      session?.user?.user_metadata?.name ??
      session?.user?.email?.split('@')[0] ??
      '익명';

    const userType = session ? getUserType(session) : null;
    const trimmedLink = input.linkUrl?.trim() ?? '';
    const linkUrl = trimmedLink || null;
    const linkTitle = linkUrl ? getHostnameLabel(linkUrl) : null;

    const { data, error } = await supabase
      .from('community_posts')
      .insert({
        user_id: session?.user?.id ?? null,
        browser_id: session?.user?.id ? null : getBrowserId(),
        author,
        user_type: userType,
        region: input.region,
        title: input.title.trim(),
        content: input.content.trim(),
        tags: ['정보공유'],
        mentioned_academies: [],
        link_url: linkUrl,
        link_title: linkTitle,
      })
      .select('*');

    if (error) {
      throw new Error(error.message);
    }

    const savedRow = ((data ?? []) as CommunityPostRow[])[0];
    if (!savedRow) {
      throw new Error('게시글 저장 결과를 확인할 수 없습니다.');
    }

    const saved = mapRowToPost(savedRow);
    set((state) => ({
      posts: resolvePosts([saved, ...state.posts.filter((item) => item.id !== saved.id)]),
      hydrated: true,
    }));
    return saved;
  },

  updatePost: async (input) => {
    const supabase = getSupabaseBrowserClient();
    const trimmedLink = input.linkUrl?.trim() ?? '';
    const linkUrl = trimmedLink || null;
    const linkTitle = linkUrl ? getHostnameLabel(linkUrl) : null;

    const { data, error } = await supabase
      .from('community_posts')
      .update({
        region: input.region,
        title: input.title.trim(),
        content: input.content.trim(),
        link_url: linkUrl,
        link_title: linkTitle,
      })
      .eq('id', input.postId)
      .select('*');

    if (error) {
      throw new Error(error.message);
    }

    const updatedRow = ((data ?? []) as CommunityPostRow[])[0];
    if (!updatedRow) {
      throw new Error('수정할 게시글을 찾지 못했어요. 새로고침 후 다시 시도해 주세요.');
    }

    const updated = mapRowToPost(updatedRow);
    const counts = await fetchEngagementCounts([updated.id]);
    const countedPost = applyEngagementCounts([updated], counts)[0];

    set((state) => ({
      posts: resolvePosts([countedPost, ...state.posts.filter((item) => item.id !== countedPost.id)]),
    }));

    return countedPost;
  },

  deletePost: async (postId) => {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from('community_posts').delete().eq('id', postId);
    if (error) {
      throw new Error(error.message);
    }

    set((state) => {
      const nextComments = { ...state.commentsByPost };
      delete nextComments[postId];

      return {
        posts: state.posts.filter((post) => post.id !== postId),
        commentsByPost: nextComments,
        likedPostIds: state.likedPostIds.filter((likedId) => likedId !== postId),
      };
    });
  },

  addComment: async (postId, content) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    const supabase = getSupabaseBrowserClient();
    const browserId = getBrowserId();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const author =
      session?.user?.user_metadata?.nickname ??
      session?.user?.user_metadata?.name ??
      session?.user?.email?.split('@')[0] ??
      '익명';

    const userType = session ? getUserType(session) : null;

    const { data, error } = await supabase
      .from('community_post_comments')
      .insert({
        post_id: postId,
        user_id: session?.user?.id ?? null,
        browser_id: session?.user?.id ? null : browserId,
        author,
        user_type: userType,
        content: trimmed,
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    const savedComment = mapRowToComment(data as CommunityCommentRow);

    set((state) => ({
      commentsByPost: {
        ...state.commentsByPost,
        [postId]: [...(state.commentsByPost[postId] ?? []), savedComment],
      },
      posts: updatePostCounts(state.posts, postId, (post) => ({
        ...post,
        comments: post.comments + 1,
      })),
    }));
  },

  deleteComment: async (commentId, postId) => {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from('community_post_comments').delete().eq('id', commentId);
    if (error) {
      throw new Error(error.message);
    }

    set((state) => {
      const remainingComments = (state.commentsByPost[postId] ?? []).filter(
        (comment) => comment.id !== commentId,
      );

      return {
        commentsByPost: {
          ...state.commentsByPost,
          [postId]: remainingComments,
        },
        posts: updatePostCounts(state.posts, postId, (post) => ({
          ...post,
          comments: Math.max(0, remainingComments.length),
        })),
      };
    });
  },

  toggleLike: async (postId) => {
    const supabase = getSupabaseBrowserClient();
    const browserId = getBrowserId();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    let query = supabase.from('community_post_likes').select('id, post_id').eq('post_id', postId);
    if (session?.user?.id) {
      query = query.eq('user_id', session.user.id);
    } else {
      query = query.eq('browser_id', browserId);
    }

    const { data: existingRows, error: existingError } = await query.maybeSingle();
    if (existingError) {
      throw new Error(existingError.message);
    }

    if (existingRows) {
      const { error } = await supabase.from('community_post_likes').delete().eq('id', existingRows.id);
      if (error) throw new Error(error.message);

      set((state) => ({
        likedPostIds: state.likedPostIds.filter((likedId) => likedId !== postId),
        posts: updatePostCounts(state.posts, postId, (post) => ({
          ...post,
          likes: Math.max(0, post.likes - 1),
        })),
      }));
      return;
    }

    const { error } = await supabase.from('community_post_likes').insert({
      post_id: postId,
      user_id: session?.user?.id ?? null,
      browser_id: session?.user?.id ? null : browserId,
    });
    if (error) throw new Error(error.message);

    set((state) => ({
      likedPostIds: Array.from(new Set([...state.likedPostIds, postId])),
      posts: updatePostCounts(state.posts, postId, (post) => ({
        ...post,
        likes: post.likes + 1,
      })),
    }));
  },

  getPostById: (id) => get().posts.find((post) => post.id === id) ?? null,
  getComments: (postId) => get().commentsByPost[postId] ?? [],
  isPostLiked: (postId) => get().likedPostIds.includes(postId),
}));
