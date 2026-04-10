import { Plus } from 'lucide-react';

export default function AdminCredit() {
  const packages = [
    { amount: 10, price: '50,000원', bonus: '' },
    { amount: 30, price: '120,000원', bonus: '+5 보너스' },
    { amount: 50, price: '180,000원', bonus: '+15 보너스' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page hero */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1400px] px-8 py-10 xl:px-12">
          <p className="mb-1.5 text-sm font-semibold uppercase tracking-wider text-primary">Admin</p>
          <h1 className="font-lora text-3xl font-semibold text-slate-900 xl:text-4xl">크레딧 관리</h1>
          <p className="mt-2 text-slate-500">리드 열람에 사용되는 크레딧을 관리하세요</p>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-8 py-8 xl:px-12">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* 현재 크레딧 */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-7 text-white shadow-lg">
              <p className="text-sm font-medium opacity-80 mb-1">현재 보유 크레딧</p>
              <p className="text-4xl font-bold mt-1">0</p>
              <p className="text-sm opacity-60 mt-2">크레딧</p>
              <div className="mt-5 rounded-xl bg-white/10 px-4 py-3 text-xs opacity-80">
                리드 1건 열람 = 1 크레딧 차감
              </div>
            </div>
          </div>

          {/* 충전 패키지 + 사용 내역 */}
          <div className="lg:col-span-2 space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-4">
                <h2 className="font-semibold text-slate-900">충전 패키지</h2>
              </div>
              <div className="divide-y divide-slate-50 px-6">
                {packages.map(({ amount, price, bonus }) => (
                  <div key={amount} className="flex items-center justify-between py-5">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {amount} 크레딧
                        {bonus && (
                          <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-500">
                            {bonus}
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-sm text-slate-500">{price}</p>
                    </div>
                    <button className="flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90">
                      <Plus size={14} /> 충전
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-4">
                <h2 className="font-semibold text-slate-900">사용 내역</h2>
              </div>
              <div className="px-6 py-12 text-center text-sm text-slate-400">
                사용 내역이 없습니다.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
