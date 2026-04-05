import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function ConsultComplete() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <video autoPlay loop muted playsInline className="absolute inset-0 h-full w-full object-cover">
        <source src="/correctvideo.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50/90 to-white/90" />

      <div className="relative z-10 max-w-[480px] mx-auto px-6 min-h-screen flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <CheckCircle size={40} className="text-primary" />
        </div>
        <h1 className="font-lora text-2xl font-semibold text-slate-900 mb-2">신청 완료!</h1>
        <p className="text-sm text-slate-500 mb-10 leading-relaxed">
          담당자가 영업일 기준 1~2일 내로<br />연락드릴 예정입니다.
        </p>
        <div className="w-full space-y-3">
          <Link
            to="/academies"
            className="block w-full bg-primary text-white py-4 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            다른 학원 보기
          </Link>
          <Link
            to="/"
            className="block w-full bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-700 py-4 rounded-2xl font-semibold text-sm hover:bg-white transition-colors"
          >
            홈으로
          </Link>
        </div>
      </div>
    </div>
  );
}
