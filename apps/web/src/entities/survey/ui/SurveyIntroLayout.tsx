/**
 * 설문 소개 화면 골격 — Figma `243:1147` · `179:1748` (Stage 2 재구성 Design Spec §2) 의 **레이아웃만**.
 *
 * Stage 6 `R-5`(`N6-06` ⓐ) · Spec §2.6.1: 온보딩 소개 2종(`OnboardingIntro`)과 설문 재응답 진입(`SurveyUpdateIntro`)이
 * **같은 골격**을 쓴다. `OnboardingIntro` 의 마크업을 그대로 옮겼다 — DOM·클래스·순서 변경 0 (Stage 2 baseline 불변).
 *
 * ```
 * CharacterMedallion headphones md
 * Surface strong / card / 5  — h1 title-3 + subheadline(secondary)
 * InfoRow clock · InfoRow list-checks
 * {children}  ← 화면별 안내 블록 (온보딩 = Draft · Trial 안내, 재응답 = 없음)
 * CTA Button accent lg fullWidth (흐름 배치 mt-auto pt-8)
 * ```
 *
 * 문구·이동·데이터는 모른다 — 전부 props 다.
 */
import { Button, Icon, InfoRow, Surface, Text } from '@haru/ui';
import type { ReactNode } from 'react';

import { CharacterMedallion } from '../../character';

export interface SurveyIntroLayoutProps {
  title: string;
  body: string;
  /** 시계 행 문구. `undefined` 면 행을 그리지 않는다 (수치를 아직 모를 때). */
  duration: string | undefined;
  /** 목록 행 문구. */
  format: string;
  ctaLabel: string;
  onCta: () => void;
  /** CTA 진행 표시 (데이터 조회 중). */
  ctaLoading?: boolean | undefined;
  /** InfoRow 와 CTA 사이 블록 — 화면별 안내. */
  children?: ReactNode;
}

export function SurveyIntroLayout({
  title,
  body,
  duration,
  format,
  ctaLabel,
  onCta,
  ctaLoading,
  children,
}: SurveyIntroLayoutProps) {
  return (
    <div className="flex flex-1 flex-col items-center gap-7 pt-6">
      <CharacterMedallion asset="headphones" size="md" />

      <Surface fill="strong" radius="card" padding="5">
        <div className="flex flex-col gap-2">
          <Text variant="title-3" tone="primary" as="h1">
            {title}
          </Text>
          <Text variant="subheadline" tone="secondary">
            {body}
          </Text>
        </div>
      </Surface>

      <div className="flex w-full flex-col gap-2">
        {duration === undefined ? null : (
          <InfoRow icon={<Icon name="clock" decorative />}>{duration}</InfoRow>
        )}
        <InfoRow icon={<Icon name="list-checks" decorative />}>{format}</InfoRow>
      </div>

      {children}

      <div className="mt-auto w-full pt-8">
        <Button variant="accent" size="lg" fullWidth loading={ctaLoading === true} onPress={onCta}>
          {ctaLabel}
        </Button>
      </div>
    </div>
  );
}
