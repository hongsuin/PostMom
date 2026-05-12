# Express 백엔드 API 전환 계획서

## 1) 목표

현재 프론트에서 Supabase를 직접 호출하는 구조를,
Express 백엔드 API를 통해 호출하는 구조로 전환한다.

핵심 목표:

- 인증/인가 로직 중앙화
- 비즈니스 로직 서버 집중
- 클라이언트에서 직접 DB 접근 축소
- 추후 확장(로깅, 캐싱, 권한, 감사 추적) 용이성 확보

---

## 2) 권장 기술 스택

### Runtime / Framework

- Node.js (LTS)
- Express.js
- TypeScript (권장)

### Database / ORM

- PostgreSQL (Supabase DB 계속 사용 가능)
- Prisma ORM

### Auth

- Supabase Auth JWT 검증
  - 서버에서 `Authorization: Bearer <token>` 검증
  - 사용자 식별자(`userId`)를 req 컨텍스트로 주입

### Validation / Security

- Zod (요청 body/query/params 검증)
- Helmet (보안 헤더)
- CORS (허용 도메인 제한)
- Rate Limiting (`express-rate-limit`)
- dotenv (환경변수 관리)

### Logging / Monitoring

- Pino 또는 Winston (구조화 로그)
- Request ID 미들웨어
- Error tracking (Sentry 선택)

### API 문서 / 품질

- OpenAPI(Swagger)
- ESLint + Prettier
- 테스트: Vitest/Jest + Supertest

---

## 3) 아키텍처 제안

```text
src/
  app.ts                 # express app 구성
  server.ts              # 서버 실행 엔트리
  config/                # env, constants
  middlewares/           # auth, error, validate, logger
  modules/
    auth/
    community/
      community.controller.ts
      community.service.ts
      community.repository.ts
      community.routes.ts
      community.schema.ts
  lib/
    prisma.ts
    supabase.ts
  types/
```

레이어 원칙:

- Controller: HTTP 입출력 변환
- Service: 비즈니스 로직
- Repository: DB 접근
- Middleware: 공통 처리(auth/validation/error)

---

## 4) 진행 순서 (권장)

### Phase 0. 준비

1. 백엔드 브랜치 생성
2. 환경변수 설계 (`.env.example`)
3. 기본 서버 템플릿 구성 (health check, error handler)

산출물:

- 서버 부팅 가능
- `/health` 동작

### Phase 1. 공통 기반

1. 인증 미들웨어 구현 (JWT 검증)
2. 공통 에러 포맷 정의
3. 요청 검증 미들웨어(Zod) 적용
4. 로깅/코릴레이션 ID 도입

산출물:

- 인증 필요한 라우트 보호 가능
- 에러/로그 형식 통일

### Phase 2. 커뮤니티 API 전환

1. 게시글 API
   - GET `/api/community/posts`
   - GET `/api/community/posts/:id`
   - POST `/api/community/posts`
   - PATCH `/api/community/posts/:id`
   - DELETE `/api/community/posts/:id`
2. 댓글 API
   - GET `/api/community/posts/:id/comments`
   - POST `/api/community/posts/:id/comments`
   - DELETE `/api/community/comments/:commentId`
3. 좋아요 API
   - POST `/api/community/posts/:id/likes` (토글 또는 생성)
   - DELETE `/api/community/posts/:id/likes`

산출물:

- 프론트의 `communityStore`가 Express API만 호출

### Phase 3. 프론트 연동

1. Supabase direct 호출 제거
2. API client(axios/fetch wrapper) 통합
3. 에러 UX 정리(401/403/500)

산출물:

- 브라우저에서 DB 직접 접근 없음(커뮤니티 기준)

### Phase 4. 품질 보강

1. 단위/통합 테스트 작성
2. OpenAPI 문서화
3. 성능/보안 점검
4. 배포 파이프라인(Dev/Prod) 정리

산출물:

- 운영 가능한 수준의 API 품질 확보

---

## 5) API 설계 체크포인트

- 인증 없이 가능한 것과 필요한 것 명확히 분리
- 소유권 검증(작성자만 수정/삭제)
- 페이지네이션(목록 API)
- 정렬 기준(createdAt desc)
- 검색/필터(region, keyword)
- 응답 스키마 일관성 유지 (`{ data, error, meta }` 등)
- 에러 코드 표준화 (`UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND` 등)

---

## 6) 보안 체크리스트

- [ ] CORS origin 화이트리스트
- [ ] Helmet 적용
- [ ] Rate limit 적용
- [ ] 입력값 검증(Zod)
- [ ] SQL Injection 방지(ORM 파라미터 바인딩)
- [ ] 민감정보 로그 마스킹
- [ ] JWT 만료/무효 토큰 처리
- [ ] 권한 없는 수정/삭제 차단
- [ ] 에러 메시지 과다노출 방지

---

## 7) 데이터/권한 체크리스트

- [ ] 게시글 생성 시 userId 저장
- [ ] 익명/비로그인 정책 명확화(browserId 유지 여부)
- [ ] 댓글/좋아요 중복 정책 정의
- [ ] 삭제 시 연관 데이터 처리(cascade) 확인
- [ ] 마이그레이션 롤백 전략 수립

---

## 8) 테스트 체크리스트

- [ ] health check 통과
- [ ] 인증 성공/실패 케이스
- [ ] 게시글 CRUD 정상 동작
- [ ] 본인 글만 수정/삭제 가능
- [ ] 댓글 CRUD 정상 동작
- [ ] 좋아요 중복/토글 정책 검증
- [ ] 잘못된 입력(400) 처리
- [ ] 서버 예외(500) 처리
- [ ] 동시성 시나리오(좋아요/댓글 카운트) 검증

---

## 9) 배포 체크리스트

- [ ] 환경변수 주입 확인
- [ ] DB 연결 상태 확인
- [ ] CORS 도메인 설정 확인
- [ ] 로그/모니터링 연동 확인
- [ ] 스모크 테스트(핵심 API 호출) 완료
- [ ] 롤백 절차 문서화

---

## 10) Done 정의 (DoD)

- [ ] 커뮤니티 기능이 Express API 기반으로 전환됨
- [ ] 프론트에서 Supabase direct write 제거됨
- [ ] 인증/권한 검증이 서버에서 일관 적용됨
- [ ] 주요 API 테스트 자동화 완료
- [ ] 운영 환경에서 모니터링/에러추적 가능

## 11) 주요 리스크

- [ ] Service Role Key 사용 시 RLS 우회 위험
- [ ] 기존 Supabase direct 호출 잔존 가능성
- [ ] 권한 검증 누락 시 임의 수정/삭제 가능
- [ ] 좋아요/댓글 카운트 동시성 문제
- [ ] 프론트/백엔드 응답 스키마 불일치

## 12) 우선 결정 필요 사항

- [ ] 비로그인 사용자 정책
- [ ] 좋아요 토글 vs 명시적 생성/삭제
- [ ] 게시글 삭제 방식: hard delete vs soft delete
- [ ] Supabase RLS 유지 여부
- [ ] API 응답 표준
