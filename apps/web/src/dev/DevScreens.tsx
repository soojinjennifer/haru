/**
 * `/__dev/screens` — **검수용 화면 목록** (dev 전용).
 *
 * UI Gallery(`/__dev/ui/*`)가 컴포넌트·토큰 검사 도구인 것과 달리, 이 화면은 **지금까지 만든
 * 제품 화면을 클릭해서 돌아보기 위한 색인**이다. gallery 셸(`GalleryLayout`) 밖의 독립 화면이다 —
 * 목록에서 제품 화면으로 떠나고 뒤로 돌아오는 쓰임이라 gallery 상단 내비게이션이 끼면 방해된다.
 *
 * 진입은 **주소 입력**이다 (`http://localhost:5173/__dev/screens`). gallery 상단 내비게이션에
 * 링크를 추가하지 않았다 — chip 이 하나 늘면 sticky nav 가 한 줄 더 접히고, 그 밑으로 스크롤되는
 * 컴포넌트 영역 screenshot(V-5 · V-9)이 달라져 baseline 3건이 깨진다. baseline 재생성은
 * 이 작업 범위가 아니다.
 *
 * **Production 빌드에 들어가지 않는다.** `app/router.tsx` 가 `import.meta.env.DEV` 가드 +
 * 동적 import 로만 불러오므로 이 모듈 그래프 전체가 산출물에서 사라진다 (AC-1-42).
 * 검증: `pnpm assert:no-mocks`.
 *
 * 경로 문자열을 `shared/config/routes.ts` 에 두지 않는다 — 그 객체는 Production 번들에 남는다
 * (같은 파일 주석). dev 경로는 가드 안쪽(router.tsx)과 이 파일에만 있다.
 *
 * 스타일은 Tailwind 유틸리티가 아니라 `dev.css` 의 평문 CSS 다 (Tailwind 는 소스를 스캔하므로
 * 유틸리티를 쓰면 클래스가 Production CSS 에 남는다 — `dev.css` 머리말).
 *
 * 이 화면의 문구는 **dev 전용 검수 도구 문구**이며 제품 copy 모듈 대상이 아니다
 * (`.claude/rules/frontend.md` §8 은 사용자 노출 화면을 가리킨다).
 */
import { Link, useLocation } from 'react-router';

import { __HARU_DEV_SENTINEL__ } from './devSentinel';

import './dev.css';

/* ===== Route Guard 표시 ===================================================
 *
 * 값은 `app/guards/resolveGuardDecision.ts` 의 판정 순서를 그대로 읽은 것이다.
 *   1. me 미해결 → pending(스피너)
 *   2. 미인증    → /auth/welcome  (예외: /auth/* · Trial 온보딩 — C-12)
 *   3. 동의 누락 → /auth/consent
 *   4. VPC pending|failed → /auth/verify-parent
 *   5. 온보딩 미완료 → /onboarding/start (또는 저장된 draft 지점)
 *   6. 온보딩 완료 + /auth/* → /
 */

type AccessKey = 'open' | 'trial' | 'signedOut' | 'auth' | 'full';

interface AccessMeta {
  readonly label: string;
  readonly variant: string;
  readonly hint: string;
}

const ACCESS: Readonly<Record<AccessKey, AccessMeta>> = {
  open: {
    label: '바로 열림',
    variant: 'open',
    hint: 'Guard 가 막지 않는다. 로그인 상태와 무관하다.',
  },
  trial: {
    label: '바로 열림 (Trial)',
    variant: 'open',
    hint: '로그인 없이 열린다 — Trial 온보딩 예외 (C-12).',
  },
  signedOut: {
    label: '로그아웃 상태에서만',
    variant: 'signed-out',
    hint: '로그아웃 상태에서는 열린다. 로그인 + 온보딩 완료 상태에서 누르면 Guard 가 `/` 로 되돌린다.',
  },
  auth: {
    label: '로그인 필요',
    variant: 'auth',
    hint: '로그아웃 상태에서 누르면 `/auth/welcome` 으로 되돌린다.',
  },
  full: {
    label: '로그인 · 동의 · VPC · 온보딩 완료 필요',
    variant: 'full',
    hint: '하나라도 비면 그 단계 화면으로 되돌린다. 기본 `me:success` 에서는 로그인만 하면 충족된다.',
  },
};

interface ScreenEntry {
  readonly path: string;
  readonly name: string;
  readonly stage: string;
  readonly access: AccessKey;
  /** 되돌려지는 곳 · 주의할 점. */
  readonly note?: string;
}

interface ScreenSection {
  /** heading 연결용 id 조각 (한글·공백은 id 로 쓸 수 없다). */
  readonly id: string;
  readonly title: string;
  readonly note: string;
  readonly entries: readonly ScreenEntry[];
}

/** 플로우 순서대로. 경로는 `shared/config/routes.ts` 에 등록된 것과 1:1 이다. */
const SECTIONS: readonly ScreenSection[] = [
  {
    id: 'auth',
    title: '인증 · 동의',
    note: '7장 모두 로그아웃 상태에서 바로 열린다. 로그인하고 나면 Guard 가 / 로 되돌리므로 먼저 본다.',
    entries: [
      { path: '/auth/welcome', name: '시작 화면 (Welcome)', stage: 'Stage 2', access: 'signedOut' },
      {
        path: '/auth/sign-up',
        name: '가입 (아이 정보 포함)',
        stage: 'Stage 2',
        access: 'signedOut',
      },
      { path: '/auth/log-in', name: '로그인', stage: 'Stage 2', access: 'signedOut' },
      {
        path: '/auth/forgot-password',
        name: '비밀번호 찾기',
        stage: 'Stage 2',
        access: 'signedOut',
      },
      {
        path: '/auth/reset-password',
        name: '비밀번호 재설정',
        stage: 'Stage 2',
        access: 'signedOut',
        note: '메일 링크 진입 화면이라 TopBar 에 뒤로가기가 없다.',
      },
      {
        path: '/auth/consent',
        name: '보호자 동의 5항목',
        stage: 'Stage 2',
        access: 'signedOut',
        note: '뒤로 갈 수 없는 필수 단계 — 뒤로가기가 없다.',
      },
      {
        path: '/auth/verify-parent',
        name: '보호자 확인 (VPC 슬롯)',
        stage: 'Stage 2',
        access: 'signedOut',
        note: '뒤로가기 없음. `?scenario=me:vpc-failed` 로 실패 상태를 본다.',
      },
    ],
  },
  {
    id: 'onboarding',
    title: '온보딩',
    note: '`/onboarding/saved` 만 로그인이 필요하고, 나머지는 Trial 로 바로 열린다 (C-12). 플로우 순서 그대로 적었다.',
    entries: [
      {
        path: '/onboarding/start',
        name: '프로필 입력 안내',
        stage: 'Stage 2',
        access: 'trial',
        note: '동의 직후 첫 화면.',
      },
      {
        path: '/onboarding/child-info',
        name: '아이 정보 (About your child)',
        stage: 'Stage 2',
        access: 'trial',
      },
      {
        path: '/onboarding',
        name: '설문 안내',
        stage: 'Stage 2',
        access: 'trial',
        note: '아이 정보 다음에 오는 화면이다 — 카드 단계 앞.',
      },
      {
        path: '/onboarding/reading-together',
        name: '설문 1단계 — 함께 읽기 (카드 2)',
        stage: 'Stage 2',
        access: 'trial',
      },
      {
        path: '/onboarding/books-and-interests',
        name: '설문 2단계 — 책·관심 (카드 3)',
        stage: 'Stage 2',
        access: 'trial',
      },
      {
        path: '/onboarding/growing-together',
        name: '설문 3단계 — 함께 자라기 (카드 1)',
        stage: 'Stage 2',
        access: 'trial',
      },
      {
        path: '/onboarding/capability-items',
        name: '설문 4단계 — 역량 문항 (카드 10)',
        stage: 'Stage 2',
        access: 'trial',
        note: '카드 수는 instrument 에서 온다 — `onboarding:instrument-v2` 로 줄어든다.',
      },
      {
        path: '/onboarding/saved',
        name: '저장 완료',
        stage: 'Stage 2',
        access: 'auth',
        note: 'Trial 예외가 아니다 — 로그인하지 않으면 `/auth/welcome` 으로 되돌린다.',
      },
      {
        path: '/onboarding/profile',
        name: '프로필 결과 (온보딩 모드)',
        stage: 'Stage 6',
        access: 'auth',
        note: '`?scenario=children:all-scores-missing` · `scores-partially-missing` · `persona-fallback` · `error` 로 변형을 본다. `Next` → 발전 역량.',
      },
      {
        path: '/onboarding/growth-capability',
        name: '발전 역량 (온보딩 모드)',
        stage: 'Stage 6',
        access: 'auth',
        note: '`?scenario=children:all-scores-missing`(제안 없음 · CTA 비활성) · `scores-partially-missing`(null 축 선택) · `children.setgrowthcapability:error` / `offline`(저장 실패). 설정 모드 = `/settings/growth-capability`.',
      },
    ],
  },
  {
    id: 'app',
    title: '앱 본화면',
    note: '먼저 `/auth/log-in` 에서 로그인한다 (Mock 은 형식만 맞으면 통과한다).',
    entries: [
      {
        path: '/',
        name: 'Home (골격)',
        stage: 'Stage 2',
        access: 'full',
        note: 'contract 호출 0건인 착지 화면이다. 본문은 Stage 3 에서 채운다 (#33).',
      },
      {
        path: '/settings',
        name: '설정',
        stage: 'Stage 6',
        access: 'full',
        note: '2그룹 5행 (`C13-S6-1`). 5행 전부 화면이 등록되어 있다.',
      },
      {
        path: '/settings/child/survey',
        name: '설문 재응답 (진입 · 카드)',
        stage: 'Stage 6',
        access: 'full',
        note: '`S6-C` (`C13-S6-3`). 카드 = `/settings/child/survey/reading-together` 등. `?scenario=children:survey-update-draft`(이어서) · `children:loading` · `children:error` · `children:offline` · 제출만 실패 `children.submitsurveyupdate:error` / `:offline` / `:retry`.',
      },
      {
        path: '/settings/child',
        name: '아이 정보 수정',
        stage: 'Stage 6',
        access: 'full',
        note: '`?scenario=children:validation-failed` · `children.update:error` · `children.update:offline` · `children:loading` · `children:error`.',
      },
      {
        path: '/settings/profile',
        name: '프로필 (재방문 모드)',
        stage: 'Stage 6',
        access: 'full',
        note: '설정 목록 `Profile` 행으로 들어온다. `?scenario=children:profile-updated` · `persona-changed`.',
      },
      {
        path: '/settings/growth-capability',
        name: '발전 역량 (설정 모드)',
        stage: 'Stage 6',
        access: 'full',
        note: '`S6-D` (`C13-S6-4`). 설정 목록 `Growth focus` 행으로 들어온다. `?scenario=children:all-scores-missing`(현재값 없음 · Save 비활성) · `children:loading` · `children:error` · `children:offline` · 저장만 실패 `children.setgrowthcapability:error` / `:offline` / `:retry`.',
      },
    ],
  },
  {
    id: 'common',
    title: '공통',
    note: 'Guard 밖의 route 다.',
    entries: [
      {
        path: '/__dev/no-such-screen',
        name: 'Not Found (`*` route)',
        stage: 'Stage 1',
        access: 'open',
        note: '등록되지 않은 아무 경로나 열면 이 화면이다.',
      },
    ],
  },
  {
    id: 'tools',
    title: 'dev 도구 (제품 화면 아님)',
    note: 'Production 빌드에 없다. 컴포넌트·토큰·상태 검사용이다.',
    entries: [
      { path: '/__dev/ui/tokens', name: '토큰 swatch', stage: 'Stage 1', access: 'open' },
      {
        path: '/__dev/ui/components',
        name: 'Shared UI × variant × state',
        stage: 'Stage 1',
        access: 'open',
      },
      { path: '/__dev/ui/states', name: '공통 상태 6종', stage: 'Stage 1', access: 'open' },
      {
        path: '/__dev/ui/responsive',
        name: '320 / 393 / 600 / 1024 프레임',
        stage: 'Stage 1',
        access: 'open',
      },
      {
        path: '/__dev/ui/a11y',
        name: 'focus · 터치 타깃 · 대비',
        stage: 'Stage 1',
        access: 'open',
      },
      {
        path: '/__dev/ui/frame',
        name: '순수 앱 컬럼 화면',
        stage: 'Stage 1',
        access: 'open',
        note: 'gallery chrome 없는 측정용 화면.',
      },
    ],
  },
];

/* ===== Mock 시나리오 =======================================================
 *
 * key 는 각 Mock Adapter 의 `*_SCENARIO_KEYS` 를 그대로 읽은 것이다
 * (`mocks/{auth,consent,me,onboarding,books,health}/Mock*.ts`, `dev/scenario-panel/devScenarios.ts`).
 */

/** `__states` 그룹의 6종 — wildcard(`?scenario=loading`)로 쓰면 모든 그룹에 적용된다. */
const COMMON_STATE_KEYS = ['success', 'loading', 'empty', 'error', 'retry', 'offline'] as const;

/** 그룹을 지정할 때 쓰는 이름표 (`?scenario=me:error`). */
const SCENARIO_GROUPS = [
  { group: 'auth', note: '로그인 · 가입 (`token-expired` · `provider-cancelled`)' },
  { group: 'consents', note: '동의 (`consent-missing` · `consent-version-outdated`)' },
  { group: 'me', note: 'Guard 입력 (`vpc-pending` · `vpc-failed` · `onboarding-incomplete`)' },
  { group: 'onboarding', note: '온보딩 (`draft-resume` · `persona-fallback` · 아래 4종)' },
  { group: 'books', note: '책 목록 (`empty` 있음)' },
  {
    group: 'activity-cards',
    note: '오늘의 카드 덱 (Stage 6 `cold-to-warm` · `difficulty-lowered` — Home 카드 `reason` 만 바뀐다)',
  },
  {
    group: 'children',
    note: '아이 프로필 · 설정 (Stage 6 — `profile-updated` · `persona-changed` · `persona-fallback` · `all-scores-missing` · `scores-partially-missing` · `validation-failed` · `survey-update-draft` · `survey-update-submitted`)',
  },
  {
    group: 'session-completion',
    note: '완료 화면 (`subtext-missing` · `bubble-missing` · `reflection-submitted` — Stage 5 재진입)',
  },
  {
    group: 'reflections',
    note: '회고 저장 (`reflection-already-submitted` · `invalid-transition` · 공통 5종 — `empty` 없음)',
  },
  {
    group: 'analysis',
    note: '분석 상태 (`analysis-pending` · `-completed` · `-failed` … — 피드백 화면 `S5-C`)',
  },
  { group: 'health', note: 'Scenario Panel 의 기본 그룹' },
] as const;

interface BoundScenario {
  readonly param: string;
  readonly path: string;
  readonly label: string;
  readonly note: string;
}

/** 온보딩 전용 시나리오 — 효과가 보이는 화면과 묶어 둔다. */
const ONBOARDING_SCENARIOS: readonly BoundScenario[] = [
  {
    param: 'onboarding:prefilled-child-info',
    path: '/onboarding/child-info',
    label: 'prefilled-child-info',
    note: '가입에서 받아 둔 아이 정보가 채워진 상태 (읽기 모드로 진입).',
  },
  {
    param: 'onboarding:missing-prefill',
    path: '/onboarding/child-info',
    label: 'missing-prefill',
    note: 'draft 에 아이 정보가 없다 — 빈 편집 폼으로 진입한다.',
  },
  {
    param: 'onboarding:instrument-v2',
    path: '/onboarding',
    label: 'instrument-v2',
    note: '문항 수가 다른 instrument — 안내 화면의 카드 수·소요 시간이 따라 변한다.',
  },
  {
    param: 'onboarding:owned-books-empty',
    path: '/onboarding/books-and-interests',
    label: 'owned-books-empty',
    note: 'Q5 카탈로그가 비어 Q5 카드가 사라진다 (카드 수가 하나 줄어든다).',
  },
  {
    param: 'onboarding:draft-resume',
    path: '/onboarding/start',
    label: 'draft-resume',
    note: '서버에 중도 응답이 있는 상태 — 저장된 지점으로 복귀한다.',
  },
];

/**
 * Stage 5 회고 카드 — 완료 화면 하단 (`S5-B`, AC-5-16 · Plan §5.4 R-8). 지난 세션(`analyzed`)으로 직접 진입한다 —
 * 새로고침은 Mock 인증을 지우므로 **로그인한 뒤** 이 목록에서 누른다.
 */
const REFLECTION_SESSION_PATH = '/session/77777777-7777-4777-8777-000000000001/complete';

const REFLECTION_SCENARIOS: readonly BoundScenario[] = [
  {
    param: 'reflections:success',
    path: REFLECTION_SESSION_PATH,
    label: 'reflection — 빈 카드 → 저장',
    note: 'S0 → S1 → 저장 Toast + 홈 (`N5-07`).',
  },
  {
    param: 'reflections:loading',
    path: REFLECTION_SESSION_PATH,
    label: 'reflection — 저장 중',
    note: 'S2 — Save loading · 입력 잠금.',
  },
  {
    param: 'reflections:error',
    path: REFLECTION_SESSION_PATH,
    label: 'reflection — 저장 실패',
    note: 'S3 — 오류 Toast · 입력 보존.',
  },
  {
    param: 'reflections:retry',
    path: REFLECTION_SESSION_PATH,
    label: 'reflection — Retry',
    note: '1회 실패(오류 Toast · 입력 보존) 후 다시 누르면 저장 — 같은 body 는 같은 Idempotency-Key.',
  },
  {
    param: 'reflections:offline',
    path: REFLECTION_SESSION_PATH,
    label: 'reflection — 오프라인',
    note: 'S4 — 회고 전용 오프라인 Toast · 입력 보존.',
  },
  {
    param: 'reflections:invalid-transition',
    path: REFLECTION_SESSION_PATH,
    label: 'reflection — 서버 완료 전',
    note: '첫 시도만 `SESSION_INVALID_TRANSITION` — 다시 누르면 저장된다.',
  },
  {
    param: 'reflections:reflection-already-submitted',
    path: REFLECTION_SESSION_PATH,
    label: 'reflection — 이미 저장됨(서버)',
    note: '`REFLECTION_ALREADY_SUBMITTED` → 안내 Toast + 홈.',
  },
  {
    param: 'session-completion:reflection-submitted',
    path: REFLECTION_SESSION_PATH,
    label: 'reflection — 재진입 읽기 전용',
    note: 'S6 — 제출값 표시 · Save 비활성 (`N5-08`).',
  },
];

/**
 * Stage 5 피드백 · 분석 상태 화면 (`S5-C`, `C13-S5-1` Spec §2.3). **deep link 전용**(`N5-10` ⓐ) — 앱 안 진입점이
 * 없으므로 여기서 직접 연다. 지난 세션(`analyzing` — 기본 `success` 는 3번째 조회에 `analyzed`)으로 진입한다.
 * 새로고침은 Mock 인증을 지우므로 **로그인한 뒤** 이 목록에서 누른다.
 */
const FEEDBACK_SESSION_PATH = '/session/77777777-7777-4777-8777-000000000002/feedback';

const FEEDBACK_SCENARIOS: readonly BoundScenario[] = [
  {
    param: 'analysis:success',
    path: FEEDBACK_SESSION_PATH,
    label: 'feedback — 기본',
    note: 'pending → 폴링 15초 → 피드백.',
  },
  {
    param: 'analysis:loading',
    path: FEEDBACK_SESSION_PATH,
    label: 'feedback — Loading',
    note: 'Spinner.',
  },
  {
    param: 'analysis:analysis-pending',
    path: FEEDBACK_SESSION_PATH,
    label: 'feedback — pending',
    note: '준비 중 안내.',
  },
  {
    param: 'analysis:analysis-completed',
    path: FEEDBACK_SESSION_PATH,
    label: 'feedback — analyzed',
    note: '버블 = 응답 문구.',
  },
  {
    param: 'analysis:analysis-feedback-missing',
    path: FEEDBACK_SESSION_PATH,
    label: 'feedback — text null',
    note: 'state slot 비움 (AC-5-37).',
  },
  {
    param: 'analysis:analysis-low-quality',
    path: FEEDBACK_SESSION_PATH,
    label: 'feedback — low-quality',
    note: '버블 + 조용한 곳 안내.',
  },
  {
    param: 'analysis:analysis-failed',
    path: FEEDBACK_SESSION_PATH,
    label: 'feedback — failed',
    note: '재시도 버튼 없음 · 60초 폴링.',
  },
  {
    param: 'analysis:analysis-not-available',
    path: FEEDBACK_SESSION_PATH,
    label: 'feedback — 대화 전용',
    note: '`ANALYSIS_NOT_AVAILABLE`.',
  },
  {
    param: 'analysis:recording-deleted',
    path: FEEDBACK_SESSION_PATH,
    label: 'feedback — 녹음 없음',
    note: '`N5-12` ⓐ — 폴링 정지.',
  },
  {
    param: 'analysis:analysis-pending-then-completed',
    path: FEEDBACK_SESSION_PATH,
    label: 'feedback — pending → completed',
    note: '폴링 종료 확인.',
  },
  {
    param: 'analysis:error',
    path: FEEDBACK_SESSION_PATH,
    label: 'feedback — Error',
    note: 'Try again.',
  },
  {
    param: 'analysis:retry',
    path: FEEDBACK_SESSION_PATH,
    label: 'feedback — Retry',
    note: '1회 실패 후 성공.',
  },
  {
    param: 'analysis:offline',
    path: FEEDBACK_SESSION_PATH,
    label: 'feedback — Offline',
    note: 'Try again.',
  },
  {
    param: 'analysis:success',
    path: '/session/99999999-9999-4999-8999-999999999999/feedback',
    label: 'feedback — 없는 세션',
    note: '`RESOURCE_NOT_FOUND` → Go home (AC-5-42).',
  },
];

/* ===== 아직 없는 화면 (링크 없음) ========================================== */

const PENDING_SCREENS = [
  {
    label: 'Home 본문 · Activity Card · Library · 책 선택 · 추천',
    note: 'Stage 3.',
  },
  { label: 'Storytime Session · 녹음 · Prompt Drawer · 업로드 UX', note: 'Stage 4.' },
  { label: '개인화 · 프로필 수정 · 추천 루프', note: 'Stage 6.' },
  { label: '4주 리포트 · History · 하이라이트 오디오 · PDF', note: 'Stage 7.' },
  { label: '데이터 관리 · 탈퇴 (동의 이력 보기는 선택)', note: 'Stage 8 (C-15 · C-19).' },
] as const;

/* ===== 화면 ================================================================ */

const SELF_PATH = '/__dev/screens';
const SCENARIO_PARAM = 'scenario';

/** 목록의 링크에 현재 선택한 scenario 를 그대로 물려 준다. */
function withScenario(path: string, param: string): string {
  if (param.length === 0) return path;
  return `${path}?${SCENARIO_PARAM}=${encodeURIComponent(param)}`;
}

export default function DevScreens() {
  const { search } = useLocation();
  const carried = new URLSearchParams(search).get(SCENARIO_PARAM) ?? '';

  return (
    <div className="haru-dev-root" data-dev-sentinel={__HARU_DEV_SENTINEL__}>
      <main className="haru-dev-main">
        <h1 className="haru-dev-section__title">HARU 화면 검수 목록</h1>
        <p className="haru-dev-lede">
          지금까지 만든 화면(Stage 1–2)을 눌러서 돌아본다. 각 항목에 Route Guard 가 막는 조건을 적어
          두었다.
        </p>

        <p className="haru-dev-screens__order">
          <strong>검수 순서</strong> — 로그아웃 상태에서 ① 인증·동의 7장 → ② 온보딩 안내·위저드 7장
          → ③ <code>/auth/log-in</code> 에서 로그인 → ④ <code>/onboarding/saved</code> ·{' '}
          <code>/</code> · <code>/settings</code>. 로그인하고 나면 <code>/auth/*</code> 가{' '}
          <code>/</code> 로 되돌려지므로 인증 화면을 먼저 본다.
        </p>

        {/* ===== 시나리오 전환 ===== */}
        <section className="haru-dev-section" aria-labelledby="dev-screens-scenarios">
          <h2 className="haru-dev-section__title" id="dev-screens-scenarios">
            Mock 시나리오
          </h2>
          <p className="haru-dev-section__note">
            여기에서 상태를 고르면 <strong>아래 모든 화면 링크에 그대로 붙는다</strong>. 선택은 URL
            에만 있으므로 주소를 공유해도 같은 상태가 재현된다. 화면 우하단 Scenario Panel 로도 바꿀
            수 있다.
          </p>

          <h3 className="haru-dev-subhead">공통 상태 6종 (wildcard — 모든 그룹에 적용)</h3>
          <div className="haru-dev-screens__chips">
            {COMMON_STATE_KEYS.map((key) => (
              <Link
                key={key}
                to={withScenario(SELF_PATH, key)}
                className="haru-dev-screens__chip"
                aria-current={carried === key ? 'page' : undefined}
              >
                {key}
              </Link>
            ))}
            <Link
              to={SELF_PATH}
              className="haru-dev-screens__chip"
              aria-current={carried === '' ? 'page' : undefined}
            >
              해제
            </Link>
          </div>
          <p className="haru-dev-screens__hint">
            현재 선택: <span className="haru-dev-mono">{carried === '' ? '(없음)' : carried}</span>.
            그룹에 없는 key 는 그 그룹의 기본값(<span className="haru-dev-mono">success</span>)으로
            떨어진다 — 예컨대 <span className="haru-dev-mono">empty</span> 는{' '}
            <span className="haru-dev-mono">books</span> 에만 있다.
          </p>

          <h3 className="haru-dev-subhead">그룹 지정 (`?scenario=그룹:key`)</h3>
          <ul className="haru-dev-screens__plain">
            {SCENARIO_GROUPS.map((item) => (
              <li key={item.group}>
                <span className="haru-dev-mono">{item.group}</span> — {item.note}
              </li>
            ))}
          </ul>

          <h3 className="haru-dev-subhead">온보딩 전용 — 효과가 보이는 화면으로 바로 이동</h3>
          <ul className="haru-dev-screens__list">
            {ONBOARDING_SCENARIOS.map((item) => (
              <li className="haru-dev-screens__item" key={item.param}>
                <Link className="haru-dev-screens__link" to={withScenario(item.path, item.param)}>
                  {item.label}
                </Link>
                <p className="haru-dev-screens__path haru-dev-mono">
                  {item.path}?{SCENARIO_PARAM}={item.param}
                </p>
                <p className="haru-dev-screens__hint">{item.note}</p>
              </li>
            ))}
          </ul>

          <h3 className="haru-dev-subhead">Stage 5 회고 카드 — 완료 화면 하단</h3>
          <ul className="haru-dev-screens__list">
            {REFLECTION_SCENARIOS.map((item) => (
              <li className="haru-dev-screens__item" key={item.param}>
                <Link className="haru-dev-screens__link" to={withScenario(item.path, item.param)}>
                  {item.label}
                </Link>
                <p className="haru-dev-screens__path haru-dev-mono">
                  {item.path}?{SCENARIO_PARAM}={item.param}
                </p>
                <p className="haru-dev-screens__hint">{item.note}</p>
              </li>
            ))}
          </ul>

          <h3 className="haru-dev-subhead">Stage 5 피드백 · 분석 상태 — deep link 전용</h3>
          <ul className="haru-dev-screens__list">
            {FEEDBACK_SCENARIOS.map((item) => (
              <li className="haru-dev-screens__item" key={`${item.path}?${item.param}`}>
                <Link className="haru-dev-screens__link" to={withScenario(item.path, item.param)}>
                  {item.label}
                </Link>
                <p className="haru-dev-screens__path haru-dev-mono">
                  {item.path}?{SCENARIO_PARAM}={item.param}
                </p>
                <p className="haru-dev-screens__hint">{item.note}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ===== 화면 목록 ===== */}
        {SECTIONS.map((section) => (
          <section
            className="haru-dev-section"
            key={section.id}
            aria-labelledby={`dev-screens-${section.id}`}
          >
            <h2 className="haru-dev-section__title" id={`dev-screens-${section.id}`}>
              {section.title}
            </h2>
            <p className="haru-dev-section__note">{section.note}</p>

            <ul className="haru-dev-screens__list">
              {section.entries.map((entry) => {
                const access = ACCESS[entry.access];

                return (
                  <li className="haru-dev-screens__item" key={entry.path}>
                    <Link className="haru-dev-screens__link" to={withScenario(entry.path, carried)}>
                      {entry.name}
                    </Link>
                    <p className="haru-dev-screens__path haru-dev-mono">{entry.path}</p>
                    <p className="haru-dev-screens__meta">
                      <span className="haru-dev-screens__badge">{entry.stage}</span>
                      <span className="haru-dev-screens__badge" data-access={access.variant}>
                        {access.label}
                      </span>
                    </p>
                    <p className="haru-dev-screens__hint">
                      {access.hint}
                      {entry.note === undefined ? null : ` ${entry.note}`}
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        {/* ===== 아직 없는 화면 ===== */}
        <section className="haru-dev-section" aria-labelledby="dev-screens-pending">
          <h2 className="haru-dev-section__title" id="dev-screens-pending">
            아직 없는 화면 (예정)
          </h2>
          <p className="haru-dev-section__note">
            route 에 등록되지 않았다. 링크를 두지 않는다 — 누르면 Not Found 가 나와 검수를 방해한다.
          </p>
          <ul className="haru-dev-screens__plain">
            {PENDING_SCREENS.map((item) => (
              <li key={item.label}>
                {item.label} — <span className="haru-dev-screens__hint-inline">{item.note}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
