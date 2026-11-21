/**
 * 삭제 진행 중 쓰기 차단 — `ACCOUNT_DELETION_PENDING`(409) (Stage 8 Rev 12 `C8-5`, `N8-09` ⓐ · `P8-BIP-07`).
 *
 * 전체 데이터 삭제 · 탈퇴가 진행 중(`received` · `processing`)이면 계정은 `deletion_pending` 이고 **모든 쓰기 endpoint** 가
 * 거부된다. 도메인 Mock 마다 같은 분기를 넣지 않고 번들 조립 지점(`mocks/index.ts`)에서 **쓰기 메서드 목록**으로 한 번 감싼다
 * — 목록이 곧 "어느 endpoint 가 쓰기인가" 의 Mock 쪽 기준이다 (Backend Handoff 대조용).
 *
 * 제외 (의도):
 * - 삭제 · 탈퇴 endpoint 자신(`createDeletionRequest` · `deleteAccount`) — `DELETION_ALREADY_REQUESTED` 를 낸다
 * - `notifications.deletePushDevice` — 로그아웃 · 탈퇴 정리 경로다. 서버 삭제 파이프라인도 push 기기를 해제한다(`P8-BIP-02`)
 * - `uploadTransport` — HTTP API 가 아니라 Storage 바이트 전송이다. 차단은 `recordings.init` · `refreshTokens` · `complete` 가 한다
 * - 읽기(`GET`) 전부 — 진행 상태 폴링 · 요약은 계속 동작해야 한다
 */
import type { ApiClients } from '../../shared/api/types';

import type { MockFailure } from './delivery';

type WriteMethodTable = {
  readonly [K in keyof ApiClients]?: readonly (keyof ApiClients[K] & string)[];
};

/** `ACCOUNT_DELETION_PENDING` 대상 쓰기 메서드 (Plan §7 `C8-5` "모든 쓰기 endpoint"). */
export const DELETION_PENDING_WRITE_METHODS = {
  me: ['update'],
  consents: ['record'],
  onboarding: ['saveStep', 'submit'],
  activities: ['selectOption'],
  library: ['addOwnBook', 'createGiftRequest', 'saveBook', 'unsaveBook'],
  sessions: ['create', 'transition'],
  recordings: ['init', 'refreshTokens', 'complete'],
  notifications: ['updatePreferences', 'registerPushDevice'],
  reflections: ['submit'],
  children: ['update', 'setGrowthCapability', 'saveSurveyUpdateStep', 'submitSurveyUpdate'],
  reports: ['markViewed'],
  reportPdf: ['request'],
  dataManagement: ['deleteSessionRecording'],
} as const satisfies WriteMethodTable;

function guardApi<T extends object>(api: T, methods: readonly string[], check: () => void): T {
  const guarded: T = { ...api };
  for (const name of methods) {
    const original: unknown = Reflect.get(api, name);
    if (typeof original !== 'function') continue;
    const wrapped = async (...args: unknown[]): Promise<unknown> => {
      check();
      return Reflect.apply(original, api, args) as unknown;
    };
    Reflect.set(guarded, name, wrapped);
  }
  return guarded;
}

/**
 * `clients` 의 쓰기 메서드를 감싼다. `isPending()` 이 참이면 원래 메서드를 부르지 않고 `ACCOUNT_DELETION_PENDING` 으로 거절한다.
 * `isPending` 은 호출 시점마다 다시 본다 — 삭제가 끝나면(`completed` · `failed`) 쓰기가 다시 열린다.
 */
export function applyDeletionPendingWriteGuard(
  clients: ApiClients,
  isPending: () => boolean,
  failure: MockFailure,
): ApiClients {
  const check = (): void => {
    if (isPending()) {
      failure.fail(
        'ACCOUNT_DELETION_PENDING',
        'Your data is being deleted. Changes are paused until that finishes.',
      );
    }
  };

  const guarded: ApiClients = { ...clients };
  for (const [domain, methods] of Object.entries(DELETION_PENDING_WRITE_METHODS)) {
    const api: unknown = Reflect.get(clients, domain);
    if (typeof api !== 'object' || api === null) continue;
    Reflect.set(guarded, domain, guardApi(api, methods, check));
  }
  return guarded;
}
