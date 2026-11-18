/**
 * `entities/child-profile` hook — Stage 6 Plan §5.2 캐시 전파 · 중복 요청 · Idempotency-Key (AC-6-19 · 22 · 27 · 28 · 31 hook 부분).
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { SubmitSurveyUpdateRequest } from '@haru/contracts';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { createDefaultSurveyAnswers, createMockApiClientsBundle } from '../../../mocks';
import { createOnboardingInstrumentFixture } from '../../../mocks/fixtures/onboarding';
import { ApiClientsProvider } from '../../../shared/api/context';
import { createImmediateTimer } from '../../../shared/api/helpers';
import { activityCardKeys } from '../../activity-card';
import { homeKeys } from '../../home';
import { meKeys } from '../../me';
import {
  childProfileKeys,
  surveyUpdateKeys,
  useChildProfile,
  useSaveSurveyUpdateStep,
  useSetGrowthCapability,
  useSubmitSurveyUpdate,
  useSurveyUpdateState,
  useUpdateChild,
} from '../index';

const CHILD_ID = '44444444-4444-4444-8444-444444444444';
const instrument = createOnboardingInstrumentFixture();
const SUBMIT: SubmitSurveyUpdateRequest = {
  instrument: { code: instrument.code, version: instrument.version },
  answers: createDefaultSurveyAnswers(instrument),
};

function setup(scenario = '') {
  const bundle = createMockApiClientsBundle({
    search: scenario.length > 0 ? `?scenario=${scenario}` : '',
    timer: createImmediateTimer(),
  });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  function wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ApiClientsProvider clients={bundle.clients}>{children}</ApiClientsProvider>
      </QueryClientProvider>
    );
  }
  return { bundle, queryClient, wrapper };
}

describe('useChildProfile', () => {
  it('childId 가 없으면 요청하지 않는다 (온보딩 전)', () => {
    const { bundle, wrapper } = setup();
    const getProfile = vi.spyOn(bundle.clients.children, 'getProfile');
    const { result } = renderHook(() => useChildProfile(undefined), { wrapper });
    expect(result.current.isPending).toBe(false);
    expect(getProfile).not.toHaveBeenCalled();
  });

  it('조회 성공 · offline 은 isOffline', async () => {
    const ok = setup();
    const { result } = renderHook(() => useChildProfile(CHILD_ID), { wrapper: ok.wrapper });
    await waitFor(() => expect(result.current.profile?.child.firstName).toBe('Emma'));

    const off = setup('children:offline');
    const offline = renderHook(() => useChildProfile(CHILD_ID), { wrapper: off.wrapper });
    await waitFor(() => expect(offline.result.current.isOffline).toBe(true));
  });
});

describe('useUpdateChild', () => {
  it('성공 → 프로필 캐시 = 응답 · me 무효화 (AC-6-22 hook 부분)', async () => {
    const { wrapper, queryClient } = setup();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const onUpdated = vi.fn();
    const { result } = renderHook(() => useUpdateChild(CHILD_ID, { onUpdated }), { wrapper });

    act(() => result.current.update({ firstName: 'Mia' }));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(
      queryClient.getQueryData<{ child: { firstName: string } }>(childProfileKeys.detail(CHILD_ID))
        ?.child.firstName,
    ).toBe('Mia');
    expect(invalidate).toHaveBeenCalledWith({ queryKey: meKeys.all });
    expect(onUpdated).toHaveBeenCalledTimes(1);
  });

  it('진행 중 중복 호출 → 요청 1건 (`loading`, AC-6-19)', async () => {
    const { bundle, wrapper } = setup('children:loading');
    const update = vi.spyOn(bundle.clients.children, 'update');
    const { result } = renderHook(() => useUpdateChild(CHILD_ID), { wrapper });
    act(() => {
      result.current.update({ firstName: 'Mia' });
      result.current.update({ firstName: 'Mia' });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(update).toHaveBeenCalledTimes(1);
  });

  it('`validation-failed` → invalidFields 는 필드 이름만 (AC-6-20)', async () => {
    const { wrapper } = setup('children:validation-failed');
    const { result } = renderHook(() => useUpdateChild(CHILD_ID), { wrapper });
    act(() => result.current.update({ firstName: 'Mia', birthYearMonth: '2021-05' }));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.errorCode).toBe('VALIDATION_FAILED');
    expect(result.current.invalidFields).toStrictEqual(['firstName', 'birthYearMonth']);
  });
});

describe('useSetGrowthCapability', () => {
  it('성공 → 프로필 캐시 갱신 · Home · 오늘 카드 무효화', async () => {
    const { wrapper, queryClient } = setup();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useSetGrowthCapability(CHILD_ID), { wrapper });
    act(() => result.current.select('intrinsic_motivation'));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.profile?.growthCapability).toBe('intrinsic_motivation');
    expect(invalidate).toHaveBeenCalledWith({ queryKey: homeKeys.all });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: activityCardKeys.all });
  });

  it('성공 뒤 호출 무시 · 실패 뒤에는 다시 보낼 수 있다 (S6-D 더블 탭)', async () => {
    const ok = setup();
    const onSaved = vi.fn();
    const withCallback = renderHook(() => useSetGrowthCapability(CHILD_ID, { onSaved }), {
      wrapper: ok.wrapper,
    });
    act(() => withCallback.result.current.select('intrinsic_motivation'));
    await waitFor(() => expect(withCallback.result.current.isSuccess).toBe(true));
    act(() => withCallback.result.current.select('emotion_regulation'));
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(onSaved).toHaveBeenCalledTimes(1);
    expect(withCallback.result.current.profile?.growthCapability).toBe('intrinsic_motivation');

    const retry = setup('children.setgrowthcapability:retry');
    const { result } = renderHook(() => useSetGrowthCapability(CHILD_ID), {
      wrapper: retry.wrapper,
    });
    act(() => result.current.select('emotion_regulation'));
    await waitFor(() => expect(result.current.isError).toBe(true));
    act(() => result.current.select('emotion_regulation'));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('실패 → 캐시된 프로필 불변 (낙관적 갱신 없음, AC-6-31)', async () => {
    const { wrapper, queryClient } = setup('children.setgrowthcapability:error');
    const profile = renderHook(() => useChildProfile(CHILD_ID), { wrapper });
    await waitFor(() => expect(profile.result.current.profile).toBeDefined());

    const { result } = renderHook(() => useSetGrowthCapability(CHILD_ID), { wrapper });
    act(() => result.current.select('intrinsic_motivation'));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(
      queryClient.getQueryData<{ growthCapability: string }>(childProfileKeys.detail(CHILD_ID))
        ?.growthCapability,
    ).toBe('cognitive_flexibility');
  });
});

describe('설문 재응답 hook', () => {
  it('state · 단계 저장 → draft 캐시 갱신 · hasDraftInProgress', async () => {
    const { wrapper } = setup();
    const state = renderHook(() => useSurveyUpdateState(CHILD_ID), { wrapper });
    await waitFor(() => expect(state.result.current.state).toBeDefined());
    expect(state.result.current.hasDraftInProgress).toBe(false);

    const save = renderHook(() => useSaveSurveyUpdateStep(CHILD_ID), { wrapper });
    act(() =>
      save.result.current.mutate({
        step: 'growing_together',
        answers: { growthGoals: ['intrinsic_motivation'] },
      }),
    );
    await waitFor(() => expect(state.result.current.hasDraftInProgress).toBe(true));
    expect(state.result.current.state?.currentStep).toBe('growing_together');
  });

  it('`survey-update-draft` → 진행 중 draft 로 시작', async () => {
    const { wrapper } = setup('children:survey-update-draft');
    const { result } = renderHook(() => useSurveyUpdateState(CHILD_ID), { wrapper });
    await waitFor(() => expect(result.current.hasDraftInProgress).toBe(true));
  });

  it('제출: 실패 후 같은 답 재시도 = 같은 key · 성공 → draft 캐시 제거 · 프로필·Home 무효화 (AC-6-27 · 28)', async () => {
    const { bundle, wrapper, queryClient } = setup('children:retry');
    const submit = vi.spyOn(bundle.clients.children, 'submitSurveyUpdate');
    queryClient.setQueryData(surveyUpdateKeys.state(CHILD_ID), { stale: true });
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const onSubmitted = vi.fn();
    const { result } = renderHook(() => useSubmitSurveyUpdate(CHILD_ID, { onSubmitted }), {
      wrapper,
    });

    act(() => result.current.submit(SUBMIT));
    await waitFor(() => expect(result.current.isError).toBe(true));
    act(() => result.current.submit(SUBMIT));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const keys = submit.mock.calls.map(([, options]) => options.idempotencyKey);
    expect(keys).toHaveLength(2);
    expect(keys[0]).toBe(keys[1]);
    expect(result.current.result?.snapshot.source).toBe('survey_update');
    expect(queryClient.getQueryData(surveyUpdateKeys.state(CHILD_ID))).toBeUndefined();
    expect(invalidate).toHaveBeenCalledWith({ queryKey: childProfileKeys.detail(CHILD_ID) });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: homeKeys.all });
    expect(onSubmitted).toHaveBeenCalledTimes(1);
  });

  it('성공한 뒤의 제출 호출은 무시한다 — 더블 탭 = 요청 1건 (S6-C)', async () => {
    const { bundle, wrapper } = setup('children:success');
    const submit = vi.spyOn(bundle.clients.children, 'submitSurveyUpdate');
    const { result } = renderHook(() => useSubmitSurveyUpdate(CHILD_ID), { wrapper });
    act(() => result.current.submit(SUBMIT));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    act(() => result.current.submit(SUBMIT));
    expect(submit).toHaveBeenCalledTimes(1);
  });

  it('답을 바꾸면 새 key 를 쓴다', async () => {
    const { bundle, wrapper } = setup('children.submitsurveyupdate:error');
    const submit = vi.spyOn(bundle.clients.children, 'submitSurveyUpdate');
    const { result } = renderHook(() => useSubmitSurveyUpdate(CHILD_ID), { wrapper });
    act(() => result.current.submit(SUBMIT));
    await waitFor(() => expect(result.current.isError).toBe(true));
    act(() =>
      result.current.submit({
        ...SUBMIT,
        answers: { ...SUBMIT.answers, growing_together: { growthGoals: ['intrinsic_motivation'] } },
      }),
    );
    await waitFor(() => expect(submit).toHaveBeenCalledTimes(2));
    const keys = submit.mock.calls.map(([, options]) => options.idempotencyKey);
    expect(keys[0]).not.toBe(keys[1]);
  });
});
