# POSTMOM RAG 챗봇

학원장을 위한 노무·인사 상담 AI 챗봇. PDF 문서를 기반으로 RAG(Retrieval-Augmented Generation) 방식으로 답변을 생성합니다.

---

## 작동 방식

### 전체 구조

```
[PDF 문서]
    ↓ ingest.py
[텍스트 청크] → [임베딩 벡터] → [ChromaDB 저장]

[사용자 질문]
    ↓ rag.py
[질문 벡터화] → [ChromaDB 유사 문서 검색] → [Claude Haiku에 전달] → [답변 반환]
    ↑
[FastAPI 서버] ← Spring 백엔드 호출
```

### 핵심 개념: RAG란?

RAG(Retrieval-Augmented Generation)는 모델을 별도로 학습시키지 않고, 문서를 검색해서 Claude에게 참고 자료로 제공하는 방식입니다.

- **모델 학습 없음** — Claude API를 그대로 사용
- **문서 추가/수정** 시 `ingest.py`만 다시 실행하면 즉시 반영
- **답변 근거 추적 가능** — 어떤 문서의 몇 페이지를 참고했는지 반환

---

## 파일 구성

| 파일 | 역할 |
|---|---|
| `ingest.py` | PDF 문서를 읽어 ChromaDB에 벡터 저장 |
| `rag.py` | 질문 검색 + Claude 답변 생성 파이프라인 |
| `main.py` | FastAPI 서버 (Spring 백엔드와 연동) |
| `docs/` | 노무 관련 PDF 문서 보관 폴더 |
| `chroma_db/` | 벡터 DB 저장 폴더 (자동 생성) |

---

## 기술 스택

| 구분 | 기술 |
|---|---|
| API 서버 | FastAPI + Uvicorn |
| 벡터 DB | ChromaDB |
| 임베딩 모델 | `intfloat/multilingual-e5-base` (HuggingFace, 로컬 실행) |
| LLM | Claude Haiku (`claude-haiku-4-5-20251001`) |
| PDF 파싱 | PyPDF (LangChain) |
| 청크 분할 | `RecursiveCharacterTextSplitter` (500자, overlap 50자) |

---

## 시작하기

### 1. 환경 변수 설정

```bash
cp .env.example .env
```

`.env` 파일에 Anthropic API 키 입력:

```
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

### 2. 패키지 설치

```bash
pip install -r requirements.txt
```

### 3. PDF 문서 추가

`docs/` 폴더를 만들고 노무 관련 PDF 파일을 넣습니다:

```bash
mkdir docs
# docs/ 폴더에 PDF 파일 복사
```

### 4. 문서 인제스트 (벡터 DB 구축)

```bash
python ingest.py
```

PDF가 추가되거나 변경될 때마다 재실행합니다.

### 5. 서버 실행

```bash
uvicorn main:app --reload --port 8000
```

---

## API

### 헬스 체크

```
GET /health
```

```json
{ "status": "ok" }
```

### 채팅

```
POST /chat
Content-Type: application/json

{
  "question": "아르바이트 주휴수당 기준이 어떻게 되나요?"
}
```

**응답:**

```json
{
  "answer": "주휴수당은 1주 소정근로시간이 15시간 이상인 경우 발생합니다...",
  "sources": [
    { "source": "docs/노무가이드.pdf", "page": 3 }
  ]
}
```

---

## 비용 (Claude Haiku 기준)

| 요청 유형 | 1000건당 비용 |
|---|---|
| 텍스트 질문만 | 약 $0.80 |
| 이미지 포함 (사진 촬영) | 약 $3.00 |
| PDF 업로드 (5페이지) | 약 $8~10 |

> Haiku 요금: 입력 $0.80/백만 토큰, 출력 $4.00/백만 토큰

---

## 시스템 프롬프트

챗봇은 다음 원칙으로 동작합니다:

- 답변은 **반드시 등록된 문서에 근거**
- 문서에 없는 내용은 `"제공된 자료에서 확인되지 않습니다. 전문 노무사 상담을 권장합니다."` 안내
- 학원 운영 관련 노무·인사 영역에 특화

---

## 향후 확장 계획

- [ ] 이미지/PDF 업로드 질문 지원 (Claude Vision 활용)
- [ ] 관리자 페이지에서 문서 업로드 UI
- [ ] 대화 히스토리 유지 (멀티턴)
