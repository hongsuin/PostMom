# PostMom Web — 페이지 맵

> `postmom-web` 프로젝트의 URL → 파일 위치 매핑

---

## 라우터 설정
`src/App.tsx`

---

## 페이지 목록

### 공통 (레이아웃 없음)

| URL | 파일 | 설명 |
|-----|------|------|
| `/` | `src/pages/Home.tsx` | 랜딩 페이지 |
| `/login` | `src/pages/Login.tsx` | 로그인 |
| `/signup` | `src/pages/Signup.tsx` | 회원가입 |
| `/consult/complete` | `src/pages/ConsultComplete.tsx` | 상담 신청 완료 |
| `/compare/result` | `src/pages/AICompareResult.tsx` | AI 비교 결과 |

---

### 학원 탐색 (UserLayout)

| URL | 파일 | 설명 |
|-----|------|------|
| `/academies` | `src/pages/AcademyList.tsx` | 학원 목록 + 필터 |
| `/academies/:id` | `src/pages/AcademyDetail.tsx` | 학원 상세 페이지 |
| `/compare` | `src/pages/AICompare.tsx` | AI 비교할 학원 선택 |
| `/consult/:id` | `src/pages/ConsultRequest.tsx` | 상담 신청 폼 |
| `/leveltest/:id` | `src/pages/LevelTestRequest.tsx` | 레벨테스트 신청 폼 |

---

### 커뮤니티 (UserLayout)

| URL | 파일 | 설명 |
|-----|------|------|
| `/community` | `src/pages/CommunityHome.tsx` | 커뮤니티 피드 |
| `/community/:id` | `src/pages/CommunityPost.tsx` | 게시글 상세 + 댓글 |

---

### 마이페이지 (UserLayout)

| URL | 파일 | 설명 |
|-----|------|------|
| `/mypage` | `src/pages/MyPage.tsx` | 사용자 프로필 + 메뉴 |

---

### 온보딩 (레이아웃 없음)

| URL | 파일 | 설명 |
|-----|------|------|
| `/onboarding/1` | `src/features/onboarding/pages/OnboardingStep1.tsx` | 학년 / 영어 수준 / 어려운 점 |
| `/onboarding/2` | `src/features/onboarding/pages/OnboardingStep2.tsx` | 학습 우선순위 |
| `/onboarding/3` | `src/features/onboarding/pages/OnboardingStep3.tsx` | 학습 스타일 |
| `/onboarding/4` | `src/features/onboarding/pages/OnboardingStep4.tsx` | 예산 / 거리 |
| `/onboarding/5` | `src/features/onboarding/pages/OnboardingStep5.tsx` | 신뢰 요소 |
| `/onboarding/loading` | `src/features/onboarding/pages/OnboardingLoading.tsx` | AI 분석 중 로딩 |

---

### 어드민 (AdminLayout)

| URL | 파일 | 설명 |
|-----|------|------|
| `/admin` | `src/features/admin/pages/AdminDashboard.tsx` | 대시보드 (통계 + 최근 상담) |
| `/admin/leads` | `src/features/admin/pages/AdminLeadList.tsx` | 상담 요청 전체 목록 |
| `/admin/leads/:id` | `src/features/admin/pages/AdminLeadDetail.tsx` | 상담 요청 상세 |
| `/admin/profile` | `src/features/admin/pages/AdminProfile.tsx` | 어드민 계정 설정 |
| `/admin/credit` | `src/features/admin/pages/AdminCredit.tsx` | 크레딧 / 결제 관리 |

---

## 레이아웃 파일

| 파일 | 적용 범위 |
|------|-----------|
| `src/layouts/UserLayout.tsx` | `/academies`, `/compare`, `/community`, `/mypage` |
| `src/layouts/AdminLayout.tsx` | `/admin/*` 전체 |
| `src/layouts/SiteHeader.tsx` | UserLayout 내부 헤더 |
| `src/layouts/Header.tsx` | 모바일 헤더 (ConsultRequest, LevelTestRequest) |
| `src/layouts/BottomNav.tsx` | UserLayout 하단 네비게이션 |

---

## 주요 유틸리티

| 파일 | 역할 |
|------|------|
| `src/store/onboardingStore.ts` | 온보딩 전역 상태 (Zustand) — AI 비교에도 사용 |
| `src/data/mockData.ts` | 학원 목록 / 커뮤니티 게시글 / 어드민 상담 데이터 |

---

## 온보딩 공용 컴포넌트

| 파일 | 역할 |
|------|------|
| `src/features/onboarding/components/OnboardingLayout.tsx` | 온보딩 공통 래퍼 (진행 표시 등) |
| `src/features/onboarding/components/StepCard.tsx` | 선택지 카드 컴포넌트 |
