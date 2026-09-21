/**
 * BottomTabBar 데모 — Design Spec §6.2 · Plan AC-1-25.
 *
 * `items` 는 **gallery 안에서** 조립한다. 실제 route·copy 조립(`shared/config` + `shared/copy`)은
 * 탭을 화면에 마운트하는 Stage 3 의 일이다 (Design Spec §11-8: Stage 1 은 `/` 에 탭바를 붙이지 않는다).
 *
 * 탭 아이콘 글리프는 `book` / `chart-no-axes-column-increasing` 으로 **확정**되었다
 * (결정 `S1-D2-5`, approvals §8 — Figma `25:87` 대조).
 */
import { BottomTabBar, Text, type TabBarItem } from '@haru/ui';
import { useState } from 'react';

import { galleryCopy } from './gallery-copy';
import { Section, Stack, Stage, SubHead } from './primitives';

/** Design Spec §6.2 표 — Library / Home(center) / Progress. Session 탭은 없다 (#15, D-02). */
export const TAB_ITEMS: readonly TabBarItem[] = [
  { key: 'library', label: 'Library', icon: 'book' },
  { key: 'home', label: 'Home', icon: 'haru:tab-center-home', emphasis: 'center' },
  { key: 'progress', label: 'Progress', icon: 'chart-no-axes-column-increasing' },
];

export function TabBarDemo() {
  const [active, setActive] = useState('home');

  return (
    <Section
      id="v3-tab-bar"
      title="8. BottomTabBar"
      note="Library / Home(center) / Progress — active 3종 (Figma 25:87 · 140:2971)"
    >
      <Stage>
        <Stack>
          {TAB_ITEMS.map((item) => (
            <div key={item.key} data-tab-active={item.key}>
              <BottomTabBar
                items={[...TAB_ITEMS]}
                activeKey={item.key}
                onSelect={() => undefined}
                label={galleryCopy.components.tabsLabel}
              />
            </div>
          ))}
          <SubHead>interactive</SubHead>
          <BottomTabBar
            items={[...TAB_ITEMS]}
            activeKey={active}
            onSelect={setActive}
            label={galleryCopy.components.tabsLabel}
          />
          <Text variant="caption-1" tone="secondary">
            탭 아이콘 글리프는 Figma 25:87 대조로 book / chart-no-axes-column-increasing 으로
            확정되었다 (S1-D2-5).
          </Text>
        </Stack>
      </Stage>
    </Section>
  );
}
