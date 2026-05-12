# PostMom 데이터 저장 위치 정리

## 1. Supabase Auth — `user_metadata`

Supabase 인증 유저 객체의 `user_metadata` 필드에 저장됩니다.  
읽기: `session.user.user_metadata.*`  
쓰기: `supabase.auth.updateUser({ data: { ... } })`

| 키 | 타입 | 내용 | 저장 시점 |
|---|---|---|---|
| `learning_type` | `string` | 학습 유형 테스트 결과 (e.g. `"competitive"`) | `/learning-test` 결과 저장 시 |
| `onboarding` | `object` | 온보딩 5단계 입력값 전체 | `/onboarding/5` 저장하기 클릭 시 |

### `onboarding` 객체 상세

| 필드 | 타입 | 값 예시 |
|---|---|---|
| `childGrade` | `string` | `"elementary"` \| `"middle"` \| `"high"` |
| `englishLevel` | `string` | `"beginner"` \| `"average"` \| `"advanced"` |
| `difficulties` | `string[]` | `["lacks_interest", "weak_grammar"]` |
| `priorities` | `string[]` | 우선순위 3개 ordered array |
| `classType` | `string` | `"small_group"` \| `"one_on_one"` \| `"no_preference"` |
| `teachingStyle` | `string` | `"fun"` \| `"systematic"` \| `"balanced"` |
| `budgetRange` | `string` | `"under_200"` \| `"200_300"` \| ... \| `"over_500"` |
| `distance` | `string` | `"walking"` \| `"10min"` \| `"20min"` \| `"no_limit"` |
| `trustFactor` | `string` | `"child_enjoys"` \| `"see_improvement"` \| ... |

---

## 2. Supabase DB — 테이블

| 테이블 | 내용 | 주요 컬럼 |
|---|---|---|
| `community_posts` | 커뮤니티 게시글 | `id`, `user_id`, `title`, `content`, `created_at` |
| `community_post_comments` | 댓글 | `id`, `post_id`, `user_id`, `content` |
| `community_post_likes` | 좋아요 | `post_id`, `user_id` |

---

## 3. PostgreSQL (Prisma) — 별도 Express 서버

서버 주소: `VITE_SERVER_URL` (기본값 `http://localhost:3001`)

| 테이블 | 내용 | 주요 컬럼 |
|---|---|---|
| `chat_sessions` | AI 노무상담 세션 | `id`, `user_id`, `created_at` |
| `chat_messages` | 노무상담 메시지 | `id`, `session_id`, `role`, `content` |

---

## 4. localStorage — 브라우저

| 키 | 내용 | 저장 시점 | 만료 |
|---|---|---|---|
| `lastRecommendation` | AI 비교 결과 상위 학원 목록 `[{id, name, rating, matchScore}]` + `savedAt` | `/compare/result` AI 분석 완료 시 | 없음 (수동 삭제 전까지 유지) |

---

## 5. Zustand — 인메모리 (새로고침 시 초기화)

| 스토어 | 파일 | 내용 | 초기화 시점 |
|---|---|---|---|
| `useOnboardingStore` | `src/store/onboardingStore.ts` | 온보딩 진행 중 입력값 임시 저장 | `/onboarding/1` 진입 시 자동 reset |
| `useCompareStore` | `src/store/compareStore.ts` | AI 비교 화면에서 선택한 학원 ID·정보 | 비교 완료 후 수동 clear |
| `useLearningTypeAnimStore` | `src/store/learningTypeAnimStore.ts` | 학습유형 저장 시 애니메이션 트리거 상태 | 애니메이션 종료 후 자동 |

---

## 요약

```
유저 프로필 데이터   →  Supabase user_metadata
커뮤니티 콘텐츠      →  Supabase DB (테이블)
노무상담 대화        →  PostgreSQL + Express 서버
AI 추천 결과 캐시    →  localStorage
온보딩 진행 상태     →  Zustand (임시)
```
