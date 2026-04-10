# PRD: 회원 유형 선택 및 유형별 기능 분기

**작성일:** 2026-04-10  
**관련 파일:**
- `src/pages/Signup.tsx` — 회원가입 폼
- `src/pages/Login.tsx` — 로그인
- `src/pages/MyPage.tsx` — 마이페이지
- `src/pages/CommunityHome.tsx`, `CommunityPost.tsx` — 커뮤니티/리뷰
- `src/store/onboardingStore.ts` — 유저 상태 저장
- `src/lib/supabase.ts` — Auth

---

## 1. 개요

회원가입 시 **3가지 유형 중 하나를 먼저 선택**하고, 유형에 따라 리뷰 뱃지·키워드·마이페이지 구성이 달라진다.  
디자인은 현재 서비스 디자인 시스템(Tailwind, 초록색 primary `hsl(130 79% 41%)`, rounded-2xl 카드)을 그대로 사용한다.

---

## 2. 회원 유형 정의

| 유형 키 | 표시 이름 | 이모지 | 한 줄 설명 |
|---|---|---|---|
| `student` | 학생 / 일반 | 🎒 | 리뷰 확인 및 학원 검색 |
| `parent` | 학부모 | 👨‍👩‍👧 | 우리 아이 학원 찾기 |
| `academy` | 학원 / 기업 | 🏫 | 학원 프로필 관리 및 리드 확인 |

---

## 3. 회원가입 플로우

```
[신규 진입 /signup]
       ↓
[STEP 1] 유형 선택 화면 (/signup 또는 /signup/type)
  └─ 학생/일반 / 학부모 / 학원·기업  카드 3개
       ↓ 카드 클릭
[STEP 2] 가입 방법 선택
  ├─ 일반 가입 → 이메일/비밀번호 폼 (기존 Signup 폼 재사용)
  └─ 카카오로 시작하기 → Kakao OAuth (기존 handleKakaoLogin 재사용)
       ↓
[Supabase user_metadata에 userType 저장]
       ↓
온보딩(/onboarding/1) 또는 홈(/)으로 이동
```

### 핵심 원칙
- **유형 선택 → 가입 방법** 순서 고정 (유형을 먼저 확정 후 가입)
- 카카오 OAuth의 경우: OAuth 완료 후 AuthCallback에서 `userType`을 `user_metadata`에 업서트
- 유형은 `Supabase user_metadata.userType`에 저장해 세션 어디서든 읽을 수 있도록

---

## 4. STEP 1 — 유형 선택 화면 UI

### 레이아웃
레퍼런스 이미지(별별선생) 스타일을 현재 디자인 언어로 재해석:

```
┌────────────────────────────────────────────────────┐
│                                                    │
│  [로고]                                            │
│                                                    │
│  회원가입                                           │
│  본인이 해당하시는 유형을 선택해주세요.               │
│                                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │    🎒    │  │  👨‍👩‍👧   │  │    🏫    │         │
│  │          │  │          │  │          │         │
│  │ 학생/일반 │  │  학부모   │  │ 학원/기업 │         │
│  │          │  │          │  │          │         │
│  │ 리뷰 작성  │  │ 학부모    │  │ 학원 프로  │         │
│  │ 및 학원   │  │ 뱃지로    │  │ 필 관리 및  │         │
│  │ 검색      │  │ 신뢰도 UP │  │ 리드 확인  │         │
│  └──────────┘  └──────────┘  └──────────┘         │
│                                                    │
│  이미 계정이 있으신가요?  [로그인]                    │
│                                                    │
└────────────────────────────────────────────────────┘
```

### 카드 컴포넌트 스펙
- 클릭 시 `selected` 상태로 `border-primary bg-primary/5` 적용
- 기본: `border-slate-200 bg-white`
- 각 카드: 이모지(큰) + 유형명(bold) + 2줄 설명 + "선택하기" 표시(hover/selected)
- 카드 클릭 → `selectedType` state 업데이트 → 자동으로 STEP 2로 전환

---

## 5. STEP 2 — 가입 방법 선택 UI

유형 선택 후 같은 페이지 내에서 슬라이드 or 페이드로 전환.

```
┌────────────────────────────────────────────────┐
│  ← 유형 변경                                    │
│                                                │
│  선택된 유형: 👨‍👩‍👧 학부모                       │
│                                                │
│  [카카오로 시작하기]  (노란 버튼)                │
│                                                │
│  ──────── 또는 ────────                        │
│                                                │
│  이메일     [____________]                      │
│  비밀번호   [____________]                      │
│  비밀번호 확인 [____________]                    │
│                                                │
│  [가입하기]                                     │
│                                                │
│  이미 계정이 있으신가요? [로그인]                 │
└────────────────────────────────────────────────┘
```

---

## 6. 유저 유형 저장 방식

### Supabase user_metadata
```typescript
// 이메일 가입 시
await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { userType: selectedType }  // 'student' | 'parent' | 'academy'
  }
});

// 카카오 가입 시 → AuthCallback.tsx에서 처리
// OAuth 완료 후 session 확인 → user_metadata에 userType 없으면 업서트
await supabase.auth.updateUser({
  data: { userType: pendingUserType }  // localStorage에서 임시 저장한 값 읽기
});
```

### localStorage 임시 저장 (카카오 OAuth용)
```typescript
// STEP 1 카드 클릭 → 카카오 버튼 클릭 시
localStorage.setItem('pendingUserType', selectedType);

// AuthCallback.tsx에서
const pendingType = localStorage.getItem('pendingUserType');
if (pendingType) {
  await supabase.auth.updateUser({ data: { userType: pendingType } });
  localStorage.removeItem('pendingUserType');
}
```

### 읽기 (앱 전체에서)
```typescript
const userType = session?.user?.user_metadata?.userType as 'student' | 'parent' | 'academy' | undefined;
```

---

## 7. 유형별 기능 분기

### 7-1. 리뷰 뱃지

리뷰 작성자 이름 옆에 유형별 뱃지 표시:

| 유형 | 뱃지 | 스타일 |
|---|---|---|
| `student` | (없음) | — |
| `parent` | 👨‍👩‍👧 학부모 | `bg-blue-50 text-blue-600 border border-blue-200` |
| `academy` | 🏫 학원 | `bg-amber-50 text-amber-600 border border-amber-200` |

**적용 위치:**
- `CommunityHome.tsx` — 피드의 작성자 정보
- `CommunityPost.tsx` — 게시글 상세의 작성자 정보
- (미래) 리뷰 작성 완료 후 본인 뱃지 표시

---

### 7-2. 리뷰 작성 키워드 (유형별 차별화)

리뷰 작성 시 선택할 수 있는 키워드 태그가 유형별로 다름:

#### 학생/일반 (`student`) 키워드
```
수업 분위기  선생님  난이도  가격  위치  시설  친구들  자기주도  성적향상  재미있어요
```

#### 학부모 (`parent`) 키워드
```
관리가 잘 돼요  숙제량 적당  피드백 꼼꼼  선생님 친절  커리큘럼 체계적
진도 빨라요  성적 올랐어요  학부모 소통  비용 대비 만족  시설 깔끔
```

> 키워드는 `src/data/reviewKeywords.ts`에 유형별로 분리 관리

---

### 7-3. 마이페이지 구성 분기

| 구성 요소 | 학생/일반 | 학부모 | 학원/기업 |
|---|---|---|---|
| 프로필 카드 (이름, 이메일) | ✅ | ✅ | ✅ |
| 학습 유형 select | ✅ | ✅ | ❌ |
| 상담 내역 | ✅ | ✅ | ✅ |
| 내 게시글 | ✅ | ✅ | ✅ |
| 알림 설정 | ✅ | ✅ | ✅ |
| 관리자 대시보드 버튼 | ❌ | ❌ | ✅ |
| 유형 뱃지 표시 | ❌ | 👨‍👩‍👧 학부모 | 🏫 학원 |

**현재 `MyPage.tsx`의 관리자 버튼** → `userType === 'academy'` 일 때만 렌더링

---

## 8. 변경 파일 목록

| 파일 | 변경 내용 |
|---|---|
| `src/pages/Signup.tsx` | STEP1(유형선택) + STEP2(가입폼) 2단계 구조로 전면 개편 |
| `src/pages/AuthCallback.tsx` | localStorage의 `pendingUserType` 읽어서 user_metadata 업서트 추가 |
| `src/pages/MyPage.tsx` | userType 읽어 관리자 버튼 조건부 렌더링, 유형 뱃지 표시 |
| `src/pages/CommunityHome.tsx` | 작성자 유형 뱃지 렌더링 |
| `src/pages/CommunityPost.tsx` | 작성자 유형 뱃지 렌더링 |
| `src/data/reviewKeywords.ts` | 신규 생성 — 유형별 리뷰 키워드 상수 |
| `src/types/user.ts` | 신규 생성 — `UserType` 타입, `getUserType()` 헬퍼 |

---

## 9. 타입 정의

```typescript
// src/types/user.ts
export type UserType = 'student' | 'parent' | 'academy';

export const USER_TYPE_META = {
  student: {
    label: '학생 / 일반',
    emoji: '🎒',
    desc: '리뷰를 작성하고 학원을 검색해요',
    badge: null,
  },
  parent: {
    label: '학부모',
    emoji: '👨‍👩‍👧',
    desc: '학부모 뱃지로 신뢰도 있는 리뷰를 남겨요',
    badge: { label: '학부모', style: 'bg-blue-50 text-blue-600 border border-blue-200' },
  },
  academy: {
    label: '학원 / 기업',
    emoji: '🏫',
    desc: '학원 프로필을 관리하고 리드를 확인해요',
    badge: { label: '학원', style: 'bg-amber-50 text-amber-600 border border-amber-200' },
  },
} as const;

// Supabase session에서 userType 추출하는 헬퍼
export function getUserType(session: Session | null): UserType {
  return (session?.user?.user_metadata?.userType as UserType) ?? 'student';
}
```

---

## 10. 미결 사항

| 항목 | 결정 필요 |
|---|---|
| 가입 후 이동 경로 | 온보딩(`/onboarding/1`) vs 바로 홈(`/`) — 유형별로 다르게? |
| 유형 변경 가능 여부 | 마이페이지에서 유형 변경 허용? (특히 `academy` → `parent` 등) |
| 학원 가입 추가 정보 | 학원명, 사업자번호 등 추가 입력 필드 필요 여부 |
| 커뮤니티 뱃지 데이터 | 현재 mock 데이터에 `userType` 필드 없음 → 추가 필요 |
