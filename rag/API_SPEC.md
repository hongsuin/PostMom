# PostMom RAG 챗봇 API 기능명세서

> **서비스 개요:** 학원 운영 전문 노무 상담 AI 챗봇입니다. ChromaDB에 저장된 노무 법령 문서를 검색(RAG)하고, Google Gemini 2.5 Flash 모델로 답변을 생성합니다.
>
> **실행:** `uvicorn main:app --reload --port 8000`
> **Base URL:** `http://localhost:8000`
> **Framework:** FastAPI (Python)
> **LLM:** Google Gemini 2.5 Flash (`gemini-2.5-flash`)
> **Vector DB:** ChromaDB (`./chroma_db`)
> **Embedding:** `intfloat/multilingual-e5-base` (HuggingFace)

---

## 목차

1. [엔드포인트 목록](#1-엔드포인트-목록)
2. [GET /health — 헬스체크](#2-get-health--헬스체크)
3. [POST /chat — 챗봇 질의응답](#3-post-chat--챗봇-질의응답)
4. [RAG 파이프라인 동작 방식](#4-rag-파이프라인-동작-방식)
5. [문서 카테고리 및 키워드 분류](#5-문서-카테고리-및-키워드-분류)
6. [문서 수집 (Ingest)](#6-문서-수집-ingest)
7. [환경 변수](#7-환경-변수)
8. [에러 응답](#8-에러-응답)
9. [의존성 패키지](#9-의존성-패키지)

---

## 1. 엔드포인트 목록

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| `GET` | `/health` | 서버 상태 확인 | 불필요 |
| `POST` | `/chat` | 노무 상담 질의응답 | 불필요 |

**CORS 설정**
- `allow_origins`: `*` (모든 출처 허용)
- `allow_methods`: `*`
- `allow_headers`: `*`

---

## 2. GET /health — 헬스체크

서버 정상 동작 여부를 확인합니다.

### 요청

```
GET /health
```

요청 파라미터 없음.

### 응답

**200 OK**

```json
{
  "status": "ok"
}
```

---

## 3. POST /chat — 챗봇 질의응답

사용자의 질문을 받아 관련 노무 법령 문서를 검색한 뒤 AI 답변을 생성합니다.

### 요청

```
POST /chat
Content-Type: application/json
```

### 요청 Body

```json
{
  "question": "string",
  "history": [
    {
      "role": "user" | "assistant",
      "content": "string"
    }
  ]
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `question` | string | ✅ | 사용자 질문 (공백만 있는 경우 400 에러) |
| `history` | HistoryMessage[] | ❌ | 이전 대화 내역 (기본값 `[]`) |
| `history[].role` | `"user" \| "assistant"` | ✅ | 메시지 발신자 역할 |
| `history[].content` | string | ✅ | 메시지 내용 |

**멀티턴 대화 처리 규칙**
- `history` 배열의 마지막 메시지는 현재 `question`으로 간주하여 제외합니다.
- `history[:-1]` 기준으로 Gemini 멀티턴 `contents` 구성
- Gemini 역할 매핑: `"user"` → `"user"`, 그 외 → `"model"`

### 응답

**200 OK**

```json
{
  "answer": "string",
  "sources": [
    {
      "source": "string",
      "page": 0
    }
  ]
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| `answer` | string | AI 생성 답변 |
| `sources` | Source[] | 답변 근거 문서 목록 |
| `sources[].source` | string | 원본 파일 경로 또는 파일명 |
| `sources[].page` | number | PDF 페이지 번호 (0-based) |

**참고 문서 없을 때**
- `sources`: 빈 배열 `[]`
- `answer`: 전문 지식 기반 답변 (법령 조항 인용 시 출처 명시, 복잡한 사안은 전문 노무사 상담 권장)

---

### 요청/응답 예시

**단순 질문 (히스토리 없음)**

```json
// 요청
{
  "question": "주 15시간 미만 강사도 퇴직금을 받을 수 있나요?"
}

// 응답
{
  "answer": "주 15시간 미만 단시간 근로자는 근로기준법상 퇴직급여 적용 제외 대상입니다...",
  "sources": [
    {
      "source": "docs/퇴직급여제도/근로자퇴직급여 보장법 시행령(...).pdf",
      "page": 3
    }
  ]
}
```

**멀티턴 대화**

```json
// 요청
{
  "question": "그럼 주 15시간 이상이면 어떻게 되나요?",
  "history": [
    { "role": "user", "content": "주 15시간 미만 강사도 퇴직금을 받을 수 있나요?" },
    { "role": "assistant", "content": "주 15시간 미만 단시간 근로자는..." }
  ]
}
```

---

## 4. RAG 파이프라인 동작 방식

`src/rag.py`의 `RAGPipeline` 클래스가 처리합니다. 싱글톤 패턴(`get_pipeline()`)으로 서버 기동 후 최초 1회 초기화됩니다.

### 처리 흐름

```
질문 수신
    │
    ▼
카테고리 감지 (detect_category)
    │
    ├─ 카테고리 감지됨 ──▶ 1순위: qa_answer 문서 검색 (k=2, 카테고리 필터)
    │                       2순위: law 문서 검색 (k=3, 카테고리 필터)
    │                       합산 후 중복 제거 (최대 k=3개)
    │
    └─ 카테고리 미감지 ──▶ 전체 벡터DB 유사도 검색 (k=3)
    │   또는 필터 실패
    │
    ▼
문서 존재 여부 분기
    │
    ├─ 문서 있음 ──▶ SYSTEM_PROMPT + "참고 문서:\n{context}\n\n질문: {question}"
    │
    └─ 문서 없음 ──▶ SYSTEM_PROMPT_NO_DOCS + "질문: {question}"
    │
    ▼
Gemini API 호출 (멀티턴 contents 구성)
    │
    ▼
{ answer, sources } 반환
```

### 검색 전략

| 우선순위 | 필터 조건 | 검색 수 |
|---------|-----------|---------|
| 1순위 | `category=감지된카테고리` + `doc_type=qa_answer` | k=2 |
| 2순위 | `category=감지된카테고리` + `doc_type=law` | k=3 |
| 폴백 | 필터 없음 (전체 검색) | k=3 |

### 시스템 프롬프트 구분

| 상황 | 시스템 프롬프트 | 동작 |
|------|----------------|------|
| 참고 문서 있음 | `SYSTEM_PROMPT` | 문서 우선 근거, 부족분은 전문 지식 보완 |
| 참고 문서 없음 | `SYSTEM_PROMPT_NO_DOCS` | 전문 지식만으로 답변, 법령 출처 명시 |

**범위 외 질문 응답**
- 참고 문서 있음 모드: "학원 운영 및 노무 관련 질문에만 답변드릴 수 있습니다."
- 참고 문서 없음 모드: "학원 운영 관련 질문에만 답변드릴 수 있습니다. 운영중에 어려운 점이 있으신가요? 편하게 말씀해주세요!"

---

## 5. 문서 카테고리 및 키워드 분류

질문 텍스트에서 키워드 매칭 횟수가 가장 많은 카테고리를 선택합니다 (동점 시 첫 번째 카테고리).

| 카테고리 | 주요 키워드 |
|----------|------------|
| `임금` | 임금, 급여, 월급, 최저임금, 수당, 체불, 통상임금, 평균임금, 연장, 야간, 휴일, 임금명세서, 공제, 임금채권 |
| `실업급여` | 실업급여, 구직급여, 실업, 수급자격, 이직확인서, 고용보험, 권고사직, 계약만료, 비자발적, 조기재취업 |
| `퇴직급여제도` | 퇴직금, 퇴직급여, 퇴직연금, 중간정산, DB형, DC형, 계속근로, 평균임금, 퇴직, 폐업 |
| `기간제및단시간근로자` | 기간제, 단시간, 계약직, 파트타임, 시간강사, 주15시간, 계약갱신, 무기계약, 근로계약서, 4대보험, 차별시정 |

키워드가 하나도 매칭되지 않으면 카테고리 미감지로 처리하여 전체 벡터DB 검색을 수행합니다.

---

## 6. 문서 수집 (Ingest)

RAG에 사용할 문서를 ChromaDB에 색인하는 스크립트입니다.

```bash
python ingest.py
```

### 처리 과정

```
docs/ 폴더 탐색 (재귀)
    │
    ├─ PDF 파일 → PyPDFLoader로 페이지 단위 로드
    └─ MD 파일  → TextLoader로 로드
    │
    ▼
메타데이터 부여
    ├─ category: 파일 경로의 폴더명으로 결정
    └─ doc_type: 파일 형식/이름 패턴으로 결정
    │
    ▼
청크 분할 (RecursiveCharacterTextSplitter)
    ├─ chunk_size: 500자
    ├─ chunk_overlap: 50자
    └─ separators: ["\n\n", "\n", ".", " "]
    │
    ▼
임베딩 (intfloat/multilingual-e5-base, CPU)
    │
    ▼
ChromaDB 저장 (./chroma_db, 기존 DB 완전 재구축)
```

### 문서 타입 분류 규칙

| 조건 | doc_type |
|------|----------|
| `.md` 파일 | `guide` |
| 파일명이 `[pdf]`로 시작하는 PDF | `qa_answer` |
| 그 외 PDF | `law` |

### 지원 카테고리 폴더 구조

```
docs/
├── 임금/
│   ├── [pdf]임금.pdf              (doc_type: qa_answer)
│   ├── 근로기준법(...).pdf         (doc_type: law)
│   └── README.md                  (doc_type: guide)
├── 실업급여/
│   ├── [pdf]실업급여.pdf
│   └── 고용보험법(...).pdf
├── 퇴직급여제도/
│   ├── [pdf]퇴직급여제도.pdf
│   └── 근로기준법(...).pdf
└── 기간제및단시간근로자/
    ├── [pdf]기간제 및 단시간근로자.pdf
    └── 근로기준법(...).pdf
```

---

## 7. 환경 변수

`.env` 파일로 관리합니다.

| 변수명 | 필수 | 설명 |
|--------|------|------|
| `GOOGLE_API_KEY` | ✅ | Google Gemini API 키 |

---

## 8. 에러 응답

FastAPI 기본 에러 형식으로 반환됩니다.

```json
{
  "detail": "에러 메시지"
}
```

| HTTP 상태 코드 | 발생 조건 | `detail` 메시지 |
|----------------|-----------|-----------------|
| `400 Bad Request` | `question`이 공백만 있는 경우 | `"질문을 입력해주세요."` |
| `422 Unprocessable Entity` | 요청 Body 형식 오류 (FastAPI 자동) | Pydantic validation 에러 상세 |
| `500 Internal Server Error` | Gemini API 오류, ChromaDB 접근 실패 등 | FastAPI 기본 에러 |

---

## 9. 의존성 패키지

`requirements.txt` 기준

| 패키지 | 버전 | 용도 |
|--------|------|------|
| `fastapi` | 0.115.0 | API 서버 프레임워크 |
| `uvicorn` | 0.30.6 | ASGI 서버 |
| `python-dotenv` | 1.0.1 | 환경 변수 로드 |
| `google-genai` | - | Gemini API 클라이언트 |
| `langchain` | 0.3.1 | 문서 처리 파이프라인 |
| `langchain-community` | 0.3.1 | ChromaDB, HuggingFace 연동 |
| `chromadb` | 0.5.11 | 벡터 데이터베이스 |
| `sentence-transformers` | 3.1.1 | 임베딩 모델 실행 |
| `pypdf` | 4.3.1 | PDF 문서 로드 |
| `python-multipart` | 0.0.12 | FastAPI 멀티파트 폼 지원 |
