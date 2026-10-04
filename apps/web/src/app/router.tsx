import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';

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
import { NotFoundPage } from '../pages/not-found/NotFoundPage';
import { OnboardingSessionProvider } from '../features/onboarding-survey';
import {
  OnboardingIntroPage,
  OnboardingSavedPage,
  OnboardingStartPage,
  OnboardingStepPage,
} from '../pages/onboarding';
import { SettingsPage, SettingsTopBar } from '../pages/settings';
import { ROUTES } from '../shared/config/routes';

import { RouteGuard } from './guards/RouteGuard';
import { StackLayout } from './layouts/StackLayout';

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
 * | `/`                      | StackLayout     | Home skeleton — `HomeTopBar`(워드마크 `26:39` + 설정 `26:44`) |
 * | `/settings`              | StackLayout     | TopBar centered — 로그아웃 1행 |
 * | `/__dev/ui/*`            | (dev 전용)      | UI gallery — dev 에서만 존재한다 |
 * | `/__dev/screens`         | (dev 전용)      | 검수용 화면 목록 — dev 에서만 존재한다 |
 * | `*`                      | StackLayout     | NotFound |
 *
 * `/auth/*` 는 화면마다 TopBar 구성이 달라서 **Page 가 직접 `StackLayout` 을 조립**한다
 * (layout route 로 묶으면 TopBar 를 화면별로 줄 수 없다). Page 는 여전히 Composition 만 한다.
 *
 * Stage 2 에 등록하지 않는 route: `/onboarding/profile` · `/onboarding/growth-capability`
 * (**Stage 2-B** — 디자이너 Figma 대기, approvals §3). `ROUTES` 에도 두지 않는다.
 * BottomTabBar 를 쓰는 TabLayout route 는 Stage 3 이다 — Home 에 탭바를 마운트하지 않는다 (#33).
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
        재마운트되기 때문이다 (features/onboarding-survey/model/onboardingSession.tsx).
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
        Home 헤더는 `variant="large"` 에 제목 없이 워드마크 + 설정만 두는 구성이라
        다른 화면과 공유할 수 없다 → `/` 전용 layout route 다 (Design Spec §2.13).
      */}
      <Route element={<StackLayout topBar={<HomeTopBar />} />}>
        <Route
          path={ROUTES.home}
          element={
            <RouteGuard>
              <HomePage />
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
