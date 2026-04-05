import { Link, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  { label: '학원 찾기', to: '/academies' },
  { label: 'AI 비교', to: '/compare' },
  { label: '커뮤니티', to: '/community' },
];

export default function SiteHeader() {
  const { pathname } = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-8 py-3.5 xl:px-12">
        {/* Logo */}
        <Link to="/" className="font-lora text-xl font-semibold tracking-tight text-slate-900">
          PostMom
        </Link>

        {/* Nav */}
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
          <Link
            to="/login"
            className="hidden text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 lg:block"
          >
            로그인
          </Link>
          <Link
            to="/onboarding/1"
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 hover:scale-[1.03] active:scale-[0.97]"
          >
            AI 비교 시작
          </Link>
        </div>
      </div>
    </header>
  );
}
