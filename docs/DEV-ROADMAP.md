# 개발 로드맵 (Dev Roadmap)

**작성일:** 2026-04-10  
**참조 PRD:** `PRD-signup-usertype.md`, `PRD-learning-test.md`

> 각 단계는 순서대로 진행. 이전 단계의 산출물을 다음 단계가 의존하므로 순서 변경 금지.

---

## PHASE 0 — 완료된 항목 ✅

> 이미 구현 완료. 건드리지 않음.

| 항목 | 파일 | 상태 |
|---|---|---|
| 학습 유형 테스트 페이지 (인트로 애니메이션, 퀴즈, 결과) | `src/pages/LearningTypeTest.tsx` | ✅ 완료 |
| 학습 유형 공유 데이터 | `src/data/learningTypes.ts` | ✅ 완료 |
| onboardingStore에 learningType 필드 | `src/store/onboardingStore.ts` | ✅ 완료 |
| MyPage 학습유형 select 추가 | `src/pages/MyPage.tsx` | ✅ 완료 |
| primary 색상 초록으로 통일 (index.css, OnboardingLayout, Home) | 전체 | ✅ 완료 |
| CommunityPost 인터페이스에 userType 필드 추가 | `src/data/mockData.ts` | ✅ 완료 |

---

## PHASE 1 — 공유 기반 코드 (Foundation)

> 이후 모든 단계가 의존하는 타입·컴포넌트. **가장 먼저** 만들어야 함.

### 1-1. `src/types/user.ts` 신규 생성
```
UserType 타입, USER_TYPE_META 상수, getUserType() 헬퍼 함수
```

**작업 내용:**
- `UserType = 'student' | 'parent' | 'academy'` 타입 정의
- `USER_TYPE_META` 객체: 각 유형의 label, emoji, desc, badge 정보
- `getUserType(session)` 헬퍼: Supabase 세션에서 userType 추출 (없으면 'student' 기본값)

**완료 기준:** 타입 에러 없이 임포트 가능

---

### 1-2. `src/data/reviewKeywords.ts` 신규 생성
```
유형별 리뷰 키워드 상수
```

**작업 내용:**
- `REVIEW_KEYWORDS.student` — 학생용 키워드 10개
- `REVIEW_KEYWORDS.parent` — 학부모용 키워드 10개
- `REVIEW_KEYWORDS.academy` — (추후 확장용, 현재 빈 배열)

**완료 기준:** export 가능, 타입 안전

---

### 1-3. `src/components/UserTypeBadge.tsx` 신규 생성
```
작성자 유형 뱃지 공통 컴포넌트
```

**작업 내용:**
- `userType` prop을 받아 학부모/학원 뱃지 렌더링
- `student` 또는 undefined이면 null 반환
- 뱃지 스타일: 학부모 = 파란 계열, 학원 = 노란 계열

**완료 기준:** 스토리 없이도 확인 가능한 단순 컴포넌트

---

### 1-4. `src/data/mockData.ts` — communityPosts에 userType 값 추가
```
기존 인터페이스에 이미 userType 필드 추가됨 → 실제 데이터에 값 채우기
```

**작업 내용:**
- `id: '1'` 위례맘123 → `userType: 'parent'`
- `id: '2'` 분당학부모 → `userType: 'parent'`
- `id: '3'` 새내기맘 → `userType: 'student'`

**완료 기준:** 데이터에 userType 값이 존재함

---

## PHASE 2 — 회원가입 플로우 개편

> `src/pages/Signup.tsx` 전면 재작성 + 콜백 수정

### 2-1. `src/pages/Signup.tsx` — STEP 1: 유형 선택 화면
```
기존 단순 폼 → 2단계 구조의 첫 번째 화면
```

**작업 내용:**
- 3개 카드 레이아웃 (학생/일반 🎒, 학부모 👨‍👩‍👧, 학원/기업 🏫)
- 카드 클릭 시 selectedType 상태 저장 후 STEP 2로 자동 전환
- 각 카드: 이모지(크게) + 유형명(bold) + 2줄 설명
- 선택된 카드: `border-primary bg-primary/5`
- 하단: "이미 계정이 있으신가요? 로그인" 링크

**완료 기준:** 3개 카드 클릭 시 상태가 바뀌고 다음 단계로 전환됨

---

### 2-2. `src/pages/Signup.tsx` — STEP 2: 가입 방법 선택 화면
```
유형 선택 후 전환되는 두 번째 화면
```

**작업 내용:**
- 상단: "← 유형 변경" 버튼 (STEP 1으로 복귀)
- 선택된 유형 칩 표시 (이모지 + 유형명)
- [카카오로 시작하기] 버튼 (기존 handleKakaoLogin 재사용)
  - 클릭 전 `localStorage.setItem('pendingUserType', selectedType)` 실행
- 구분선 ("또는")
- 이메일 / 비밀번호 / 비밀번호 확인 폼 (기존 로직 재사용)
  - 학원/기업 유형일 경우 추가 필드 렌더링:
    - 학원명 (선택, text)
    - 사업자 번호 (선택, text)
    - 사업자 등록증 (선택, file)
- [가입하기] 버튼: `signUp({ data: { userType: selectedType } })`
- 가입 성공 후 이동:
  - student/parent → `/onboarding/1`
  - academy → `/`

**완료 기준:** 이메일/카카오 모두 가입 완료 후 유형별 올바른 경로로 이동

---

### 2-3. `src/pages/AuthCallback.tsx` — pendingUserType 처리
```
카카오 OAuth 완료 후 userType을 user_metadata에 저장
```

**작업 내용:**
- 콜백 진입 시 `localStorage.getItem('pendingUserType')` 확인
- 값이 있으면 `supabase.auth.updateUser({ data: { userType } })` 호출
- 저장 후 `localStorage.removeItem('pendingUserType')` 정리
- userType에 따른 이동 경로 분기:
  - student/parent → `/onboarding/1`
  - academy → `/`

**완료 기준:** 카카오 가입 후 user_metadata.userType이 Supabase에 저장되어 있음

---

## PHASE 3 — 마이페이지 유형별 분기

> PHASE 1의 `src/types/user.ts` 완료 후 진행

### 3-1. `src/pages/MyPage.tsx` — userType 읽기 및 조건부 렌더링

**작업 내용:**
- 세션에서 `getUserType(session)` 호출하여 userType 확인
- **관리자 대시보드 버튼**: `userType === 'academy'`일 때만 표시 (현재는 무조건 표시됨 → 수정)
- **학습 유형 select**: `userType === 'student' || 'parent'`일 때만 표시 (`academy`는 숨김)
- **프로필 카드에 유형 뱃지 표시**: 학부모/학원 뱃지 `<UserTypeBadge>` 노출
  - 위치: 이름 옆 or 카드 우상단 코너

**완료 기준:**
- 학원 계정 → 대시보드 버튼 보임, 학습유형 select 숨김
- 학부모 계정 → 대시보드 버튼 없음, 학부모 뱃지 보임
- 학생 계정 → 대시보드 버튼 없음, 뱃지 없음

---

## PHASE 4 — 커뮤니티 뱃지 적용

> PHASE 1의 `UserTypeBadge` 컴포넌트 완료 후 진행

### 4-1. `src/pages/CommunityHome.tsx` — 피드 작성자 뱃지

**작업 내용:**
- 게시글 카드의 작성자(author) 이름 옆에 `<UserTypeBadge userType={post.userType} />` 추가
- mock 데이터 기준으로 학부모 뱃지 실제로 노출되는지 확인

**완료 기준:** 피드에서 학부모 게시글에 뱃지 표시됨

---

### 4-2. `src/pages/CommunityPost.tsx` — 게시글 상세 작성자 뱃지

**작업 내용:**
- 게시글 상세 헤더의 작성자 이름 옆에 `<UserTypeBadge userType={post.userType} />` 추가

**완료 기준:** 상세 페이지에서도 뱃지 표시됨

---

## PHASE 5 — 리뷰 작성 키워드 분기 (미래 작업)

> 리뷰 작성 기능 구현 시 진행. 현재는 작성 UI가 없으므로 PHASE 4 완료 후 별도 일정.

### 5-1. 리뷰 작성 UI 신규 개발
- 작성자 userType에 따라 `REVIEW_KEYWORDS.student` 또는 `REVIEW_KEYWORDS.parent` 키워드 렌더링
- 커뮤니티 글쓰기 폼에서 키워드 멀티셀렉트
- 작성 완료 후 `userType`을 게시글 데이터에 포함하여 저장

---

## 전체 순서 요약

```
PHASE 1  →  PHASE 2  →  PHASE 3  →  PHASE 4  →  PHASE 5
기반 코드     회원가입      마이페이지     커뮤니티뱃지    리뷰작성
(타입/컴포넌트  (Signup,      (조건부UI)    (뱃지 노출)    (추후)
 /키워드)      AuthCallback)
```

---

## 작업 체크리스트

### PHASE 1
- [x] `src/types/user.ts` 생성
- [x] `src/data/reviewKeywords.ts` 생성
- [x] `src/components/UserTypeBadge.tsx` 생성
- [x] `src/data/mockData.ts` — communityPosts userType 값 채우기

### PHASE 2
- [x] `Signup.tsx` STEP 1 — 유형 선택 카드 UI
- [x] `Signup.tsx` STEP 2 — 가입 방법 + 학원 추가 필드
- [x] `AuthCallback.tsx` — pendingUserType 처리

### PHASE 3
- [x] `MyPage.tsx` — 대시보드 버튼 조건부 렌더링
- [x] `MyPage.tsx` — 학습유형 select 조건부 렌더링
- [x] `MyPage.tsx` — 유형 뱃지 표시

### PHASE 4
- [x] `CommunityHome.tsx` — 작성자 뱃지 추가
- [x] `CommunityPost.tsx` — 작성자 뱃지 추가

### PHASE 5
- [x] `mockData.ts` Academy.reviews에 userType 필드 추가
- [x] `AcademyDetail.tsx` 리뷰 작성 UI 개발 (별점, 키워드, 텍스트, 제출)
- [x] 유형별 키워드 멀티셀렉트 (REVIEW_KEYWORDS 연동)
- [x] 기존 리뷰에 UserTypeBadge 표시
- [x] 로그인 상태 체크 (비로그인 시 작성 버튼 → 로그인 링크)
