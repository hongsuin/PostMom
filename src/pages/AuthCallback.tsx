import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getSupabaseBrowserClient } from '../lib/supabase';
import type { UserType } from '../types/user';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('카카오 로그인 정보를 확인하고 있어요...');

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const authError = searchParams.get('error_description') ?? searchParams.get('error');

    if (authError) {
      setMessage('로그인에 실패했어요. 잠시 후 다시 시도해주세요.');
      return;
    }

    let isMounted = true;

    // ── 가입 후 이동 경로 분기 ──────────────────────────────────
    const getRedirectPath = (userType: UserType | null) => {
      if (userType === 'academy') return '/';
      if (!userType) return '/signup'; // userType 없음 → 회원가입 먼저
      return '/onboarding/1';
    };

    // ── pendingUserType 처리 + 세션 확인 ────────────────────────
    const finishLogin = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (error) {
        setMessage('세션을 불러오지 못했어요. 다시 로그인해주세요.');
        return;
      }

      if (data.session) {
        const pendingType = localStorage.getItem('pendingUserType') as UserType | null;

        if (pendingType) {
          // 카카오 가입 시 선택한 유형을 user_metadata에 저장
          await supabase.auth.updateUser({ data: { userType: pendingType } });
          localStorage.removeItem('pendingUserType');
          navigate(getRedirectPath(pendingType), { replace: true });
        } else {
          // 일반 로그인 (유형 이미 저장됨) → 기존 유형으로 분기
          const existingType = data.session.user?.user_metadata?.userType as UserType | null;
          navigate(getRedirectPath(existingType), { replace: true });
        }
        return;
      }

      setMessage('세션이 아직 준비되지 않았어요. 잠시 후 다시 시도해주세요.');
    };

    void finishLogin();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const pendingType = localStorage.getItem('pendingUserType') as UserType | null;

        if (pendingType) {
          await supabase.auth.updateUser({ data: { userType: pendingType } });
          localStorage.removeItem('pendingUserType');
          navigate(getRedirectPath(pendingType), { replace: true });
        } else {
          const existingType = session.user?.user_metadata?.userType as UserType | null;
          navigate(getRedirectPath(existingType), { replace: true });
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-slate-50 px-6 flex items-center justify-center">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/70 text-center">
        <p className="text-sm font-medium text-slate-500 mb-2">PostMom</p>
        <h1 className="text-xl font-semibold text-slate-900 mb-3">로그인 처리 중</h1>
        <p className="text-sm text-slate-600 leading-6">{message}</p>
        {/* 로딩 스피너 */}
        <div className="mt-5 flex justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    </div>
  );
}
