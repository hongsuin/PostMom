require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const PORT = process.env.PORT || 3001;
const RAG_URL = process.env.RAG_URL || 'http://localhost:8000';

app.use(cors({ origin: /^http:\/\/localhost(:\d+)?$/, credentials: true }));
app.use(express.json());

// ── 인증 미들웨어 ──
async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: '인증이 필요합니다.' });

  const token = header.slice(7);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    console.error('[AUTH ERROR]', error?.message);
    return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
  }
  req.userId = user.id;
  next();
}

// ── 헬스체크 ──
app.get('/health', (_, res) => res.json({ status: 'ok' }));

// ── 세션 목록 조회 ──
app.get('/api/sessions', authMiddleware, async (req, res) => {
  try {
    const sessions = await prisma.chatSession.findMany({
      where: { userId: req.userId },
      orderBy: { updatedAt: 'desc' },
      take: 50,
      select: { id: true, title: true, createdAt: true, updatedAt: true },
    });
    res.json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '세션 목록 조회 실패' });
  }
});

// ── 특정 세션 메시지 조회 ──
app.get('/api/sessions/:id/messages', authMiddleware, async (req, res) => {
  try {
    const session = await prisma.chatSession.findFirst({
      where: { id: Number(req.params.id), userId: req.userId },
    });
    if (!session) return res.status(404).json({ error: '세션을 찾을 수 없습니다.' });

    const messages = await prisma.chatMessage.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: 'asc' },
    });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '메시지 조회 실패' });
  }
});

// ── 채팅 (RAG 호출 + DB 저장) ──
app.post('/api/chat', authMiddleware, async (req, res) => {
  const { question, sessionId } = req.body;
  if (!question?.trim()) return res.status(400).json({ error: '질문을 입력해주세요.' });

  try {
    // 세션 확인 or 생성
    let session;
    if (sessionId) {
      session = await prisma.chatSession.findFirst({
        where: { id: Number(sessionId), userId: req.userId },
      });
      if (!session) return res.status(403).json({ error: '접근 권한이 없습니다.' });
    } else {
      session = await prisma.chatSession.create({
        data: { userId: req.userId, title: question.slice(0, 40) },
      });
    }

    // 유저 메시지 저장
    await prisma.chatMessage.create({
      data: { sessionId: session.id, role: 'user', content: question },
    });

    // 직전 대화 히스토리 조회 (최근 6개)
    const recentMessages = await prisma.chatMessage.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });
    const history = recentMessages.reverse().map(m => ({ role: m.role, content: m.content }));

    // RAG 서버 호출
    const ragRes = await fetch(`${RAG_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, history }),
    });
    if (!ragRes.ok) throw new Error('RAG 서버 오류');
    const ragData = await ragRes.json();

    // 봇 메시지 저장
    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: 'bot',
        content: ragData.answer,
        sources: ragData.sources ?? [],
      },
    });

    // 세션 updatedAt 갱신
    await prisma.chatSession.update({
      where: { id: session.id },
      data: { updatedAt: new Date() },
    });

    res.json({ sessionId: session.id, answer: ragData.answer, sources: ragData.sources ?? [] });
  } catch (err) {
    console.error('[CHAT ERROR]', err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// ── 세션 삭제 ──
app.delete('/api/sessions/:id', authMiddleware, async (req, res) => {
  try {
    const session = await prisma.chatSession.findFirst({
      where: { id: Number(req.params.id), userId: req.userId },
    });
    if (!session) return res.status(404).json({ error: '세션을 찾을 수 없습니다.' });

    await prisma.chatSession.delete({ where: { id: session.id } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '세션 삭제 실패' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ POSTMOM 서버 실행 중 → http://localhost:${PORT}`);
});
