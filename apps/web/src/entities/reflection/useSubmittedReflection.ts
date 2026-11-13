/**
 * `useSubmittedReflection` — 이 앱 실행 중 **이미 성공한** 회고 제출의 응답 (Stage 5 `N5-08` ⓐ).
 *
 * 완료 화면이 전이 응답으로 그려진 경로(`Submit` 직후)는 세션 상세를 조회하지 않아 `SessionDetail.reflection` 을
 * 모른다. 저장 후 홈으로 갔다가 뒤로 돌아오면 빈 카드가 다시 보이고, 다시 누르면 `REFLECTION_ALREADY_SUBMITTED`
 * 가 된다 — 그래서 mutation cache 의 성공 응답을 읽어 읽기 전용으로 보여 준다. 메모리에만 있다 (`N5-17`).
 */
import { useMutationState } from '@tanstack/react-query';
import { ReflectionSchema, type Reflection } from '@haru/contracts';

import { reflectionKeys } from './reflectionKeys';

export function useSubmittedReflection(sessionId: string): Reflection | null {
  const submitted = useMutationState({
    filters: { mutationKey: reflectionKeys.submit(sessionId), status: 'success' },
    select: (mutation) => mutation.state.data,
  });
  for (let index = submitted.length - 1; index >= 0; index -= 1) {
    const parsed = ReflectionSchema.safeParse(submitted[index]);
    if (parsed.success) return parsed.data;
  }
  return null;
}
