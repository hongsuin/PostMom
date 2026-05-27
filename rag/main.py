"""
FastAPI 서버 - Spring 백엔드에서 호출하는 RAG API
실행: uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rag import get_pipeline

app = FastAPI(title="POSTMOM RAG API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class HistoryMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    question: str
    history: list[HistoryMessage] = []


class ChatResponse(BaseModel):
    answer: str
    sources: list


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="질문을 입력해주세요.")

    pipeline = get_pipeline()
    result = pipeline.ask(req.question, history=[{"role": m.role, "content": m.content} for m in req.history])
    return ChatResponse(**result)
