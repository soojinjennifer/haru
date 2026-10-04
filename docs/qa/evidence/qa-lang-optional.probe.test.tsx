/**
 * QA probe (3회차) — 언어 환경 **선택 항목 + 기본값 영어** 의 두 상태 구분 실측.
 * Product Code 아니다. 구현자 테스트와 독립적으로 작성했다.
 *
 * 확인 대상:
 *  1. draft 키 없음 → 폼/화면 `English` 기본 선택
 *  2. draft `[]` → 해제 상태 유지 (기본값이 되살아나지 않는다)
 *  3. 전부 해제 → 저장소가 `[]` 로 남는다 (영어로 되돌리지 않는다)
 *  4. 전부 해제 → 전진이 막히지 않는다
 *  5. 제출 payload 는 `['english']`, 직접 고른 값은 덮어쓰지 않는다
 *  6. `gender: null` 제출이 차단되지 않는다
 *  7. `EMPTY_CHILD_INFO_FORM` 에 기본값이 없다 (QA-2R-009 재발 방지선)
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { AppRoutes } from '/Users/soojin/dev/haru/apps/web/src/app/router';
import {
  DEFAULT_ONBOARDING_INSTRUMENT,
  onboardingCopy,
} from '/Users/soojin/dev/haru/apps/web/src/features/onboarding-survey';
import { buildSubmitRequest } from '/Users/soojin/dev/haru/apps/web/src/features/onboarding-survey/model/submitRequest';
import { setSurveyAnswer } from '/Users/soojin/dev/haru/apps/web/src/features/onboarding-survey/model/surveyAnswers';
import { MOCK_REQUIRED_CONSENT_TYPES } from '/Users/soojin/dev/haru/apps/web/src/mocks/fixtures/consent';
import { ONBOARDING_DRAFT_STORAGE_KEY } from '/Users/soojin/dev/haru/apps/web/src/shared/lib/onboarding-draft';
import {
  EMPTY_CHILD_INFO_FORM,
  childInfoFormFrom,
} from '/Users/soojin/dev/haru/apps/web/src/shared/lib/child-info';
import { createHarness } from '/Users/soojin/dev/haru/apps/web/src/test/harness';

const CREDENTIALS = { email: 'sam@example.com', password: 'sunny-evening-8' } as const;
const NOW = new Date('2026-10-04T00:00:00.000Z');

type Draft = Record<string, unknown>;

function seedDraft(childInfo: Draft): void {
  globalThis.localStorage.setItem(
    ONBOARDING_DRAFT_STORAGE_KEY,
    JSON.stringify({
      schemaVersion: 1,
      instrument: {
        code: DEFAULT_ONBOARDING_INSTRUMENT.code,
        version: DEFAULT_ONBOARDING_INSTRUMENT.version,
      },
      currentStep: 'child_info',
      answers: { child_info: childInfo },
      updatedAt: NOW.toISOString(),
    }),
  );
}

function storedChildInfo(): Draft | undefined {
  const raw = globalThis.localStorage.getItem(ONBOARDING_DRAFT_STORAGE_KEY);
  if (raw === null) return undefined;
  const parsed = JSON.parse(raw) as { answers?: { child_info?: Draft } };
  return parsed.answers?.child_info;
}

async function renderChildInfo(childInfo: Draft): Promise<void> {
  seedDraft(childInfo);
  const harness = createHarness({ initialEntries: ['/onboarding/child-info'], scenarios: [] });
  await harness.bundle.authGateway.signInWithEmail({ ...CREDENTIALS });
  harness.bundle.consentState.grant(MOCK_REQUIRED_CONSENT_TYPES);
  const Wrapper = harness.wrapper;

  render(
    <Wrapper>
      <AppRoutes />
    </Wrapper>,
  );

  await screen.findByRole('button', { name: 'English' });
}

function chip(label: string): HTMLElement {
  return screen.getByRole('button', { name: label });
}

function pressed(label: string): string | null {
  return chip(label).getAttribute('aria-pressed');
}

beforeEach(() => {
  globalThis.localStorage.clear();
});

describe('두 상태 구분 — 순수 함수', () => {
  it('키 없음 → 영어 기본 선택 / 빈 배열 → 해제 유지', () => {
    expect(childInfoFormFrom({ firstName: 'Nova' }, undefined).languageEnvironment).toStrictEqual([
      'english',
    ]);
    expect(
      childInfoFormFrom({ firstName: 'Nova', languageEnvironment: [] }, undefined)
        .languageEnvironment,
    ).toStrictEqual([]);
  });

  it('`EMPTY_CHILD_INFO_FORM` 에는 기본값이 없다 (가입 화면이 영어를 들고 다니지 않는다)', () => {
    expect(EMPTY_CHILD_INFO_FORM.languageEnvironment).toStrictEqual([]);
  });
});

describe('화면 실측 (`/onboarding/child-info`)', () => {
  it('언어 키가 없는 draft 에서 English 만 선택 상태로 보인다', async () => {
    await renderChildInfo({ firstName: 'Nova', gender: null });

    expect(pressed('English')).toBe('true');
    expect(pressed('Korean')).toBe('false');
  });

  it('빈 배열 draft 는 해제 상태로 보인다 (기본값이 되살아나지 않는다)', async () => {
    await renderChildInfo({ firstName: 'Nova', gender: null, languageEnvironment: [] });

    expect(pressed('English')).toBe('false');
  });

  it('전부 해제하면 저장소가 `[]` 로 남고 영어로 되돌리지 않는다', async () => {
    await renderChildInfo({ firstName: 'Nova', gender: null });

    fireEvent.click(chip('English'));

    await waitFor(() => {
      expect(storedChildInfo()?.['languageEnvironment']).toStrictEqual([]);
    });
    expect(pressed('English')).toBe('false');
  });

  it('직접 고른 값은 기본값이 덮어쓰지 않는다', async () => {
    await renderChildInfo({
      firstName: 'Nova',
      gender: null,
      languageEnvironment: ['korean', 'spanish'],
    });

    expect(pressed('Korean')).toBe('true');
    expect(pressed('Spanish')).toBe('true');
    expect(pressed('English')).toBe('false');

    fireEvent.click(chip('Arabic'));
    await waitFor(() => {
      expect(storedChildInfo()?.['languageEnvironment']).toStrictEqual([
        'korean',
        'spanish',
        'arabic',
      ]);
    });
  });

  it('전부 해제해도 다음 단계로 전진한다', async () => {
    await renderChildInfo({ firstName: 'Nova', birthYearMonth: '2021-04', gender: null });

    fireEvent.click(chip('English'));
    await waitFor(() => {
      expect(storedChildInfo()?.['languageEnvironment']).toStrictEqual([]);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Next', exact: true }));

    // 설문 소개(`/onboarding`) 로 넘어간다 — 화면 문구로 확인한다.
    expect(await screen.findByText(onboardingCopy.intro.survey.body)).toBeDefined();
  });
});

describe('가입 화면 통과 (`QA-2R-009` 재발 여부)', () => {
  async function signUpWithDraft(childInfo: Draft): Promise<void> {
    seedDraft(childInfo);
    const harness = createHarness({
      initialEntries: ['/auth/sign-up'],
      scenarios: ['me:consent-missing'],
    });
    const Wrapper = harness.wrapper;

    render(
      <Wrapper>
        <AppRoutes />
      </Wrapper>,
    );

    fireEvent.change(await screen.findByLabelText('Your name'), {
      target: { value: 'Sam Rivera' },
    });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: CREDENTIALS.email } });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: CREDENTIALS.password },
    });
    /*
      negative control — 아이 이름을 **바꿔서** 제출한다. 저장 경로가 실제로 돌았는지를
      이름 변화로 확인한다 (seed 값 그대로면 테스트가 헛돈다).
    */
    fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Mira' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    // 가입 저장이 끝난 것을 이름 변화로 확인한 뒤에 언어를 읽는다.
    await waitFor(() => {
      expect(storedChildInfo()?.['firstName']).toBe('Mira');
    });
  }

  it('Trial 에서 고른 언어가 가입을 지나도 남아 있다', async () => {
    await signUpWithDraft({
      firstName: 'Nova',
      birthYearMonth: '2021-04',
      gender: 'girl',
      languageEnvironment: ['korean', 'spanish'],
    });

    expect(storedChildInfo()?.['languageEnvironment']).toStrictEqual(['korean', 'spanish']);
    expect(storedChildInfo()?.['gender']).toBe('girl');
  });

  it('직접 해제한 상태(`[]`)를 가입이 영어로 되돌리지 않는다', async () => {
    await signUpWithDraft({
      firstName: 'Nova',
      birthYearMonth: '2021-04',
      gender: 'girl',
      languageEnvironment: [],
    });

    expect(storedChildInfo()?.['languageEnvironment']).toStrictEqual([]);
  });

  it('언어 키가 없는 draft 에 가입이 기본값을 심지 않는다 (키 없음 상태 유지)', async () => {
    await signUpWithDraft({ firstName: 'Nova', birthYearMonth: '2021-04', gender: 'girl' });

    expect('languageEnvironment' in (storedChildInfo() ?? {})).toBe(false);
  });
});

describe('제출 경계', () => {
  const instrument = DEFAULT_ONBOARDING_INSTRUMENT;

  function complete(childInfo: Draft): Record<string, unknown> {
    return instrument.survey.items.reduce<Record<string, unknown>>(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- probe: draft 타입을 직접 import 하지 않는다
      (answers, item) => setSurveyAnswer(answers as any, instrument, item.itemCode, 3) as any,
      {
        child_info: childInfo,
        reading_together: { storyComfort: 'quiet_gentle', readAloudBehavior: 'sits_and_listens' },
        growing_together: { growthGoals: ['emotion_regulation'] },
      },
    );
  }

  const BASE = { firstName: 'Nova', birthYearMonth: '2021-04', gender: null } as const;

  function build(childInfo: Draft) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- probe
    return buildSubmitRequest(instrument, complete(childInfo) as any, NOW);
  }

  it('`gender: null` + 언어 해제 상태의 제출이 막히지 않고 영어로 채워진다', () => {
    const built = build({ ...BASE, languageEnvironment: [] });

    expect(built.ok).toBe(true);
    if (!built.ok) return;
    expect(built.request.answers.child_info.gender).toBeNull();
    expect(built.request.answers.child_info.languageEnvironment).toStrictEqual(['english']);
  });

  it('언어 키가 없어도 제출이 막히지 않는다', () => {
    const built = build({ ...BASE });

    expect(built.ok).toBe(true);
    if (!built.ok) return;
    expect(built.request.answers.child_info.languageEnvironment).toStrictEqual(['english']);
  });

  it('고른 언어는 그대로 나간다', () => {
    const built = build({ ...BASE, languageEnvironment: ['korean', 'spanish'] });

    expect(built.ok).toBe(true);
    if (!built.ok) return;
    expect(built.request.answers.child_info.languageEnvironment).toStrictEqual([
      'korean',
      'spanish',
    ]);
  });

  /**
   * `gender` 를 언어와 **다르게** 둔 판단의 근거 검증 — 키를 빼면 미응답 사용자의 제출이
   * 실제로 막힌다. 그래서 `partialChildInfoAnswers` 가 `gender` 키를 항상 유지하는 것이 옳다.
   */
  it('`gender` 키가 없으면 제출이 막힌다 (키 유지 판단의 근거)', () => {
    const { gender: _omit, ...withoutGender } = BASE;
    const built = build({ ...withoutGender, languageEnvironment: ['english'] });

    expect(built.ok).toBe(false);
    if (built.ok) return;
    expect(built.missing).toContain('child_info');
  });

  it('negative control — 필수(이름)가 비면 제출이 막힌다', () => {
    const built = build({ birthYearMonth: '2021-04', gender: null });

    expect(built.ok).toBe(false);
  });
});
