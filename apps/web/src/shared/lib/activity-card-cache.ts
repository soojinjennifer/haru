/**
 * Activity Card 오프라인 캐시 — **결정 `D-11`** (`docs/plans/stage-3-plan.md` §16, 이월 `QA-3-002`,
 * Stage 4 AC-4-82 · AC-4-83).
 *
 * ```
 * localStorage["haru.activity-card.v1"] = JSON({ schemaVersion, childId, card })
 * ```
 *
 * NFR 오프라인 *"Activity Card 는 최근 카드 캐시 표시"* 를 위한 **유일한 저장 지점**이다.
 * 화면·feature 는 직접 `localStorage` 를 만지지 않는다 (`entities/activity-card` 의 query hook 만 쓴다).
 *
 * 규칙 (`D-11` 승인 원문)
 * - 저장하는 것은 **`{ schemaVersion, childId, card }` 뿐**이다. Home 집계(`lastHighlightLine` — 아이 발화
 *   파생)·서재·`me` 는 저장하지 않는다 (`AC-3-48`). TanStack Query persist 플러그인을 쓰지 않는다.
 * - **읽기·쓰기 모두** `ActivityCardSchema` 로 parse 한다.
 * - 폐기 조건 = ① `schemaVersion` 불일치 ② parse 실패 ③ `card.date` 가 **오늘보다 2일 이상 과거**
 *   ④ 로그아웃(`clear`) — + ⑤ 다른 아이의 캐시(`childId` 불일치, MVP 는 아이 1명이라 방어 조건).
 *   ①②③⑤ 는 읽는 순간 지운다.
 * - "오늘" 은 주입된 `Clock` 의 **로컬 달력 날짜**다 (`toCalendarDate`). 이것은 화면에 쓰는 "오늘" 이 아니라
 *   **캐시 수명** 판정일 뿐이다 — `D-10`(서버 `date` 를 그대로 신뢰, 화면에서 재판정 금지)과 충돌하지 않는다.
 * - `Date.now()` 를 쓰지 않는다. 저장소 접근이 막힌 환경에서도 던지지 않는다 (캐시가 없을 뿐이다).
 *
 * 레코드 모양은 **이 기기 안의 저장 형식**이지 API Contract 가 아니다 — 그래서 `packages/contracts` 에
 * 새 schema 를 두지 않고, 담긴 `card` 만 contract schema 로 검증한다.
 */
import { ActivityCardSchema, type ActivityCard } from '@haru/contracts';

import { toCalendarDate, type Clock } from './clock';
import { errorName, logger } from './logger';

/** `D-11` 이 지정한 키. 버전 접미사는 `schemaVersion` 과 함께 움직인다. */
export const ACTIVITY_CARD_CACHE_STORAGE_KEY = 'haru.activity-card.v1';

export const ACTIVITY_CARD_CACHE_SCHEMA_VERSION = 1;

/** `card.date` 가 오늘보다 **이만큼 이상** 과거면 버린다 (`D-11` "2일 이상"). */
export const ACTIVITY_CARD_CACHE_MAX_AGE_DAYS = 2;

export type ActivityCardCacheDiscardReason = 'unreadable' | 'stale' | 'other-child';

export interface ActivityCardCacheReadResult {
  card: ActivityCard | null;
  discarded: ActivityCardCacheDiscardReason | null;
}

export interface ActivityCardCache {
  read(childId: string): ActivityCardCacheReadResult;
  write(childId: string, card: ActivityCard): void;
  /** 로그아웃 (`D-11` ④ · AC-4-83). */
  clear(): void;
}

export interface ActivityCardCacheOptions {
  clock: Clock;
  /** 기본은 브라우저 `localStorage`. 테스트는 메모리 구현을 넣는다. */
  storage?: Storage | undefined;
}

const EMPTY: ActivityCardCacheReadResult = { card: null, discarded: null };

function resolveStorage(storage: Storage | undefined): Storage | null {
  if (storage !== undefined) return storage;
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

/** `YYYY-MM-DD` → UTC 자정 epoch. 두 달력 날짜의 **일수 차**만 필요하므로 시간대가 끼지 않는다. */
function dayNumber(calendarDate: string): number {
  const [year, month, day] = calendarDate.split('-').map(Number);
  return Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1) / 86_400_000;
}

/** 오늘(로컬)과 `card.date` 의 일수 차. 양수 = 카드가 과거. */
export function activityCardAgeDays(cardDate: string, clock: Clock): number {
  return dayNumber(toCalendarDate(clock.now())) - dayNumber(cardDate);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function createActivityCardCache(options: ActivityCardCacheOptions): ActivityCardCache {
  const storage = resolveStorage(options.storage);
  const { clock } = options;

  function remove(): void {
    try {
      storage?.removeItem(ACTIVITY_CARD_CACHE_STORAGE_KEY);
    } catch (error: unknown) {
      logger.warn('activity_card_cache_clear_failed', { errorName: errorName(error) });
    }
  }

  return {
    read(childId) {
      if (storage === null) return EMPTY;

      let raw: string | null;
      try {
        raw = storage.getItem(ACTIVITY_CARD_CACHE_STORAGE_KEY);
      } catch (error: unknown) {
        logger.warn('activity_card_cache_read_failed', { errorName: errorName(error) });
        return EMPTY;
      }
      if (raw === null) return EMPTY;

      let json: unknown;
      try {
        json = JSON.parse(raw);
      } catch {
        remove();
        return { card: null, discarded: 'unreadable' };
      }

      // ① schemaVersion 불일치 · ② parse 실패 — 처리(폐기)가 같다.
      if (!isRecord(json) || json['schemaVersion'] !== ACTIVITY_CARD_CACHE_SCHEMA_VERSION) {
        remove();
        return { card: null, discarded: 'unreadable' };
      }
      const parsed = ActivityCardSchema.safeParse(json['card']);
      if (!parsed.success || typeof json['childId'] !== 'string') {
        remove();
        return { card: null, discarded: 'unreadable' };
      }

      // ⑤ 다른 아이의 캐시.
      if (json['childId'] !== childId) {
        remove();
        return { card: null, discarded: 'other-child' };
      }

      // ③ 날짜 경과.
      if (activityCardAgeDays(parsed.data.date, clock) >= ACTIVITY_CARD_CACHE_MAX_AGE_DAYS) {
        remove();
        return { card: null, discarded: 'stale' };
      }

      return { card: parsed.data, discarded: null };
    },

    write(childId, card) {
      if (storage === null) return;
      // 쓰기에서도 parse 한다 — 잘못된 값이 저장소에 들어가지 않는다.
      const validated = ActivityCardSchema.parse(card);
      try {
        storage.setItem(
          ACTIVITY_CARD_CACHE_STORAGE_KEY,
          JSON.stringify({
            schemaVersion: ACTIVITY_CARD_CACHE_SCHEMA_VERSION,
            childId,
            card: validated,
          }),
        );
      } catch (error: unknown) {
        logger.warn('activity_card_cache_write_failed', { errorName: errorName(error) });
      }
    },

    clear: remove,
  };
}
