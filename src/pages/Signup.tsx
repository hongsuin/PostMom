import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name) e.name = '이름을 입력하세요';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = '올바른 이메일을 입력하세요';
    if (!form.password || form.password.length < 6) e.password = '비밀번호는 6자 이상이어야 합니다';
    if (form.password !== form.confirm) e.confirm = '비밀번호가 일치하지 않습니다';
    return e;
  };

  const handleSignup = () => {
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
          <h1 className="font-lora text-3xl font-semibold text-slate-900 mb-2">회원가입</h1>
          <p className="text-slate-500 text-sm">PostMom에 오신 것을 환영합니다</p>
        </div>

        <div className="space-y-4">
          {[
            { key: 'name', label: '이름', placeholder: '이름을 입력하세요', type: 'text' },
            { key: 'email', label: '이메일', placeholder: '이메일을 입력하세요', type: 'email' },
            { key: 'password', label: '비밀번호', placeholder: '6자 이상 입력하세요', type: 'password' },
            { key: 'confirm', label: '비밀번호 확인', placeholder: '비밀번호를 다시 입력하세요', type: 'password' },
          ].map(({ key, label, placeholder, type }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
              <input
                type={type}
                value={form[key as keyof typeof form]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className={`w-full bg-white/80 backdrop-blur-sm border rounded-2xl px-4 py-3.5 text-sm focus:outline-none shadow-sm ${
                  errors[key] ? 'border-red-400' : 'border-slate-200 focus:border-primary'
                }`}
              />
              {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
            </div>
          ))}
        </div>

        <button
          onClick={handleSignup}
          className="w-full mt-6 bg-primary text-white py-4 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-all duration-200 active:scale-[0.99]"
        >
          회원가입
        </button>
        <p className="text-center text-sm text-slate-500 mt-4">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="text-primary font-semibold">로그인</Link>
        </p>
      </div>
    </div>
  );
}
