/**
 * 전체 데이터 삭제 요청 **기기 표시** — Stage 8 `N8-31` ⓐ (`D8-2` ①, Plan rev 2.2 §5.7 · AC-8-97).
 *
 * ```
 * localStorage["haru.data-deletion.pending.v1"] = JSON({ requestId, scope: 'all_data', savedAt })
 * ```
 *
 * 전체 삭제가 **화면 밖**(이탈 · 폴링 상한 · 앱 재시작)에서 끝나도 이 기기의 아동 데이터를 정리하기 위해, 진행 중인
 * `all_data` 요청의 id 만 기기에 남긴다. 앱 조립 지점의 감시자(`app/providers` `DataDeletionWatcher`)가 이 id 를 조회해
 * `completed` 면 로컬 정리 + Toast 1회를 한다.
 *
 * 규칙
 * - 담는 것은 **요청 id · scope · 저장 시각뿐**이다 — PII 0 (아이 이름 · 보호자 이메일 · 경로 0). 로그에도 남기지 않는다.
 * - 키 1개 · 요청 1건. 다시 쓰면 덮어쓴다 (caregiver 당 진행 요청은 1건 — `DELETION_ALREADY_REQUESTED`).
 * - `scope='account'`(탈퇴)는 표시하지 않는다 — 탈퇴 완료는 요청 성공 즉시 정리 + 세션 종료다 (`N8-10` 탈퇴 ⓐ).
 * - 레코드 모양은 **이 기기 안의 저장 형식**이지 API Contract 가 아니다 (`activity-card-cache` 와 같은 이유로 contracts 밖).
 *   담긴 `requestId` 는 contracts 의 uuid 형식으로만 받는다.
 * - 저장소가 막힌 환경에서도 던지지 않는다. 그때는 **메모리 값**으로 이 탭 수명 동안 같은 동작을 한다.
 * - 같은 탭의 쓰기는 `storage` 이벤트가 오지 않으므로 구독(`subscribe`)으로 감시자에게 알린다.
 *
 * 쓰는 때 · 지우는 때 (Plan §5.7 — 호출부)
 * | 사건 | 호출부 | 동작 |
 * |---|---|---|
 * | `POST /v1/data-deletion-requests` 성공 | `features/data-management` `DataManagement` | `save` |
 * | `/settings/data` 요약에 진행 중 `all_data` 요청 (진입 · `DELETION_ALREADY_REQUESTED` 후 재조회 — 다른 기기 요청 포함) | 〃 | `save` |
 * | `completed` → 정리 **성공 후** | `DataDeletionWatcher` | `clear` (실패면 남겨 다음 시작 때 재시도) |
 * | `failed` · `RESOURCE_NOT_FOUND` · `FORBIDDEN` | `DataDeletionWatcher` | `clear` |
 * | 로그아웃 · 탈퇴 정리 | `performSessionCleanup` 호출부(`useSignOut` · `useAccountDeletionCleanup`) | `clear` |
 */
import { z } from 'zod';

import type { Clock } from './clock';

/** Plan §5.7 이 정한 키 (예시 이름 그대로). 버전 접미사는 형식이 바뀔 때만 올린다. */
export const DATA_DELETION_MARKER_STORAGE_KEY = 'haru.data-deletion.pending.v1';

const DataDeletionMarkerSchema = z
  .object({
    requestId: z.uuid(),
    scope: z.literal('all_data'),
    savedAt: z.iso.datetime({ offset: true }),
  })
  .strict();

export type DataDeletionMarker = z.infer<typeof DataDeletionMarkerSchema>;

export interface DataDeletionMarkerStore {
  read(): DataDeletionMarker | null;
  /** 진행 중 `all_data` 요청 id 를 표시한다. 같은 id 면 아무것도 하지 않는다. */
  save(requestId: string, clock: Clock): void;
  clear(): void;
  /** 표시가 바뀌면 부른다 (같은 탭 쓰기 · 다른 탭 `storage` 이벤트). */
  subscribe(listener: () => void): () => void;
}

function resolveStorage(storage: Storage | undefined): Storage | null {
  if (storage !== undefined) return storage;
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

function parse(raw: string | null): DataDeletionMarker | null {
  if (raw === null) return null;
  try {
    const result = DataDeletionMarkerSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function createDataDeletionMarkerStore(
  options: { storage?: Storage | undefined } = {},
): DataDeletionMarkerStore {
  const listeners = new Set<() => void>();
  /** 저장소를 쓸 수 없을 때의 대체 값 (이 탭 수명). */
  let memory: DataDeletionMarker | null = null;

  const notify = () => {
    for (const listener of listeners) listener();
  };

  const storage = () => resolveStorage(options.storage);

  return {
    read() {
      const target = storage();
      if (target === null) return memory;
      try {
        const raw = target.getItem(DATA_DELETION_MARKER_STORAGE_KEY);
        const marker = parse(raw);
        // 읽을 수 없는 값은 남기지 않는다 (형식 불일치 · 손상).
        if (raw !== null && marker === null) target.removeItem(DATA_DELETION_MARKER_STORAGE_KEY);
        // 메모리 값은 저장소 쓰기가 실패했을 때만 있다 (`save`).
        return marker ?? memory;
      } catch {
        return memory;
      }
    },

    save(requestId, clock) {
      const current = this.read();
      if (current?.requestId === requestId) return;
      const parsed = DataDeletionMarkerSchema.safeParse({
        requestId,
        scope: 'all_data',
        savedAt: clock.nowIso(),
      });
      if (!parsed.success) return;
      const target = storage();
      try {
        if (target === null) throw new Error('storage unavailable');
        target.setItem(DATA_DELETION_MARKER_STORAGE_KEY, JSON.stringify(parsed.data));
      } catch {
        // 저장소가 막혔다 — 메모리 값으로 이 탭 동안 감시한다.
        memory = parsed.data;
      }
      notify();
    },

    clear() {
      const hadMarker = memory !== null || this.read() !== null;
      memory = null;
      try {
        storage()?.removeItem(DATA_DELETION_MARKER_STORAGE_KEY);
      } catch {
        // 무시 — 메모리 값은 이미 비웠다.
      }
      if (hadMarker) notify();
    },

    subscribe(listener) {
      listeners.add(listener);
      const onStorage = (event: StorageEvent) => {
        if (event.key === null || event.key === DATA_DELETION_MARKER_STORAGE_KEY) listener();
      };
      globalThis.addEventListener?.('storage', onStorage);
      return () => {
        listeners.delete(listener);
        globalThis.removeEventListener?.('storage', onStorage);
      };
    },
  };
}

/** 앱 공용 인스턴스 — 화면 · 감시자 · 로그아웃이 같은 표시를 본다. */
export const dataDeletionMarkerStore: DataDeletionMarkerStore = createDataDeletionMarkerStore();
