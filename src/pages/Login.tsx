import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = '올바른 이메일을 입력하세요';
    if (!form.password || form.password.length < 6) e.password = '비밀번호는 6자 이상이어야 합니다';
    return e;
  };

  const handleLogin = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    navigate('/');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <video autoPlay loop muted playsInline className="absolute inset-0 h-full w-full object-cover">
        <source src="/correctvideo.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50/90 to-white/90" />

      <div className="relative z-10 max-w-[480px] mx-auto px-6 pt-16 pb-10 min-h-screen flex flex-col justify-center">
        <div className="mb-10">
          <h1 className="font-lora text-3xl font-semibold text-primary mb-2">PostMom</h1>
          <p className="text-slate-500 text-sm">학원 비교·상담 플랫폼</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">이메일</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="이메일을 입력하세요"
              className={`w-full bg-white/80 backdrop-blur-sm border rounded-2xl px-4 py-3.5 text-sm focus:outline-none shadow-sm ${
                errors.email ? 'border-red-400' : 'border-slate-200 focus:border-primary'
              }`}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">비밀번호</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="비밀번호를 입력하세요"
              className={`w-full bg-white/80 backdrop-blur-sm border rounded-2xl px-4 py-3.5 text-sm focus:outline-none shadow-sm ${
                errors.password ? 'border-red-400' : 'border-slate-200 focus:border-primary'
              }`}
            />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>
        </div>

        <button
          onClick={handleLogin}
          className="w-full mt-6 bg-primary text-white py-4 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-all duration-200 active:scale-[0.99]"
        >
          로그인
        </button>
        <p className="text-center text-sm text-slate-500 mt-4">
          계정이 없으신가요?{' '}
          <Link to="/signup" className="text-primary font-semibold">회원가입</Link>
        </p>
      </div>
    </div>
  );
}
