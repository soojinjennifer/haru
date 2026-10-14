/**
 * dev UI Gallery 진입점 — **`import.meta.env.DEV` 가드 + 동적 import 로만 로드된다**
 * (`app/router.tsx`). Production(`VITE_API_MODE=http`) 빌드에서는 이 모듈 그래프 전체가 사라진다
 * (Plan §16 D-6, AC-1-42). 검증: `pnpm assert:no-mocks`.
 *
 * route 표 (Design Spec §11-5)
 * | path                    | 내용 |
 * |-------------------------|------|
 * | `/__dev/ui/tokens`      | 색 · 타입 · spacing · radius · shadow · material swatch |
 * | `/__dev/ui/components`  | Shared UI 22종 × variant × state |
 * | `/__dev/ui/states`      | 공통 상태 6종 (AppColumn + TopBar 컨텍스트) |
 * | `/__dev/ui/responsive`  | 320 / 393 / 600 / 1024 프레임 |
 * | `/__dev/ui/a11y`        | focus 순회 · 터치 타깃 · 대비 실측 |
 * | `/__dev/ui/frame`       | (보조) gallery chrome 없는 순수 앱 컬럼 화면 — iframe · 측정 대상 |
 * | `/__dev/ui/recording-spike` | (Stage 4 `S4-A`) Web 녹음 측정판 — 자동 드라이버 대상 + 실기기 수동 측정 |
 *
 * `recording-spike` 는 `frame` 과 같이 **`GalleryLayout` 밖**에 둔다 — gallery 상단
 * 내비게이션을 끼우면 chip 이 한 줄 늘어 그 아래 스크롤되는 영역 screenshot baseline 이
 * 깨진다 (`DevScreens.tsx` 머리말과 같은 이유 · `R-BASELINE-1`). 링크도 추가하지 않는다.
 */
import { ToastProvider } from '@haru/ui';
import { Navigate, Route, Routes } from 'react-router';

import { __HARU_DEV_SENTINEL__ } from './devSentinel';
import { A11yPage } from './ui-gallery/A11yPage';
import { ComponentsPage } from './ui-gallery/ComponentsPage';
import { FramePage } from './ui-gallery/FramePage';
import { GalleryLayout } from './ui-gallery/GalleryLayout';
import { RecordingSpikePage } from './recording-spike/RecordingSpikePage';
import { ResponsivePage } from './ui-gallery/ResponsivePage';
import { StatesPage } from './ui-gallery/StatesPage';
import { TokensPage } from './ui-gallery/TokensPage';

import './dev.css';

export default function DevGallery() {
  return (
    <div className="haru-dev-root" data-dev-sentinel={__HARU_DEV_SENTINEL__}>
      <ToastProvider>
        <Routes>
          <Route path="frame" element={<FramePage />} />
          <Route path="recording-spike" element={<RecordingSpikePage />} />
          <Route element={<GalleryLayout />}>
            <Route index element={<Navigate to="tokens" replace />} />
            <Route path="tokens" element={<TokensPage />} />
            <Route path="components" element={<ComponentsPage />} />
            <Route path="states" element={<StatesPage />} />
            <Route path="responsive" element={<ResponsivePage />} />
            <Route path="a11y" element={<A11yPage />} />
          </Route>
        </Routes>
      </ToastProvider>
    </div>
  );
}
