export default function AdminProfile() {
  return (
    <div className="px-4 py-4 space-y-4">
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-5 text-white">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3">
          <span className="text-2xl font-bold">A</span>
        </div>
        <p className="font-bold text-lg">관리자</p>
        <p className="text-sm opacity-80">admin@postmom.kr</p>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-4">학원 정보</h2>
        {[
          { label: '학원명', value: '매쓰피아 수학학원' },
          { label: '대표자', value: '김수학' },
          { label: '연락처', value: '031-123-4567' },
          { label: '주소', value: '경기 성남시 수정구 위례중앙로 100' },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between py-2.5 border-b border-gray-50 last:border-0">
            <span className="text-sm text-gray-500">{label}</span>
            <span className="text-sm font-medium text-gray-900">{value}</span>
          </div>
        ))}
      </div>

      <button className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-sm">
        정보 수정
      </button>
    </div>
  );
}
