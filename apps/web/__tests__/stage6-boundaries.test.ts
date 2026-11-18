/**
 * Stage 6 `S6-F` 레이어 · dev 화면 목록 가드 (AC-6-48 · AC-6-14 · AC-6-13).
 *
 * `pnpm lint:boundaries`(dependency-cruiser)가 레이어 방향과 feature 간 import 를 막는다. 여기서는 그 규칙이
 * 놓치는 Stage 6 고유 사실을 소스에서 직접 본다:
 *  1. Stage 6 route 가 dev `/__dev/screens` 목록에 전부 있다 (R-6).
 *  2. Stage 6 Page 는 Composition 만 — API Client · Adapter · Mock · fetch import 0.
 *  3. `survey-update` ↔ `onboarding-survey` 직접 import 0 (`R-5` 이후 공용은 `entities/survey`).
 *  4. Stage 6 feature · entity 가 `mocks/` 를 import 하지 않는다 (Mock Data 하드코딩 0).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

import { describe, expect, it } from 'vitest';

import { ROUTES } from '../src/shared/config/routes';

const SRC = join(import.meta.dirname, '..', 'src');

function read(...segments: string[]): string {
  return readFileSync(join(SRC, ...segments), 'utf8');
}

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === '__tests__' ? [] : sources(path);
    return /\.(ts|tsx)$/.test(name) ? [path] : [];
  });
}

function importsOf(path: string): string[] {
  return [...readFileSync(path, 'utf8').matchAll(/from\s+['"]([^'"]+)['"]/g)].map(
    (match) => match[1] ?? '',
  );
}

const STAGE6_ROUTES = [
  ROUTES.onboarding.profile,
  ROUTES.onboarding.growthCapability,
  ROUTES.settings,
  ROUTES.settingsProfile,
  ROUTES.settingsChild,
  ROUTES.settingsChildSurvey,
  ROUTES.settingsGrowthCapability,
] as const;

const STAGE6_PAGES = [
  'pages/onboarding/OnboardingProfilePage.tsx',
  'pages/onboarding/OnboardingGrowthPage.tsx',
  'pages/onboarding/OnboardingGrowthTopBar.tsx',
  'pages/settings/ProfilePage.tsx',
  'pages/settings/ProfileTopBar.tsx',
  'pages/settings/ChildInfoEditPage.tsx',
  'pages/settings/ChildInfoEditTopBar.tsx',
  'pages/settings/SurveyUpdatePage.tsx',
  'pages/settings/SurveyUpdateStepPage.tsx',
  'pages/settings/SurveyUpdateTopBar.tsx',
  'pages/settings/GrowthCapabilityPage.tsx',
  'pages/settings/GrowthCapabilityTopBar.tsx',
] as const;

const STAGE6_MODULE_DIRS = [
  'features/child-profile-view',
  'features/child-profile-edit',
  'features/growth-capability',
  'features/survey-update',
  'features/settings',
  'entities/child-profile',
  'entities/child',
  'entities/survey',
] as const;

describe('dev 화면 목록 (R-6 · AC-6-14)', () => {
  it('Stage 6 route 7개가 `/__dev/screens` 에 전부 있다 · `children` · `activity-cards` 시나리오 그룹 등재', () => {
    const devScreens = read('dev', 'DevScreens.tsx');
    const missing = STAGE6_ROUTES.filter((path) => !devScreens.includes(`path: '${path}'`));
    expect(missing).toStrictEqual([]);
    expect(devScreens).toContain("group: 'children'");
    expect(devScreens).toContain("group: 'activity-cards'");
  });
});

describe('레이어 (AC-6-48 · AC-6-13)', () => {
  it('Stage 6 Page = Composition — API Client · Adapter · Mock · fetch 0', () => {
    const offenders = STAGE6_PAGES.flatMap((page) => {
      const text = read(page);
      const bad = importsOf(join(SRC, page)).filter((spec) =>
        /shared\/api|\/mocks|Adapter|@tanstack\/react-query/.test(spec),
      );
      return [...bad, ...(/\bfetch\(/.test(text) ? ['fetch('] : [])].map(
        (spec) => `${page}: ${spec}`,
      );
    });
    expect(offenders).toStrictEqual([]);
  });

  it('`survey-update` ↔ `onboarding-survey` 직접 import 0 (R-5 이후 공용 = `entities/survey`)', () => {
    const cross = [
      ...sources(join(SRC, 'features', 'survey-update')).flatMap((path) =>
        importsOf(path)
          .filter((spec) => spec.includes('onboarding-survey'))
          .map((spec) => `${relative(SRC, path)} → ${spec}`),
      ),
      ...sources(join(SRC, 'features', 'onboarding-survey')).flatMap((path) =>
        importsOf(path)
          .filter((spec) => spec.includes('survey-update'))
          .map((spec) => `${relative(SRC, path)} → ${spec}`),
      ),
    ];
    expect(cross).toStrictEqual([]);
  });

  it('Stage 6 feature · entity → `mocks/` import 0 · 다른 feature import 0', () => {
    const offenders = STAGE6_MODULE_DIRS.flatMap((dir) =>
      sources(join(SRC, dir)).flatMap((path) =>
        importsOf(path)
          .filter(
            (spec) =>
              spec.includes('/mocks') ||
              (spec.includes('features/') && !spec.includes(dir.replace('features/', ''))),
          )
          .map((spec) => `${relative(SRC, path)} → ${spec}`),
      ),
    );
    expect(offenders).toStrictEqual([]);
  });
});
