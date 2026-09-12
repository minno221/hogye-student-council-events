# 학생회 행사 사이트

학생회 행사 목록을 보여주고, 클릭하면 학생회가 만든 네이버폼으로 이동하는 사이트입니다.
관리자는 `/admin` 페이지에서 비밀번호로 로그인해서 행사를 등록/수정/삭제할 수 있습니다.

## 폴더 구조

```
app/
  page.tsx                 -> 일반 사용자용 행사 목록 (클릭 시 네이버폼으로 이동)
  admin/page.tsx           -> 관리자 로그인 페이지
  admin/dashboard/page.tsx -> 관리자 대시보드 (행사 등록/수정/삭제)
  api/events/route.ts      -> 행사 목록 조회 / 등록 API
  api/events/[id]/route.ts -> 행사 수정 / 삭제 API
  api/admin/login/route.ts -> 관리자 로그인 / 로그아웃 API
prisma/schema.prisma       -> 데이터베이스 구조 (Event 모델)
middleware.ts              -> 로그인 안 하고 /admin/dashboard 접근 시 막아주는 코드
```

## 로컬에서 실행하는 방법

1. 패키지 설치
   ```
   npm install
   ```

2. `.env.example` 파일을 복사해서 `.env` 파일 만들기
   ```
   cp .env.example .env
   ```
   그리고 `.env` 안의 `DATABASE_URL`을 실제 데이터베이스 주소로 바꿔주세요.
   (예: Vercel Postgres, Supabase, Neon 등에서 무료로 만들 수 있어요)

3. 데이터베이스에 테이블 만들기
   ```
   npx prisma migrate dev --name init
   ```

4. 개발 서버 실행
   ```
   npm run dev
   ```
   브라우저에서 http://localhost:3000 접속

5. 관리자 페이지: http://localhost:3000/admin
   - 비밀번호: `.env`에 설정한 `ADMIN_PASSWORD` (기본값 3587)

## Vercel에 배포하는 방법

1. 이 코드를 GitHub 저장소에 업로드
2. https://vercel.com 에서 "New Project" -> GitHub 저장소 선택
3. Vercel 프로젝트 설정의 Environment Variables에 아래 두 개 추가
   - `DATABASE_URL` : 사용할 Postgres 데이터베이스 주소
   - `ADMIN_PASSWORD` : 관리자 비밀번호 (예: 3587)
4. 배포(Deploy) 클릭하면 끝!

> ⚠️ 주의: `.env` 파일은 절대 깃허브에 올리면 안 됩니다 (`.gitignore`에 이미 포함되어 있어요).
> 비밀번호와 데이터베이스 주소는 항상 Vercel의 Environment Variables에서 설정하세요.

## 다음에 추가하면 좋은 기능
- 행사 이미지 업로드
- 행사 카테고리(분과별) 필터
- 관리자 여러 명 계정 관리 (지금은 비밀번호 1개만 공유하는 방식)
