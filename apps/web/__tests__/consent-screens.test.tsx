/**
 * 동의 화면 · VPC 슬롯 동작 · 접근성 · **Privacy 불변식**.
 * AC-2-10 · AC-2-11 · AC-2-13 · AC-2-14 · AC-2-15 · AC-2-16 · AC-2-17 · AC-2-18 · AC-2-60.
 */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router';
import { describe, expect, it } from 'vitest';

import { resolveGuardDecision } from '../src/app/guards/resolveGuardDecision';
import { AppRoutes } from '../src/app/router';
import { consentCopy } from '../src/features/consent/copy';
import { VpcStep } from '../src/features/consent/ui/VpcStep';
import { createConsentDocumentsFixture } from '../src/mocks/fixtures/consent';
import { createMeResponseFixture } from '../src/mocks/fixtures/me';
import { findChildDataKeys, type RequestLogEntry } from '../src/mocks/request-log';
import { isPlaceholderLegalUrl } from '../src/shared/config/legal-links';
import { ROUTES } from '../src/shared/config/routes';
import { createFixedClock } from '../src/shared/lib/clock';
import { createHarness, type Harness } from '../src/test/harness';

const CREDENTIALS = { email: 'sam@example.com', password: 'sunny-evening-8' } as const;

const DOCUMENTS = createConsentDocumentsFixture().documents;
const REQUIRED_TITLES = DOCUMENTS.filter((document) => document.required).map((d) => d.title);

/** 현재 경로를 노출해 Guard 리다이렉트 결과를 관찰한다. */
function LocationProbe() {
  const location = useLocation();

  return <span data-testid="pathname">{location.pathname}</span>;
}

/** 로그인한 상태로 앱을 띄운다 — Guard 가 scenario 에 맞는 화면으로 보낸다. */
async function renderSignedIn(scenarios: readonly string[]): Promise<Harness> {
  const harness = createHarness({ initialEntries: [ROUTES.home], scenarios });
  await harness.bundle.authGateway.signInWithEmail({ ...CREDENTIALS });

  const Wrapper = harness.wrapper;

  render(
    <Wrapper>
      <LocationProbe />
      <AppRoutes />
    </Wrapper>,
  );

  return harness;
}

async function expectPath(expected: string): Promise<void> {
  await waitFor(() => {
    expect(screen.getByTestId('pathname').textContent).toBe(expected);
  });
}

function continueButton(): HTMLElement {
  return screen.getByRole('button', { name: consentCopy.guardianConsent.submit });
}

async function checkAllRequired(): Promise<void> {
  for (const title of REQUIRED_TITLES) {
    fireEvent.click(await screen.findByRole('checkbox', { name: new RegExp(title) }));
  }
}

describe('/auth/consent — 항목은 전부 API 응답 값이다 (AC-2-10, C-1)', () => {
  it('가입 직후 Guard 가 동의 화면으로 보낸다 (C-2)', async () => {
    await renderSignedIn(['me:consent-missing']);

    await expectPath(ROUTES.auth.consent);
    expect(
      await screen.findByRole('heading', { level: 1, name: consentCopy.guardianConsent.title }),
    ).toBeDefined();
  });

  it('응답이 준 5항목이 개별 체크박스로 그려진다 ("모두 동의" 일괄 체크 없음)', async () => {
    await renderSignedIn(['me:consent-missing']);

    const group = await screen.findByRole('group', { name: consentCopy.guardianConsent.legend });
    const checkboxes = within(group).getAllByRole('checkbox');

    expect(checkboxes).toHaveLength(DOCUMENTS.length);
    for (const document of DOCUMENTS) {
      expect(
        within(group).getByRole('checkbox', { name: new RegExp(document.title) }),
      ).toBeDefined();
    }
  });

  it('필수/선택 표시가 응답 `required` 에서만 나오고 문구로도 구분된다', async () => {
    await renderSignedIn(['me:consent-missing']);
    const group = await screen.findByRole('group', { name: consentCopy.guardianConsent.legend });

    const requiredCount = DOCUMENTS.filter((document) => document.required).length;
    const optionalCount = DOCUMENTS.length - requiredCount;
    const [{ version }] = DOCUMENTS;

    expect(
      within(group).getAllByText(
        consentCopy.guardianConsent.meta(consentCopy.guardianConsent.requiredLabel, version ?? ''),
      ),
    ).toHaveLength(requiredCount);
    expect(
      within(group).getAllByText(
        consentCopy.guardianConsent.meta(consentCopy.guardianConsent.optionalLabel, version ?? ''),
      ),
    ).toHaveLength(optionalCount);
  });

  it('화면 코드가 항목 목록을 갖고 있지 않다 — 문구 출처는 Mock 응답이다', async () => {
    const copyText = JSON.stringify(consentCopy);

    for (const document of DOCUMENTS) {
      expect(copyText).not.toContain(document.title);
    }
  });
});

describe('문서 링크 — 외부 링크로만 연다 (결정 D-4, AC-2-18)', () => {
  it('항목마다 새 탭 외부 링크가 있다', async () => {
    await renderSignedIn(['me:consent-missing']);
    await screen.findByRole('group', { name: consentCopy.guardianConsent.legend });

    for (const document of DOCUMENTS) {
      const link = screen.getByRole('link', {
        name: new RegExp(consentCopy.guardianConsent.viewLabelFor(document.title)),
      });

      expect(link.getAttribute('href')).toBe(document.url);
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    }
  });

  it('링크 주소가 아직 실제 문서가 아님이 드러난다 (출시 전 차단 항목 §4.1)', () => {
    expect(DOCUMENTS.map((document) => isPlaceholderLegalUrl(document.url))).toStrictEqual(
      DOCUMENTS.map(() => true),
    );
  });

  it('앱에 `/legal/*` route 가 없다 (본문 화면을 만들지 않았다)', () => {
    expect(JSON.stringify(ROUTES)).not.toContain('/legal');
  });
});

describe('필수 미체크 — CTA 는 aria-disabled 다 (AC-2-11, Design Spec §2.6 · §10)', () => {
  it('비활성 이유가 `aria-describedby` 로 버튼에 연결된다', async () => {
    await renderSignedIn(['me:consent-missing']);
    await screen.findByRole('group', { name: consentCopy.guardianConsent.legend });

    const button = continueButton();

    expect(button.getAttribute('aria-disabled')).toBe('true');
    // native `disabled` 가 아니어야 포커스를 받아 이유가 읽힌다.
    expect(button.hasAttribute('disabled')).toBe(false);

    const describedBy = button.getAttribute('aria-describedby');
    expect(describedBy).not.toBeNull();
    expect(document.getElementById(describedBy ?? '')?.textContent).toBe(
      consentCopy.guardianConsent.blockedReason,
    );
  });

  it('비활성 상태에서 눌러도 동의가 기록되지 않는다', async () => {
    const harness = await renderSignedIn(['me:consent-missing']);
    await screen.findByRole('group', { name: consentCopy.guardianConsent.legend });

    fireEvent.click(continueButton());

    await waitFor(() => {
      expect(continueButton().getAttribute('aria-disabled')).toBe('true');
    });
    expect(
      harness.bundle.requestLog
        .entries()
        .filter((entry) => entry.operation === 'POST /v1/consents'),
    ).toStrictEqual([]);
  });

  it('필수 3종을 고르면 이유 문구가 사라지고 CTA 가 열린다', async () => {
    await renderSignedIn(['me:consent-missing']);
    await checkAllRequired();

    await waitFor(() => {
      expect(continueButton().getAttribute('aria-disabled')).toBeNull();
    });
    expect(screen.queryByText(consentCopy.guardianConsent.blockedReason)).toBeNull();
  });

  it('필수 1종을 다시 해제하면 다시 막힌다', async () => {
    await renderSignedIn(['me:consent-missing']);
    await checkAllRequired();

    const [firstRequired] = REQUIRED_TITLES;
    fireEvent.click(screen.getByRole('checkbox', { name: new RegExp(firstRequired ?? '') }));

    await waitFor(() => {
      expect(continueButton().getAttribute('aria-disabled')).toBe('true');
    });
  });
});

describe('동의 기록 → 다음 단계 (end-to-end, Mock)', () => {
  it('필수 3종 기록 후 Guard 가 온보딩 구간으로 넘긴다', async () => {
    const harness = await renderSignedIn(['me:consent-missing']);
    await checkAllRequired();

    fireEvent.click(continueButton());

    await expectPath(ROUTES.onboarding.intro);
    expect(harness.bundle.consentState.granted()).toStrictEqual([
      'child_voice_data',
      'privacy_policy',
      'terms_of_service',
    ]);
  });

  it('요청 payload 에 항목별 문서 버전(documentId)이 담긴다 (P2-BIP-04)', async () => {
    const harness = await renderSignedIn(['me:consent-missing']);
    await checkAllRequired();
    fireEvent.click(continueButton());

    await expectPath(ROUTES.onboarding.intro);

    const recorded = harness.bundle.requestLog
      .entries()
      .find((entry) => entry.operation === 'POST /v1/consents');

    expect(recorded?.payload).toStrictEqual({
      items: DOCUMENTS.filter((document) => document.required).map((document) => ({
        type: document.type,
        documentId: document.documentId,
        action: 'granted',
      })),
      source: 'signup_email',
    });
  });

  it('선택 항목을 함께 고르면 요청에 포함된다', async () => {
    const harness = await renderSignedIn(['me:consent-missing']);
    await checkAllRequired();

    const optional = DOCUMENTS.find((document) => !document.required);
    fireEvent.click(screen.getByRole('checkbox', { name: new RegExp(optional?.title ?? '') }));
    fireEvent.click(continueButton());

    await expectPath(ROUTES.onboarding.intro);
    expect(harness.bundle.consentState.granted()).toContain(optional?.type);
  });
});

describe('재동의 — consent-version-outdated (AC-2-15)', () => {
  it('이전 기록이 있으면 갱신 안내가 함께 보인다', async () => {
    await renderSignedIn(['me:consent-version-outdated', 'consents:consent-version-outdated']);

    await expectPath(ROUTES.auth.consent);
    expect(await screen.findByText(consentCopy.guardianConsent.reconsentTitle)).toBeDefined();
  });

  it('최초 동의 화면에는 갱신 안내가 없다', async () => {
    await renderSignedIn(['me:consent-missing']);
    await screen.findByRole('group', { name: consentCopy.guardianConsent.legend });

    expect(screen.queryByText(consentCopy.guardianConsent.reconsentTitle)).toBeNull();
  });

  it('갱신된 문서 버전으로 다시 동의하면 통과한다', async () => {
    const harness = await renderSignedIn([
      'me:consent-version-outdated',
      'consents:consent-version-outdated',
    ]);
    await checkAllRequired();
    fireEvent.click(continueButton());

    await expectPath(ROUTES.onboarding.intro);

    const recorded = harness.bundle.requestLog
      .entries()
      .find((entry) => entry.operation === 'POST /v1/consents');

    expect(JSON.stringify(recorded?.payload)).toContain('"source":"reconsent"');
  });
});

describe('문서 조회 실패 상태 (Design Spec §8)', () => {
  it('error → 재시도 버튼이 있는 오류 카드가 뜬다', async () => {
    await renderSignedIn(['me:consent-missing', 'consents:error']);

    expect(
      await screen.findByRole('button', { name: consentCopy.guardianConsent.retryLabel }),
    ).toBeDefined();
    expect(screen.queryByRole('group', { name: consentCopy.guardianConsent.legend })).toBeNull();
  });

  it('offline → 오프라인 안내로 바뀐다', async () => {
    await renderSignedIn(['me:consent-missing', 'consents:offline']);

    expect(await screen.findByText('You are offline')).toBeDefined();
  });

  it('retry → 재시도하면 항목이 나타난다 (체크 상태를 잃지 않는 경로)', async () => {
    await renderSignedIn(['me:consent-missing', 'consents:retry']);

    fireEvent.click(
      await screen.findByRole('button', { name: consentCopy.guardianConsent.retryLabel }),
    );

    expect(
      await screen.findByRole('group', { name: consentCopy.guardianConsent.legend }),
    ).toBeDefined();
  });
});

describe('/auth/verify-parent — VPC 슬롯 (AC-2-17, C-3)', () => {
  it('vpc-pending 이면 그 화면에 머물고 진행 안내가 읽힌다', async () => {
    await renderSignedIn(['me:vpc-pending']);

    await expectPath(ROUTES.auth.verifyParent);
    expect(await screen.findByText(consentCopy.verifyParent.pending)).toBeDefined();
  });

  it('vpc-failed 면 안내와 재시도 경로가 보이고 온보딩으로 넘어가지 않는다', async () => {
    await renderSignedIn(['me:vpc-failed']);

    await expectPath(ROUTES.auth.verifyParent);
    expect(await screen.findByText(consentCopy.verifyParent.failedTitle)).toBeDefined();
    expect(screen.getByRole('button', { name: consentCopy.verifyParent.tryAgain })).toBeDefined();

    // 재시도해도 scenario 가 failed 인 동안에는 계속 막힌다.
    fireEvent.click(screen.getByRole('button', { name: consentCopy.verifyParent.tryAgain }));
    await expectPath(ROUTES.auth.verifyParent);
  });

  it('실패 문구에 사용자 귀책·판정 표현을 쓰지 않는다', () => {
    const text = `${consentCopy.verifyParent.failedTitle} ${consentCopy.verifyParent.failedDescription}`;

    for (const banned of ['failed', 'invalid', 'denied', 'rejected', 'wrong', 'error']) {
      expect(text.toLowerCase()).not.toContain(banned);
    }
  });

  it('기본(안내) 상태에는 Continue 만 있고 진행·실패 표시가 없다', () => {
    render(
      <MemoryRouter>
        <VpcStep status="not_required" onContinue={() => {}} onRetry={() => {}} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('button', { name: consentCopy.verifyParent.continue })).toBeDefined();
    expect(screen.queryByText(consentCopy.verifyParent.pending)).toBeNull();
    expect(screen.queryByText(consentCopy.verifyParent.failedTitle)).toBeNull();
  });

  it('VPC 화면에는 아이 입력 필드가 없다', async () => {
    await renderSignedIn(['me:vpc-pending']);
    await screen.findByText(consentCopy.verifyParent.pending);

    expect(screen.queryAllByRole('textbox')).toStrictEqual([]);
    for (const label of [/child/i, /birth/i, /gender/i]) {
      expect(screen.queryByLabelText(label)).toBeNull();
    }
  });
});

/* ===== AC-2-13 — Privacy 불변식 ============================================ */

/** 동의 기록이 성공하기 **전까지**의 요청만 남긴다 (성공한 기록 요청 자체는 포함한다). */
function entriesThroughConsent(entries: readonly RequestLogEntry[]): readonly RequestLogEntry[] {
  const index = entries.findIndex((entry) => entry.operation === 'POST /v1/consents');

  return index === -1 ? entries : entries.slice(0, index + 1);
}

describe('AC-2-13 — 동의 기록 성공 이전 구간의 모든 요청에 아동 데이터 0건', () => {
  it('가입 → 동의 화면 → 동의 기록까지 전수 검사', async () => {
    const harness = createHarness({
      initialEntries: [ROUTES.auth.signUp],
      scenarios: ['me:consent-missing'],
    });
    const Wrapper = harness.wrapper;

    render(
      <Wrapper>
        <LocationProbe />
        <AppRoutes />
      </Wrapper>,
    );

    // ① 이메일 가입 — 보호자 3필드만 있다 (AD-S2-1).
    fireEvent.change(await screen.findByLabelText('Your name'), {
      target: { value: 'Sam Rivera' },
    });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: CREDENTIALS.email } });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: CREDENTIALS.password },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    // ② Guard 가 동의 화면으로 보낸다.
    await expectPath(ROUTES.auth.consent);
    await checkAllRequired();

    // ③ 동의 기록.
    fireEvent.click(continueButton());
    await expectPath(ROUTES.onboarding.intro);

    const entries = harness.bundle.requestLog.entries();
    const beforeConsentDone = entriesThroughConsent(entries);

    // 검사가 헛돌지 않도록: 이 구간에 실제 요청이 있었고 동의 기록이 포함되어 있다.
    expect(beforeConsentDone.length).toBeGreaterThan(2);
    expect(beforeConsentDone.map((entry) => entry.operation)).toContain('POST /v1/consents');
    expect(beforeConsentDone.map((entry) => entry.operation)).toContain(
      'AuthGateway.signUpWithEmail',
    );

    // 핵심 단언 — 아동 데이터 키가 하나도 없다.
    expect(findChildDataKeys(beforeConsentDone)).toStrictEqual([]);
    // 이 Step 범위 전체로 넓혀도 마찬가지다.
    expect(findChildDataKeys(entries)).toStrictEqual([]);
  });

  it('동의 화면·VPC 화면을 열기만 해도 아동 데이터 요청이 0건이다', async () => {
    for (const scenario of ['me:consent-missing', 'me:vpc-pending', 'me:vpc-failed']) {
      const harness = await renderSignedIn([scenario]);

      await waitFor(() => {
        expect(harness.bundle.requestLog.entries().length).toBeGreaterThan(0);
      });
      expect(findChildDataKeys(harness.bundle.requestLog.entries())).toStrictEqual([]);
    }
  });

  it('동의 전 요청 로그에 비밀번호 원문이 남지 않는다 (AC-2-63 · AC-2-64)', async () => {
    const harness = createHarness({ scenarios: ['me:consent-missing'] });
    await harness.bundle.authGateway.signUpWithEmail({
      caregiverName: 'Sam Rivera',
      ...CREDENTIALS,
    });

    expect(JSON.stringify(harness.bundle.requestLog.entries())).not.toContain(CREDENTIALS.password);
  });

  it('필수 동의가 남아 있으면 Guard 가 온보딩 경로를 동의 화면으로 되돌린다 (AC-2-14)', () => {
    const clock = createFixedClock(Date.UTC(2026, 0, 1));
    const me = createMeResponseFixture(clock, {
      missingConsents: ['child_voice_data'],
      onboardingStatus: 'not_started',
    });

    for (const path of ['/onboarding', '/onboarding/child-info', '/onboarding/saved', '/']) {
      expect(resolveGuardDecision(me, path)).toStrictEqual({
        status: 'redirect',
        to: ROUTES.auth.consent,
        replace: true,
      });
    }
  });

  it('VPC 가 끝나지 않으면 온보딩 경로도 VPC 로 되돌린다 (AC-2-17)', () => {
    const clock = createFixedClock(Date.UTC(2026, 0, 1));

    for (const status of ['pending', 'failed'] as const) {
      const me = createMeResponseFixture(clock, {
        parentVerification: status,
        onboardingStatus: 'not_started',
      });

      expect(resolveGuardDecision(me, '/onboarding/child-info')).toStrictEqual({
        status: 'redirect',
        to: ROUTES.auth.verifyParent,
        replace: true,
      });
    }
  });
});

describe('copy 규칙 (AC-2-38 · AC-2-65)', () => {
  it('동의·VPC 문구에 진단·판정·비교 표현이 없다', () => {
    const text = JSON.stringify(consentCopy).toLowerCase();

    for (const banned of ['diagnos', 'assess', 'score', 'compare', 'normal', 'delay', 'disorder']) {
      expect(text).not.toContain(banned);
    }
  });

  it('동의 화면 문구가 아이 성(last name)을 다루지 않는다', () => {
    expect(JSON.stringify(consentCopy).toLowerCase()).not.toContain('last name');
  });
});
