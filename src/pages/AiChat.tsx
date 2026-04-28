import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, BookOpen, Scale, Users, User, Menu, Plus, Send, Paperclip, ArrowLeft, Trash2 } from 'lucide-react';
import { getSupabaseBrowserClient } from '../lib/supabase';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  sources?: { source: string; page: number }[];
  time: string;
}

interface Session {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

const SUGGESTED = [
  '퇴직금은 어떻게 계산하나요?',
  '연차는 몇 개 줘야 하나요?',
  '근로계약서에 꼭 넣어야 할 항목은?',
  '4대보험 가입 기준이 어떻게 되나요?',
];

const NAV_ITEMS = [
  { icon: Home, label: '홈', path: '/' },
  { icon: BookOpen, label: '학원', path: '/academies' },
  { icon: Scale, label: 'AI상담', path: '/ai-chat' },
  { icon: Users, label: '커뮤니티', path: '/community' },
  { icon: User, label: '마이', path: '/mypage' },
];

function getTime() {
  return new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

function formatSource(src: string) {
  return src.split(/[\\/]/).pop()?.replace(/^\[pdf\]/, '') ?? src;
}

function groupByDate(sessions: Session[]) {
  const now = new Date();
  const today = now.toDateString();
  const yesterday = new Date(now.getTime() - 86400000).toDateString();

  const groups: Record<string, Session[]> = { '오늘': [], '어제': [], '지난 주': [] };
  sessions.forEach(s => {
    const d = new Date(s.updated_at).toDateString();
    if (d === today) groups['오늘'].push(s);
    else if (d === yesterday) groups['어제'].push(s);
    else groups['지난 주'].push(s);
  });
  return groups;
}

async function getAuthHeader(): Promise<{ Authorization: string } | null> {
  const supabase = getSupabaseBrowserClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return null;
  return { Authorization: `Bearer ${token}` };
}

export default function AiChat() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(-1);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [userName, setUserName] = useState('');
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 로그인 유저 정보 + 세션 목록 로드
  useEffect(() => {
    async function init() {
      const supabase = getSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const name = user.user_metadata?.name || user.email?.split('@')[0] || '원장님';
        setUserName(name);
      }
      await fetchSessions();
    }
    init();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isLoading) {
      setProgress(0);
      let current = 0;
      progressTimer.current = setInterval(() => {
        current += Math.random() * 8 * (1 - current / 90);
        if (current >= 88) current = 88;
        setProgress(Math.round(current));
      }, 300);
    } else {
      if (progressTimer.current) clearInterval(progressTimer.current);
      if (progress >= 0) {
        setProgress(100);
        setTimeout(() => setProgress(-1), 600);
      }
    }
    return () => { if (progressTimer.current) clearInterval(progressTimer.current); };
  }, [isLoading]);

  async function fetchSessions() {
    const headers = await getAuthHeader();
    if (!headers) return;
    try {
      const res = await fetch(`${SERVER_URL}/api/sessions`, { headers });
      if (res.ok) setSessions(await res.json());
    } catch { /* 서버 꺼진 경우 무시 */ }
  }

  async function loadSession(session: Session) {
    const headers = await getAuthHeader();
    if (!headers) return;
    try {
      const res = await fetch(`${SERVER_URL}/api/sessions/${session.id}/messages`, { headers });
      if (!res.ok) return;
      const rows = await res.json();
      const loaded: Message[] = rows.map((r: { id: number; role: string; content: string; sources: { source: string; page: number }[] | null; created_at: string }) => ({
        id: String(r.id),
        role: r.role as 'user' | 'bot',
        content: r.content,
        sources: r.sources ?? undefined,
        time: new Date(r.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      }));
      setMessages(loaded);
      setCurrentSessionId(session.id);
      setSidebarOpen(false);
    } catch { /* 무시 */ }
  }

  async function deleteSession(e: React.MouseEvent, sessionId: number) {
    e.stopPropagation();
    const headers = await getAuthHeader();
    if (!headers) return;
    await fetch(`${SERVER_URL}/api/sessions/${sessionId}`, { method: 'DELETE', headers });
    if (currentSessionId === sessionId) {
      setMessages([]);
      setCurrentSessionId(null);
    }
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  }

  function handleNewChat() {
    setMessages([]);
    setCurrentSessionId(null);
    setSidebarOpen(false);
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  }

  async function sendMessage(question: string) {
    if (!question.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: question, time: getTime() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setIsLoading(true);

    try {
      const headers = await getAuthHeader();
      if (!headers) throw new Error('로그인이 필요합니다.');

      const res = await fetch(`${SERVER_URL}/api/chat`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, sessionId: currentSessionId }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: data.answer,
        sources: data.sources,
        time: getTime(),
      }]);

      // 새 세션이었으면 세션 ID 저장 + 목록 갱신
      if (!currentSessionId) {
        setCurrentSessionId(data.sessionId);
        await fetchSessions();
      }
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: '연결 오류가 발생했습니다. 서버 상태를 확인해주세요.',
        time: getTime(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  const isEmpty = messages.length === 0;
  const grouped = groupByDate(sessions);

  return (
    <div className="flex h-screen overflow-hidden bg-white font-lora">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside
        className={`
          flex flex-col flex-shrink-0 overflow-hidden z-50 w-[280px] md:w-[500px]
          transition-transform duration-[250ms] ease-in-out
          fixed top-0 bottom-0 left-0
          md:static md:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ background: '#18ad60' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/15 flex-shrink-0">
          <img src="/기본얼굴.png" alt="AI" className="w-8 h-8 object-contain flex-shrink-0" />
          <div>
            <div className="text-[15px] font-bold text-white leading-tight">POSTMOM</div>
            <div className="text-[10px] leading-tight" style={{ color: '#D4EDE0' }}>노무 상담 AI</div>
          </div>
        </div>

        {/* New chat */}
        <button
          onClick={handleNewChat}
          className="mx-3 mt-3 mb-1 px-4 py-2.5 rounded-[10px] flex items-center gap-2 text-[13px] font-semibold text-white border border-white/25 flex-shrink-0 transition-colors hover:bg-white/20"
          style={{ background: 'rgba(255,255,255,0.15)' }}
        >
          <Plus size={15} />
          새 상담 시작
        </button>

        {/* History */}
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {sessions.length === 0 ? (
            <div className="px-3 pt-4 text-[12px]" style={{ color: '#D4EDE0' }}>
              아직 상담 기록이 없어요.
            </div>
          ) : (
            Object.entries(grouped).map(([group, items]) => {
              if (!items.length) return null;
              return (
                <div key={group}>
                  <div className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-[0.8px]" style={{ color: '#D4EDE0' }}>
                    {group}
                  </div>
                  {items.map(item => (
                    <div
                      key={item.id}
                      onClick={() => loadSession(item)}
                      className={`group px-3 py-2.5 rounded-lg cursor-pointer mb-0.5 hover:bg-black/15 transition-colors flex items-center justify-between ${currentSessionId === item.id ? 'bg-black/20' : ''}`}
                    >
                      <div className="truncate flex-1">
                        <div className="text-[13px] font-medium text-white truncate">{item.title}</div>
                        <div className="text-[11px] truncate" style={{ color: '#D4EDE0' }}>
                          {new Date(item.updated_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                      <button
                        onClick={(e) => deleteSession(e, item.id)}
                        className="opacity-0 group-hover:opacity-100 ml-2 p-1 rounded hover:bg-black/20 transition-all flex-shrink-0"
                      >
                        <Trash2 size={13} className="text-white/70" />
                      </button>
                    </div>
                  ))}
                </div>
              );
            })
          )}
        </div>

        {/* User */}
        <div className="px-3 pb-3 pt-3 border-t border-white/15 flex-shrink-0">
          <div className="flex items-center gap-3 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-black/15 transition-colors">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <User size={16} className="text-white" />
            </div>
            <div>
              <div className="text-[13px] font-semibold text-white">{userName || '원장님'}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden bg-white">
        {/* Topbar */}
        <header className="h-14 px-5 flex items-center justify-between border-b border-gray-200 flex-shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={18} />
            </button>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center text-gray-500 hover:text-gray-800"
            >
              <ArrowLeft size={18} />
            </button>
            <span className="text-[15px] font-semibold text-gray-900">노무 상담 AI</span>
          </div>
        </header>

        {/* Token progress bar */}
        <div className="h-[3px] w-full bg-gray-100 flex-shrink-0 overflow-hidden">
          {progress >= 0 && (
            <div
              className="h-full"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #1AA75F, #34d399)',
                transition: 'width 0.3s ease',
                opacity: progress === 100 ? 0 : 1,
              }}
            />
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-6">
          <div className="max-w-[720px] mx-auto px-5 flex flex-col gap-5">
            {isEmpty ? (
              <div className="flex flex-col items-center gap-4 pt-8">
                <img src="/웃음.png" alt="노무 AI" className="w-[88px] h-[88px] object-contain" />
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900 leading-snug mb-1.5">
                    {userName ? `${userName}님, 안녕하세요!` : '원장님, 안녕하세요!'}
                  </div>
                  <p className="text-[13px] text-gray-500 leading-relaxed max-w-[320px]">
                    학원 노무 관련 궁금증을 편하게 물어보세요.<br />
                    관련 법령과 문서를 바탕으로 안내해 드립니다.
                  </p>
                </div>

                {/* Topic cards */}
                <div className="grid grid-cols-2 gap-2 w-full max-w-[520px] mt-1">
                  {[
                    { title: '퇴직금', desc: '지급 기준, 계산 방법' },
                    { title: '근로계약서', desc: '작성 항목, 주의사항' },
                    { title: '4대보험', desc: '가입 기준, 유형별 적용' },
                    { title: '최저임금·수당', desc: '2025년 기준, 연장수당' },
                  ].map(({ title, desc }) => (
                    <button
                      key={title}
                      onClick={() => sendMessage(title + '에 대해 알려주세요')}
                      className="text-left px-4 py-3 rounded-xl border border-slate-200 bg-white hover:border-primary hover:bg-green-50 transition-all"
                    >
                      <div className="text-[13px] font-bold text-gray-900 mb-0.5">{title}</div>
                      <div className="text-[11px] text-gray-400">{desc}</div>
                    </button>
                  ))}
                </div>

                {/* Example questions */}
                <div className="w-full max-w-[520px] flex flex-col gap-2 mt-1">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 px-1">자주 묻는 질문</div>
                  {SUGGESTED.map(q => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-[13px] text-gray-700 font-medium hover:border-primary hover:bg-green-50 hover:text-primary transition-all"
                    >
                      {q}
                      <span className="text-slate-300 ml-2 flex-shrink-0">›</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {msg.role === 'bot' && (
                    <img src="/검색.png" alt="AI" className="w-[34px] h-[34px] object-contain flex-shrink-0 mt-0.5" />
                  )}
                  <div className={`flex flex-col gap-1.5 max-w-[78%] ${msg.role === 'user' ? 'items-end' : ''}`}>
                    {msg.role === 'bot' && (
                      <div className="text-[11px] font-semibold text-gray-400 px-1">POSTMOM AI</div>
                    )}
                    <div
                      className={`px-4 py-3 rounded-2xl text-[14px] leading-relaxed whitespace-pre-wrap break-words ${
                        msg.role === 'user' ? 'text-white rounded-tr-sm' : 'text-gray-900 border rounded-tl-sm'
                      }`}
                      style={
                        msg.role === 'user'
                          ? { background: '#1AA75F' }
                          : { background: '#F0F9F3', borderColor: '#C0EDD5' }
                      }
                    >
                      {msg.content}
                    </div>
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 px-1">
                        {msg.sources.map((s, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border"
                            style={{ background: '#EDFAF3', color: '#137A45', borderColor: '#C0EDD5' }}
                          >
                            📄 {formatSource(s.source)} · {s.page + 1}p
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="text-[10px] text-gray-400 px-1">{msg.time}</div>
                  </div>
                </div>
              ))
            )}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex gap-3">
                <img src="/검색.png" alt="AI" className="w-[34px] h-[34px] object-contain flex-shrink-0" />
                <div
                  className="px-4 py-3 rounded-2xl rounded-tl-sm border flex gap-1 items-center"
                  style={{ background: '#F0F9F3', borderColor: '#C0EDD5' }}
                >
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block"
                      style={{ animation: `bounce 1.4s ${i * 0.2}s infinite` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="px-5 pb-5 pt-3 flex-shrink-0 bg-white">
          <div
            className="max-w-[720px] mx-auto flex items-center gap-2.5 px-4 py-3 rounded-[14px] border bg-gray-50 transition-all"
            style={{ borderColor: '#E5E7EB' }}
            onFocusCapture={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#1AA75F'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 0 3px rgba(26,167,95,0.1)'; }}
            onBlurCapture={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#E5E7EB'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={isEmpty ? '궁금한 점을 입력하세요...' : '추가 질문을 입력하세요...'}
              rows={1}
              disabled={isLoading}
              className="flex-1 bg-transparent text-[14px] text-gray-800 placeholder-gray-400 resize-none outline-none leading-relaxed"
              style={{ fontFamily: 'inherit', maxHeight: '120px' }}
            />
            <div className="flex gap-2 items-center flex-shrink-0">
              <button className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:bg-gray-50">
                <Paperclip size={14} />
              </button>
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                className="w-9 h-9 rounded-[10px] flex items-center justify-center transition-all"
                style={{
                  background: input.trim() && !isLoading ? '#1AA75F' : '#E5E7EB',
                  boxShadow: input.trim() && !isLoading ? '0 2px 8px rgba(26,167,95,0.3)' : 'none',
                }}
              >
                <Send size={14} className="text-white" />
              </button>
            </div>
          </div>
          <p className="hidden sm:block text-center text-[11px] text-gray-400 mt-2">
            AI 답변은 참고용입니다. 중요한 사안은 전문 노무사와 상담하세요.
          </p>
        </div>

        {/* Bottom nav (mobile only) */}
        <nav className="md:hidden flex border-t border-gray-200 bg-white/95 backdrop-blur-md flex-shrink-0">
          {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
            const active = location.pathname === path;
            return (
              <Link key={path} to={path} className="flex flex-1 flex-col items-center gap-0.5 py-2.5">
                <Icon size={20} className={active ? 'text-primary' : 'text-gray-400'} />
                <span className={`text-[10px] ${active ? 'font-bold text-primary' : 'font-medium text-gray-400'}`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
