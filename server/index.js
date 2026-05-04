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

// ── AI 학원 비교 ──
app.post('/api/compare', authMiddleware, async (req, res) => {
  const { academies, userProfile } = req.body;
  if (!Array.isArray(academies) || academies.length < 2) {
    return res.status(400).json({ error: '학원을 2개 이상 선택해주세요.' });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY가 설정되지 않았습니다.' });
  }

  const gradeMap = { elementary: '초등학생', middle: '중학생', high: '고등학생' };
  const levelMap = { beginner: '기초', average: '보통', advanced: '상급' };

  const userSummary = userProfile ? [
    userProfile.childGrade ? `학년: ${gradeMap[userProfile.childGrade] || userProfile.childGrade}` : null,
    userProfile.englishLevel ? `영어 수준: ${levelMap[userProfile.englishLevel] || userProfile.englishLevel}` : null,
    userProfile.budgetRange ? `예산: ${userProfile.budgetRange}` : null,
    userProfile.distance ? `선호 거리: ${userProfile.distance}` : null,
    userProfile.classType ? `수업 형태: ${userProfile.classType}` : null,
    userProfile.teachingStyle ? `선호 스타일: ${userProfile.teachingStyle}` : null,
    userProfile.priorities?.length ? `우선순위: ${userProfile.priorities.join(', ')}` : null,
    userProfile.difficulties?.length ? `어려움: ${userProfile.difficulties.join(', ')}` : null,
  ].filter(Boolean).join('\n') : '정보 없음';

  const academySummaries = academies.map((a, i) => `
[학원 ${i + 1}]
ID: ${a.id}
이름: ${a.name}
과목: ${a.subject || '영어'}
위치: ${a.location || '위례'}
주소: ${a.address || '정보 없음'}
월 비용: ${a.monthlyCost || a.priceRange || '정보 없음'}
대상 학년: ${a.targetGrade || '정보 없음'}
반 크기: ${a.classSize || '정보 없음'}
거리: ${a.distance || '정보 없음'}
태그: ${a.tags?.join(', ') || '없음'}
설명: ${a.description !== '정보 준비중' ? a.description : '없음'}
교육 스타일: ${a.teachingStyle !== '정보 준비중' ? a.teachingStyle : '없음'}
리뷰 키워드: ${a.reviewKeywords?.join(', ') || '없음'}
평점: ${a.rating || '정보 없음'}
`.trim()).join('\n\n');

  const prompt = `당신은 학원 추천 전문가입니다. 아래 학부모/학생 프로필과 학원 정보를 바탕으로 각 학원을 분석하고 적합도를 평가해주세요.

## 학부모/학생 프로필
${userSummary}

## 비교할 학원 목록
${academySummaries}

## 요청사항
각 학원에 대해 다음 JSON 배열을 반환해주세요. 반드시 적합도 점수(matchScore) 기준 내림차순으로 정렬하세요.
정보가 부족한 항목은 학원 이름, 위치, 가격, 반 크기 등 가용 정보를 바탕으로 합리적으로 추론해주세요.

반드시 아래 JSON 형식만 반환하세요 (설명 없이):
[
  {
    "id": "학원 ID (위 목록의 ID 그대로)",
    "name": "학원 이름",
    "rating": 숫자 (실제 평점이 없으면 4.0~4.9 사이 추정),
    "matchScore": 0~100 정수 (프로필 적합도),
    "reasons": ["추천 이유 1", "추천 이유 2", "추천 이유 3", "추천 이유 4"],
    "curriculumFit": 0~100 정수,
    "teachingQuality": 0~100 정수,
    "priceFit": 0~100 정수,
    "distanceFit": 0~100 정수
  }
]`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('[GEMINI ERROR]', errText);
      return res.status(502).json({ error: 'Gemini API 오류' });
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return res.status(502).json({ error: 'Gemini 응답이 비어있습니다.' });

    const results = JSON.parse(rawText);
    res.json(results);
  } catch (err) {
    console.error('[COMPARE ERROR]', err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ POSTMOM 서버 실행 중 → http://localhost:${PORT}`);
});
