import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';

import { NotFoundPage } from '../pages/not-found/NotFoundPage';
import { PlaceholderPage } from '../pages/placeholder/PlaceholderPage';
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
const DevOverlay = import.meta.env.DEV ? lazy(() => import('../dev/DevOverlay')) : null;

/**
 * Stage 1 route 표 (Plan §5.4)
 *
 * | path             | layout      | 비고 |
 * |------------------|-------------|------|
 * | `/`              | StackLayout | 임시 placeholder — Stage 2 에서 Home 골격으로 교체 |
 * | `/__dev/ui/*`    | (dev 전용)  | UI gallery — dev 에서만 존재한다 |
 * | `*`              | StackLayout | NotFound |
 *
 * BottomTabBar 를 쓰는 TabLayout route 는 Stage 3 이다.
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
      <Route element={<StackLayout />}>
        <Route
          path={ROUTES.home}
          element={
            <RouteGuard>
              <PlaceholderPage />
            </RouteGuard>
          }
        />
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
