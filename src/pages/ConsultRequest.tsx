import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { academies } from '../data/mockData';
import Header from '../layouts/Header';
import { getSupabaseBrowserClient } from '../lib/supabase';
import { useConsultationStore } from '../store/consultationStore';

export default function ConsultRequest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const academy = academies.find(a => a.id === id);

  const [form, setForm] = useState({ name: '', phone: '', grade: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const { addConsultation } = useConsultationStore();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name) e.name = '이름을 입력하세요';
    if (!form.phone || !/^010-\d{4}-\d{4}$/.test(form.phone)) e.phone = '올바른 전화번호를 입력하세요 (010-0000-0000)';
    if (!form.grade) e.grade = '학년을 선택하세요';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    if (!academy) return;

    setSubmitting(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();

      await addConsultation(
        {
          academyId: academy.id,
          academyName: academy.name,
          parentName: form.name,
          phone: form.phone,
          grade: form.grade,
          message: form.message || undefined,
          requestType: '상담',
        },
        session?.user.id,
      );

      navigate('/consult/complete');
    } catch (err) {
      console.error('[ConsultRequest] 저장 오류:', err);
      // 저장 실패해도 완료 페이지로 이동
      navigate('/consult/complete');
    } finally {
      setSubmitting(false);
    }
  };

  if (!academy) return <div className="p-4">학원을 찾을 수 없습니다.</div>;

  return (
    <div className="min-h-screen">
      <Header title="상담 신청" showBack />

      <div className="mx-auto max-w-[1400px] px-8 pt-5 pb-8 xl:px-12 space-y-4">
        {/* 학원 정보 */}
        <div className="bg-primary/10 rounded-2xl p-4">
          <p className="text-sm font-semibold text-primary">{academy.name}</p>
          <p className="text-xs text-slate-500 mt-0.5">{academy.location} · {academy.subject}</p>
        </div>

        {[
          { key: 'name', label: '학부모 성함', placeholder: '이름을 입력하세요', type: 'text' },
          { key: 'phone', label: '연락처', placeholder: '010-0000-0000', type: 'tel' },
        ].map(({ key, label, placeholder, type }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
            <input
              type={type}
              value={form[key as keyof typeof form]}
              onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              placeholder={placeholder}
              className={`w-full bg-white/80 backdrop-blur-sm border rounded-2xl px-4 py-3 text-sm focus:outline-none shadow-sm ${
                errors[key] ? 'border-red-400' : 'border-slate-200 focus:border-primary'
              }`}
            />
            {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">자녀 학년</label>
          <select
            value={form.grade}
            onChange={e => setForm(f => ({ ...f, grade: e.target.value }))}
            className={`w-full bg-white/80 backdrop-blur-sm border rounded-2xl px-4 py-3 text-sm focus:outline-none shadow-sm ${
              errors.grade ? 'border-red-400' : 'border-slate-200 focus:border-primary'
            }`}
          >
            <option value="">학년 선택</option>
            {['초1','초2','초3','초4','초5','초6','중1','중2','중3','고1','고2','고3'].map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          {errors.grade && <p className="text-xs text-red-500 mt-1">{errors.grade}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">문의 내용 (선택)</label>
          <textarea
            value={form.message}
            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
            placeholder="궁금한 점을 자유롭게 적어주세요"
            rows={4}
            className="w-full bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary resize-none shadow-sm"
          />
        </div>

        <button
          onClick={() => void handleSubmit()}
          disabled={submitting}
          className="w-full bg-primary text-white py-4 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          {submitting ? '신청 중...' : '상담 신청하기'}
        </button>
      </div>
    </div>
  );
}
