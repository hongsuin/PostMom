import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { getSupabaseBrowserClient } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

const NAV_LINKS = [
  { label: '학원 찾기', to: '/academies' },
  { label: 'AI 비교', to: '/compare' },
  { label: '커뮤니티', to: '/community' },
];

export default function SiteHeader() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-8 py-3.5 xl:px-12">
          {/* Logo */}
          <Link to="/" className="font-lora text-xl font-semibold tracking-tight text-slate-900">
            PostMom
          </Link>

          {/* Nav (desktop) */}
          <nav className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.to || pathname.startsWith(link.to + '/');
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-medium transition-colors ${
                    active ? 'text-primary' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="ml-1 inline-block h-1 w-1 rounded-full bg-primary align-middle" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-3">
            {session ? (
              <button
                onClick={() => void handleLogout()}
                className="hidden text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 lg:block"
              >
                로그아웃
              </button>
            ) : (
              <Link
                to="/login"
                className="hidden text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 lg:block"
              >
                로그인
              </Link>
            )}
            <Link
              to="/onboarding/1"
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 hover:scale-[1.03] active:scale-[0.97]"
            >
              AI 비교 시작
            </Link>

            {/* Login/Logout icon (mobile) */}
            {session ? (
              <button
                onClick={() => void handleLogout()}
                className="flex items-center justify-center p-1 text-slate-700 lg:hidden"
                aria-label="로그아웃"
              >
                <User size={22} />
              </button>
            ) : (
              <Link
                to="/login"
                className="flex items-center justify-center p-1 text-slate-700 lg:hidden"
                aria-label="로그인"
              >
                <User size={22} />
              </Link>
            )}

            {/* Hamburger (mobile) */}
            <button
              className="flex flex-col justify-center items-center gap-1.5 p-1 lg:hidden"
              onClick={() => setDrawerOpen(true)}
              aria-label="메뉴 열기"
            >
              <span className="block h-0.5 w-6 bg-slate-700" />
              <span className="block h-0.5 w-6 bg-slate-700" />
              <span className="block h-0.5 w-6 bg-slate-700" />
            </button>
          </div>
        </div>
      </header>

      {/* Overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Left Drawer */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-xl transition-transform duration-300 ease-in-out ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <Link
            to="/"
            className="font-lora text-xl font-semibold tracking-tight text-slate-900"
            onClick={() => setDrawerOpen(false)}
          >
            PostMom
          </Link>
          <button
            onClick={() => setDrawerOpen(false)}
            aria-label="메뉴 닫기"
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col px-4 py-6 gap-1">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.to || pathname.startsWith(link.to + '/');
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setDrawerOpen(false)}
                className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {link.label}
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-100 px-4 py-5">
          {session ? (
            <button
              onClick={() => { setDrawerOpen(false); void handleLogout(); }}
              className="block w-full rounded-lg border border-slate-200 py-2.5 text-center text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              로그아웃
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setDrawerOpen(false)}
              className="block w-full rounded-lg border border-slate-200 py-2.5 text-center text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              로그인
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
