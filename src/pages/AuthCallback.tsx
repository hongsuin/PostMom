import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getSupabaseBrowserClient } from '../lib/supabase';

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

    const finishLogin = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (error) {
        setMessage('세션을 불러오지 못했어요. 다시 로그인해주세요.');
        return;
      }

      if (data.session) {
        navigate('/', { replace: true });
        return;
      }

      setMessage('세션이 아직 준비되지 않았어요. 잠시 후 다시 시도해주세요.');
    };

    void finishLogin();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/', { replace: true });
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
      </div>
    </div>
  );
}
