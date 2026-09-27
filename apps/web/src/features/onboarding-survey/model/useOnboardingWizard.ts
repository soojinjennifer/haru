/**
 * 위저드 컨트롤러 — 화면이 필요한 것만 모아서 돌려준다.
 *
 * 여기에서만 일어나는 일
 * 1. **문항의 출처 결정**: 서버 instrument > Trial 기본 instrument (결정 D-A ③)
 * 2. **저장 경로 분리**: 로컬 draft 400ms debounce / 서버는 단계 이동 시 1회 (결정 D-11)
 * 3. **Trial 보호**: 미인증이면 `GET /v1/onboarding` · `PUT …/steps/:step` 을 호출하지 않는다
 *    (C-12 · AC-2-27 — 가입 전 서버 요청 0건)
 * 4. **제출**: 5단계 전체를 1회 요청으로 (C-12), 성공하면 로컬 draft 삭제 (D-3 삭제 시점 ①)
 *
 * UI 컴포넌트는 이 hook 의 결과만 보고, API·저장소·라우팅을 직접 만지지 않는다.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  type CaregiverRelationship,
  type OnboardingDraftAnswers,
  type OnboardingInstrument,
  type OnboardingStep,
  type SaveOnboardingStepRequest,
  type UpdateCaregiverRequest,
} from '@haru/contracts';

import { useMe, useUpdateCaregiver } from '../../../entities/me';
import {
  useOnboardingState,
  useSaveOnboardingStep,
  useSubmitOnboarding,
} from '../../../entities/onboarding';
import { useAuth } from '../../../shared/auth';
import { ROUTES } from '../../../shared/config/routes';
import { clockDate, createSystemClock, type Clock } from '../../../shared/lib/clock';
import type { OnboardingDraftStore } from '../../../shared/lib/onboarding-draft';

import { DEFAULT_ONBOARDING_INSTRUMENT } from './defaultInstrument';
import { buildSubmitRequest } from './submitRequest';
import { LAST_STEP, nextStep, pathForStep, previousStep } from './steps';
import {
  hasAnyAnswers,
  useOnboardingDraft,
  type OnboardingDraftController,
} from './useOnboardingDraft';

export interface UseOnboardingWizardOptions {
  /** 현재 열려 있는 단계 (route param 에서 온다). */
  step: OnboardingStep;
  /** 테스트 주입 지점. */
  store?: OnboardingDraftStore | undefined;
  clock?: Clock | undefined;
}

export interface OnboardingWizardController {
  instrument: OnboardingInstrument;
  /** 미인증 체험 구간인가 (C-12). `true` 면 서버 요청이 하나도 나가지 않는다. */
  isTrial: boolean;
  answers: OnboardingDraftAnswers;
  draft: OnboardingDraftController;
  now: Date;
  /** 단계 저장이 실패했는가 — 조용한 저장이므로 실패할 때만 알린다 (Design Spec §2.9). */
  saveFailed: boolean;
  submitPending: boolean;
  submitError: unknown;
  /** 제출에 필요한 단계가 비어 있을 때 그 목록. */
  submitBlockedBy: readonly OnboardingStep[];
  /** 보호자 관계 — 아동 데이터와 **다른 요청**으로 전송된다 (결정 D-16). */
  relationship: CaregiverRelationship | null;
  setRelationship: (value: CaregiverRelationship) => void;
  setAnswers: (next: OnboardingDraftAnswers) => void;
  goBack: () => void;
  goNext: () => void;
}

/**
 * 기기 타임존 — `PATCH /v1/me` 와 함께 1회 보낸다 (결정 D-16).
 * 감지에 실패하는 환경(구형 브라우저 · 테스트 stub)에서는 보내지 않는다.
 */
function detectTimezone(): string | null {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return zone.length > 0 ? zone : null;
  } catch {
    return null;
  }
}

function stepPayload(
  step: OnboardingStep,
  answers: OnboardingDraftAnswers,
  instrument: OnboardingInstrument,
): SaveOnboardingStepRequest {
  switch (step) {
    case 'child_info':
      return { step, answers: answers.child_info ?? {} };
    case 'temperament':
      return { step, answers: answers.temperament ?? {} };
    case 'books':
      return { step, answers: answers.books ?? {} };
    case 'goals':
      return { step, answers: answers.goals ?? {} };
    case 'capability_items':
      return {
        step,
        answers: answers.capability_items ?? {
          instrumentCode: instrument.survey.code,
          answers: [],
        },
      };
  }
}

export function useOnboardingWizard(
  options: UseOnboardingWizardOptions,
): OnboardingWizardController {
  const { step } = options;
  const navigate = useNavigate();
  const { session } = useAuth();
  // 렌더 중에 ref 를 읽지 않는다 (`react-hooks/refs`) — 마운트 동안 고정된 값은 lazy state 다.
  const [clock] = useState<Clock>(() => options.clock ?? createSystemClock());
  const [now] = useState<Date>(() => clockDate(clock));

  // 세션이 확정되지 않은 동안(`undefined`)은 아직 요청하지 않는다.
  const isTrial = session === null;
  const authenticated = session !== null && session !== undefined;

  const serverState = useOnboardingState({ enabled: authenticated });
  const saveStep = useSaveOnboardingStep();
  const submit = useSubmitOnboarding();
  const updateCaregiver = useUpdateCaregiver();
  const { me } = useMe();

  const instrument = serverState.state?.instrument ?? DEFAULT_ONBOARDING_INSTRUMENT;

  const draft = useOnboardingDraft({
    instrument,
    store: options.store,
    clock,
  });

  const [submitBlockedBy, setSubmitBlockedBy] = useState<readonly OnboardingStep[]>([]);
  const [relationship, setRelationshipState] = useState<CaregiverRelationship | null>(null);
  const seededRef = useRef(false);

  // 서버에 이미 저장된 관계가 있으면 그것이 초기값이다. Trial 구간에는 `me` 자체가 없다.
  const storedRelationship = me?.caregiver.relationship ?? null;
  const effectiveRelationship = relationship ?? storedRelationship;

  // 서버에 저장된 draft 가 있고 이 기기에는 없으면 서버 값으로 시작한다 (`draft-resume`).
  // 반대로 이 기기에 응답이 있으면 그것이 더 최근이므로 덮어쓰지 않는다 (Trial → 가입 경로).
  const serverDraft = serverState.state;
  useEffect(() => {
    if (seededRef.current || serverDraft === undefined) return;
    seededRef.current = true;

    if (hasAnyAnswers(draft.answers)) return;
    if (!hasAnyAnswers(serverDraft.draftAnswers)) return;

    draft.seed(serverDraft.draftAnswers, serverDraft.currentStep);
  }, [serverDraft, draft]);

  const persistStep = useCallback(
    (answers: OnboardingDraftAnswers) => {
      // Trial 구간은 서버로 아무것도 보내지 않는다 (AC-2-27).
      if (!authenticated) return;

      saveStep.mutate(stepPayload(step, answers, instrument));

      // 결정 D-16 — 화면 1개 / 요청 2개. 보호자 데이터는 아동 데이터와 **같은 payload 에
      // 섞이지 않는다**. 그래야 "동의 기록 전 아동 데이터 0건" 을 요청 단위로 검증할 수 있다.
      if (step !== 'child_info' || relationship === null) return;

      const timezone = detectTimezone();
      const patch: UpdateCaregiverRequest = {
        relationship,
        ...(timezone === null ? {} : { timezone }),
      };
      updateCaregiver.mutate(patch);
    },
    [authenticated, instrument, relationship, saveStep, step, updateCaregiver],
  );

  const goBack = useCallback(() => {
    const previous = previousStep(step);
    persistStep(draft.answers);

    if (previous === null) {
      void navigate(ROUTES.onboarding.intro);
      return;
    }

    draft.setCurrentStep(previous);
    void navigate(pathForStep(previous));
  }, [draft, navigate, persistStep, step]);

  const goNext = useCallback(() => {
    persistStep(draft.answers);

    const following = nextStep(step);

    if (following !== null) {
      draft.setCurrentStep(following);
      void navigate(pathForStep(following));
      return;
    }

    // 마지막 단계 — Trial 이면 제출 대신 가입으로 보낸다 (Design Spec §2.12).
    if (!authenticated) {
      void navigate(ROUTES.auth.signUp);
      return;
    }

    const built = buildSubmitRequest(instrument, draft.answers, now);

    if (!built.ok) {
      setSubmitBlockedBy(built.missing);
      const target = built.missing[0];
      if (target !== undefined && target !== LAST_STEP) {
        draft.setCurrentStep(target);
        void navigate(pathForStep(target));
      }
      return;
    }

    setSubmitBlockedBy([]);
    submit.mutate(built.request, {
      onSuccess: () => {
        // 삭제 시점 ① — 제출이 확정된 뒤에만 지운다 (D-3).
        draft.clear();
        void navigate(ROUTES.onboarding.saved, { replace: true });
      },
    });
  }, [authenticated, draft, instrument, navigate, now, persistStep, step, submit]);

  return {
    instrument,
    isTrial,
    answers: draft.answers,
    draft,
    now,
    saveFailed: saveStep.isError,
    submitPending: submit.isPending,
    submitError: submit.isError ? submit.error : null,
    submitBlockedBy,
    relationship: effectiveRelationship,
    setRelationship: setRelationshipState,
    setAnswers: draft.setAnswers,
    goBack,
    goNext,
  };
}
