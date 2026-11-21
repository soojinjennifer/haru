/**
 * 재응답 카드 컨트롤러 — 화면이 필요한 것만 모아서 돌려준다 (Stage 6 Spec §2.6.2 · §2.6.3, AC-6-24 ~ 28).
 *
 * 여기에서만 일어나는 일
 * 1. **답의 출처**: 이 흐름에서 고친 답(메모리, `SurveyUpdateSession`) > 서버 draft(`draftAnswers` — 진행 중 draft 가
 *    없으면 서버가 최근 제출 응답으로 프리필한 값). 기기 저장 0 (`N6-07`).
 * 2. **단계 저장**: 단계 이동 시 1회 `PUT …/survey-update/steps/:step` (`D-11` 규칙 재사용, AC-6-25). 실패해도 이동은 막지
 *    않는다 — 다음 이동 때 다시 저장된다 (Spec §2.6.3 · 시각 변화 0).
 *    **Rev 10.1 (`D6-9` ② · AC-6-26)** — 복귀 단계 = 사용자가 **보던** 단계:
 *    - 단계 이동(앞·뒤): `step` = 떠나는 단계 · `currentStep` = **도착 단계**.
 *    - 카드 화면 이탈(TopBar 뒤로 → 진입 · 앱 안 route 이동 · 브라우저 back): 보던 단계에 **저장 안 된 편집**이 있으면
 *      PUT 1회(`currentStep` 생략) — fire-and-forget, 실패해도 UI 없음. 흐름 안 이동은 `replace` 라 back = route 이탈.
 *    - 탭 닫기 · 새로고침 = `pagehide` 에서 같은 요청을 **best-effort**(`keepalive`). 유실은 수용 범위다.
 *    "저장 안 된 편집" = 이 단계 화면에서 답을 바꾼 뒤 아직 PUT 하지 않음. 이동 PUT · 제출 성공이 지운다.
 * 3. **제출**: 4단계 전체를 1회 요청으로 (`Idempotency-Key` — 같은 답 재시도 = 같은 키, `useSubmitSurveyUpdate`).
 *    성공 → Toast *"Your answers are saved"* → `/settings/profile` **replace** (`N6-10` + `D6-1`, AC-6-27).
 *
 * 흐름 안의 이동은 전부 **replace** 다 — 흐름이 history 에 한 칸만 남는다. 그래서 제출 후 프로필의 뒤로 · 진입 화면의
 * 뒤로가 모두 설정 목록이고, 제출한 설문 카드로 되돌아가지 않는다 (온보딩 `N6-24` 의 replace 와 같은 이유).
 */
import { useToast } from '@haru/ui';
import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
  unansweredRequiredQuestions,
  type ChoiceQuestionId,
  type ErrorCode,
  type OnboardingDraftAnswers,
  type OnboardingInstrument,
  type SaveSurveyUpdateStepRequest,
  type SurveyUpdateDraftAnswers,
  type SurveyUpdateState,
  type SurveyUpdateStep,
} from '@haru/contracts';

import {
  useSaveSurveyUpdateStep,
  useSubmitSurveyUpdate,
  useSurveyUpdatePageHideSave,
} from '../../../entities/child-profile';
import { ROUTES } from '../../../shared/config/routes';
import { surveyUpdateCopy } from '../copy';

import { nextSurveyUpdateStep, previousSurveyUpdateStep, surveyUpdateStepPath } from './steps';
import { buildSurveyUpdateSubmitRequest } from './submitRequest';
import { useSurveyUpdateSession } from './surveyUpdateSession';

export interface UseSurveyUpdateWizardOptions {
  step: SurveyUpdateStep;
  childId: string;
  state: SurveyUpdateState;
}

export interface SurveyUpdateWizardController {
  instrument: OnboardingInstrument;
  answers: SurveyUpdateDraftAnswers;
  setAnswers: (next: OnboardingDraftAnswers) => void;
  /** 현재 단계에서 아직 응답하지 않은 필수 문항 (`S2-ONB-1` — instrument 가 판정). */
  missingRequired: readonly ChoiceQuestionId[];
  submitPending: boolean;
  /** 제출 실패 표시 — `null` 이면 실패 없음. */
  submitFailure: { readonly offline: boolean; readonly code: ErrorCode | undefined } | null;
  /** 이전 단계로 (첫 단계면 진입 화면). 떠나는 단계를 저장한다. */
  goBack: () => void;
  /** 다음 단계로. 필수 미응답이면 아무 일도 하지 않는다. 떠나는 단계를 저장한다. */
  goNext: () => void;
  /** 마지막 카드 *Save answers*. */
  submit: () => void;
}

/** 재응답 draft 에서 온보딩 draft 의 `child_info` 를 뺀다 — 카드 컴포넌트는 온보딩 draft 모양으로 돌려준다. */
function toSurveyUpdateAnswers(next: OnboardingDraftAnswers): SurveyUpdateDraftAnswers {
  const { reading_together, books_and_interests, growing_together, capability_items } = next;
  return {
    ...(reading_together === undefined ? {} : { reading_together }),
    ...(books_and_interests === undefined ? {} : { books_and_interests }),
    ...(growing_together === undefined ? {} : { growing_together }),
    ...(capability_items === undefined ? {} : { capability_items }),
  };
}

function stepPayload(
  step: SurveyUpdateStep,
  answers: SurveyUpdateDraftAnswers,
  instrument: OnboardingInstrument,
): SaveSurveyUpdateStepRequest {
  switch (step) {
    case 'reading_together':
      return { step, answers: answers.reading_together ?? {} };
    case 'books_and_interests':
      return { step, answers: answers.books_and_interests ?? {} };
    case 'growing_together':
      return { step, answers: answers.growing_together ?? {} };
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

export function useSurveyUpdateWizard({
  step,
  childId,
  state,
}: UseSurveyUpdateWizardOptions): SurveyUpdateWizardController {
  const navigate = useNavigate();
  const toast = useToast();
  const session = useSurveyUpdateSession();
  const saveStep = useSaveSurveyUpdateStep(childId);
  const pageHideSave = useSurveyUpdatePageHideSave(childId);
  /** 보던 단계에 저장 안 된 편집이 있다 (Rev 10.1). 이 화면 = 한 단계 — 단계 전환은 재마운트다. */
  const unsaved = useRef(false);
  const submission = useSubmitSurveyUpdate(childId, {
    onSubmitted: () => {
      // 제출이 4단계 전체를 담았다 — 화면을 떠나며 draft PUT 을 다시 보내지 않는다.
      unsaved.current = false;
      toast.show({ tone: 'success', message: surveyUpdateCopy.savedToast });
      void navigate(ROUTES.settingsProfile, { replace: true });
    },
  });

  const instrument = state.instrument;
  const answers = session.answers ?? state.draftAnswers;
  const { setAnswers: storeAnswers } = session;

  /** 이탈 저장 요청 — 화면이 내려간 뒤(cleanup · `pagehide`)에도 최신 값을 읽도록 ref 로 둔다. */
  const leavePayload = useRef<SaveSurveyUpdateStepRequest>(stepPayload(step, answers, instrument));
  const mutateStep = useRef(saveStep.mutate);
  useEffect(() => {
    leavePayload.current = stepPayload(step, answers, instrument);
    mutateStep.current = saveStep.mutate;
  });

  /** 카드 화면 이탈 — 저장 안 된 편집이 있을 때만 1회 (`currentStep` 생략 = 보던 단계). */
  const saveUnsavedOnLeave = useCallback(() => {
    if (!unsaved.current) return;
    unsaved.current = false;
    mutateStep.current(leavePayload.current);
  }, []);

  // 앱 안 이동 · 브라우저 back · TopBar 뒤로 → 진입 — 모두 이 화면의 unmount 다.
  useEffect(() => saveUnsavedOnLeave, [saveUnsavedOnLeave]);

  // 탭 닫기 · 새로고침 — best-effort. bfcache 로 돌아올 수 있으므로 표시는 지우지 않는다(다음 이탈 때 다시 보낸다).
  useEffect(() => {
    const onPageHide = () => {
      if (unsaved.current) pageHideSave(leavePayload.current);
    };
    window.addEventListener('pagehide', onPageHide);
    return () => {
      window.removeEventListener('pagehide', onPageHide);
    };
  }, [pageHideSave]);

  /** 단계 이동 PUT — 떠나는 단계의 답 + 도착 단계. */
  const persistMove = useCallback(
    (arrival: SurveyUpdateStep) => {
      unsaved.current = false;
      saveStep.mutate({ ...stepPayload(step, answers, instrument), currentStep: arrival });
    },
    [answers, instrument, saveStep, step],
  );

  const goBack = useCallback(() => {
    const previous = previousSurveyUpdateStep(step);
    if (previous === null) {
      // 첫 카드에서 뒤로 = 진입 화면 — 단계 이동이 아니라 카드 화면 이탈이다.
      saveUnsavedOnLeave();
      void navigate(ROUTES.settingsChildSurvey, { replace: true });
      return;
    }
    persistMove(previous);
    void navigate(surveyUpdateStepPath(previous), { replace: true });
  }, [navigate, persistMove, saveUnsavedOnLeave, step]);

  const goNext = useCallback(() => {
    if (unansweredRequiredQuestions(instrument, answers, step).length > 0) return;
    const following = nextSurveyUpdateStep(step);
    if (following === null) return;
    persistMove(following);
    void navigate(surveyUpdateStepPath(following), { replace: true });
  }, [answers, instrument, navigate, persistMove, step]);

  const submit = useCallback(() => {
    if (unansweredRequiredQuestions(instrument, answers, step).length > 0) return;

    const built = buildSurveyUpdateSubmitRequest(instrument, answers);
    if (!built.ok) {
      const target = built.missing[0];
      if (target !== undefined && target !== step) {
        persistMove(target);
        void navigate(surveyUpdateStepPath(target), { replace: true });
      }
      return;
    }
    submission.submit(built.request);
  }, [answers, instrument, navigate, persistMove, step, submission]);

  return {
    instrument,
    answers,
    setAnswers: (next) => {
      unsaved.current = true;
      storeAnswers(toSurveyUpdateAnswers(next));
    },
    missingRequired: unansweredRequiredQuestions(instrument, answers, step),
    submitPending: submission.isPending,
    submitFailure: submission.isError
      ? { offline: submission.isOffline, code: submission.errorCode }
      : null,
    goBack,
    goNext,
    submit,
  };
}
