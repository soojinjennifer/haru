/**
 * 로컬 draft 상태 — 결정 **D-3**(저장소) · **D-11**(저장 주기).
 *
 * | 저장 대상 | 주기 |
 * |---|---|
 * | 로컬 draft (`localStorage`) | 입력 변경 후 **400ms debounce** |
 * | 서버 draft (`PUT /v1/onboarding/steps/:step`) | **단계 이동 시 1회** (이 hook 밖) |
 *
 * 이 hook 은 **네트워크를 모른다.** Trial(가입 전) 구간에서 서버 요청이 0건이어야 하므로
 * (AC-2-27), 응답을 붙잡아 두는 책임과 전송하는 책임을 분리한다.
 *
 * 단계 이동은 debounce 없이 **즉시** 기록한다 — 이동 직후 새로고침해도 같은 단계로 돌아와야
 * 한다 (AC-2-20).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  instrumentRefOf,
  ONBOARDING_DRAFT_SCHEMA_VERSION,
  type OnboardingDraftAnswers,
  type OnboardingInstrument,
  type OnboardingStep,
} from '@haru/contracts';

import { createSystemClock, type Clock } from '../../../shared/lib/clock';
import {
  createOnboardingDraftStore,
  type OnboardingDraftDiscardReason,
  type OnboardingDraftStore,
} from '../../../shared/lib/onboarding-draft';

import { FIRST_STEP } from './steps';

/** 결정 D-11 — 로컬 저장 debounce. */
export const DRAFT_DEBOUNCE_MS = 400;

export interface UseOnboardingDraftOptions {
  instrument: OnboardingInstrument;
  /** 테스트 · dev 주입 지점. 주지 않으면 `localStorage` + 시스템 시계를 쓴다. */
  store?: OnboardingDraftStore | undefined;
  clock?: Clock | undefined;
}

export interface OnboardingDraftController {
  answers: OnboardingDraftAnswers;
  currentStep: OnboardingStep;
  /** 읽는 순간 폐기된 draft 가 있었다면 그 사유 (§2.12 안내 문구). */
  discarded: OnboardingDraftDiscardReason | null;
  /** 응답 변경 — 400ms debounce 후 저장된다. */
  setAnswers: (next: OnboardingDraftAnswers) => void;
  /** 단계 이동 — 즉시 저장된다. */
  setCurrentStep: (step: OnboardingStep) => void;
  /** 서버 draft 로 초기 상태를 채운다 (로컬이 비어 있을 때만 호출한다). */
  seed: (answers: OnboardingDraftAnswers, step: OnboardingStep) => void;
  /** 삭제 시점 ①(제출 성공) · ②(로그아웃). */
  clear: () => void;
  dismissDiscardNotice: () => void;
}

/** 응답이 하나라도 들어 있는가 — 서버 draft 로 덮어쓸지 판단할 때 쓴다. */
export function hasAnyAnswers(answers: OnboardingDraftAnswers): boolean {
  return Object.values(answers).some(
    (value) => value !== undefined && Object.keys(value as object).length > 0,
  );
}

export function useOnboardingDraft(options: UseOnboardingDraftOptions): OnboardingDraftController {
  const { instrument } = options;

  // 시계·저장소는 마운트 동안 변하지 않는 싱글턴이다. ref 대신 lazy `useState` 로 만든다 —
  // 렌더 중에 ref 를 읽지 않기 위해서다 (`react-hooks/refs`).
  const [clock] = useState<Clock>(() => options.clock ?? createSystemClock());
  const [store] = useState<OnboardingDraftStore>(
    () => options.store ?? createOnboardingDraftStore({ clock }),
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** debounce 대기 중인 값. 화면을 떠나거나 단계를 옮길 때 이 값을 즉시 기록한다. */
  const pendingRef = useRef(false);

  const [initial] = useState(() => store.read());
  const [answers, setAnswersState] = useState<OnboardingDraftAnswers>(initial.draft?.answers ?? {});
  const [currentStep, setStepState] = useState<OnboardingStep>(
    initial.draft?.currentStep ?? FIRST_STEP,
  );
  const [discarded, setDiscarded] = useState<OnboardingDraftDiscardReason | null>(
    initial.discarded,
  );

  // 최신 값을 렌더 사이클과 무관하게 읽기 위한 거울. 저장 시점(타이머·언마운트)은
  // 렌더 밖이라 state 를 그대로 읽으면 옛 값이 잡힌다.
  const answersRef = useRef(answers);
  const stepRef = useRef(currentStep);

  const persist = useCallback(() => {
    store.write({
      schemaVersion: ONBOARDING_DRAFT_SCHEMA_VERSION,
      instrument: instrumentRefOf(instrument),
      currentStep: stepRef.current,
      answers: answersRef.current,
      updatedAt: clock.nowIso(),
    });
  }, [clock, instrument, store]);

  const cancelTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const flush = useCallback(() => {
    cancelTimer();
    if (!pendingRef.current) return;
    pendingRef.current = false;
    persist();
  }, [cancelTimer, persist]);

  // 화면을 떠날 때 아직 debounce 중인 입력을 잃지 않는다.
  useEffect(() => flush, [flush]);

  const setAnswers = useCallback(
    (next: OnboardingDraftAnswers) => {
      answersRef.current = next;
      setAnswersState(next);

      pendingRef.current = true;
      cancelTimer();
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        pendingRef.current = false;
        persist();
      }, DRAFT_DEBOUNCE_MS);
    },
    [cancelTimer, persist],
  );

  const setCurrentStep = useCallback(
    (step: OnboardingStep) => {
      stepRef.current = step;
      setStepState(step);
      // 단계 이동은 debounce 하지 않는다 — 진행 위치는 즉시 남아야 한다 (AC-2-20).
      cancelTimer();
      pendingRef.current = false;
      persist();
    },
    [cancelTimer, persist],
  );

  const seed = useCallback(
    (nextAnswers: OnboardingDraftAnswers, step: OnboardingStep) => {
      answersRef.current = nextAnswers;
      stepRef.current = step;
      setAnswersState(nextAnswers);
      setStepState(step);
      cancelTimer();
      pendingRef.current = false;
      persist();
    },
    [cancelTimer, persist],
  );

  const clear = useCallback(() => {
    cancelTimer();
    pendingRef.current = false;
    answersRef.current = {};
    stepRef.current = FIRST_STEP;
    store.clear();
    setAnswersState({});
    setStepState(FIRST_STEP);
  }, [cancelTimer, store]);

  const dismissDiscardNotice = useCallback(() => {
    setDiscarded(null);
  }, []);

  return {
    answers,
    currentStep,
    discarded,
    setAnswers,
    setCurrentStep,
    seed,
    clear,
    dismissDiscardNotice,
  };
}
