import { Home, BookOpen, Zap, Users, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { icon: Home, label: '홈', path: '/' },
  { icon: BookOpen, label: '학원', path: '/academies' },
  { icon: Zap, label: 'AI비교', path: '/compare' },
  { icon: Users, label: '커뮤니티', path: '/community' },
  { icon: User, label: '마이', path: '/mypage' },
];

export default function BottomNav() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  if (isHome) return null;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-[480px] border-t border-slate-200/60 bg-white/90 backdrop-blur-lg">
      <div className="flex">
        {navItems.map(({ icon: Icon, label, path }) => {
          const active =
            location.pathname === path ||
            (path !== '/' && location.pathname.startsWith(path));
          return (
            <Link
              key={path}
              to={path}
              className="flex flex-1 flex-col items-center gap-0.5 py-2.5"
            >
              <Icon size={22} className={active ? 'text-primary' : 'text-slate-400'} />
              <span className={`text-[10px] ${active ? 'font-semibold text-primary' : 'text-slate-400'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
