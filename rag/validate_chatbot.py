"""
validate_chatbot.py
Nemotron-Personas-Korea 페르소나 기반 RAG 챗봇 품질 검증 스크립트

사전 준비:
  1. pip install datasets google-genai
  2. RAG 서버 실행: uvicorn main:app --reload --port 8000
  3. python validate_chatbot.py

결과: validate_report.json
"""

import json
import os
import time
import requests
import google.genai as genai
from datasets import load_dataset
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

# ── 설정 ────────────────────────────────────────────────────────────────────

CHATBOT_API_URL = "http://localhost:8000/chat"
NUM_PERSONAS    = 20   # 검증할 페르소나 수
QUESTIONS_PER_PERSONA = 3   # 페르소나당 질문 수 (카테고리별 1개씩)
API_DELAY       = 1.0  # 챗봇 API 호출 간격(초) — 서버 부하 방지

# 교육·학원 관련 직업 키워드 (데이터셋 occupation 필드 필터용)
EDUCATION_KEYWORDS = ["학원", "강사", "교사", "교육", "원장", "교수", "훈련교사", "보육"]

# RAG가 다루는 4개 노무 카테고리
CATEGORIES = ["임금", "실업급여", "퇴직급여", "기간제및단시간근로자"]

# 챗봇이 범위 외 질문이라고 판단할 때 내뱉는 문구
REJECTION_PHRASES = [
    "학원 운영 및 노무 관련 질문에만 답변",
    "학원 운영 관련 질문에만 답변",
    "답변드릴 수 없습니다",
]


# ── 1단계: 페르소나 수집 ─────────────────────────────────────────────────────

def load_personas(n: int) -> list[dict]:
    """
    Nemotron-Personas-Korea를 스트리밍으로 읽어
    교육·학원 관련 페르소나를 우선 수집하고, 부족하면 일반 페르소나로 채운다.
    """
    print("📦 Nemotron-Personas-Korea 스트리밍 로드 중...")
    ds = load_dataset(
        "nvidia/Nemotron-Personas-Korea",
        split="train",
        streaming=True,
        trust_remote_code=True,
    )

    edu_personas   = []
    other_personas = []

    for row in ds:
        occ = row.get("occupation") or ""
        if any(kw in occ for kw in EDUCATION_KEYWORDS):
            edu_personas.append(row)
        elif len(other_personas) < n:
            other_personas.append(row)

        if len(edu_personas) >= n:
            break
        # 스트리밍 조기 종료 조건: 양쪽 다 충분히 모임
        if len(edu_personas) + len(other_personas) >= n * 10:
            break

    selected = edu_personas[:n]
    if len(selected) < n:
        selected += other_personas[: n - len(selected)]

    edu_count = min(len(edu_personas), n)
    print(f"✅ {len(selected)}개 수집 완료 (교육·학원 관련: {edu_count}개, 일반: {len(selected)-edu_count}개)\n")
    return selected


# ── 2단계: 질문 생성 ─────────────────────────────────────────────────────────

def generate_questions(persona: dict, client: genai.Client) -> list[dict]:
    """
    페르소나 정보를 LLM에 주입해 학원 노무 관련 현실적인 질문 3개를 생성한다.
    각 질문은 서로 다른 카테고리를 커버해야 한다.
    """
    occupation    = persona.get("occupation") or "자영업자"
    age           = persona.get("age") or ""
    province      = persona.get("province") or ""
    persona_text  = (persona.get("professional_persona") or persona.get("persona") or "")[:300]

    prompt = f"""다음 인물이 학원을 운영하거나 학원에서 강사로 일하는 상황이라고 가정합니다.
이 사람이 학원 노무 AI 챗봇에게 실제로 물어볼 법한 질문 {QUESTIONS_PER_PERSONA}개를 만들어주세요.

[인물 정보]
직업: {occupation}
나이: {age}세
지역: {province}
소개: {persona_text}

[질문 조건]
- 질문마다 아래 카테고리 중 하나를 각각 다르게 사용하세요: 임금 / 실업급여 / 퇴직급여 / 기간제및단시간근로자
- 실제 학원 현장에서 생길 법한 구체적인 상황(금액·기간·인원 등)을 담으세요
- 구어체 한국어로, 실제 사람이 챗봇에게 타이핑할 것처럼 작성하세요
- 반드시 아래 JSON 형식만 반환하세요 (설명 없이)

[출력 형식]
[
  {{"question": "...", "category": "임금"}},
  {{"question": "...", "category": "실업급여"}},
  {{"question": "...", "category": "퇴직급여"}}
]"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[{"role": "user", "parts": [{"text": prompt}]}],
    )

    text = response.text.strip()

    # 마크다운 코드블록 제거
    if "```" in text:
        parts = text.split("```")
        text = parts[1] if len(parts) > 1 else parts[0]
        if text.lower().startswith("json"):
            text = text[4:]

    return json.loads(text.strip())


# ── 3단계: 챗봇 호출 ─────────────────────────────────────────────────────────

def call_chatbot(question: str) -> dict:
    """POST /chat 호출. 서버 미실행 시 API_UNREACHABLE 반환."""
    try:
        resp = requests.post(
            CHATBOT_API_URL,
            json={"question": question, "history": []},
            timeout=30,
        )
        resp.raise_for_status()
        return resp.json()
    except requests.exceptions.ConnectionError:
        return {"answer": "API_UNREACHABLE", "sources": []}
    except Exception as e:
        return {"answer": f"ERROR: {e}", "sources": []}


# ── 4단계: 답변 평가 ─────────────────────────────────────────────────────────

def evaluate(answer: str, sources: list) -> dict:
    """
    품질 점수 산출 기준 (총 100점):
      - 거절 안 함          +40점
      - 소스 반환           +30점
      - 답변 200자 이상     +20점
      - 답변 500자 이상     +10점 (추가)
    """
    is_rejected  = any(p in answer for p in REJECTION_PHRASES)
    has_sources  = len(sources) > 0
    answer_len   = len(answer)
    unreachable  = answer == "API_UNREACHABLE"

    score = 0
    if not unreachable:
        if not is_rejected:   score += 40
        if has_sources:       score += 30
        if answer_len > 200:  score += 20
        if answer_len > 500:  score += 10

    return {
        "is_rejected":   is_rejected,
        "has_sources":   has_sources,
        "answer_length": answer_len,
        "quality_score": score,
        "unreachable":   unreachable,
    }


# ── 5단계: 결과 요약 ─────────────────────────────────────────────────────────

def print_summary(results: list[dict]) -> None:
    total       = len(results)
    if total == 0:
        print("❌ 결과 없음")
        return

    rejected    = sum(1 for r in results if r["evaluation"]["is_rejected"])
    sourced     = sum(1 for r in results if r["evaluation"]["has_sources"])
    unreachable = sum(1 for r in results if r["evaluation"]["unreachable"])
    avg_score   = sum(r["evaluation"]["quality_score"] for r in results) / total
    avg_len     = sum(r["evaluation"]["answer_length"] for r in results) / total

    # 카테고리별 집계
    cat_stats: dict[str, dict] = {}
    for r in results:
        cat = r["category"]
        s   = cat_stats.setdefault(cat, {"total": 0, "rejected": 0, "score_sum": 0})
        s["total"]     += 1
        s["rejected"]  += int(r["evaluation"]["is_rejected"])
        s["score_sum"] += r["evaluation"]["quality_score"]

    # 최저/최고 점수 질문
    sorted_r   = sorted(results, key=lambda x: x["evaluation"]["quality_score"])
    worst      = sorted_r[0]
    best       = sorted_r[-1]

    w = 60
    print("\n" + "=" * w)
    print("  📊 PostMom RAG 챗봇 품질 검증 결과")
    print("=" * w)
    print(f"  총 질문 수       : {total}개")
    print(f"  서버 미응답      : {unreachable}개")
    print(f"  응답 거절 비율   : {rejected}/{total} ({rejected/total*100:.1f}%)")
    print(f"  소스 반환 비율   : {sourced}/{total} ({sourced/total*100:.1f}%)")
    print(f"  평균 품질 점수   : {avg_score:.1f} / 100")
    print(f"  평균 답변 길이   : {avg_len:.0f} 자")
    print()
    print("  📂 카테고리별")
    print(f"  {'카테고리':<22} {'질문':>4}  {'거절':>4}  {'평균점수':>6}")
    print(f"  {'-'*44}")
    for cat, s in cat_stats.items():
        avg = s["score_sum"] / s["total"]
        print(f"  {cat:<22} {s['total']:>4}개  {s['rejected']:>4}건  {avg:>6.1f}점")
    print()
    print("  🏆 최고 점수 질문")
    print(f"  [{best['category']}] {best['question'][:70]}")
    print(f"  → 점수: {best['evaluation']['quality_score']}/100 | 소스 {len(best['sources'])}개")
    print()
    print("  ⚠️  최저 점수 질문")
    print(f"  [{worst['category']}] {worst['question'][:70]}")
    print(f"  → 점수: {worst['evaluation']['quality_score']}/100")
    print("=" * w)


# ── 메인 ────────────────────────────────────────────────────────────────────

def main() -> None:
    client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

    # 서버 상태 확인
    try:
        resp = requests.get("http://localhost:8000/health", timeout=5)
        if resp.json().get("status") == "ok":
            print("✅ RAG 서버 정상 연결\n")
    except Exception:
        print("⚠️  RAG 서버에 연결할 수 없습니다. 챗봇 응답은 API_UNREACHABLE로 기록됩니다.\n")

    # 1. 페르소나 수집
    personas = load_personas(NUM_PERSONAS)
    results  = []

    for i, persona in enumerate(personas):
        occ      = persona.get("occupation", "?")
        age      = persona.get("age", "?")
        province = persona.get("province", "?")
        print(f"[{i+1:02d}/{len(personas)}] {occ} / {age}세 / {province}")

        # 2. 질문 생성
        try:
            questions = generate_questions(persona, client)
        except Exception as e:
            print(f"  ⚠ 질문 생성 실패: {e}")
            continue

        for q in questions:
            question = q.get("question", "").strip()
            category = q.get("category", "기타")
            if not question:
                continue

            print(f"  ❓ [{category}] {question[:65]}...")

            # 3. 챗봇 호출
            response = call_chatbot(question)
            answer   = response.get("answer", "")
            sources  = response.get("sources", [])

            # 4. 평가
            ev   = evaluate(answer, sources)
            icon = "✅" if ev["quality_score"] >= 70 else "⚠️ " if ev["quality_score"] >= 40 else "❌"
            print(f"  {icon} 점수: {ev['quality_score']:3d}/100 | 소스: {len(sources)}개 | 길이: {ev['answer_length']}자")

            results.append({
                "persona": {
                    "occupation": occ,
                    "age":        age,
                    "province":   province,
                },
                "question":   question,
                "category":   category,
                "answer":     answer,
                "sources":    sources,
                "evaluation": ev,
            })

            time.sleep(API_DELAY)

    # 5. 요약 출력
    print_summary(results)

    # 6. JSON 리포트 저장
    report_path = "validate_report.json"
    report = {
        "generated_at":   datetime.now().isoformat(),
        "config": {
            "num_personas":          NUM_PERSONAS,
            "questions_per_persona": QUESTIONS_PER_PERSONA,
        },
        "total_questions": len(results),
        "results":         results,
    }
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    print(f"\n💾 상세 결과 저장: {report_path}")


if __name__ == "__main__":
    main()
