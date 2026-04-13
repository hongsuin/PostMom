import { adminLeads, myAcademy } from '../../../data/mockData';
import { TrendingUp, Users, Bell, CreditCard, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const newLeads = adminLeads.filter(l => l.status === '신규').length;
  const inProgressLeads = adminLeads.filter(l => l.status === '진행중').length;


  const stats = [
    { label: '전체 리드', value: adminLeads.length, icon: Users, color: 'bg-primary/10 text-primary', border: 'border-primary/20' },
    { label: '신규', value: newLeads, icon: Bell, color: 'bg-red-50 text-red-500', border: 'border-red-100' },
    { label: '진행중', value: inProgressLeads, icon: TrendingUp, color: 'bg-green-50 text-green-600', border: 'border-green-100' },
    { label: '이번달 매출', value: '0원', icon: CreditCard, color: 'bg-yellow-50 text-yellow-600', border: 'border-yellow-100' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page hero - 학원명 타이틀 */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1400px] px-8 py-10 xl:px-12">
          <p className="mb-1.5 text-sm font-semibold uppercase tracking-wider text-primary">Admin 대시보드</p>
          <h1 className="font-lora text-3xl font-semibold text-slate-900 xl:text-4xl">
            {myAcademy.name}
          </h1>
          <p className="mt-2 text-slate-500">{myAcademy.subject} · {myAcademy.address}</p>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-8 py-8 xl:px-12 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map(({ label, value, icon: Icon, color, border }) => (
            <div key={label} className={`rounded-2xl border ${border} bg-white p-5 shadow-sm`}>
              <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
                <Icon size={18} />
              </div>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="mt-0.5 text-sm text-slate-500">{label}</p>
            </div>
          ))}
        </div>

        {/* 최근 리드 */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="font-semibold text-slate-900">최근 리드</h2>
            <Link to="/admin/leads" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              전체보기 <ChevronRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {adminLeads.map(lead => (
              <Link
                key={lead.id}
                to={`/admin/leads/${lead.id}`}
                className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-slate-50"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{lead.parentName}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{lead.childGrade} · {lead.requestType}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    lead.status === '신규' ? 'bg-red-50 text-red-500' :
                    lead.status === '진행중' ? 'bg-primary/10 text-primary' :
                    'bg-slate-100 text-slate-500'
                  }`}>{lead.status}</span>
                  <ChevronRight size={14} className="text-slate-300" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
