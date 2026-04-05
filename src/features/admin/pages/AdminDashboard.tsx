import { adminLeads, academies } from '../../../data/mockData';
import { TrendingUp, Users, Bell, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const newLeads = adminLeads.filter(l => l.status === '신규').length;
  const stats = [
    { label: '전체 리드', value: adminLeads.length, icon: Users, color: 'bg-primary/10 text-primary' },
    { label: '신규 리드', value: newLeads, icon: Bell, color: 'bg-[#FFF0F0] text-[#FF6B6B]' },
    { label: '등록 학원', value: academies.length, icon: TrendingUp, color: 'bg-[#F0FFF4] text-green-500' },
    { label: '이번달 매출', value: '0원', icon: CreditCard, color: 'bg-[#FFFBF0] text-yellow-500' },
  ];

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-2`}>
              <Icon size={18} />
            </div>
            <p className="text-xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-gray-900 text-sm">최근 리드</p>
          <Link to="/admin/leads" className="text-xs text-primary">전체보기</Link>
        </div>
        <div className="space-y-3">
          {adminLeads.map(lead => (
            <Link key={lead.id} to={`/admin/leads/${lead.id}`}
              className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-800">{lead.parentName}</p>
                <p className="text-xs text-gray-400">{lead.academyName} · {lead.requestType}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                lead.status === '신규' ? 'bg-[#FFF0F0] text-[#FF6B6B]' :
                lead.status === '진행중' ? 'bg-primary/10 text-primary' :
                'bg-gray-100 text-gray-500'
              }`}>{lead.status}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
