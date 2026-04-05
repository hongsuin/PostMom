import { Plus } from 'lucide-react';

export default function AdminCredit() {
  return (
    <div className="px-4 py-4 space-y-4">
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-5 text-white">
        <p className="text-sm opacity-80 mb-1">현재 크레딧</p>
        <p className="text-3xl font-bold">0 크레딧</p>
        <p className="text-xs opacity-60 mt-1">리드 1건 = 1 크레딧</p>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-3">충전 패키지</h2>
        {[
          { amount: 10, price: '50,000원', bonus: '' },
          { amount: 30, price: '120,000원', bonus: '+5 보너스' },
          { amount: 50, price: '180,000원', bonus: '+15 보너스' },
        ].map(({ amount, price, bonus }) => (
          <div key={amount} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
            <div>
              <p className="font-semibold text-gray-900 text-sm">{amount}크레딧 {bonus && <span className="text-[#FF6B6B] text-xs">{bonus}</span>}</p>
              <p className="text-xs text-gray-500">{price}</p>
            </div>
            <button className="flex items-center gap-1 bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-semibold">
              <Plus size={12} />충전
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-3">사용 내역</h2>
        <p className="text-sm text-gray-400 text-center py-4">사용 내역이 없습니다.</p>
      </div>
    </div>
  );
}
