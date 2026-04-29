# POSTMOM 챗봇 백엔드 서버 구조

## 전체 아키텍처

```
프론트엔드 (React, :5173)
    │
    │  Bearer Token (Supabase JWT)
    ▼
Node 서버 (Express, :3001)   ──→  Supabase Auth (토큰 검증)
    │                              
    │  채팅 요청 시
    ├──→  RAG 서버 (FastAPI, :8000)  ──→  ChromaDB + Gemini AI
    │
    └──→  PostgreSQL (Prisma ORM, :5432)
              ├── chat_sessions
              └── chat_messages
```

---

## 폴더 구조

```
postmom-new/
├── src/                   # React 프론트엔드
│   └── pages/AiChat.tsx   # 챗봇 UI (백엔드 연동)
│
└── server/                # Node.js 백엔드
    ├── index.js           # 서버 진입점 (Express)
    ├── .env               # 환경변수
    ├── package.json
    └── prisma/
        ├── schema.prisma  # DB 모델 정의
        └── migrations/    # 마이그레이션 기록
```

---

## 환경변수 (`server/.env`)

| 변수 | 설명 |
|------|------|
| `PORT` | 서버 포트 (기본 3001) |
| `CORS_ORIGIN` | 허용할 프론트 도메인 (기본 `http://localhost:5173`) |
| `DATABASE_URL` | PostgreSQL 연결 문자열 |
| `SUPABASE_URL` | Supabase 프로젝트 URL |
| `SUPABASE_ANON_KEY` | Supabase anon 키 |
| `RAG_URL` | RAG 서버 주소 (기본 http://localhost:8000) |

---

## DB 모델 (Prisma)

### ChatSession — 대화 세션
| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | Int (PK) | 자동 증가 |
| `userId` | UUID | Supabase 유저 ID |
| `title` | String | 첫 질문 앞 40자 |
| `createdAt` | DateTime | 생성 시각 |
| `updatedAt` | DateTime | 마지막 메시지 시각 |

### ChatMessage — 메시지
| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | Int (PK) | 자동 증가 |
| `sessionId` | Int (FK) | ChatSession 참조 |
| `role` | String | `user` 또는 `bot` |
| `content` | String | 메시지 내용 |
| `sources` | Json? | RAG 출처 문서 목록 |
| `createdAt` | DateTime | 생성 시각 |

---

## API 엔드포인트

모든 엔드포인트는 `Authorization: Bearer <token>` 헤더 필요.

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/health` | 서버 상태 확인 (인증 불필요) |
| `GET` | `/api/sessions` | 내 채팅 세션 목록 (최근 50개) |
| `GET` | `/api/sessions/:id/messages` | 특정 세션 메시지 전체 |
| `POST` | `/api/chat` | 채팅 전송 (RAG 호출 + DB 저장) |
| `DELETE` | `/api/sessions/:id` | 세션 삭제 |

### POST `/api/chat` 요청/응답

**요청**
```json
{
  "question": "퇴직금은 어떻게 계산하나요?",
  "sessionId": 1  // 없으면 새 세션 자동 생성
}
```

**응답**
```json
{
  "sessionId": 1,
  "answer": "퇴직금은 평균임금 × 30일 × 근속연수로 계산합니다...",
  "sources": [
    { "source": "퇴직급여제도.pdf", "page": 3 }
  ]
}
```

---

## 인증 흐름

1. 프론트엔드에서 `supabase.auth.getSession()` 으로 access token 획득
2. 모든 API 요청에 `Authorization: Bearer <token>` 헤더 포함
3. 서버에서 `supabase.auth.getUser(token)` 으로 유저 검증
4. 검증 성공 시 `req.userId` (Supabase UUID) 로 DB 접근

---

## 실행 방법

```bash
# 전체 실행 (프론트 + Node 서버 + RAG 서버)
cd postmom-new
npm run dev

# DB 마이그레이션 (스키마 변경 시)
cd postmom-new/server
npx prisma migrate dev --name <이름>

# DB GUI (Prisma Studio)
cd postmom-new/server
npx prisma studio
```
