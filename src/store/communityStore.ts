import { create } from 'zustand';
import { communityPosts as mockCommunityPosts } from '../data/mockData';
import type { CommunityPost, CommunityRegion } from '../data/mockData';
import { getSupabaseBrowserClient } from '../lib/supabase';
import { getUserType } from '../types/user';

interface CommunityInsertInput {
  region: CommunityRegion;
  title: string;
  content: string;
  linkUrl?: string;
}

interface CommunityStore {
  posts: CommunityPost[];
  loading: boolean;
  hydrated: boolean;
  fetchPosts: () => Promise<void>;
  fetchPostById: (id: string) => Promise<CommunityPost | null>;
  addPost: (input: CommunityInsertInput) => Promise<CommunityPost>;
  getPostById: (id: string) => CommunityPost | null;
}

interface CommunityPostRow {
  id: string;
  author: string;
  user_id: string | null;
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

function sortPosts(posts: CommunityPost[]) {
  return [...posts].sort((a, b) => {
    const timeA = new Date(a.createdAt ?? a.date).getTime();
    const timeB = new Date(b.createdAt ?? b.date).getTime();
    return timeB - timeA;
  });
}

function mergePosts(remotePosts: CommunityPost[]) {
  const merged = new Map<string, CommunityPost>();

  mockCommunityPosts.forEach((post) => {
    merged.set(post.id, post);
  });

  remotePosts.forEach((post) => {
    merged.set(post.id, post);
  });

  return sortPosts([...merged.values()]);
}

export const useCommunityStore = create<CommunityStore>((set, get) => ({
  posts: sortPosts(mockCommunityPosts),
  loading: false,
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
      set({ loading: false, hydrated: true, posts: sortPosts(mockCommunityPosts) });
      return;
    }

    const mapped = ((data ?? []) as CommunityPostRow[]).map(mapRowToPost);
    set({
      posts: mergePosts(mapped),
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

    if (!data) {
      return null;
    }

    const post = mapRowToPost(data as CommunityPostRow);
    set((state) => ({
      posts: mergePosts([post, ...state.posts]),
      hydrated: true,
    }));
    return post;
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
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    const saved = mapRowToPost(data as CommunityPostRow);
    set((state) => ({
      posts: mergePosts([saved, ...state.posts]),
      hydrated: true,
    }));
    return saved;
  },

  getPostById: (id) => get().posts.find((post) => post.id === id) ?? null,
}));
