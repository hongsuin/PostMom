import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, User } from 'lucide-react';

const adminNav = [
  { icon: LayoutDashboard, label: '대시보드', path: '/admin' },
  { icon: Users, label: '리드', path: '/admin/leads' },
  { icon: CreditCard, label: '크레딧', path: '/admin/credit' },
  { icon: User, label: '프로필', path: '/admin/profile' },
];

export default function AdminLayout() {
  const location = useLocation();
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/correctvideo.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50/90 to-white/90" />

      {/* Content */}
      <div className="relative z-10 app-container">
        <header className="sticky top-0 bg-primary z-40 px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-white text-lg">POSTMOM Admin</span>
          <Link to="/" className="text-white/80 text-sm">유저뷰</Link>
        </header>
        <div className="pb-[70px]">
          <Outlet />
        </div>
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full bg-white border-t border-gray-200 z-50">
          <div className="flex">
            {adminNav.map(({ icon: Icon, label, path }) => {
              const active = location.pathname === path;
              return (
                <Link key={path} to={path} className="flex-1 flex flex-col items-center py-2 gap-0.5">
                  <Icon size={22} className={active ? 'text-primary' : 'text-gray-400'} />
                  <span className={`text-[10px] ${active ? 'text-primary font-semibold' : 'text-gray-400'}`}>{label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
