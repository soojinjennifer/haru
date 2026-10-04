/**
 * QA 독립 검증 — `AC-2R-13` (Privacy Critical).
 * stage-qa-agent 가 작성한 **검증용 probe** 다. Product Code 가 아니다.
 *
 * 구현자 테스트가 덮지 않은 구간을 직접 재현한다:
 *  ① Create account 화면의 **아이 입력란에 실제로 타이핑**한 뒤 가입 → 동의 성공까지
 *     전 구간 Mock 요청 로그에 아동 금칙 키 0건.
 *  ② 검사기(`findChildDataKeys`) 자체가 같은 값을 payload 에 넣으면 **탐지**한다 (negative control).
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AppRoutes } from '/Users/soojin/dev/haru/apps/web/src/app/router';
import { CHILD_DATA_KEYS, findChildDataKeys } from '/Users/soojin/dev/haru/apps/web/src/mocks/request-log';
import { createHarness, type Harness } from '/Users/soojin/dev/haru/apps/web/src/test/harness';
import { authCopy } from '/Users/soojin/dev/haru/apps/web/src/features/auth/copy';
import { onboardingCopy } from '/Users/soojin/dev/haru/apps/web/src/features/onboarding-survey/copy';

function renderAt(path: string, scenarios: readonly string[] = []): Harness {
  const harness = createHarness({ initialEntries: [path], scenarios });
  const Wrapper = harness.wrapper;
  render(
    <Wrapper>
      <AppRoutes />
    </Wrapper>,
  );
  return harness;
}

const CHILD_NAME = 'Zephyrine';
const CHILD_LAST = 'Quintanilla';

describe('QA probe — AC-2R-13', () => {
  it('아이 입력란을 채운 뒤 가입해도 요청 로그에 아동 키 0건', async () => {
    const harness = renderAt('/auth/sign-up');

    fireEvent.change(await screen.findByLabelText(authCopy.signUp.nameLabel), {
      target: { value: 'Sam Rivera' },
    });
    fireEvent.change(screen.getByLabelText(authCopy.signUp.emailLabel), {
      target: { value: 'sam@example.com' },
    });
    fireEvent.change(screen.getByLabelText(authCopy.signUp.passwordLabel), {
      target: { value: 'sunny-evening-8' },
    });

    // ★ 아이 입력란을 실제로 채운다.
    fireEvent.change(screen.getByLabelText(new RegExp(onboardingCopy.childInfo.firstName)), {
      target: { value: CHILD_NAME },
    });
    fireEvent.change(screen.getByLabelText(new RegExp(onboardingCopy.childInfo.lastName)), {
      target: { value: CHILD_LAST },
    });

    fireEvent.click(screen.getByRole('button', { name: authCopy.signUp.submit }));

    await waitFor(() => {
      expect(
        harness.bundle.requestLog
          .entries()
          .some((e) => e.operation === 'AuthGateway.signUpWithEmail'),
      ).toBe(true);
    });

    const entries = harness.bundle.requestLog.entries();
    // eslint-disable-next-line no-console
    console.log('QA-PROBE operations:', JSON.stringify(entries.map((e) => e.operation)));
    // eslint-disable-next-line no-console
    console.log('QA-PROBE payloads:', JSON.stringify(entries));

    expect(findChildDataKeys(entries)).toStrictEqual([]);
    // 값 단위로도 아이 이름이 payload 에 없다 (키 기반 검사기의 공백 보완).
    expect(JSON.stringify(entries)).not.toContain(CHILD_NAME);
    expect(JSON.stringify(entries)).not.toContain(CHILD_LAST);
  });

  it('negative control — 같은 값이 payload 에 있으면 검사기가 잡는다', () => {
    const leaked = [
      {
        operation: 'AuthGateway.signUpWithEmail',
        payload: {
          email: 'sam@example.com',
          firstName: CHILD_NAME,
          lastName: CHILD_LAST,
          birthYearMonth: '2021-04',
          gender: 'female',
        },
      },
    ];
    expect(findChildDataKeys(leaked)).toStrictEqual([
      'birthYearMonth',
      'firstName',
      'gender',
      'lastName',
    ]);
    expect(CHILD_DATA_KEYS.length).toBeGreaterThan(0);
  });
});

/* ─── 전 구간 (가입 → 동의 기록 성공) ─── */
import { ROUTES } from '/Users/soojin/dev/haru/apps/web/src/shared/config/routes';
import { consentCopy } from '/Users/soojin/dev/haru/apps/web/src/features/consent/copy';
import { ONBOARDING_DRAFT_STORAGE_KEY } from '/Users/soojin/dev/haru/apps/web/src/shared/lib/onboarding-draft';

describe('QA probe — AC-2R-13 전 구간 (아이 입력란 채움 + 동의까지)', () => {
  it('동의 성공 이전 전 구간 로그에 아동 키 0건이고, 값은 로컬에만 있다', async () => {
    const harness = renderAt(ROUTES.auth.signUp, ['me:consent-missing']);

    fireEvent.change(await screen.findByLabelText(authCopy.signUp.nameLabel), {
      target: { value: 'Sam Rivera' },
    });
    fireEvent.change(screen.getByLabelText(authCopy.signUp.emailLabel), {
      target: { value: 'sam@example.com' },
    });
    fireEvent.change(screen.getByLabelText(authCopy.signUp.passwordLabel), {
      target: { value: 'sunny-evening-8' },
    });
    fireEvent.change(screen.getByLabelText(new RegExp(onboardingCopy.childInfo.firstName)), {
      target: { value: CHILD_NAME },
    });
    fireEvent.click(screen.getByRole('button', { name: authCopy.signUp.submit }));

    // 동의 화면이 떴다.
    const submit = await screen.findByRole('button', {
      name: consentCopy.guardianConsent.submit,
    });

    // 필수 항목 전부 체크.
    for (const box of screen.getAllByRole('checkbox')) fireEvent.click(box);
    fireEvent.click(submit);

    await waitFor(() => {
      expect(
        harness.bundle.requestLog.entries().some((e) => e.operation === 'POST /v1/consents'),
      ).toBe(true);
    });

    const entries = harness.bundle.requestLog.entries();
    const idx = entries.findIndex((e) => e.operation === 'POST /v1/consents');
    const window = entries.slice(0, idx + 1);

    // eslint-disable-next-line no-console
    console.log('QA-PROBE2 window ops:', JSON.stringify(window.map((e) => e.operation)));
    // eslint-disable-next-line no-console
    console.log('QA-PROBE2 window payloads:', JSON.stringify(window));

    expect(window.map((e) => e.operation)).toContain('AuthGateway.signUpWithEmail');
    expect(findChildDataKeys(window)).toStrictEqual([]);
    expect(JSON.stringify(window)).not.toContain(CHILD_NAME);

    // 값은 로컬 draft 에 있다 — 분리가 성립했다.
    const raw = globalThis.localStorage.getItem(ONBOARDING_DRAFT_STORAGE_KEY);
    // eslint-disable-next-line no-console
    console.log('QA-PROBE2 localStorage key:', ONBOARDING_DRAFT_STORAGE_KEY, 'hasChild:', raw?.includes(CHILD_NAME));
    expect(raw).toContain(CHILD_NAME);
  });
});
