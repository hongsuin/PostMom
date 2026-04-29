import { create } from 'zustand';
import { communityPosts as mockCommunityPosts } from '../data/mockData';
import type { CommunityPost, CommunityRegion } from '../data/mockData';
import { getSupabaseBrowserClient } from '../lib/supabase';
import { communityRequest } from '../lib/communityApi';
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
    try {
      const [postsData, likeData] = await Promise.all([
        communityRequest<CommunityPostRow[]>('/api/community/posts'),
        communityRequest<{ post_id: string }[]>('/api/community/likes/me', { auth: true }).catch(() => []),
      ]);

      const posts = resolvePosts(postsData.map(mapRowToPost));
      set({
        posts,
        likedPostIds: likeData.map((row) => row.post_id),
        loading: false,
        hydrated: true,
      });
    } catch (error) {
      console.error('[communityStore] fetchPosts error:', error);
      set({ loading: false, hydrated: true, posts: [] });
    }
  },

  fetchPostById: async (id) => {
    const existing = get().getPostById(id);
    if (existing) return existing;

    try {
      const post = await communityRequest<CommunityPostRow>(`/api/community/posts/${id}`);
      const mapped = mapRowToPost(post);
      set((state) => ({
        posts: resolvePosts([mapped, ...state.posts.filter((item) => item.id !== mapped.id)]),
        hydrated: true,
      }));
      return mapped;
    } catch (error) {
      console.error('[communityStore] fetchPostById error:', error);
      return null;
    }
  },

  fetchComments: async (postId) => {
    if (get().commentsLoadingByPost[postId]) return;

    set((state) => ({
      commentsLoadingByPost: { ...state.commentsLoadingByPost, [postId]: true },
    }));

    try {
      const data = await communityRequest<CommunityCommentRow[]>(`/api/community/posts/${postId}/comments`);
      const comments = data.map(mapRowToComment);
      set((state) => ({
        commentsByPost: { ...state.commentsByPost, [postId]: comments },
        commentsLoadingByPost: { ...state.commentsLoadingByPost, [postId]: false },
        posts: updatePostCounts(state.posts, postId, (post) => ({
          ...post,
          comments: comments.length,
        })),
      }));
    } catch (error) {
      console.error('[communityStore] fetchComments error:', error);
      set((state) => ({
        commentsLoadingByPost: { ...state.commentsLoadingByPost, [postId]: false },
      }));
    }
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
    const trimmedLink = input.linkUrl?.trim();
    const savedRow = await communityRequest<CommunityPostRow>('/api/community/posts', {
      method: 'POST',
      auth: true,
      body: {
        region: input.region,
        title: input.title.trim(),
        content: input.content.trim(),
        linkUrl: trimmedLink || undefined,
        author,
        userType: userType ?? undefined,
      },
    });

    const saved = mapRowToPost(savedRow);
    set((state) => ({
      posts: resolvePosts([saved, ...state.posts.filter((item) => item.id !== saved.id)]),
      hydrated: true,
    }));
    return saved;
  },

  updatePost: async (input) => {
    const trimmedLink = input.linkUrl?.trim();
    const updatedRow = await communityRequest<CommunityPostRow>(`/api/community/posts/${input.postId}`, {
      method: 'PATCH',
      auth: true,
      body: {
        region: input.region,
        title: input.title.trim(),
        content: input.content.trim(),
        linkUrl: trimmedLink || undefined,
      },
    });

    const countedPost = mapRowToPost(updatedRow);

    set((state) => ({
      posts: resolvePosts([countedPost, ...state.posts.filter((item) => item.id !== countedPost.id)]),
    }));

    return countedPost;
  },

  deletePost: async (postId) => {
    await communityRequest<{ ok: true }>(`/api/community/posts/${postId}`, {
      method: 'DELETE',
      auth: true,
    });

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
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const author =
      session?.user?.user_metadata?.nickname ??
      session?.user?.user_metadata?.name ??
      session?.user?.email?.split('@')[0] ??
      '익명';

    const userType = session ? getUserType(session) : null;

    const row = await communityRequest<CommunityCommentRow>(`/api/community/posts/${postId}/comments`, {
      method: 'POST',
      auth: true,
      body: {
        content: trimmed,
        author,
        userType: userType ?? undefined,
      },
    });

    const savedComment = mapRowToComment(row);

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
    await communityRequest<{ ok: true }>(`/api/community/comments/${commentId}`, {
      method: 'DELETE',
      auth: true,
    });

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
    const isLiked = get().likedPostIds.includes(postId);

    if (isLiked) {
      await communityRequest<{ ok: true }>(`/api/community/posts/${postId}/likes`, {
        method: 'DELETE',
        auth: true,
      });

      set((state) => ({
        likedPostIds: state.likedPostIds.filter((likedId) => likedId !== postId),
        posts: updatePostCounts(state.posts, postId, (post) => ({
          ...post,
          likes: Math.max(0, post.likes - 1),
        })),
      }));
      return;
    }

    await communityRequest<{ ok: true }>(`/api/community/posts/${postId}/likes`, {
      method: 'POST',
      auth: true,
    });

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
