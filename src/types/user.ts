import type { Session } from '@supabase/supabase-js';

// ── 회원 유형 ────────────────────────────────────────────────────
export type UserType = 'student' | 'parent' | 'academy';

export interface UserTypeMeta {
  label: string;
  emoji: string;
  desc: string;
  badge: { label: string; style: string } | null;
}

export const USER_TYPE_META: Record<UserType, UserTypeMeta> = {
  student: {
    label: '학생 / 일반',
    emoji: '🎒',
    desc: '리뷰를 작성하고 학원을 검색해요',
    badge: null,
  },
  parent: {
    label: '학부모',
    emoji: '👨‍👩‍👧',
    desc: '학부모 뱃지로 신뢰도 있는 리뷰를 남겨요',
    badge: {
      label: '학부모',
      style: 'bg-blue-50 text-blue-600 border border-blue-200',
    },
  },
  academy: {
    label: '학원 / 기업',
    emoji: '🏫',
    desc: '학원 프로필을 관리하고 리드를 확인해요',
    badge: {
      label: '학원',
      style: 'bg-amber-50 text-amber-600 border border-amber-200',
    },
  },
};

// ── Supabase 세션에서 userType 추출 ──────────────────────────────
export function getUserType(session: Session | null): UserType {
  const raw = session?.user?.user_metadata?.userType;
  if (raw === 'parent' || raw === 'academy') return raw;
  return 'student'; // 기본값
}
