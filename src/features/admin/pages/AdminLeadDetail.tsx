import { useParams, useNavigate } from 'react-router-dom';
import { adminLeads } from '../../../data/mockData';
import { ArrowLeft } from 'lucide-react';

export default function AdminLeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const lead = adminLeads.find(l => l.id === id);

  if (!lead) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <p className="text-slate-500">리드를 찾을 수 없습니다.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page hero */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1400px] px-8 py-10 xl:px-12">
          <button
            onClick={() => navigate('/admin/leads')}
            className="mb-4 flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-primary"
          >
            <ArrowLeft size={15} /> 리드 목록으로
          </button>
          <div className="flex items-center gap-3">
            <h1 className="font-lora text-3xl font-semibold text-slate-900 xl:text-4xl">
              {lead.parentName}
            </h1>
            <span className={`rounded-full px-3 py-1 text-sm font-medium ${
              lead.status === '신규' ? 'bg-red-50 text-red-500' :
              lead.status === '진행중' ? 'bg-primary/10 text-primary' :
              'bg-slate-100 text-slate-500'
            }`}>{lead.status}</span>
          </div>
          <p className="mt-2 text-slate-500">{lead.childGrade} · {lead.subject} · {lead.requestType}</p>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-8 py-8 xl:px-12">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* 상세 정보 */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="font-semibold text-slate-900">리드 상세 정보</h2>
            </div>
            <div className="divide-y divide-slate-50 px-6">
              {[
                ['학부모', lead.parentName],
                ['연락처', lead.phone],
                ['자녀 학년', lead.childGrade],
                ['과목', lead.subject],
                ['신청 유형', lead.requestType],
                ['신청일', lead.date],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between py-4">
                  <span className="text-sm text-slate-500">{label}</span>
                  <span className="text-sm font-semibold text-slate-900">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 상태 변경 */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-slate-900 mb-4">상태 변경</h2>
              <div className="space-y-3">
                <button className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-white transition-all hover:opacity-90">
                  진행중으로 변경
                </button>
                <button className="w-full rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-semibold text-slate-700 transition-all hover:border-primary hover:text-primary">
                  완료로 변경
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
