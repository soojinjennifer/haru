import { lazy, Suspense } from 'react';
import { BrowserRouter, Outlet, Route, Routes } from 'react-router';

import {
  AuthTopBar,
  ForgotPasswordPage,
  GuardianConsentPage,
  LogInPage,
  ParentVerificationPage,
  ResetPasswordPage,
  SignUpPage,
  WelcomePage,
} from '../pages/auth';
import { authCopy } from '../features/auth';
import { consentCopy } from '../features/consent';
import { HomePage, HomeTopBar } from '../pages/home';
import {
  AddOwnBookPage,
  AddOwnBookTopBar,
  GiftRequestsPage,
  GiftRequestsTopBar,
  LibraryPage,
  LibraryTopBar,
} from '../pages/library';
import {
  ProgressPage,
  ProgressTopBar,
  ReportDetailPage,
  ReportDetailTopBar,
} from '../pages/progress';
import { NotFoundPage } from '../pages/not-found/NotFoundPage';
import { OnboardingSessionProvider } from '../features/onboarding-survey';
import { SurveyUpdateSessionProvider } from '../features/survey-update';
import {
  OnboardingGrowthPage,
  OnboardingGrowthTopBar,
  OnboardingIntroPage,
  OnboardingProfilePage,
  OnboardingSavedPage,
  OnboardingStartPage,
  OnboardingStepPage,
} from '../pages/onboarding';
import { SessionCompletePage, SessionFeedbackPage, StorytimeSessionPage } from '../pages/session';
import {
  ChildInfoEditPage,
  ChildInfoEditTopBar,
  GrowthCapabilityPage,
  GrowthCapabilityTopBar,
  ProfilePage,
  ProfileTopBar,
  SettingsPage,
  SettingsTopBar,
  SurveyUpdatePage,
  SurveyUpdateStepPage,
  SurveyUpdateTopBar,
} from '../pages/settings';
import { ROUTES } from '../shared/config/routes';

import { RouteGuard } from './guards/RouteGuard';
import { AppTabBar } from './layouts/AppTabBar';
import { FullscreenLayout } from './layouts/FullscreenLayout';
import { StackLayout } from './layouts/StackLayout';
import { TabLayout } from './layouts/TabLayout';

/**
 * dev 전용 화면 (Stage 1-G) — **Production 빌드에서 완전히 제거되어야 한다**.
 *
 * `import.meta.env.DEV` 는 Vite 가 빌드 시 `false` 리터럴로 치환하므로 아래 삼항은
 * `null` 로 상수 접히고, `import('../dev/…')` 가 도달 불가능해져 Rollup 이 dev 모듈
 * 그래프(gallery · Scenario Panel · dev.css)를 산출물에서 지운다 (Plan §16 D-6, AC-1-42).
 * 조건을 상수나 함수 뒤로 감추면 이 제거가 보장되지 않는다.
 */
const DevGallery = import.meta.env.DEV ? lazy(() => import('../dev/DevGallery')) : null;
const DevScreens = import.meta.env.DEV ? lazy(() => import('../dev/DevScreens')) : null;
const DevOverlay = import.meta.env.DEV ? lazy(() => import('../dev/DevOverlay')) : null;

/**
 * Stage 2 route 표 (Plan §9.1 — Stage 2-B 2 화면을 뺀 12 route + dev)
 *
 * | path                     | layout          | 비고 |
 * |--------------------------|-----------------|------|
 * | `/auth/welcome`          | Page 가 Stack 조립 | TopBar 없음 |
 * | `/auth/sign-up`          | 〃              | TopBar centered |
 * | `/auth/log-in`           | 〃              | TopBar centered(transparent) |
 * | `/auth/forgot-password`  | 〃              | TopBar centered |
 * | `/auth/reset-password`   | 〃              | 메일 링크 진입 (leading 없음) |
 * | `/auth/consent`          | 〃              | TopBar centered · **leading 없음**(뒤로 갈 수 없는 필수 단계) |
 * | `/auth/verify-parent`    | 〃              | 〃 (VPC 슬롯) |
 * | `/onboarding`            | StackLayout     | 설문 소개 — TopBar 없음 (Trial 허용) |
 * | `/onboarding/start`      | StackLayout     | 프로필 입력 소개 (`243:1147`) — TopBar 없음 |
 * | `/onboarding/:step`      | StackLayout     | 위저드 — **TopBar 는 feature 가 렌더**(단계·문항마다 내용이 다르다) |
 * | `/onboarding/saved`      | StackLayout     | 제출 완료 — TopBar 없음 |
 * | `/onboarding/profile`    | StackLayout     | 프로필 결과 · 온보딩 모드 (Stage 6 `C13-09`) — TopBar 없음 (뒤로 없음 `N6-24`) |
 * | `/onboarding/growth-capability` | StackLayout | 발전 역량 · 온보딩 모드 (Stage 6 `C13-10`) — TopBar centered 제목 없음 · 뒤로 → 프로필 |
 * | `/`                      | **TabLayout**   | Home 본문 — `HomeTopBar`(워드마크 + 주간 집계 칩 + 설정) |
 * | `/library`               | **TabLayout**   | 서재 — Stage 3 1차는 탭바 마운트 자리만 |
 * | `/progress`              | **TabLayout**   | 주간 관찰 + 4주 리포트 카드 (Stage 7 `S7-C` — `D7-1`) |
 * | `/progress/reports/:reportId` | StackLayout | 4주 리포트 상세 (Stage 7 `S7-D`, `C13-S7-1`) — TopBar centered "4-week report" · 뒤로 = `N7-23` |
 * | `/settings`              | StackLayout     | TopBar centered — 2그룹 5행 (Stage 6 `C13-S6-1`) |
 * | `/settings/profile`      | StackLayout     | 프로필 결과 · 재방문 모드 (Stage 6 `C13-09`) — TopBar centered "Profile" |
 * | `/settings/child`        | StackLayout     | 아이 정보 수정 (Stage 6 `C13-S6-2`) — TopBar centered "Child info", 뒤로 = 변경 시 확인 |
 * | `/settings/child/survey` | StackLayout     | 설문 재응답 진입 (Stage 6 `C13-S6-3`) — TopBar centered 제목 없음 · 뒤로 |
 * | `/settings/child/survey/:step` | StackLayout | 설문 재응답 카드 — **TopBar 는 feature 가 렌더** (온보딩 위저드와 같다) |
 * | `/settings/growth-capability` | StackLayout | 발전 역량 · 설정 모드 (Stage 6 `C13-S6-4`) — TopBar centered "Growth focus" · 뒤로 `navigate(-1)` |
 * | `/__dev/ui/*`            | (dev 전용)      | UI gallery — dev 에서만 존재한다 |
 * | `/__dev/screens`         | (dev 전용)      | 검수용 화면 목록 — dev 에서만 존재한다 |
 * | `*`                      | StackLayout     | NotFound |
 *
 * `/auth/*` 는 화면마다 TopBar 구성이 달라서 **Page 가 직접 `StackLayout` 을 조립**한다
 * (layout route 로 묶으면 TopBar 를 화면별로 줄 수 없다). Page 는 여전히 Composition 만 한다.
 *
 * Stage 2-B 의 `/onboarding/profile` · `/onboarding/growth-capability` 는 Stage 6 에서 design-agent 명세로
 * 들어왔다 (`D6-1`). `S6-E1` 이 `/onboarding/profile` · `/settings/profile` 을, `S6-E2` 가
 * `/onboarding/growth-capability` 를, `S6-D` 가 설정 모드 `/settings/growth-capability` 를 등록한다.
 * Stage 3 에서 `/` · `/library` · `/progress` 가 **TabLayout** 으로 바뀌며 BottomTabBar 가
 * 처음 마운트된다 (#15 · `D-02`).
 */
export function AppRoutes() {
  return (
    <Routes>
      {DevGallery === null ? null : (
        <Route
          path="/__dev/ui/*"
          element={
            <Suspense fallback={null}>
              <DevGallery />
            </Suspense>
          }
        />
      )}
      {DevScreens === null ? null : (
        <Route
          path="/__dev/screens"
          element={
            <Suspense fallback={null}>
              <DevScreens />
            </Suspense>
          }
        />
      )}
      {/*
        `/auth/*` 는 화면마다 TopBar 구성이 달라 **layout route 를 경로별로** 둔다.
        Layout 은 app 레이어가 씌운다 — `pages` 는 `app` 을 import 할 수 없다
        (rules/architecture §3, `pnpm lint:boundaries`).
      */}
      <Route element={<StackLayout />}>
        <Route
          path={ROUTES.auth.welcome}
          element={
            <RouteGuard>
              <WelcomePage />
            </RouteGuard>
          }
        />
      </Route>
      <Route element={<StackLayout topBar={<AuthTopBar title={authCopy.signUp.title} />} />}>
        <Route
          path={ROUTES.auth.signUp}
          element={
            <RouteGuard>
              <SignUpPage />
            </RouteGuard>
          }
        />
      </Route>
      {/* 로그인 화면의 TopBar 는 제목 없이 투명하다 (Figma `179:1828`). */}
      <Route element={<StackLayout topBar={<AuthTopBar />} />}>
        <Route
          path={ROUTES.auth.logIn}
          element={
            <RouteGuard>
              <LogInPage />
            </RouteGuard>
          }
        />
      </Route>
      <Route
        element={<StackLayout topBar={<AuthTopBar title={authCopy.forgotPassword.title} />} />}
      >
        <Route
          path={ROUTES.auth.forgotPassword}
          element={
            <RouteGuard>
              <ForgotPasswordPage />
            </RouteGuard>
          }
        />
      </Route>
      {/* 메일 링크 진입이라 돌아갈 화면이 없다 → leading 없음. */}
      <Route
        element={
          <StackLayout
            topBar={<AuthTopBar title={authCopy.resetPassword.title} withBack={false} />}
          />
        }
      >
        <Route
          path={ROUTES.auth.resetPassword}
          element={
            <RouteGuard>
              <ResetPasswordPage />
            </RouteGuard>
          }
        />
      </Route>
      {/*
        동의 · VPC 는 **뒤로 갈 수 없는 필수 단계**라 TopBar 에 leading 을 두지 않는다
        (Design Spec §2.6 · §2.7). 동의 기록 전에 되돌아가는 경로를 만들지 않는다.
      */}
      <Route
        element={
          <StackLayout
            topBar={<AuthTopBar title={consentCopy.guardianConsent.title} withBack={false} />}
          />
        }
      >
        <Route
          path={ROUTES.auth.consent}
          element={
            <RouteGuard>
              <GuardianConsentPage />
            </RouteGuard>
          }
        />
      </Route>
      <Route
        element={
          <StackLayout
            topBar={<AuthTopBar title={consentCopy.verifyParent.title} withBack={false} />}
          />
        }
      >
        <Route
          path={ROUTES.auth.verifyParent}
          element={
            <RouteGuard>
              <ParentVerificationPage />
            </RouteGuard>
          }
        />
      </Route>
      {/*
        온보딩은 화면마다 TopBar 구성이 다르고, Step 5 는 **문항 index** 에 따라 제목·trailing 이
        바뀐다. layout route 는 정적이라 이를 표현할 수 없으므로 TopBar 를 위저드가 렌더한다.
      */}
      {/*
        온보딩 세션 상태(떠난 카드 · 전환 후 포커스)는 **에러 경계보다 위**에 있어야 한다.
        `RouteErrorBoundary` 가 `key={location.key}` 라서 navigate 할 때마다 그 아래 트리가
        재마운트되기 때문이다 (entities/survey/deckSession.tsx — Stage 6 `R-5` 이동).
        provider 를 layout element 안에 두면 온보딩 route 사이에서는 살아남고, 온보딩을
        벗어나면 함께 사라진다.
      */}
      <Route
        element={
          <OnboardingSessionProvider>
            <StackLayout />
          </OnboardingSessionProvider>
        }
      >
        <Route
          path={ROUTES.onboarding.intro}
          element={
            <RouteGuard>
              <OnboardingIntroPage />
            </RouteGuard>
          }
        />
        {/* `start` · `saved` 가 `:step` 보다 먼저 와야 slug 로 잡히지 않는다. */}
        <Route
          path={ROUTES.onboarding.start}
          element={
            <RouteGuard>
              <OnboardingStartPage />
            </RouteGuard>
          }
        />
        <Route
          path={ROUTES.onboarding.saved}
          element={
            <RouteGuard>
              <OnboardingSavedPage />
            </RouteGuard>
          }
        />
        {/* Stage 6 `S6-E1` — 프로필 결과 온보딩 모드. `:step` 보다 먼저 와야 slug 로 잡히지 않는다. */}
        <Route
          path={ROUTES.onboarding.profile}
          element={
            <RouteGuard>
              <OnboardingProfilePage />
            </RouteGuard>
          }
        />
        <Route
          path={ROUTES.onboarding.step}
          element={
            <RouteGuard>
              <OnboardingStepPage />
            </RouteGuard>
          }
        />
      </Route>
      {/*
        Stage 6 `S6-E2` — 발전 역량 온보딩 모드 (`C13-10`). TopBar(뒤로 → 프로필)가 있어 layout 이 다르다.
        정적 경로라 `/onboarding/:step` 보다 **순위가 높다**(React Router 는 선언 순서가 아니라 특이도로 고른다) —
        등록 전에는 이 경로가 `:step` 에 잡혀 위저드로 갔다 (H6-2.4 ①). 위저드 세션 provider 는 필요 없다.
      */}
      <Route element={<StackLayout topBar={<OnboardingGrowthTopBar />} />}>
        <Route
          path={ROUTES.onboarding.growthCapability}
          element={
            <RouteGuard>
              <OnboardingGrowthPage />
            </RouteGuard>
          }
        />
      </Route>
      {/*
        ── Stage 3 탭 route 3개 ────────────────────────────────────────────────
        `BottomTabBar` 의 **첫 실마운트**다 (#15 · `D-02`). 항목은 Library / Home(가운데) /
        Progress 3개이며 `/session` 탭이 없다. TopBar 는 화면마다 다르므로 layout route 를
        경로별로 둔다 (Home = 워드마크 + 집계 칩 + 설정, 서재·진행 = 대형 제목).

        탭바 하단 여백은 `.haru-app-shell__bar-bottom` 한 곳이 소유한다 (§2.1 이중 계상 금지).
      */}
      <Route element={<TabLayout topBar={<HomeTopBar />} tabBar={<AppTabBar />} />}>
        <Route
          path={ROUTES.home}
          element={
            <RouteGuard>
              <HomePage />
            </RouteGuard>
          }
        />
      </Route>
      <Route element={<TabLayout topBar={<LibraryTopBar />} tabBar={<AppTabBar />} />}>
        <Route
          path={ROUTES.library}
          element={
            <RouteGuard>
              <LibraryPage />
            </RouteGuard>
          }
        />
      </Route>
      <Route element={<TabLayout topBar={<ProgressTopBar />} tabBar={<AppTabBar />} />}>
        <Route
          path={ROUTES.progress}
          element={
            <RouteGuard>
              <ProgressPage />
            </RouteGuard>
          }
        />
      </Route>
      {/*
        Stage 7 `S7-D` — 4주 리포트 상세 (`C13-S7-1`, Figma 없음 → Spec §2.3). 탭이 아닌 스택 화면(탭바 없음).
        진입 = `/progress` 카드 헤더 링크 · 과거 목록 행 · push `report_published` deep link (`N7-22`).
      */}
      <Route element={<StackLayout topBar={<ReportDetailTopBar />} />}>
        <Route
          path={ROUTES.progressReport}
          element={
            <RouteGuard>
              <ReportDetailPage />
            </RouteGuard>
          }
        />
      </Route>
      {/*
        서재 하위 스택 2개 — 탭이 아니다 (탭바 없음). Figma 에 없고 `C-13` ②(`L-OPEN-12` ·
        `L-OPEN-13`)로 승인된 design-agent 명세다 (Library Design Spec §7.2 · §7.3).
        `/settings` 와 같은 `StackLayout` + `centered` TopBar 규격을 쓴다.
      */}
      {/*
        Stage 4 세션 화면 — **Fullscreen**(627 이하만 세로 스크롤 `D4-82` · 탭바 없음 · TopBar 없음 `D4-51`).
        닫기는 화면이 직접 그린다 (Figma `300:1318`).
      */}
      <Route element={<FullscreenLayout />}>
        <Route
          path={ROUTES.session}
          element={
            <RouteGuard>
              <StorytimeSessionPage />
            </RouteGuard>
          }
        />
        {/* 완료 화면 `29:62` y 0~468 (`S4-H1`) */}
        <Route
          path={ROUTES.sessionComplete}
          element={
            <RouteGuard>
              <SessionCompletePage />
            </RouteGuard>
          }
        />
        {/* 피드백 · 분석 상태 (`S5-C`, Figma 없음 — `C13-S5-1` Spec §2.3). deep link 전용 (`N5-10` ⓐ) */}
        <Route
          path={ROUTES.sessionFeedback}
          element={
            <RouteGuard>
              <SessionFeedbackPage />
            </RouteGuard>
          }
        />
      </Route>
      <Route element={<StackLayout topBar={<AddOwnBookTopBar />} />}>
        <Route
          path={ROUTES.libraryAdd}
          element={
            <RouteGuard>
              <AddOwnBookPage />
            </RouteGuard>
          }
        />
      </Route>
      <Route element={<StackLayout topBar={<GiftRequestsTopBar />} />}>
        <Route
          path={ROUTES.libraryGiftRequests}
          element={
            <RouteGuard>
              <GiftRequestsPage />
            </RouteGuard>
          }
        />
      </Route>
      <Route element={<StackLayout topBar={<SettingsTopBar />} />}>
        <Route
          path={ROUTES.settings}
          element={
            <RouteGuard>
              <SettingsPage />
            </RouteGuard>
          }
        />
      </Route>
      {/* Stage 6 `S6-E1` — 프로필 결과 재방문 모드 (`D6-4`). 설정 목록 행 = `S6-B`. */}
      <Route element={<StackLayout topBar={<ProfileTopBar />} />}>
        <Route
          path={ROUTES.settingsProfile}
          element={
            <RouteGuard>
              <ProfilePage />
            </RouteGuard>
          }
        />
      </Route>
      {/*
        Stage 6 `S6-B` — 아이 정보 수정 (`C13-S6-2`). TopBar 뒤로는 폼에 묻는다(변경 시 확인 `N6-14`).
      */}
      <Route element={<StackLayout topBar={<ChildInfoEditTopBar />} />}>
        <Route
          path={ROUTES.settingsChild}
          element={
            <RouteGuard>
              <ChildInfoEditPage />
            </RouteGuard>
          }
        />
      </Route>
      {/*
        Stage 6 `S6-D` — 발전 역량 설정 모드 (`C13-S6-4`). 온보딩과 같은 컴포넌트(`D6-6`) · 이탈 확인 없음(`N6-46`).
      */}
      <Route element={<StackLayout topBar={<GrowthCapabilityTopBar />} />}>
        <Route
          path={ROUTES.settingsGrowthCapability}
          element={
            <RouteGuard>
              <GrowthCapabilityPage />
            </RouteGuard>
          }
        />
      </Route>
      {/*
        Stage 6 `S6-C` — 설문 재응답 (`C13-S6-3`). 진입 화면과 카드 단계가 **한 흐름 세션**을 공유한다 — 고친 답(메모리,
        `N6-07`)과 카드 덱 세션(떠난 카드 · 복귀 지점)이 단계 전환(navigate → 에러 경계 재마운트)을 넘어 살아남도록
        provider 를 두 layout 의 **위**에 둔다. 흐름을 벗어나면 provider 가 사라지고 메모리 답도 함께 사라진다.
      */}
      <Route
        element={
          <SurveyUpdateSessionProvider>
            <Outlet />
          </SurveyUpdateSessionProvider>
        }
      >
        <Route element={<StackLayout topBar={<SurveyUpdateTopBar />} />}>
          <Route
            path={ROUTES.settingsChildSurvey}
            element={
              <RouteGuard>
                <SurveyUpdatePage />
              </RouteGuard>
            }
          />
        </Route>
        <Route element={<StackLayout />}>
          <Route
            path={ROUTES.settingsChildSurveyStep}
            element={
              <RouteGuard>
                <SurveyUpdateStepPage />
              </RouteGuard>
            }
          />
        </Route>
      </Route>
      <Route element={<StackLayout />}>
        <Route path={ROUTES.notFound} element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

/** 앱 조립 지점에서 쓰는 Router (history 연결 포함). 테스트는 `AppRoutes` 를 직접 쓴다. */
export function AppRouter() {
  return (
    <BrowserRouter>
      <AppRoutes />
      {DevOverlay === null ? null : (
        <Suspense fallback={null}>
          <DevOverlay />
        </Suspense>
      )}
    </BrowserRouter>
  );
}
