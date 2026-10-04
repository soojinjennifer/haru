/**
 * 가입 화면에서 받은 아이 정보의 **로컬 보관** — `R-01` (`stage-3-approvals.md` §11.5).
 *
 * ── 지켜야 하는 경계 ──
 * "화면에서 입력받는 것"과 "서버로 전송하는 것"을 분리한다. 이 모듈은 **전자만** 한다.
 *  - `SignUpWithEmailInput` 은 `.strict()` 를 유지한다 — 아이 필드를 추가하지 않는다 (`AC-2-05`).
 *  - 값은 기존 `OnboardingDraftStore` **한 경로만** 통과한다 (신규 저장소를 만들지 않는다).
 *  - 동의 기록 이후 `POST /v1/onboarding/submit` 1회로 전송된다 (`AC-2R-13`).
 *  - 로그아웃·데이터 삭제 시 같은 저장소가 지워지므로 이 값도 함께 사라진다
 *    (`features/settings/model/useSignOut`, `rules/architecture.md` §9).
 *  - 콘솔·에러 로그에 아이 이름을 남기지 않는다.
 *
 * draft 가 이미 있으면 **instrument 참조와 진행 단계를 그대로 보존**하고 `child_info` 만 합친다.
 */
import {
  ONBOARDING_DRAFT_SCHEMA_VERSION,
  ONBOARDING_INSTRUMENT_CODE,
  ONBOARDING_INSTRUMENT_VERSION,
  type OnboardingDraftAnswers,
} from '@haru/contracts';

import type { Clock } from '../../../shared/lib/clock';
import type { OnboardingDraftStore } from '../../../shared/lib/onboarding-draft';

/**
 * 실제로 입력된 값이 있는가.
 *
 * `partialChildInfoAnswers` 는 빈 폼에서도 `gender: null` 을 담아 돌려준다
 * (`languageEnvironment` 는 빈 배열이면 키 자체를 빼므로 남지 않는다 — `QA-2R-009`).
 * 그걸 그대로 저장하면 **아무것도 입력하지 않은 사용자에게도 draft 가 생겨**
 * Guard 가 "중도 복귀" 로 보고 프로필 안내를 건너뛴다 (`§11.19` 7-2). 그래서 저장 전에
 * 의미 있는 값이 하나라도 있는지 본다.
 */
export function hasChildDraftValues(
  childInfo: NonNullable<OnboardingDraftAnswers['child_info']>,
): boolean {
  return (
    (childInfo.firstName ?? '').trim().length > 0 ||
    (childInfo.lastName ?? '').trim().length > 0 ||
    childInfo.birthYearMonth !== undefined ||
    (childInfo.gender ?? null) !== null
  );
}

export interface SaveChildDraftOptions {
  store: OnboardingDraftStore;
  clock: Clock;
  childInfo: NonNullable<OnboardingDraftAnswers['child_info']>;
}

/**
 * 아이 정보를 로컬 draft 에 합쳐 저장한다. **서버 요청은 발생하지 않는다.**
 * 입력된 값이 하나도 없으면 아무것도 쓰지 않는다 (`hasChildDraftValues`).
 */
export function saveChildDraft({ store, clock, childInfo }: SaveChildDraftOptions): void {
  if (!hasChildDraftValues(childInfo)) return;

  const existing = store.read().draft;

  store.write({
    schemaVersion: ONBOARDING_DRAFT_SCHEMA_VERSION,
    instrument: existing?.instrument ?? {
      code: ONBOARDING_INSTRUMENT_CODE,
      version: ONBOARDING_INSTRUMENT_VERSION,
    },
    currentStep: existing?.currentStep ?? 'child_info',
    answers: {
      ...existing?.answers,
      child_info: { ...existing?.answers.child_info, ...childInfo },
    },
    updatedAt: clock.nowIso(),
  });
}

/** 저장돼 있는 아이 정보 (있으면). 가입 화면 재진입 시 입력값을 되살린다. */
export function readChildDraft(
  store: OnboardingDraftStore,
): NonNullable<OnboardingDraftAnswers['child_info']> | undefined {
  return store.read().draft?.answers.child_info;
}
