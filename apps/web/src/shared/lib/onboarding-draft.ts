/**
 * Trial 온보딩 draft 저장소 — **결정 D-3** (`docs/decisions/stage-2-approvals.md` §4).
 *
 * ```
 * localStorage["haru.onboarding.draft.v1"] = JSON(OnboardingDraft)
 * ```
 *
 * 가입 전(Trial) 구간과 동의 기록 전 구간의 응답은 **서버로 나가지 않는다** (C-12 · AC-2-27).
 * 이 파일이 그 응답이 머무는 **유일한 경계**다 (Plan §5.3). 화면·feature 는 직접
 * `localStorage` 를 만지지 않는다.
 *
 * 규칙
 * - **읽기·쓰기 모두** `OnboardingDraftSchema` 로 parse 한다. 손상된 값을 화면에 흘리지 않는다.
 * - 삭제 시점 5종: ① 제출 성공 ② 로그아웃 ③ `schemaVersion` 불일치 ④ parse 실패 ⑤ 30일 경과.
 *   ③④⑤ 는 읽는 순간 저장소에서 지우고 사유를 돌려준다 — 화면이 안내 문구를 고른다 (§2.12).
 * - `Date.now()` 를 쓰지 않는다. 기준 시각은 주입된 `Clock` 에서만 온다.
 * - 저장소 접근이 막힌 환경(사생활 보호 모드 · SSR)에서도 던지지 않는다. draft 가 없을 뿐이다.
 */
import {
  isOnboardingDraftExpired,
  ONBOARDING_DRAFT_SCHEMA_VERSION,
  OnboardingDraftSchema,
  type OnboardingDraft,
} from '@haru/contracts';

import { clockDate, type Clock } from './clock';
import { errorName, logger } from './logger';

/** 결정 D-3 이 지정한 키. 버전 접미사는 `schemaVersion` 과 함께 움직인다. */
export const ONBOARDING_DRAFT_STORAGE_KEY = 'haru.onboarding.draft.v1';

/** draft 를 버린 이유 — 화면 안내 문구가 이 값으로 갈린다 (Design Spec §2.12). */
export type OnboardingDraftDiscardReason = 'expired' | 'unreadable';

export interface OnboardingDraftReadResult {
  /** 쓸 수 있는 draft. 없거나 버려졌으면 `null`. */
  draft: OnboardingDraft | null;
  /** 저장돼 있던 값을 버렸다면 그 이유. 애초에 없었으면 `null`. */
  discarded: OnboardingDraftDiscardReason | null;
}

export interface OnboardingDraftStore {
  read(): OnboardingDraftReadResult;
  write(draft: OnboardingDraft): void;
  /** 삭제 시점 ①(제출 성공) · ②(로그아웃). */
  clear(): void;
}

export interface OnboardingDraftStoreOptions {
  clock: Clock;
  /** 기본은 브라우저 `localStorage`. 테스트는 메모리 구현을 넣는다. */
  storage?: Storage | undefined;
}

const EMPTY: OnboardingDraftReadResult = { draft: null, discarded: null };

function resolveStorage(storage: Storage | undefined): Storage | null {
  if (storage !== undefined) return storage;

  try {
    return globalThis.localStorage;
  } catch {
    // 사생활 보호 모드 등에서 접근 자체가 던질 수 있다.
    return null;
  }
}

/** 메모리 저장소 — 테스트와 저장소가 없는 환경에서 쓴다. */
export function createMemoryStorage(initial: Readonly<Record<string, string>> = {}): Storage {
  const map = new Map<string, string>(Object.entries(initial));

  return {
    get length() {
      return map.size;
    },
    clear: () => {
      map.clear();
    },
    getItem: (key: string) => map.get(key) ?? null,
    key: (index: number) => [...map.keys()][index] ?? null,
    removeItem: (key: string) => {
      map.delete(key);
    },
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
  };
}

export function createOnboardingDraftStore(
  options: OnboardingDraftStoreOptions,
): OnboardingDraftStore {
  const storage = resolveStorage(options.storage);
  const { clock } = options;

  function remove(): void {
    try {
      storage?.removeItem(ONBOARDING_DRAFT_STORAGE_KEY);
    } catch (error: unknown) {
      logger.warn('onboarding_draft_clear_failed', { errorName: errorName(error) });
    }
  }

  return {
    read() {
      if (storage === null) return EMPTY;

      let raw: string | null;
      try {
        raw = storage.getItem(ONBOARDING_DRAFT_STORAGE_KEY);
      } catch (error: unknown) {
        logger.warn('onboarding_draft_read_failed', { errorName: errorName(error) });
        return EMPTY;
      }

      if (raw === null) return EMPTY;

      // ③ schemaVersion 불일치 · ④ parse 실패 — 둘 다 "읽을 수 없음" 으로 안내한다.
      // 사용자에게 두 사유를 구분해 말할 이유가 없고, 처리(폐기)도 같다.
      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(raw);
      } catch {
        remove();
        return { draft: null, discarded: 'unreadable' };
      }

      const parsed = OnboardingDraftSchema.safeParse(parsedJson);

      if (!parsed.success) {
        remove();
        return { draft: null, discarded: 'unreadable' };
      }

      // ⑤ 보관 상한 경과.
      if (isOnboardingDraftExpired(parsed.data.updatedAt, clockDate(clock))) {
        remove();
        return { draft: null, discarded: 'expired' };
      }

      return { draft: parsed.data, discarded: null };
    },

    write(draft) {
      if (storage === null) return;

      // 쓰기에서도 parse 한다 — 잘못된 값이 저장소에 들어가지 않는다.
      const validated = OnboardingDraftSchema.parse(draft);

      try {
        storage.setItem(ONBOARDING_DRAFT_STORAGE_KEY, JSON.stringify(validated));
      } catch (error: unknown) {
        // 용량 초과 등. 저장에 실패해도 화면은 계속 동작해야 한다.
        logger.warn('onboarding_draft_write_failed', { errorName: errorName(error) });
      }
    },

    clear: remove,
  };
}

export { ONBOARDING_DRAFT_SCHEMA_VERSION };
