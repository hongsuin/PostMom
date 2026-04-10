import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, User, ChevronRight } from 'lucide-react';

const adminNav = [
  { icon: LayoutDashboard, label: '대시보드', path: '/admin' },
  { icon: Users, label: '리드 관리', path: '/admin/leads' },
  { icon: CreditCard, label: '크레딧', path: '/admin/credit' },
  { icon: User, label: '프로필', path: '/admin/profile' },
];

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-8 py-3.5 xl:px-12">
          {/* Logo */}
          <Link to="/admin" className="font-lora text-xl font-semibold tracking-tight text-slate-900">
            PostMom <span className="text-primary text-sm font-medium ml-1 bg-primary/10 px-2 py-0.5 rounded-full">Admin</span>
          </Link>

          {/* Nav links */}
          <nav className="hidden items-center gap-1 lg:flex">
            {adminNav.map(({ icon: Icon, label, path }) => {
              const active = location.pathname === path || (path !== '/admin' && location.pathname.startsWith(path));
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right */}
          <Link
            to="/"
            className="flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-primary hover:text-primary"
          >
            유저뷰로 이동
            <ChevronRight size={14} />
          </Link>
        </div>

        {/* Mobile nav */}
        <div className="flex border-t border-slate-100 lg:hidden">
          {adminNav.map(({ icon: Icon, label, path }) => {
            const active = location.pathname === path || (path !== '/admin' && location.pathname.startsWith(path));
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
                  active ? 'text-primary' : 'text-slate-400'
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </div>
      </header>

      {/* Content */}
      <main className="pt-[57px] lg:pt-[57px]">
        <Outlet />
      </main>
    </div>
  );
}
