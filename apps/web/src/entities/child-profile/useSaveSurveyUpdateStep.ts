/**
 * `useSaveSurveyUpdateStep` — `PUT /v1/children/:childId/survey-update/steps/:step` Mutation hook
 * (Stage 6 Plan §5.3 · AC-6-25).
 *
 * - **단계 이동 시 1회** 호출한다 (`D-11` 규칙 재사용 — 키 입력마다 보내지 않는다). 호출 시점은 feature 가 정한다.
 * - 성공 응답으로 draft 캐시를 갱신한다. 실패해도 이동은 막지 않는다 — 다음 이동 때 다시 저장된다 (Spec §2.6.3).
 * - 로컬 저장을 하지 않는다 — 서버 draft 가 정본이다 (`N6-07`, AC-6-44).
 * - Rev 10.1 (`D6-9` ②): 이동 PUT 은 `body.currentStep` = 도착 단계, 카드 화면 이탈 PUT 은 생략. 호출 시점은 feature.
 */
import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { useCallback } from 'react';
import type { SaveSurveyUpdateStepRequest, SurveyUpdateState } from '@haru/contracts';

import { useApiClients } from '../../shared/api/context';

import { surveyUpdateKeys } from './childProfileKeys';

export type SaveSurveyUpdateStepMutation = UseMutationResult<
  SurveyUpdateState,
  unknown,
  SaveSurveyUpdateStepRequest
>;

export function useSaveSurveyUpdateStep(childId: string): SaveSurveyUpdateStepMutation {
  const { children } = useApiClients();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: SaveSurveyUpdateStepRequest) =>
      children.saveSurveyUpdateStep({ childId, body }),
    onSuccess: (state) => {
      queryClient.setQueryData(surveyUpdateKeys.state(childId), state);
    },
  });
}

/**
 * `pagehide`(탭 닫기 · 새로고침) best-effort 저장 — Rev 10.1 (`D6-9` ② ③). Mutation 을 거치지 않고 adapter 를
 * `keepalive` 로 **직접 1회** 호출한다 — 페이지가 내려가는 중이라 Mutation 상태·재시도·화면 갱신이 의미가 없다.
 * 실패는 삼킨다(UI 없음 · 로그 없음 — 본문에 아이 답이 있다). 유실은 수용 범위다 (`API_CONTRACTS.md` Rev 10.1).
 */
export function useSurveyUpdatePageHideSave(
  childId: string,
): (body: SaveSurveyUpdateStepRequest) => void {
  const { children } = useApiClients();

  return useCallback(
    (body: SaveSurveyUpdateStepRequest) => {
      children.saveSurveyUpdateStep({ childId, body }, { keepalive: true }).catch(() => undefined);
    },
    [childId, children],
  );
}
