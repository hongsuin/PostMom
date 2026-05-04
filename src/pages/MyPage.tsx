import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, ChevronRight, BookOpen, MessageCircle, LogOut, Bell, Brain, ChevronDown } from 'lucide-react';
import { getSupabaseBrowserClient } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import { useOnboardingStore } from '../store/onboardingStore';
import { LEARNING_TYPES, TYPE_KEY_LIST } from '../data/learningTypes';
import type { TypeKey } from '../data/learningTypes';
import { getUserType, USER_TYPE_META } from '../types/user';

import { useConsultationStore } from '../store/consultationStore';

export default function MyPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [typeDropOpen, setTypeDropOpen] = useState(false);
  const typeDropRef = useRef<HTMLDivElement>(null);
  const { data, updateData } = useOnboardingStore();

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (typeDropRef.current && !typeDropRef.current.contains(e.target as Node)) {
        setTypeDropOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleLearningTypeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as TypeKey | '';
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.updateUser({ data: { learning_type: value || null } });
    updateData({ learningType: value });
  };

  const { myConsultations, fetchMyConsultations } = useConsultationStore();

  useEffect(() => {
    if (session?.user.id) {
      void fetchMyConsultations(session.user.id);
    }
  }, [session, fetchMyConsultations]);

  const userType = getUserType(session);
  const userTypeMeta = USER_TYPE_META[userType];

  const displayName =
    session?.user?.user_metadata?.full_name ??
    session?.user?.user_metadata?.name ??
    '사용자';
  const email = session?.user?.email ?? '';

  const currentLearningType = data.learningType;
  const currentTypeData = currentLearningType ? LEARNING_TYPES[currentLearningType] : null;

  const consultCount = myConsultations.length;

  const menuItems = [
    { icon: BookOpen, label: '상담 내역', badge: consultCount > 0 ? String(consultCount) : '', onClick: () => navigate('/mypage/consultations') },
    { icon: MessageCircle, label: '내 게시글', badge: '', onClick: undefined },
    { icon: Bell, label: '알림 설정', badge: '', onClick: undefined },
  ];

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

              {/* 유저 정보 */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                  <User size={32} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-lora font-semibold text-xl">{displayName}</p>
                    {/* 유형 뱃지 (학부모/학원만 표시) */}
                    {userType !== 'student' && (
                      <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white border border-white/30">
                        {userTypeMeta.emoji} {userTypeMeta.label}
                      </span>
                    )}
                  </div>
                  {email && <p className="text-sm opacity-75 mt-0.5 truncate">{email}</p>}
                </div>
              </div>

              {/* 학습 유형 섹션 — 학원/기업은 표시 안 함 */}
              {userType !== 'academy' && (
                <div className="mt-5 pt-5 border-t border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain size={14} className="text-white/80" />
                    <p className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                      학습 유형
                    </p>
                  </div>

                  {currentTypeData ? (
                    <>
                      {/* 커스텀 pill 드롭다운 */}
                      <div ref={typeDropRef} className="relative mb-2.5">
                        <button
                          onClick={() => setTypeDropOpen(o => !o)}
                          className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 transition-colors"
                        >
                          <span className="text-sm font-semibold text-white">{currentTypeData.name}</span>
                          <ChevronDown size={14} className={`text-white/70 transition-transform ${typeDropOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {typeDropOpen && (
                          <div className="absolute left-0 right-0 top-full mt-1.5 rounded-2xl bg-white shadow-lg border border-slate-100 overflow-hidden z-50">
                            {TYPE_KEY_LIST.map((key) => {
                              const t = LEARNING_TYPES[key];
                              return (
                                <button
                                  key={key}
                                  onClick={async () => {
                                    await handleLearningTypeChange({ target: { value: key } } as React.ChangeEvent<HTMLSelectElement>);
                                    setTypeDropOpen(false);
                                  }}
                                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-primary/5 ${
                                    key === currentLearningType ? 'font-semibold text-primary bg-primary/5' : 'text-slate-700'
                                  }`}
                                >
                                  {t.name}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <Link
                        to="/learning-test"
                        className="flex items-center justify-center gap-1 text-xs text-white/70 hover:text-white transition-colors"
                      >
                        <Brain size={11} />
                        테스트 다시 하기 →
                      </Link>
                    </>
                  ) : (
                    <div className="bg-white/10 rounded-xl p-3.5 text-center">
                      <p className="text-xs text-white/60 mb-2.5">
                        아직 학습 유형 테스트를 받지 않았어요
                      </p>
                      <Link
                        to="/learning-test"
                        className="inline-flex items-center gap-1.5 bg-white text-primary text-xs font-semibold px-4 py-2 rounded-lg hover:bg-white/90 transition-colors"
                      >
                        <Brain size={12} />
                        테스트 받으러 가기
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 메뉴 */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              {menuItems.map(({ icon: Icon, label, badge, onClick }) => (
                <button
                  key={label}
                  onClick={onClick}
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
                      <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full font-medium">
                        {badge}
                      </span>
                    )}
                    <ChevronRight size={16} className="text-slate-300" />
                  </div>
                </button>
              ))}
            </div>

            {/* 관리자 대시보드 — 학원/기업만 표시 */}
            {userType === 'academy' && (
              <Link
                to="/admin"
                className="block bg-slate-900 text-white px-6 py-4 rounded-2xl text-sm font-semibold text-center hover:bg-slate-800 transition-colors"
              >
                관리자 페이지로 이동 →
              </Link>
            )}

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
