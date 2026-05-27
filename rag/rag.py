"""
RAG 파이프라인: ChromaDB에서 관련 문서 검색 후 Claude API로 답변 생성
"""

import os
import google.genai as genai
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from dotenv import load_dotenv

load_dotenv()

CHROMA_DIR = "./chroma_db"
EMBED_MODEL = "intfloat/multilingual-e5-base"

SYSTEM_PROMPT = """당신은 학원 운영 전문 노무 상담 AI입니다.
학원장님들의 노무, 인사, 운영 관련 질문에 정확하고 친절하게 답변해주세요.
참고 문서가 제공된 경우 해당 문서를 우선 근거로 삼고, 부족한 부분은 노무·학원 운영 전문 지식으로 보완하세요.
참고 문서가 없는 경우에도 학원 운영 및 노무 관련 질문이라면 전문 지식을 바탕으로 답변하세요.
학원 운영과 무관한 질문에는 "학원 운영 및 노무 관련 질문에만 답변드릴 수 있습니다."라고 안내하세요.
답변 시작 시 인사말 없이 바로 핵심 내용부터 답변하세요.
질문이 여러 상황에 적용될 수 있는 광범위한 경우, 모든 경우를 나열하지 말고 먼저 상황을 파악하는 짧은 질문을 하세요. 예: 근로 형태(정규직/기간제/단시간), 재직 기간, 주당 근로시간 등 핵심 조건 1~2가지만 물어보세요."""

SYSTEM_PROMPT_NO_DOCS = """당신은 학원 운영 전문 노무 상담 AI입니다.
참고 문서 없이 전문 지식만으로 답변합니다.
학원 운영 및 노무 관련 질문에 정확하고 친절하게 답변하세요.
법령 조항 인용 시 출처를 명시하고, 복잡한 사안은 전문 노무사 상담을 권장하세요.
학원 운영과 무관한 질문에는 "학원 운영 관련 질문에만 답변드릴 수 있습니다. 운영중에 어려운 점이 있으신가요? 편하게 말씀해주세요!"라고 안내하세요.
답변 시작 시 인사말 없이 바로 핵심 내용부터 답변하세요."""

# 질문 키워드 → 카테고리 매핑
CATEGORY_KEYWORDS = {
    "임금": [
        "임금", "급여", "월급", "최저임금", "수당", "체불", "통상임금", "평균임금",
        "연장", "야간", "휴일", "임금명세서", "공제", "임금채권",
    ],
    "실업급여": [
        "실업급여", "구직급여", "실업", "수급자격", "이직확인서", "고용보험",
        "권고사직", "계약만료", "비자발적", "조기재취업",
    ],
    "퇴직급여제도": [
        "퇴직금", "퇴직급여", "퇴직연금", "중간정산", "DB형", "DC형",
        "계속근로", "평균임금", "퇴직", "폐업",
    ],
    "기간제및단시간근로자": [
        "기간제", "단시간", "계약직", "파트타임", "시간강사", "주15시간",
        "계약갱신", "무기계약", "근로계약서", "4대보험", "차별시정",
    ],
}


def detect_category(query: str) -> str | None:
    """질문에서 가장 관련성 높은 카테고리를 감지"""
    scores = {cat: 0 for cat in CATEGORY_KEYWORDS}
    for cat, keywords in CATEGORY_KEYWORDS.items():
        for kw in keywords:
            if kw in query:
                scores[cat] += 1
    best = max(scores, key=lambda c: scores[c])
    return best if scores[best] > 0 else None


class RAGPipeline:
    def __init__(self):
        self.client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
        self.embeddings = HuggingFaceEmbeddings(
            model_name=EMBED_MODEL,
            model_kwargs={"device": "cpu"},
        )
        self.vectordb = Chroma(
            persist_directory=CHROMA_DIR,
            embedding_function=self.embeddings,
        )

    def search(self, query: str, k: int = 3) -> list:
        category = detect_category(query)

        if category:
            try:
                # 1순위: 해당 카테고리의 qa_answer 문서
                qa_docs = self.vectordb.similarity_search(
                    query,
                    k=2,
                    filter={"$and": [{"category": {"$eq": category}}, {"doc_type": {"$eq": "qa_answer"}}]},
                )
                # 2순위: 해당 카테고리의 법령 문서
                law_docs = self.vectordb.similarity_search(
                    query,
                    k=k,
                    filter={"$and": [{"category": {"$eq": category}}, {"doc_type": {"$eq": "law"}}]},
                )
                seen = {d.page_content for d in qa_docs}
                combined = list(qa_docs)
                for d in law_docs:
                    if d.page_content not in seen and len(combined) < k:
                        combined.append(d)
                        seen.add(d.page_content)
                if combined:
                    return combined
            except Exception:
                pass  # 메타데이터 미구축 시 전체 검색으로 폴백

        # 카테고리 미감지 또는 필터 실패 시 전체 검색
        return self.vectordb.similarity_search(query, k=k)

    def ask(self, question: str, history: list = []) -> dict:
        docs = self.search(question)

        if docs:
            context = "\n\n---\n\n".join([doc.page_content for doc in docs])
            sources = [
                {
                    "source": doc.metadata.get("source", ""),
                    "page": doc.metadata.get("page", 0),
                }
                for doc in docs
            ]
            final_prompt = f"참고 문서:\n{context}\n\n질문: {question}"
            system = SYSTEM_PROMPT
        else:
            sources = []
            final_prompt = f"질문: {question}"
            system = SYSTEM_PROMPT_NO_DOCS

        # 대화 히스토리를 Gemini 멀티턴 형식으로 구성
        contents = []
        for msg in history[:-1]:  # 마지막은 현재 질문이므로 제외
            role = "user" if msg["role"] == "user" else "model"
            contents.append({"role": role, "parts": [{"text": msg["content"]}]})
        contents.append({"role": "user", "parts": [{"text": final_prompt}]})

        response = self.client.models.generate_content(
            model="gemini-2.5-flash",
            contents=contents,
            config={"system_instruction": system},
        )

        return {
            "answer": response.text,
            "sources": sources,
        }


_pipeline: RAGPipeline | None = None


def get_pipeline() -> RAGPipeline:
    global _pipeline
    if _pipeline is None:
        _pipeline = RAGPipeline()
    return _pipeline
