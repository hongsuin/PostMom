import { useParams } from 'react-router-dom';
import { adminLeads } from '../../../data/mockData';

export default function AdminLeadDetail() {
  const { id } = useParams();
  const lead = adminLeads.find(l => l.id === id);

  if (!lead) return <div className="p-4">리드를 찾을 수 없습니다.</div>;

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">리드 상세</h2>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
            lead.status === '신규' ? 'bg-[#FFF0F0] text-[#FF6B6B]' :
            lead.status === '진행중' ? 'bg-primary/10 text-primary' :
            'bg-gray-100 text-gray-500'
          }`}>{lead.status}</span>
        </div>
        {[
          ['학부모', lead.parentName],
          ['연락처', lead.phone],
          ['학원', lead.academyName],
          ['자녀 학년', lead.childGrade],
          ['과목', lead.subject],
          ['신청 유형', lead.requestType],
          ['신청일', lead.date],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between py-2.5 border-b border-gray-50 last:border-0">
            <span className="text-sm text-gray-500">{label}</span>
            <span className="text-sm font-medium text-gray-900">{value}</span>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {['진행중으로 변경', '완료로 변경'].map(label => (
          <button key={label} className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-sm">
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
