/**
 * 설정 목록 + 아이 정보 수정 — Stage 6 `S6-B` (Spec §2.4 · §2.5 · §2.7 · §3.6 · §10.3 · §10.4,
 * AC-6-15 · 16 · 17(N/A) · 18 · 19 · 20 · 21 · 22(캐시 부분) · 23(TopBar 뒤로 부분)).
 *
 * 실제 앱과 같은 조립(`createHarness` + `AppRoutes`)으로 연다. `MemoryRouter` 라 **브라우저 back** 확인
 * (history sentinel)은 여기서 동작하지 않는다 — `e2e/settings-child.spec.ts` 가 덮는다.
 * 기대값(아이 정보)은 같은 Mock 번들의 `GET /profile` 응답에서 읽는다.
 */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { ChildProfile } from '@haru/contracts';
import { useLocation } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import { AppRoutes } from '../src/app/router';
import { childProfileKeys } from '../src/entities/child-profile';
import { meKeys } from '../src/entities/me';
import {
  buildUpdateChildBody,
  childInfoEditCopy as copy,
  childInfoFormFromChild,
  serverFieldErrors,
} from '../src/features/child-profile-edit';
import { settingsCopy } from '../src/features/settings/copy';
import { MOCK_CHILD_ID } from '../src/mocks';
import { appCopy } from '../src/shared/copy/app-copy';
import { childCopy } from '../src/shared/copy/child-copy';
import { errorCopyForCode, retryLabel } from '../src/shared/copy/error-copy';
import { ROUTES } from '../src/shared/config/routes';
import { createHarness, type Harness } from '../src/test/harness';

const UPDATE = 'PATCH /v1/children/:childId';

function LocationProbe() {
  const location = useLocation();
  return <span data-testid="pathname">{location.pathname}</span>;
}

const pathname = () => screen.getByTestId('pathname').textContent;

async function waitForGuard(): Promise<void> {
  await waitFor(() => {
    expect(screen.queryAllByRole('status', { name: appCopy.guard.loadingLabel })).toHaveLength(0);
  });
}

/** `/settings` 위에 `/settings/child` 를 쌓는다 — 뒤로 목적지가 설정 목록이다. */
async function renderAt(
  entries: readonly string[],
  scenarios: readonly string[] = [],
): Promise<Harness> {
  const harness = createHarness({ scenarios, initialEntries: [...entries] });
  await harness.bundle.authGateway.signInWithEmail({
    email: 'sam@example.com',
    password: 'sunny-evening-8',
  });
  const Wrapper = harness.wrapper;
  render(
    <Wrapper>
      <LocationProbe />
      <AppRoutes />
    </Wrapper>,
  );
  await waitForGuard();
  return harness;
}

const renderEdit = (scenarios: readonly string[] = []) =>
  renderAt([ROUTES.settings, ROUTES.settingsChild], scenarios);

function view(): HTMLElement {
  return document.querySelector('.haru-child-info-edit') as HTMLElement;
}

async function ready(): Promise<HTMLElement> {
  await waitFor(() => expect(view().querySelector('[data-state="ready"]')).not.toBeNull());
  return view();
}

function firstNameInput(): HTMLInputElement {
  return screen.getByLabelText(new RegExp(childCopy.firstName)) as HTMLInputElement;
}

function saveButton(): HTMLButtonElement {
  return screen.getByRole('button', { name: copy.save }) as HTMLButtonElement;
}

function updates(harness: Harness) {
  return harness.bundle.requestLog.entries().filter((entry) => entry.operation === UPDATE);
}

async function profileOf(harness: Harness): Promise<ChildProfile> {
  return harness.bundle.clients.children.getProfile({ childId: MOCK_CHILD_ID });
}

afterEach(() => {
  globalThis.localStorage.clear();
  globalThis.sessionStorage.clear();
});

describe('설정 목록 `/settings` (Spec §2.4 · C13-S6-1 · AC-6-15 · 16)', () => {
  it('2그룹: YOUR CHILD 4행(Profile · Child info · Update survey answers · Growth focus) · ACCOUNT 로그아웃 1행', async () => {
    await renderAt([ROUTES.settings]);

    const child = await screen.findByRole('list', { name: settingsCopy.groups.child.listLabel });
    const account = screen.getByRole('list', { name: settingsCopy.groups.account.listLabel });

    expect(
      within(child)
        .getAllByRole('button')
        .map((button) => button.textContent),
    ).toEqual([
      settingsCopy.rows.profile,
      settingsCopy.rows.childInfo,
      settingsCopy.rows.surveyUpdate,
      settingsCopy.rows.growthFocus,
    ]);
    // Stage 8 `C13-S8-1` (`Q8-02` ⓐ · AC-8-13): 이동 행 2개 → 동작 행 Log out 마지막
    expect(within(account).getAllByRole('listitem')).toHaveLength(3);
    expect(
      within(account)
        .getAllByRole('button')
        .map((button) => button.textContent),
    ).toEqual([
      settingsCopy.accountRows.dataPrivacy,
      settingsCopy.accountRows.account,
      settingsCopy.logOut.rowLabel,
    ]);

    // 시각 SectionLabel 2개 (대문자 copy)
    expect(screen.getByText(settingsCopy.groups.child.sectionLabel)).toBeTruthy();
    expect(screen.getByText(settingsCopy.groups.account.sectionLabel)).toBeTruthy();
    // 이동 행에만 chevron — 로그아웃(동작 행)에는 없다
    expect(child.querySelectorAll('.haru-settings-row__chevron')).toHaveLength(4);
    expect(account.querySelectorAll('.haru-settings-row__chevron')).toHaveLength(2);
    const logOutRow = within(account).getAllByRole('listitem')[2] as HTMLElement;
    expect(logOutRow.querySelectorAll('.haru-settings-row__chevron')).toHaveLength(0);
  });

  it('명세에 없는 행 0 — 알림 · 탈퇴 · 동의 이력 (AC-6-15 · AC-6-2 · Stage 8 `N8-06` ⓑ)', async () => {
    await renderAt([ROUTES.settings]);
    await screen.findByRole('list', { name: settingsCopy.groups.child.listLabel });

    // Stage 6 5행 + Stage 8 ACCOUNT 이동 행 2 (`Q8-02` ⓐ)
    expect(screen.getAllByRole('listitem')).toHaveLength(7);
    for (const label of [/notification/i, /manage data/i, /delete account/i, /consent history/i]) {
      expect(screen.queryByText(label)).toBeNull();
    }
  });

  it.each([
    [settingsCopy.rows.profile, ROUTES.settingsProfile],
    [settingsCopy.rows.childInfo, ROUTES.settingsChild],
    [settingsCopy.rows.surveyUpdate, ROUTES.settingsChildSurvey],
    [settingsCopy.rows.growthFocus, ROUTES.settingsGrowthCapability],
    [settingsCopy.accountRows.dataPrivacy, ROUTES.settingsData],
    [settingsCopy.accountRows.account, ROUTES.settingsAccount],
  ])('행 "%s" → %s', async (label, route) => {
    await renderAt([ROUTES.settings]);
    fireEvent.click(await screen.findByRole('button', { name: label }));
    await waitFor(() => expect(pathname()).toBe(route));
  });

  it('목록은 데이터 조회를 하지 않는다 → Loading · Error 상태 해당 없음 (AC-6-17 N/A)', async () => {
    const harness = await renderAt([ROUTES.settings]);
    await screen.findByRole('list', { name: settingsCopy.groups.child.listLabel });

    expect(
      harness.bundle.requestLog
        .entries()
        .filter((entry) => entry.operation.includes('/v1/children/')),
    ).toHaveLength(0);
  });
});

describe('아이 정보 수정 `/settings/child` — 구성 · 프리필 (Spec §2.5 · AC-6-18)', () => {
  it('TopBar h1 "Child info" · 현재 값 프리필 · 관계 필드 없음 · 변경 없으면 Save 비활성', async () => {
    const harness = await renderEdit();
    await ready();
    const { child } = await profileOf(harness);

    expect(screen.getByRole('heading', { level: 1, name: copy.title })).toBeTruthy();
    expect(firstNameInput().value).toBe(child.firstName);
    const [year, month] = child.birthYearMonth.split('-');
    expect(
      screen.getByRole('button', { name: new RegExp(`${childCopy.birthYear}.*${year ?? ''}`) }),
    ).toBeTruthy();
    expect(
      screen.getByRole('button', { name: new RegExp(`${childCopy.birthMonth}.*${month ?? ''}`) }),
    ).toBeTruthy();
    for (const code of child.languageEnvironment) {
      expect(
        screen
          .getByRole('button', { name: childCopy.languageOptions[code] })
          .getAttribute('aria-pressed'),
      ).toBe('true');
    }
    if (child.readingRoutine !== undefined) {
      expect(
        (
          screen.getByRole('radio', {
            name: childCopy.readingRoutineOptions[child.readingRoutine],
          }) as HTMLInputElement
        ).checked,
      ).toBe(true);
    }

    // 관계(보호자 데이터)는 이 화면에 없다 (`N6-39`) · ABOUT YOU 섹션 없음
    expect(screen.queryByText(childCopy.relationship)).toBeNull();
    expect(screen.queryByText(childCopy.caregiverSection)).toBeNull();
    // 표시 행 ↔ 편집 전환 없음 — 처음부터 편집 모드
    expect(screen.queryByRole('button', { name: childCopy.editChild })).toBeNull();

    expect(saveButton().getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(saveButton());
    expect(updates(harness)).toHaveLength(0);
  });

  it('바꿨다가 되돌리면 다시 비활성', async () => {
    await renderEdit();
    await ready();
    const original = firstNameInput().value;

    fireEvent.change(firstNameInput(), { target: { value: 'Mia' } });
    expect(saveButton().getAttribute('aria-disabled')).toBeNull();
    fireEvent.change(firstNameInput(), { target: { value: original } });
    expect(saveButton().getAttribute('aria-disabled')).toBe('true');
  });
});

describe('저장 (AC-6-19 · 22)', () => {
  it('변경 필드만 body · 중복 탭 → 요청 1건 · 성공 → Toast "Saved" → 설정 목록 · 프로필 캐시 = 응답 · me 무효화', async () => {
    const harness = await renderEdit();
    await ready();

    fireEvent.change(firstNameInput(), { target: { value: '  Mia ' } });
    fireEvent.click(screen.getByRole('button', { name: childCopy.languageOptions.spanish }));
    fireEvent.click(saveButton());
    fireEvent.click(saveButton());

    await waitFor(() => expect(pathname()).toBe(ROUTES.settings));
    expect(await screen.findByText(copy.savedToast)).toBeTruthy();

    const sent = updates(harness);
    expect(sent).toHaveLength(1);
    expect(sent[0]?.payload).toEqual({
      firstName: 'Mia',
      languageEnvironment: ['english', 'spanish'],
    });

    const cached = harness.queryClient.getQueryData<ChildProfile>(
      childProfileKeys.detail(MOCK_CHILD_ID),
    );
    expect(cached?.child.firstName).toBe('Mia');
    // `me` 는 무효화 → 다음 조회가 새 이름 (회고 카드 제목 · 세션 버블 슬롯의 출처)
    const meState = harness.queryClient.getQueryState(meKeys.all);
    expect(meState === undefined || meState.isInvalidated).toBe(true);
    const me = await harness.bundle.clients.me.get();
    expect(me.child?.firstName).toBe('Mia');
  });

  it('성을 지우면 `lastName: ""` 만 보낸다 · 언어 순서만 바뀐 것은 변경 아님', () => {
    const base = childInfoFormFromChild({
      id: MOCK_CHILD_ID,
      firstName: 'Emma',
      lastName: 'Lee',
      birthYearMonth: '2021-04',
      gender: 'girl',
      languageEnvironment: ['english', 'korean'],
      readingRoutine: 'daily',
      topicTags: [],
      growthGoals: [],
      ownedBooks: [],
      createdAt: '2026-01-01T00:00:00.000Z',
    });

    expect(buildUpdateChildBody(base, base)).toBeNull();
    expect(buildUpdateChildBody(base, { ...base, lastName: ' ' })).toEqual({ lastName: '' });
    expect(
      buildUpdateChildBody(base, { ...base, languageEnvironment: ['korean', 'english'] }),
    ).toBeNull();
    expect(buildUpdateChildBody(base, { ...base, gender: null })).toEqual({ gender: null });
    expect(buildUpdateChildBody(base, { ...base, birthYear: '2020' })).toEqual({
      birthYearMonth: '2020-04',
    });
    // 관계는 아이 요청에 섞이지 않는다 (`N6-39`)
    expect(buildUpdateChildBody(base, { ...base, relationship: 'father' })).toBeNull();
  });
});

describe('실패 (AC-6-20 · 21)', () => {
  it('클라이언트 검증 — 이름을 비우고 Save → 필드 오류 · 요청 0 · 포커스 = 이름', async () => {
    const harness = await renderEdit();
    await ready();

    fireEvent.change(firstNameInput(), { target: { value: '' } });
    fireEvent.click(saveButton());

    expect(await screen.findByText(childCopy.firstNameRequired)).toBeTruthy();
    expect(updates(harness)).toHaveLength(0);
    await waitFor(() => expect(document.activeElement).toBe(firstNameInput()));
  });

  it('`validation-failed` → 보낸 필드에 오류 문구 · 입력 보존 · 첫 오류 필드로 포커스', async () => {
    await renderEdit(['children:validation-failed']);
    await ready();

    fireEvent.change(firstNameInput(), { target: { value: 'Mia' } });
    fireEvent.click(saveButton());

    expect(await screen.findByText(copy.fieldInvalid)).toBeTruthy();
    expect(firstNameInput().value).toBe('Mia');
    expect(firstNameInput().getAttribute('aria-invalid')).toBe('true');
    await waitFor(() => expect(document.activeElement).toBe(firstNameInput()));
    // 필드 오류로 알렸으므로 화면 단위 실패 안내는 없다
    expect(screen.queryByText(copy.saveFailed.title)).toBeNull();
    expect(pathname()).toBe(ROUTES.settingsChild);
  });

  it('슬롯 없는 필드(언어)만 거부되면 저장 실패 안내로 알린다', () => {
    expect(serverFieldErrors(['languageEnvironment'])).toEqual({ errors: {}, unplaced: true });
    expect(serverFieldErrors(['birthYearMonth'])).toEqual({
      errors: { birthYearMonth: childCopy.ageOutOfRange },
      unplaced: false,
    });
  });

  it('`error` → Save 위 InlineAlert · 입력 보존 · 저장소 기록 0', async () => {
    await renderEdit(['children.update:error']);
    await ready();

    fireEvent.change(firstNameInput(), { target: { value: 'Mia' } });
    fireEvent.click(saveButton());

    const alert = await screen.findByRole('alert');
    expect(within(alert).getByText(copy.saveFailed.title)).toBeTruthy();
    expect(within(alert).getByText(copy.saveFailed.description)).toBeTruthy();
    expect(firstNameInput().value).toBe('Mia');
    expect(pathname()).toBe(ROUTES.settingsChild);

    // AC-6-21 — 입력은 메모리에만
    const stored = [
      ...Object.values({ ...globalThis.localStorage }),
      ...Object.values({ ...globalThis.sessionStorage }),
    ].join('\n');
    expect(stored).not.toContain('Mia');
  });

  it('`offline` → 오프라인 문구', async () => {
    await renderEdit(['children.update:offline']);
    await ready();

    fireEvent.change(firstNameInput(), { target: { value: 'Mia' } });
    fireEvent.click(saveButton());

    expect(await screen.findByText(copy.offline.title)).toBeTruthy();
    expect(screen.getByText(copy.offline.description)).toBeTruthy();
  });

  it('`retry` → 첫 실패 후 다시 Save = 성공 → 설정 목록', async () => {
    const harness = await renderEdit(['children.update:retry']);
    await ready();

    fireEvent.change(firstNameInput(), { target: { value: 'Mia' } });
    fireEvent.click(saveButton());
    expect(await screen.findByText(copy.saveFailed.title)).toBeTruthy();

    fireEvent.click(saveButton());
    await waitFor(() => expect(pathname()).toBe(ROUTES.settings));
    expect(updates(harness)).toHaveLength(2);
  });

  it('초기값 조회 실패 → ErrorState + Try again (Save 미렌더)', async () => {
    await renderEdit(['children:error']);

    await waitFor(() => expect(view().querySelector('[data-state="error"]')).not.toBeNull());
    expect(screen.getByText(errorCopyForCode(undefined).title)).toBeTruthy();
    expect(screen.getByRole('button', { name: retryLabel })).toBeTruthy();
    expect(screen.queryByRole('button', { name: copy.save })).toBeNull();
  });
});

describe('변경 후 이탈 (N6-14 ⓐ · AC-6-23 — TopBar 뒤로)', () => {
  it('변경 없으면 뒤로 = 바로 설정 목록', async () => {
    await renderEdit();
    await ready();

    fireEvent.click(screen.getByRole('button', { name: copy.backLabel }));
    await waitFor(() => expect(pathname()).toBe(ROUTES.settings));
  });

  it('변경 후 뒤로 → 확인 Dialog → Keep editing = 그대로 · Discard = 설정 목록', async () => {
    const harness = await renderEdit();
    await ready();
    const { child } = await profileOf(harness);

    fireEvent.change(firstNameInput(), { target: { value: 'Mia' } });
    fireEvent.click(screen.getByRole('button', { name: copy.backLabel }));

    let dialog = await screen.findByRole('alertdialog');
    expect(within(dialog).getByText(copy.leave.title)).toBeTruthy();
    expect(within(dialog).getByText(copy.leave.description(child.firstName))).toBeTruthy();
    // destructive — 초기 포커스는 취소
    await waitFor(() =>
      expect(document.activeElement).toBe(
        within(dialog).getByRole('button', { name: copy.leave.cancel }),
      ),
    );

    fireEvent.click(within(dialog).getByRole('button', { name: copy.leave.cancel }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(pathname()).toBe(ROUTES.settingsChild);
    expect(firstNameInput().value).toBe('Mia');

    fireEvent.click(screen.getByRole('button', { name: copy.backLabel }));
    dialog = await screen.findByRole('alertdialog');
    fireEvent.click(within(dialog).getByRole('button', { name: copy.leave.confirm }));
    await waitFor(() => expect(pathname()).toBe(ROUTES.settings));
    expect(updates(harness)).toHaveLength(0);
  });
});
