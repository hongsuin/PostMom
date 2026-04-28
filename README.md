# PostMom
학원 비교 및 노무 상담 서비스

## 프로젝트 구조

```
POSTMOM/
├── postmom-new/   # 프론트엔드 (React + Vite)
└── postmom-rag/   # 챗봇 백엔드 (FastAPI + RAG)
```

## 실행 방법

### 한 번에 실행 (프론트 + 백엔드 동시)

```bash
cd postmom-new
npm run dev
```

`npm run dev` 하나로 아래 두 서버가 함께 켜집니다.

| 서버 | 주소 |
|------|------|
| 프론트엔드 (Vite) | http://localhost:5174 |
| 챗봇 백엔드 (FastAPI) | http://localhost:8000 |

### 프론트엔드만 실행

```bash
npm run dev:front
```

---

## 챗봇 백엔드 최초 설정 (최초 1회만)

`postmom-rag` 폴더에 Python 가상환경과 패키지가 설치되어 있어야 합니다.

```bash
cd postmom-rag
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

설치 후에는 `postmom-new`에서 `npm run dev`만 실행하면 됩니다.
