import { Plus } from 'lucide-react';
import { useBizMoneyStore } from '../../../store/bizMoneyStore';

const packages = [
  { amount: 10000, label: '10,000원', bonus: '' },
  { amount: 30000, label: '30,000원', bonus: '+3,000 보너스' },
  { amount: 50000, label: '50,000원', bonus: '+8,000 보너스' },
];

export default function AdminCredit() {
  const { balance, charge, dmsSent } = useBizMoneyStore();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page hero */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1400px] px-8 py-10 xl:px-12">
          <p className="mb-1.5 text-sm font-semibold uppercase tracking-wider text-primary">Admin</p>
          <h1 className="font-lora text-3xl font-semibold text-slate-900 xl:text-4xl">비즈머니</h1>
          <p className="mt-2 text-slate-500">학원 운영에 사용되는 비즈머니를 관리하세요</p>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-8 py-8 xl:px-12">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* 현재 비즈머니 */}
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-7 text-white shadow-lg">
              <p className="text-sm font-medium opacity-80 mb-1">현재 보유 비즈머니</p>
              <p className="text-4xl font-bold mt-1">{balance.toLocaleString()}</p>
              <p className="text-sm opacity-60 mt-2">원</p>
              <div className="mt-5 rounded-xl bg-white/10 px-4 py-3 text-xs opacity-80">
                DM 1건 발송 = 1,000원 차감
              </div>
            </div>

            {/* DM 전송 내역 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-800 mb-3">DM 발송 현황</p>
              {dmsSent.size === 0 ? (
                <p className="text-xs text-slate-400">아직 DM을 보낸 사용자가 없습니다.</p>
              ) : (
                <div className="space-y-2">
                  {[...dmsSent].map((author) => (
                    <div key={author} className="flex items-center justify-between text-sm">
                      <span className="text-slate-700">{author}</span>
                      <span className="text-xs text-slate-400">-1,000원</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-100 pt-2 flex justify-between text-sm font-semibold">
                    <span className="text-slate-700">총 차감</span>
                    <span className="text-red-500">-{(dmsSent.size * 1000).toLocaleString()}원</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 충전 패키지 + 사용 내역 */}
          <div className="lg:col-span-2 space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-4">
                <h2 className="font-semibold text-slate-900">충전 패키지</h2>
              </div>
              <div className="divide-y divide-slate-50 px-6">
                {packages.map(({ amount, label, bonus }) => (
                  <div key={amount} className="flex items-center justify-between py-5">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {amount.toLocaleString()}원
                        {bonus && (
                          <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-500">
                            {bonus}
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-sm text-slate-500">{label}</p>
                    </div>
                    <button
                      onClick={() => charge(amount)}
                      className="flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
                    >
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
              {dmsSent.size === 0 ? (
                <div className="px-6 py-12 text-center text-sm text-slate-400">
                  사용 내역이 없습니다.
                </div>
              ) : (
                <div className="divide-y divide-slate-50 px-6">
                  {[...dmsSent].map((author) => (
                    <div key={author} className="flex items-center justify-between py-4">
                      <div>
                        <p className="text-sm font-medium text-slate-800">DM 발송 · {author}</p>
                        <p className="text-xs text-slate-400 mt-0.5">커뮤니티 사용자</p>
                      </div>
                      <span className="text-sm font-semibold text-red-500">-1,000원</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
