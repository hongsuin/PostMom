import { User, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { myAcademy } from '../../../data/mockData';

export default function AdminProfile() {
  const info = [
    { label: '학원명', value: myAcademy.name },
    { label: '과목', value: myAcademy.subject },
    { label: '대표자', value: myAcademy.owner },
    { label: '연락처', value: myAcademy.phone },
    { label: '주소', value: myAcademy.address },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page hero */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1400px] px-8 py-10 xl:px-12">
          <p className="mb-1.5 text-sm font-semibold uppercase tracking-wider text-primary">Admin</p>
          <h1 className="font-lora text-3xl font-semibold text-slate-900 xl:text-4xl">프로필</h1>
          <p className="mt-2 text-slate-500">{myAcademy.name} 운영자 정보</p>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-8 py-8 xl:px-12">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* 프로필 카드 */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-7 text-white shadow-lg">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                <User size={28} className="text-white" />
              </div>
              <p className="text-xl font-bold">{myAcademy.owner}</p>
              <p className="mt-0.5 text-sm opacity-70">{myAcademy.name}</p>
              <p className="mt-1 text-sm opacity-80">{myAcademy.email}</p>
            </div>
          </div>

          {/* 학원 정보 + 수정 버튼 */}
          <div className="lg:col-span-2 space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-4">
                <h2 className="font-semibold text-slate-900">학원 정보</h2>
              </div>
              <div className="divide-y divide-slate-50 px-6">
                {info.map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-4">
                    <span className="text-sm text-slate-500">{label}</span>
                    <span className="text-sm font-semibold text-slate-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <button className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-white transition-all hover:opacity-90">
              정보 수정
            </button>

            <Link
              to="/admin/preview"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-semibold text-slate-700 transition-all hover:border-primary hover:text-primary"
            >
              <Eye size={16} />
              학원 페이지 미리보기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
