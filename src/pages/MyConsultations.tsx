import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, BookOpen, ClipboardList } from 'lucide-react';
import Header from '../layouts/Header';
import { getSupabaseBrowserClient } from '../lib/supabase';
import { useConsultationStore } from '../store/consultationStore';

const STATUS_STYLE: Record<string, string> = {
  신규: 'bg-primary/10 text-primary',
  진행중: 'bg-amber-100 text-amber-700',
  완료: 'bg-slate-100 text-slate-500',
};

const TYPE_STYLE: Record<string, string> = {
  상담: 'bg-blue-50 text-blue-600',
  레벨테스트: 'bg-purple-50 text-purple-600',
};

function formatDate(iso?: string) {
  if (!iso) return '';
  return iso.slice(0, 10).replace(/-/g, '.');
}

export default function MyConsultations() {
  const navigate = useNavigate();
  const { myConsultations, loading, fetchMyConsultations } = useConsultationStore();

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/login');
        return;
      }
      void fetchMyConsultations(session.user.id);
    });
  }, [fetchMyConsultations, navigate]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="상담 내역" showBack />

      <div className="mx-auto max-w-[1400px] px-8 pt-5 pb-8 xl:px-12">

        {loading && (
          <div className="flex justify-center py-16 text-slate-400 text-sm">
            불러오는 중...
          </div>
        )}

        {!loading && myConsultations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <ClipboardList size={40} className="opacity-40" />
            <p className="text-sm">아직 신청한 상담이 없어요</p>
            <button
              onClick={() => navigate('/academies')}
              className="mt-2 text-xs text-primary font-medium hover:underline"
            >
              학원 둘러보기 →
            </button>
          </div>
        )}

        {!loading && myConsultations.length > 0 && (
          <div className="space-y-3">
            {myConsultations.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 px-5 py-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <BookOpen size={18} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{c.academyName}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_STYLE[c.requestType] ?? ''}`}>
                        {c.requestType}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[c.status ?? '신규'] ?? ''}`}>
                        {c.status ?? '신규'}
                      </span>
                      <span className="text-xs text-slate-400">{formatDate(c.createdAt)}</span>
                    </div>
                    {c.grade && (
                      <p className="text-xs text-slate-400 mt-0.5">{c.grade} · {c.parentName}</p>
                    )}
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-300 shrink-0" />
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
