# 📋 포트폴리오 웹사이트 마스터 플랜
> **최종 업데이트:** 2026-03-24
> **프로젝트:** Apple Folder Style + Accordion File Folder Portfolio
> **도메인:** gun-hee.com

---

## 🎯 프로젝트 개요
전남대학교 인공지능학부 김건희 학생의 대학생활 포트폴리오 웹사이트.
- **감성:** 애플 OS 폴더 스타일 + 아코디언 서류첩
- **핵심 기능:** Glassmorphism UI, 물리적 서류첩 애니메이션, GitHub README 연동

---

## 📐 Phase 구분

### Phase 1: Vercel 정적 배포 (현재 구축 상태)
- [x] 프로젝트 구조 설계
- [x] Next.js App Router 프로젝트 초기화 (`frontend/` 폴더 - Vercel Root Directory 설정)
- [x] Tailwind CSS + Framer Motion 설정
- [x] 통일 데이터 스키마 정의 (`public/data.json`)
- [x] 메인 페이지 (`/`) 구현: 중앙 통제형 버튼 2개 `[포트폴리오 보러가기]`, `[내용 추가하기]`
- [x] 포트폴리오 뷰 (`/portfolio`) 구현
  - [x] 사진 같은 느낌의 물리적 서류첩 2개 UI (날짜별 / 목적별 선택)
  - [x] 하위 항목 아코디언 서류첩(Expanding File Folder) 스르륵 펼쳐지는 애니메이션
  - [x] Activity Block (Quick Look 이미지/증거자료 모달 확대)
  - [x] 사이드바 통계 (선택 폴더 기반 수상횟수, 포지션 참여횟수 등 요약)
- [x] Admin 페이지 (`/admin` - 🚧 Vercel 환경에서는 자동 리다이렉트 차단)
  - [x] Step 1: 자동 년도/학기 리스트업, [추가하기]로 직접 텍스트 생성 기능
  - [x] Step 1-1: Backend/Frontend 등 역할 다중 선택 창 (+ [역할 추가하기] 무한 생성)
  - [x] Step 2: 제목 작성, 사진+증거자료 업로드, 토글식 수상 제목 입력, GitHub URL, 느낀점
  - [x] Validation: 내용 누락 시 [다음]/[작성 완료] 버튼 비활성화 (필요없는 옵션 제외)
- [x] 환경변수 분기 처리 (`NEXT_PUBLIC_IS_VERCEL`)
- [x] GitHub README Route Handler (서버리스 1~2시간 캐싱 방어)

### Phase 2: 로컬 서버 배포 (LOCAL 모드)
- [x] FastAPI 백엔드 구축 (`backend/`)
- [x] MySQL 스키마 생성 (`years`, `activities`, `activity_roles`, `activity_files`)
- [x] 최상위 테이블 '년도' 외래키 참조 구조 컴플라이언스
- [x] `/api/portfolio` GET/POST/PUT
- [x] 업로드 사진 물리적 백엔드 스토리지 저장 및 텍스트 URL 연동
- [x] Static Files 마운트
- [x] GitHub README 비동기 업데이트 (서버 구동 시 BackgroundTasks 즉시 갱신)
- [x] Cloudflare Tunnel 설정 스크립트 (gun-hee.com 도메인 ↔ 로컬 8000/3000포트 연동)

### Phase 3: Oracle Cloud 배포 (ORACLE 모드)
- [x] APScheduler 연동 (매일 자정 24시 GitHub 자동 업데이트)
- [x] Rate Limit 어뷰징 방어를 위한 `asyncio.sleep(2)`
- [ ] OCI(Oracle Cloud) 실서버 구동 + 모니터링 세팅

---

## 🚀 배포 및 인프라 가이드

### 1. Vercel 배포 시 설정 항목
- 본 저장소를 Vercel에 연동 시 **`Root Directory`를 `frontend`로 지정**하거나 루트 경로에 있는 `vercel.json`을 활성화하면 즉시 배포 가능합니다.
- Vercel Environment Variables:
  - `NEXT_PUBLIC_IS_VERCEL=true` (필수)

### 2. GitHub Token 발급 시 필요 범위 (Scopes)
GitHub README 데이터를 끌어오기 위해 토큰 발급 시 다음 환경을 고려하세요:
- **Public Repository 전용**: 별도의 권한(Scope) 체크 없이 빈 토큰 발급 후 로드 가능 (Rate Limit 증가용)
- **Private Repository 혼용**: `repo` 스코프의 전체 체크 필수. (보안상 Private을 함께 공유할 경우 API 호출 시 인증이 필요하므로)
- **발급 경로**: GitHub -> Settings -> Developer Settings -> Personal Access Tokens (Tokens (classic) 추천) -> Generate new token.

---

## 📊 통일 데이터 스키마 (JSON & DB 공용)

```typescript
interface Activity {
  id: string;              // UUID
  year: number;            // 예: 2024
  term: string;            // "1학기" | "여름방학" | "2학기" | "겨울방학"
  category: string;        // "프로젝트" | "대회" | "캡스톤" | "캠프" 등
  roles: string[];         // ["Backend", "Data Engineer"]
  title: string;
  is_awarded: boolean;
  award_title: string | null;
  github_url: string | null;
  readme_content: string | null;
  reflection: string;
  images: string[];        // 이미지 파일 경로 배열
  certificates: string[];  // 증거 자료 파일 경로 배열
}
```

---

## 🗂 DB 테이블 구조 (Phase 2/3)

```sql
-- 1. years 테이블
CREATE TABLE years (
  id INT AUTO_INCREMENT PRIMARY KEY,
  year_value INT NOT NULL UNIQUE
);

-- 2. activities 테이블
CREATE TABLE activities (
  id VARCHAR(36) PRIMARY KEY,  -- UUID
  year_id INT NOT NULL,
  term VARCHAR(20) NOT NULL,
  category VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  is_awarded BOOLEAN DEFAULT FALSE,
  award_title VARCHAR(200) NULL,
  github_url VARCHAR(500) NULL,
  readme_content TEXT NULL,
  reflection TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (year_id) REFERENCES years(id) ON DELETE CASCADE
);

-- 3. activity_roles 테이블
CREATE TABLE activity_roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  activity_id VARCHAR(36) NOT NULL,
  role_name VARCHAR(100) NOT NULL,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
);

-- 4. activity_files 테이블
CREATE TABLE activity_files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  activity_id VARCHAR(36) NOT NULL,
  file_type ENUM('image', 'certificate') NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
);
```

---

## 🌐 API 엔드포인트 (Phase 2/3)

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/portfolio` | 전체 포트폴리오 데이터 조회 (트리 구조 JSON) |
| POST | `/api/portfolio` | 새 활동 추가 (multipart/form-data) |
| PUT | `/api/portfolio/{id}` | 특정 활동 수정 |
| GET | `/api/readme/{id}` | GitHub README 조회 (캐시) |

---

## 📁 프로젝트 디렉토리 구조

```
this-is-my-portfolio/
├── frontend/                    # Next.js App
│   ├── public/
│   │   ├── data.json           # Phase 1 더미 데이터
│   │   └── images/             # Phase 1 더미 이미지
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx        # 메인 페이지
│   │   │   ├── portfolio/
│   │   │   │   └── page.tsx    # 포트폴리오 뷰
│   │   │   ├── admin/
│   │   │   │   └── page.tsx    # Admin 페이지
│   │   │   └── api/
│   │   │       └── readme/
│   │   │           └── route.ts # GitHub README Route Handler
│   │   ├── components/
│   │   │   ├── ui/             # 공통 UI 컴포넌트
│   │   │   ├── portfolio/      # 포트폴리오 관련 컴포넌트
│   │   │   └── admin/          # Admin 관련 컴포넌트
│   │   ├── contexts/           # React Context
│   │   ├── hooks/              # Custom Hooks
│   │   ├── lib/                # 유틸리티 함수
│   │   └── types/              # TypeScript 타입 정의
│   ├── tailwind.config.ts
│   ├── next.config.ts
│   └── package.json
├── backend/                     # FastAPI (Phase 2/3)
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── database.py
│   ├── routers/
│   │   └── portfolio.py
│   ├── services/
│   │   └── github_readme.py
│   ├── uploads/
│   │   ├── images/
│   │   └── certificates/
│   ├── requirements.txt
│   └── .env
├── infra/
│   ├── cloudflare-tunnel.sh    # Cloudflare Tunnel 설정 스크립트
│   └── mysql-init.sql          # DB 초기화 SQL
├── MASTER_PLAN.md              # ← 이 파일 (마스터 플랜)
└── README.md
```

---

## 🔑 환경변수

### Frontend (.env.local)
```env
NEXT_PUBLIC_IS_VERCEL=true      # Vercel 환경 여부
NEXT_PUBLIC_API_URL=            # Phase 2/3에서 백엔드 URL
```

### Backend (.env)
```env
PHASE=LOCAL                     # LOCAL | ORACLE
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=portfolio
GITHUB_TOKEN=                   # GitHub API 토큰 (선택)
```

---

## 🔄 이어하기 가이드

> **컨텍스트가 초기화된 경우**, 이 파일(`MASTER_PLAN.md`)을 읽고 아래 체크리스트의 상태를 확인하세요.
> 완료된 항목(`[x]`)은 건너뛰고, 진행 중(`🔨`)인 항목부터 이어서 작업합니다.

### 빠른 복구 순서:
1. `MASTER_PLAN.md` 읽기 → 현재 Phase/진행 상황 파악
2. `frontend/package.json` 확인 → 프로젝트 초기화 여부
3. `frontend/src/app/` 확인 → 페이지 구현 상태
4. `public/data.json` 확인 → 더미 데이터 존재 여부
5. `backend/main.py` 확인 → 백엔드 구현 상태

---

## 📝 변경 이력

| 날짜 | 변경 사항 |
|------|-----------|
| 2026-03-24 | 초기 마스터 플랜 작성 |
