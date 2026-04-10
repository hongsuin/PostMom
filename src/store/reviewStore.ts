import { create } from 'zustand';
import type { UserType } from '../types/user';
import { getSupabaseBrowserClient } from '../lib/supabase';

export interface LocalReview {
  id?: string;
  author: string;
  text: string;
  rating: number;
  keywords: string[];
  userType?: UserType;
  createdAt?: string;
}

interface ReviewStore {
  /** 학원 ID → Supabase에서 가져온 리뷰 목록 (캐시) */
  reviewsByAcademy: Record<string, LocalReview[]>;
  loadingByAcademy: Record<string, boolean>;

  /** Supabase에서 해당 학원 리뷰 패치 (캐시에 저장) */
  fetchReviews: (academyId: string) => Promise<void>;

  /** Supabase에 리뷰 저장 후 캐시 업데이트 */
  addReview: (academyId: string, review: LocalReview, userId?: string) => Promise<void>;

  getReviews: (academyId: string) => LocalReview[];
  isLoading: (academyId: string) => boolean;
}

export const useReviewStore = create<ReviewStore>((set, get) => ({
  reviewsByAcademy: {},
  loadingByAcademy: {},

  fetchReviews: async (academyId) => {
    // 이미 로딩 중이면 중복 호출 방지
    if (get().loadingByAcademy[academyId]) return;

    set((s) => ({
      loadingByAcademy: { ...s.loadingByAcademy, [academyId]: true },
    }));

    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('academy_id', academyId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const reviews: LocalReview[] = data.map((r) => ({
        id: r.id as string,
        author: r.author as string,
        text: r.text as string,
        rating: r.rating as number,
        keywords: (r.keywords as string[]) ?? [],
        userType: r.user_type as UserType | undefined,
        createdAt: r.created_at as string,
      }));
      set((s) => ({
        reviewsByAcademy: { ...s.reviewsByAcademy, [academyId]: reviews },
        loadingByAcademy: { ...s.loadingByAcademy, [academyId]: false },
      }));
    } else {
      set((s) => ({
        loadingByAcademy: { ...s.loadingByAcademy, [academyId]: false },
      }));
      if (error) console.error('[reviewStore] fetchReviews error:', error.message);
    }
  },

  addReview: async (academyId, review, userId) => {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        academy_id: academyId,
        author: review.author,
        text: review.text,
        rating: review.rating,
        keywords: review.keywords,
        user_type: review.userType ?? null,
        user_id: userId ?? null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (data) {
      const saved: LocalReview = {
        id: data.id as string,
        author: data.author as string,
        text: data.text as string,
        rating: data.rating as number,
        keywords: (data.keywords as string[]) ?? [],
        userType: data.user_type as UserType | undefined,
        createdAt: data.created_at as string,
      };
      set((s) => ({
        reviewsByAcademy: {
          ...s.reviewsByAcademy,
          [academyId]: [saved, ...(s.reviewsByAcademy[academyId] ?? [])],
        },
      }));
    }
  },

  getReviews: (academyId) => get().reviewsByAcademy[academyId] ?? [],
  isLoading: (academyId) => get().loadingByAcademy[academyId] ?? false,
}));

/** 기존 리뷰(mock) + DB 리뷰 전체의 평균 별점 계산 */
export function calcAvgRating(
  baseReviews: { rating: number }[],
  localReviews: { rating: number }[],
  fallback: number,
): number {
  const all = [...baseReviews, ...localReviews];
  if (all.length === 0) return fallback;
  const avg = all.reduce((sum, r) => sum + r.rating, 0) / all.length;
  return Math.round(avg * 10) / 10;
}
