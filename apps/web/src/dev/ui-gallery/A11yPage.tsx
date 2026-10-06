/**
 * `/__dev/ui/a11y` — focus 순회 · 터치 타깃 오버레이 · 대비 값 표시 (Design Spec §11-5 · §9.3 · §9.4).
 *
 * 수치는 문서에서 옮겨 적지 않고 **실제 렌더 결과에서 측정**한다.
 * 그래야 가값(P-01 · P-02 · P-03 · P-11 · **P-24**) 승인 자료가 토큰 값과 어긋나지 않는다
 * (Plan §17-3). `B-3` 은 Library `LT-1` 재매핑으로 **P-01 → P-24** 로 소속이 바뀌었다.
 */
import {
  Button,
  Checkbox,
  Chip,
  Icon,
  IconButton,
  SectionHeader,
  Surface,
  Tag,
  Text,
  TextField,
} from '@haru/ui';
import { useCallback, useEffect, useRef, useState } from 'react';

import { galleryCopy } from './gallery-copy';
import { measurePairs, type ContrastPair, type ContrastResult } from './contrast';
import { Row, Section, Stack, Stage, SubHead } from './primitives';
import { measureInteractive, TOUCH_TARGET_MIN, type HitAreaResult } from './hitArea';

const copy = galleryCopy.a11y;

/** Design Spec §9.4 (A)~(E). threshold: 본문 4.5 · 큰 텍스트/비텍스트 3.0 (WCAG AA). */
const CONTRAST_PAIRS: readonly ContrastPair[] = [
  {
    id: 'A-1',
    label: 'Accent 버튼 흰 라벨',
    foreground: '--color-fg-on-accent',
    background: '--color-action-primary-bg',
    threshold: 4.5,
    marker: 'D-01 수용 예외',
  },
  {
    id: 'B-1',
    label: '보조 텍스트 on glass',
    foreground: '--color-fg-secondary',
    background: '--color-surface-glass',
    threshold: 4.5,
    marker: '가값 P-01',
  },
  {
    id: 'B-2',
    label: '보조 텍스트 on strong',
    foreground: '--color-fg-secondary',
    background: '--color-surface-strong',
    threshold: 4.5,
    marker: '가값 P-01',
  },
  {
    id: 'B-3',
    label: '3차 텍스트 on solid',
    foreground: '--color-fg-tertiary',
    background: '--color-surface-solid',
    threshold: 4.5,
    marker: '가값 P-24',
  },
  {
    id: 'C-1',
    label: 'ProgressBar fill / track',
    foreground: '--color-progress-fill',
    background: '--color-progress-track',
    threshold: 3,
    marker: '가값 P-02',
  },
  {
    id: 'C-2',
    label: 'border-subtle on solid',
    foreground: '--color-border-subtle',
    background: '--color-surface-solid',
    threshold: 3,
    marker: '가값 P-02',
  },
  {
    id: 'C-3',
    label: 'Tag 글자 (emotion)',
    foreground: '--color-capability-emotion-fg',
    background: '--color-capability-emotion-bg',
    threshold: 4.5,
    marker: '가값 P-02',
  },
  {
    id: 'C-4',
    label: 'Tag 글자 (agency)',
    foreground: '--color-capability-agency-fg',
    background: '--color-capability-agency-bg',
    threshold: 4.5,
    marker: '가값 P-02',
  },
  {
    id: 'D-1',
    label: 'Glass 버튼 라벨',
    foreground: '--color-action-secondary-fg',
    background: '--color-action-secondary-bg',
    threshold: 4.5,
    marker: '가값 P-11',
  },
  {
    id: 'D-2',
    label: 'Glass 버튼 라벨 (배경 끝 위)',
    foreground: '--color-action-secondary-fg',
    background: '--color-action-secondary-bg',
    base: '--color-bg-app-end',
    threshold: 4.5,
    marker: '가값 P-11',
  },
  {
    id: 'B-4',
    label: '보조 텍스트 on glass (배경 끝 위)',
    foreground: '--color-fg-secondary',
    background: '--color-surface-glass',
    base: '--color-bg-app-end',
    threshold: 4.5,
    marker: '가값 P-01',
  },
  {
    id: 'E-1',
    label: '본문 텍스트 on solid',
    foreground: '--color-fg-primary',
    background: '--color-surface-solid',
    threshold: 4.5,
    marker: '통과 기대',
  },
  {
    id: 'E-2',
    label: 'focus ring on solid',
    foreground: '--color-focus-ring',
    background: '--color-surface-solid',
    threshold: 3,
    marker: '가값 P-03',
  },
  {
    id: 'E-3',
    label: 'focus ring on glass',
    foreground: '--color-focus-ring',
    background: '--color-surface-glass',
    threshold: 3,
    marker: '가값 P-03',
  },
  {
    id: 'E-4',
    label: 'focus ring on accent',
    foreground: '--color-focus-ring',
    background: '--color-action-primary-bg',
    threshold: 3,
    marker: '가값 P-03',
  },
];

function ratioClass(result: ContrastResult): string {
  if (result.ratio === null) return 'haru-dev-warn';
  return result.ratio >= result.threshold ? 'haru-dev-pass' : 'haru-dev-fail';
}

function ContrastTable() {
  const [results, setResults] = useState<readonly ContrastResult[]>([]);

  useEffect(() => {
    let cancelled = false;

    void document.fonts.ready.then(() => {
      if (!cancelled) setResults(measurePairs(CONTRAST_PAIRS));
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <table className="haru-dev-table" data-testid="contrast-table">
      <thead>
        <tr>
          <th>#</th>
          <th>대상</th>
          <th>측정 대비</th>
          <th>기준</th>
          <th>표시</th>
        </tr>
      </thead>
      <tbody>
        {results.map((result) => (
          <tr key={result.id} data-contrast-id={result.id}>
            <td>{result.id}</td>
            <td>{result.label}</td>
            <td className={`haru-dev-mono ${ratioClass(result)}`} data-ratio={result.ratio ?? ''}>
              {result.ratio === null ? '—' : `${result.ratio.toFixed(2)}:1`}
            </td>
            <td className="haru-dev-mono">{result.threshold.toFixed(1)}:1</td>
            <td>{result.marker}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TouchTargets() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [results, setResults] = useState<readonly HitAreaResult[]>([]);

  const measure = useCallback(() => {
    if (containerRef.current === null) return;
    setResults(measureInteractive(containerRef.current));
  }, []);

  useEffect(() => {
    void document.fonts.ready.then(measure);
  }, [measure]);

  return (
    <>
      <div ref={containerRef} data-testid="touch-targets">
        <Stage>
          <Stack>
            <Row>
              <IconButton
                icon={<Icon name="chevron-left" size="md" decorative />}
                label={galleryCopy.components.iconButtonBack}
              />
              <IconButton
                variant="plain"
                icon={<Icon name="x" size="md" decorative />}
                label={galleryCopy.components.iconButtonClose}
              />
              <Chip label="Chip" />
              <Button size="md">Button md</Button>
            </Row>
            <Checkbox
              checked={false}
              onChange={() => undefined}
              label={galleryCopy.components.checkboxLabel}
            />
            <TextField
              label={galleryCopy.components.fieldPasswordLabel}
              value="secret"
              onChange={() => undefined}
              type="password"
              trailingAction={{ label: galleryCopy.components.fieldShow, onPress: () => undefined }}
            />
            {/*
              Library `SectionHeader` 의 "See all" — 시각 39×14 로 44 에 **미달**이며
              `::after` 로만 hit area 를 넓힌다 (Library Design Spec §9.2). 여기에 두어
              `e2e/a11y.spec.ts` 의 전수 검사가 실제 렌더에서 44 를 확인하게 한다.
            */}
            <SectionHeader
              title={galleryCopy.stage3Library.sectionFavorites}
              action={{
                label: galleryCopy.stage3Library.seeAll,
                onPress: () => undefined,
              }}
            />
          </Stack>
        </Stage>
      </div>

      <Button variant="glass" onPress={measure}>
        {copy.measureLabel}
      </Button>

      <table className="haru-dev-table" data-testid="touch-table">
        <thead>
          <tr>
            <th>요소</th>
            <th>시각 크기</th>
            <th>실제 hit</th>
            <th>44×44 도달</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, index) => (
            <tr key={`${result.label}-${index}`}>
              <td>
                {result.tag} · {result.label}
              </td>
              <td className="haru-dev-mono">
                {result.width}×{result.height}
              </td>
              <td className="haru-dev-mono" data-hit={`${result.hitWidth}x${result.hitHeight}`}>
                {result.hitWidth}×{result.hitHeight}
              </td>
              <td className={result.reaches ? 'haru-dev-pass' : 'haru-dev-fail'}>
                {result.reaches ? 'reaches' : 'below'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

/** focus ring 은 배경마다 다르게 보인다 — white · glass · accent 세 바탕에서 확인한다 (§9.3). */
function FocusTour() {
  return (
    <div data-testid="focus-tour">
      <Stage>
        <Stack>
          <SubHead>on solid</SubHead>
          <Surface material="none" fill="solid" radius="card" padding="4">
            <Row>
              <Button variant="accent">accent</Button>
              <Button variant="glass">glass</Button>
              <Chip label="chip" />
              <IconButton
                icon={<Icon name="settings" size="md" decorative />}
                label={galleryCopy.components.iconButtonSettings}
              />
            </Row>
          </Surface>

          <SubHead>on glass</SubHead>
          <Surface material="rest" fill="glass" radius="card" padding="4">
            <Row>
              <Button variant="glass">glass</Button>
              <Chip label="chip" variant="glass" />
              <Tag label="tag" tone="agency" />
            </Row>
          </Surface>

          <SubHead>on accent</SubHead>
          <Surface material="none" fill="none" radius="card" padding="4">
            <Row>
              <Button variant="accent">accent</Button>
            </Row>
          </Surface>
        </Stack>
      </Stage>
    </div>
  );
}

export function A11yPage() {
  return (
    <>
      <p className="haru-dev-lede">
        Tab 으로 순회하며 focus 표시를 확인하고, 터치 타깃은 44×44 도달 여부를 실측한다. 대비는
        렌더된 색을 읽어 계산한 값이다 (문서에서 옮겨 적지 않는다).
      </p>

      <Section
        id="v9-focus"
        title={copy.focusTourTitle}
        note="DOM 순서 = 시각 순서. :focus-visible 에서만 링을 그린다 (§9.3, 가값 P-03)."
      >
        <FocusTour />
      </Section>

      <Section
        id="v9-touch"
        title={copy.touchTargetTitle}
        note={`elementFromPoint 로 ${TOUCH_TARGET_MIN}×${TOUCH_TARGET_MIN} 도달 여부를 측정한다 (AC-1-21).`}
      >
        <TouchTargets />
      </Section>

      <Section
        id="v9-contrast"
        title={copy.contrastTitle}
        note="Design Spec §9.4 — D-01 수용 예외와 가값 P-01 · P-02 · P-03 · P-11 의 실측값."
      >
        <Stage plain>
          <ContrastTable />
          <Text variant="caption-1" tone="secondary">
            반투명 색은 앱 배경 시작색 위에 합성해 계산한다. blur · 그림자는 반영하지 않는다.
          </Text>
        </Stage>
      </Section>
    </>
  );
}
