/**
 * `MockReflectionApi` — 세션 회고 제출 Mock Adapter (Stage 5 Plan §8 · `API_CONTRACTS` §3.10 · §5.4).
 *
 * `MockSessionApi` 와 **같은 서버 상태**를 본다 — 제출된 회고는 세션 레코드에 남고, 이후
 * `GET /v1/sessions/:id` 의 `reflection` 으로 보인다 (재진입 읽기 전용, `N5-08` ⓐ).
 *
 * ── scenario (group `reflections`) ──
 * | key | 동작 |
 * |---|---|
 * | `success` | 아래 "서버 규칙" 대로 저장 → `Reflection` |
 * | `loading` | 주입 timer 로 지연 후 성공 |
 * | `error` | contracts Error Envelope — 기본 `INTERNAL_ERROR` (번들 옵션 `errorCodes` 로 지정) |
 * | `retry` | 1회차 실패 → 2회차부터 성공 (같은 `Idempotency-Key` 로 재시도 — 실패는 보관되지 않는다) |
 * | `offline` | `NetworkError` |
 * | `reflection-already-submitted` | `REFLECTION_ALREADY_SUBMITTED` (이미 성공한 같은 key 의 replay 는 최초 응답) |
 * | `invalid-transition` | 1회차 `SESSION_INVALID_TRANSITION`(`details.from` = 서버 상태) — 오프라인 Submit 이 Outbox 에 남아 서버가 아직 완료 전인 경우. 2회차부터 상태 규칙대로 |
 *
 * ⛔ `empty`(skip) 는 이 그룹에 없다 — 건너뛰기 = 요청 없음 (`N5-06` ⓐ).
 *
 * ── 서버 규칙 (BACKEND 요구사항과 같다 — `P5-BIP-01` · `02`) ──
 * - 허용 상태 = 완료 계열(`completed` · `analyzing` · `analyzed` · `failed`), 두 mode 모두. 그 밖 →
 *   `SESSION_INVALID_TRANSITION` (`details.from`)
 * - 세션당 1건 — 이미 있으면 `REFLECTION_ALREADY_SUBMITTED`
 * - **`Idempotency-Key`**: 판정이 scenario 분기보다 **앞**이다. 같은 key + 같은 body → 최초 응답 재생,
 *   같은 key + 다른 body → `IDEMPOTENCY_KEY_REUSED` (세션·녹음과 같은 보관소)
 * - 요청 body 는 contracts 로 parse 한다 — 빈 회고 · 범위 밖 별점 · 중복 칩 → `VALIDATION_FAILED`
 */
import {
  ReflectionSchema,
  SubmitReflectionRequestSchema,
  type Reflection,
  type SubmitReflectionRequest,
} from '@haru/contracts';

import { parseRequest, parseResponse, type Timer } from '../../shared/api/helpers';
import type { ApiMutationOptions } from '../../shared/api/options';
import type { ReflectionApi } from '../../shared/api/reflection-api';
import type { Clock } from '../../shared/lib/clock';
import type { IdFactory } from '../../shared/lib/idFactory';
import {
  createMockFailure,
  deliver,
  resolveErrorCode,
  type MockErrorCodes,
} from '../common/delivery';
import { idempotencyFingerprint, type IdempotencyLedger } from '../common/idempotency';
import type { RequestLog } from '../request-log';
import { beginScenarioCall, type ScenarioGroupDefinition, type ScenarioStore } from '../scenarios';
import { materializeSubmittedReflection } from '../sessions/sessionFixtureScenarios';
import { ensureSessionHistory } from '../sessions/sessionHistory';
import { COMPLETION_STATUSES, type MockSessionState } from '../sessions/sessionState';

export const REFLECTION_SCENARIO_KEYS = [
  'success',
  'loading',
  'error',
  'retry',
  'offline',
  'reflection-already-submitted',
  'invalid-transition',
] as const;

export type ReflectionScenarioKey = (typeof REFLECTION_SCENARIO_KEYS)[number];

export const reflectionScenarioGroup: ScenarioGroupDefinition<ReflectionScenarioKey> = {
  group: 'reflections',
  keys: REFLECTION_SCENARIO_KEYS,
  defaultKey: 'success',
};

/** 제출 지연 (Catalogue §5.4 `loading` "1.5–3s"). 실제 대기는 주입 timer 가 정한다. */
export const REFLECTION_LOADING_DELAY_MS = 1_500;

const SUBMIT_OPERATION = 'POST /v1/sessions/:sessionId/reflection';

export interface MockReflectionApiDeps {
  store: ScenarioStore;
  clock: Clock;
  idFactory: IdFactory;
  timer: Timer;
  state: MockSessionState;
  idempotency: IdempotencyLedger;
  requestLog?: RequestLog | undefined;
  errorCodes?: MockErrorCodes | undefined;
}

export function createMockReflectionApi(deps: MockReflectionApiDeps): ReflectionApi {
  const { store, clock, idFactory, timer, state, idempotency, requestLog, errorCodes } = deps;
  const failure = createMockFailure(idFactory);
  const { fail } = failure;

  return {
    async submit(
      request: { sessionId: string; body: SubmitReflectionRequest },
      options: ApiMutationOptions,
    ): Promise<Reflection> {
      const body = parseRequest(SubmitReflectionRequestSchema, request.body, {
        operation: SUBMIT_OPERATION,
      });
      // 요청 본문은 dev·테스트 증거용 로그에만 남는다 (AC-5-24). Production 빌드에는 `mocks/**` 가 없다.
      requestLog?.record(SUBMIT_OPERATION, { sessionId: request.sessionId, ...body });

      const fingerprint = idempotencyFingerprint(
        SUBMIT_OPERATION,
        { sessionId: request.sessionId },
        body,
      );
      const replayed = idempotency.replay<Reflection>(options.idempotencyKey, fingerprint);
      if (replayed !== undefined) return replayed;

      const { scenario, attempt } = beginScenarioCall(
        store,
        reflectionScenarioGroup,
        'submit',
        options.signal,
      );

      if (scenario === 'reflection-already-submitted') {
        return fail('REFLECTION_ALREADY_SUBMITTED', 'This storytime already has a reflection.');
      }

      const run = (): Reflection => {
        ensureSessionHistory(state, clock);
        const record = state.sessions.get(request.sessionId);
        if (record === undefined) return fail('RESOURCE_NOT_FOUND', 'Unknown session.');

        const from = record.summary.status;
        if (
          (scenario === 'invalid-transition' && attempt === 1) ||
          !COMPLETION_STATUSES.has(from)
        ) {
          return fail('SESSION_INVALID_TRANSITION', 'This storytime is not finished yet.', {
            from,
          });
        }

        materializeSubmittedReflection(store, record, idFactory, clock);
        if (record.reflection !== null) {
          return fail('REFLECTION_ALREADY_SUBMITTED', 'This storytime already has a reflection.');
        }

        const reflection = parseResponse(
          ReflectionSchema,
          {
            id: idFactory.next(),
            sessionId: record.summary.id,
            rating: body.rating,
            checks: body.checks,
            note: body.note,
            submittedAt: clock.nowIso(),
          },
          { operation: SUBMIT_OPERATION, direction: 'response' },
        );
        record.reflection = reflection;
        return idempotency.remember(options.idempotencyKey, fingerprint, reflection);
      };

      return deliver({
        scenario,
        attempt,
        delayMs: REFLECTION_LOADING_DELAY_MS,
        run,
        message: 'Mock reflection submit failed.',
        errorCode: resolveErrorCode(errorCodes, reflectionScenarioGroup.group, 'submit'),
        signal: options.signal,
        timer,
        failure,
      });
    },
  };
}
