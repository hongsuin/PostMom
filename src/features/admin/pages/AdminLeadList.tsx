import { useState } from 'react';
import { Link } from 'react-router-dom';
import { adminLeads } from '../../../data/mockData';

const statusOptions = ['전체', '신규', '진행중', '완료'];

export default function AdminLeadList() {
  const [filter, setFilter] = useState('전체');

  const filtered = filter === '전체' ? adminLeads : adminLeads.filter(l => l.status === filter);

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex gap-2">
        {statusOptions.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium ${filter === s ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(lead => (
          <Link key={lead.id} to={`/admin/leads/${lead.id}`}
            className="block bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-gray-900 text-sm">{lead.parentName}</p>
                <p className="text-xs text-gray-500 mt-0.5">{lead.phone}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                lead.status === '신규' ? 'bg-[#FFF0F0] text-[#FF6B6B]' :
                lead.status === '진행중' ? 'bg-primary/10 text-primary' :
                'bg-gray-100 text-gray-500'
              }`}>{lead.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-xs text-gray-500">
              <span>학원: {lead.academyName}</span>
              <span>학년: {lead.childGrade}</span>
              <span>과목: {lead.subject}</span>
              <span>유형: {lead.requestType}</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">{lead.date}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
