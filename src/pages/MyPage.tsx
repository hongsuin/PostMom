import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, ChevronRight, BookOpen, MessageCircle, LogOut, Bell } from 'lucide-react';
import { getSupabaseBrowserClient } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

export default function MyPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    navigate('/');
  };

  const menuItems = [
    { icon: BookOpen, label: '상담 내역', badge: '2' },
    { icon: MessageCircle, label: '내 게시글', badge: '' },
    { icon: Bell, label: '알림 설정', badge: '' },
  ];

  const displayName =
    session?.user?.user_metadata?.full_name ??
    session?.user?.user_metadata?.name ??
    '사용자';
  const email = session?.user?.email ?? '';

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1400px] px-8 py-10 xl:px-12">

        {/* 페이지 타이틀 */}
        <div className="mb-8">
          <p className="mb-1.5 text-sm font-semibold uppercase tracking-wider text-primary">
            마이페이지
          </p>
          <h1 className="font-lora text-3xl font-semibold text-slate-900 xl:text-4xl">
            내 계정
          </h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* 프로필 카드 */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                  <User size={32} className="text-white" />
                </div>
                <div>
                  <p className="font-lora font-semibold text-xl">{displayName}</p>
                  {email && <p className="text-sm opacity-75 mt-0.5">{email}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* 메뉴 */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              {menuItems.map(({ icon: Icon, label, badge }) => (
                <button
                  key={label}
                  className="w-full flex items-center justify-between px-6 py-4 border-b border-slate-50 last:border-0 hover:bg-primary/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Icon size={18} className="text-primary" />
                    </div>
                    <span className="text-sm font-medium text-slate-800">{label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {badge && (
                      <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full font-medium">{badge}</span>
                    )}
                    <ChevronRight size={16} className="text-slate-300" />
                  </div>
                </button>
              ))}
            </div>

            <Link
              to="/admin"
              className="block bg-slate-900 text-white px-6 py-4 rounded-2xl text-sm font-semibold text-center hover:bg-slate-800 transition-colors"
            >
              관리자 페이지로 이동 →
            </Link>

            <button
              onClick={() => void handleLogout()}
              className="w-full flex items-center justify-center gap-2 text-slate-400 text-sm py-3 hover:text-slate-600 transition-colors"
            >
              <LogOut size={16} />
              로그아웃
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
