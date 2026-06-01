"""
docs/ 폴더의 PDF·MD 문서를 읽어 ChromaDB에 저장하는 스크립트
사용법: python ingest.py
"""

import os
from pathlib import Path
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings

DOCS_DIR = "./docs"
CHROMA_DIR = "./chroma_db"
EMBED_MODEL = "intfloat/multilingual-e5-base"

CATEGORIES = {"임금", "실업급여", "퇴직급여제도", "기간제및단시간근로자"}


def get_category(path: Path) -> str:
    """파일 경로에서 카테고리(하위 폴더명) 추출"""
    for part in path.parts:
        if part in CATEGORIES:
            return part
    return "기타"


def get_doc_type(path: Path) -> str:
    if path.suffix == ".md":
        return "guide"
    if path.stem.startswith("[pdf]"):
        return "qa_answer"
    return "law"


def load_docs(docs_dir: str) -> list:
    docs = []
    base = Path(docs_dir)

    # PDF 파일 (하위 폴더 포함 재귀 탐색)
    pdf_files = list(base.rglob("*.pdf"))
    if not pdf_files:
        print("docs/ 폴더에 PDF 파일이 없습니다.")
    for pdf_path in pdf_files:
        category = get_category(pdf_path)
        doc_type = get_doc_type(pdf_path)
        print(f"[{category}/{doc_type}] {pdf_path.name}")
        try:
            loader = PyPDFLoader(str(pdf_path))
            pages = loader.load()
            for page in pages:
                page.metadata["category"] = category
                page.metadata["doc_type"] = doc_type
            docs.extend(pages)
        except Exception as e:
            print(f"  ⚠ 로드 실패: {e}")

    # MD 파일 (하위 폴더 포함 재귀 탐색)
    md_files = list(base.rglob("*.md"))
    for md_path in md_files:
        category = get_category(md_path)
        print(f"[{category}/guide] {md_path.name}")
        try:
            loader = TextLoader(str(md_path), encoding="utf-8")
            pages = loader.load()
            for page in pages:
                page.metadata["category"] = category
                page.metadata["doc_type"] = "guide"
                page.metadata["source"] = str(md_path)
            docs.extend(pages)
        except Exception as e:
            print(f"  ⚠ 로드 실패: {e}")

    print(f"\nPDF {len(pdf_files)}개 파일, MD {len(md_files)}개 파일 → 총 {len(docs)}페이지 로드 완료")
    return docs


def split_docs(docs: list) -> list:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        separators=["\n\n", "\n", ".", " "],
    )
    chunks = splitter.split_documents(docs)
    print(f"총 {len(chunks)}개 청크 생성 완료")
    return chunks


def build_vectordb(chunks: list):
    print(f"임베딩 모델 로드 중: {EMBED_MODEL}")
    embeddings = HuggingFaceEmbeddings(
        model_name=EMBED_MODEL,
        model_kwargs={"device": "cpu"},
    )

    # 기존 DB 초기화 후 재구축
    if Path(CHROMA_DIR).exists():
        import shutil
        shutil.rmtree(CHROMA_DIR)
        print("기존 ChromaDB 삭제 완료")

    print("ChromaDB 저장 중...")
    vectordb = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=CHROMA_DIR,
    )
    print(f"완료: {CHROMA_DIR}에 저장됨")
    return vectordb


if __name__ == "__main__":
    docs = load_docs(DOCS_DIR)
    if docs:
        chunks = split_docs(docs)
        build_vectordb(chunks)
