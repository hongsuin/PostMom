import { Link } from 'react-router-dom';
import { User, ChevronRight, BookOpen, MessageCircle, LogOut, Bell } from 'lucide-react';
import Header from '../layouts/Header';

export default function MyPage() {
  const menuItems = [
    { icon: BookOpen, label: '상담 내역', badge: '2' },
    { icon: MessageCircle, label: '내 게시글', badge: '' },
    { icon: Bell, label: '알림 설정', badge: '' },
  ];

  return (
    <div className="min-h-screen">
      <Header title="마이페이지" />

      <div className="px-5 pt-5 pb-8 space-y-4">
        {/* 프로필 카드 */}
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              <User size={28} className="text-white" />
            </div>
            <div>
              <p className="font-lora font-semibold text-lg">위례맘</p>
              <p className="text-sm opacity-75 mt-0.5">postmom@email.com</p>
            </div>
          </div>
        </div>

        {/* 메뉴 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/60 overflow-hidden">
          {menuItems.map(({ icon: Icon, label, badge }) => (
            <button
              key={label}
              className="w-full flex items-center justify-between px-4 py-4 border-b border-slate-50 last:border-0 hover:bg-primary/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Icon size={16} className="text-primary" />
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
          className="block bg-slate-900 text-white px-4 py-4 rounded-2xl text-sm font-semibold text-center hover:bg-slate-800 transition-colors"
        >
          관리자 페이지로 이동 →
        </Link>

        <button className="w-full flex items-center justify-center gap-2 text-slate-400 text-sm py-3 hover:text-slate-600 transition-colors">
          <LogOut size={16} />로그아웃
        </button>
      </div>
    </div>
  );
}
