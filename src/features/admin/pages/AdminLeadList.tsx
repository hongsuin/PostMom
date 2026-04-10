import { useState } from 'react';
import { Link } from 'react-router-dom';
import { adminLeads } from '../../../data/mockData';
import { ChevronRight } from 'lucide-react';

const statusOptions = ['전체', '신규', '진행중', '완료'];

export default function AdminLeadList() {
  const [filter, setFilter] = useState('전체');
  const filtered = filter === '전체' ? adminLeads : adminLeads.filter(l => l.status === filter);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page hero */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1400px] px-8 py-10 xl:px-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-1.5 text-sm font-semibold uppercase tracking-wider text-primary">Admin</p>
              <h1 className="font-lora text-3xl font-semibold text-slate-900 xl:text-4xl">리드 관리</h1>
              <p className="mt-2 text-slate-500">상담 및 레벨테스트 신청 내역을 관리하세요</p>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-3">
              <span className="text-sm font-medium text-primary">총 {filtered.length}건</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-8 py-8 xl:px-12 space-y-5">
        {/* 필터 */}
        <div className="flex gap-2">
          {statusOptions.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                filter === s
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-primary hover:text-primary'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* 리드 목록 */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* 테이블 헤더 (데스크탑) */}
          <div className="hidden grid-cols-5 gap-4 border-b border-slate-100 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 lg:grid">
            <span>학부모</span>
            <span>연락처</span>
            <span>학년 / 과목</span>
            <span>신청일</span>
            <span>상태</span>
          </div>

          <div className="divide-y divide-slate-50">
            {filtered.length === 0 ? (
              <p className="px-6 py-12 text-center text-sm text-slate-400">해당 상태의 리드가 없습니다.</p>
            ) : filtered.map(lead => (
              <Link
                key={lead.id}
                to={`/admin/leads/${lead.id}`}
                className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-slate-50 lg:grid lg:grid-cols-5 lg:gap-4"
              >
                {/* 학부모 */}
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{lead.parentName}</p>
                  {/* 모바일에서만 보이는 추가 정보 */}
                  <p className="text-xs text-slate-400 mt-0.5 lg:hidden">{lead.childGrade} · {lead.subject} · {lead.requestType}</p>
                </div>
                {/* 연락처 */}
                <p className="hidden text-sm text-slate-500 lg:block">{lead.phone}</p>
                {/* 학년/과목 */}
                <div className="hidden lg:block">
                  <p className="text-sm text-slate-700">{lead.childGrade} · {lead.subject}</p>
                  <p className="text-xs text-slate-400">{lead.requestType}</p>
                </div>
                {/* 신청일 */}
                <p className="hidden text-sm text-slate-500 lg:block">{lead.date}</p>
                {/* 상태 */}
                <div className="flex items-center justify-between lg:justify-start gap-2">
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
