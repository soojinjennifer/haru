/**
 * `/__dev/ui/frame` — gallery chrome 없는 **순수 앱 컬럼 화면**.
 *
 * 쓰임
 *  ① `/__dev/ui/responsive` 의 iframe 대상 (320 / 393 / 600 / 1024 프레임)
 *  ② Playwright viewport 4종 측정 대상 (AC-1-23) — 측정값을 `data-*` 로 노출한다
 *  ③ 200% 텍스트 확대 reflow · reduced-motion 확인 (AC-1-22)
 *
 * 실제 제품 화면이 아니다. 레이아웃 규칙(AppColumn · TopBar · BottomTabBar · 하단 CTA)만 담는다.
 */
import {
  AppBackground,
  AppColumn,
  BottomTabBar,
  Button,
  Icon,
  IconButton,
  Surface,
  Text,
  TopBar,
} from '@haru/ui';
import { useEffect, useState } from 'react';

import { galleryCopy } from './gallery-copy';
import { TAB_ITEMS } from './TabBarDemo';

interface Measurement {
  viewport: number;
  column: number;
  content: number;
}

function useMeasurement(selector: string): Measurement | null {
  const [measurement, setMeasurement] = useState<Measurement | null>(null);

  useEffect(() => {
    function measure(): void {
      const column = document.querySelector(selector);
      if (column === null) return;

      const rect = column.getBoundingClientRect();
      const style = window.getComputedStyle(column);
      const padding =
        Number.parseFloat(style.paddingInlineStart) + Number.parseFloat(style.paddingInlineEnd);

      setMeasurement({
        viewport: window.innerWidth,
        column: Math.round(rect.width),
        content: Math.round(rect.width - padding),
      });
    }

    measure();
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('resize', measure);
    };
  }, [selector]);

  return measurement;
}

export function FramePage() {
  const measurement = useMeasurement('.haru-app-column');

  return (
    <div className="haru-dev-screen">
      <AppBackground />
      <AppColumn as="div" id="frame-app-column">
        <div className="haru-dev-screen__inner">
          <TopBar
            variant="centered"
            title={galleryCopy.states.screenTitle}
            sticky={false}
            leading={
              <IconButton
                icon={<Icon name="chevron-left" size="md" decorative />}
                label={galleryCopy.components.iconButtonBack}
              />
            }
            trailing={
              <IconButton
                icon={<Icon name="settings" size="md" decorative />}
                label={galleryCopy.components.iconButtonSettings}
              />
            }
          />

          <main className="haru-dev-screen__content">
            <Surface material="rest" fill="strong" radius="card" padding="6">
              <Text variant="headline" as="h1">
                {galleryCopy.states.screenTitle}
              </Text>
              <Text variant="subheadline" tone="secondary">
                The app column keeps the same mobile layout at every width. Above 600px it is capped
                at 480px and centred.
              </Text>
            </Surface>

            <Surface material="rest" fill="glass" radius="card" padding="6">
              <Text variant="body">
                Long paragraphs reflow instead of scrolling sideways, so 320px at 200% text zoom
                stays readable.
              </Text>
            </Surface>

            <p
              className="haru-dev-readout"
              data-viewport={measurement?.viewport ?? ''}
              data-column-width={measurement?.column ?? ''}
              data-content-width={measurement?.content ?? ''}
            >
              viewport {measurement?.viewport ?? '—'} · column {measurement?.column ?? '—'} ·
              content {measurement?.content ?? '—'}
            </p>

            <Button fullWidth size="lg">
              {galleryCopy.components.buttonLabel}
            </Button>
          </main>

          <div className="haru-dev-screen__tabs">
            <BottomTabBar
              items={[...TAB_ITEMS]}
              activeKey="home"
              onSelect={() => undefined}
              label={galleryCopy.components.tabsLabel}
            />
          </div>
        </div>
      </AppColumn>
    </div>
  );
}
