# PostMom

영어 학원 비교·추천 및 노무 상담 플랫폼

---

## 프로젝트 구조

```
postmom-new/
├── src/                        # 프론트엔드 (React + Vite)
│   ├── pages/                  # 페이지 컴포넌트
│   ├── features/
│   │   ├── onboarding/         # 온보딩 5단계
│   │   └── admin/              # 관리자 페이지
│   ├── store/                  # Zustand 전역 상태
│   ├── data/                   # 목업 데이터 / 상수
│   ├── lib/                    # Supabase 클라이언트 등
│   └── layouts/                # 공통 레이아웃
├── server/                     # 백엔드 (Express.js)
│   ├── app.js                  # API 라우터
│   ├── index.js                # 서버 엔트리
│   └── prisma/
│       └── schema.prisma       # DB 스키마 (chat_sessions, chat_messages)
├── docs/
│   └── data-storage.md         # 데이터 저장 위치 정리
└── public/                     # 정적 파일 (영상, 이미지 등)
```

---

## 기술 스택

| 영역 | 기술 |
|---|---|
| 프론트엔드 | React 19, TypeScript, Vite 8, Tailwind CSS v4 |
| 라우팅 | React Router v7 |
| 상태 관리 | Zustand v5 |
| 애니메이션 | Motion (Framer Motion) |
| 인증 / DB | Supabase (Auth + PostgreSQL) |
| 백엔드 | Express.js v5 |
| AI | Google Gemini API (학원 비교 분석) |
| ORM | Prisma v5 (노무상담 대화 저장) |
| 동시 실행 | concurrently |

---

## 주요 페이지

| 경로 | 설명 |
|---|---|
| `/` | 메인 홈 — 내 카드, 추천 결과 표시 |
| `/onboarding/1~5` | 자녀 정보 입력 (로그인 필수) |
| `/learning-test` | 학습 유형 테스트 |
| `/academies` | 학원 목록 |
| `/academies/:id` | 학원 상세 |
| `/compare` | AI 비교 학원 선택 |
| `/compare/result` | AI 비교 결과 리포트 |
| `/ai-chat` | AI 노무상담 |
| `/community` | 커뮤니티 |
| `/mypage` | 마이페이지 |
| `/admin` | 관리자 대시보드 |

---

## 실행 방법

### 전체 실행 (프론트 + Express 서버 + RAG 서버 동시)

```bash
cd postmom-new
npm run dev
```

| 서버 | 주소 |
|---|---|
| 프론트엔드 (Vite) | http://localhost:5173 |
| Express API 서버 | http://localhost:3001 |
| RAG 서버 (FastAPI) | http://localhost:8000 |

### 프론트엔드만 실행

```bash
npm run dev:front
```

---

## 환경 변수 설정

### 프론트엔드 (`postmom-new/.env`)

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_SERVER_URL=http://localhost:3001
```

### 백엔드 (`postmom-new/server/.env`)

```env
DATABASE_URL=           # PostgreSQL 연결 문자열
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
GEMINI_API_KEY=         # Google Gemini API 키
PORT=3001
```

---

## 백엔드 DB 초기 설정 (최초 1회)

```bash
cd postmom-new/server
npm install
npx prisma migrate dev
```

### Prisma 주요 명령어

```bash
npx prisma migrate dev    # 마이그레이션 실행
npx prisma studio         # DB GUI 열기
npx prisma generate       # 클라이언트 재생성
```

---

## RAG 서버 초기 설정 (최초 1회)

```bash
cd postmom-rag
python -m venv venv
venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

---

## 데이터 저장 위치

자세한 내용은 [`docs/data-storage.md`](docs/data-storage.md) 참고

| 데이터 | 저장소 |
|---|---|
| 유저 인증 | Supabase Auth |
| 학습 유형, 온보딩 정보 | Supabase `user_metadata` |
| 커뮤니티 게시글·댓글 | Supabase DB |
| 노무상담 대화 | PostgreSQL (Prisma) |
| AI 추천 결과 캐시 | localStorage |
| 온보딩 진행 중 임시 상태 | Zustand (인메모리) |
