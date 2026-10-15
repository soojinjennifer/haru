/**
 * `recorder` 그룹의 로컬 저장소 seed key — `crash-recovered` · `local-retention-exceeded` (`D4-29`, Stage 4 `S4-E`).
 * + `MockRecordingStorage` 의 결정성·디코드 규칙.
 */
import { describe, expect, it } from 'vitest';

import { mockChunkBytes } from '../fixtures/local-recordings';
import { createMockRecordingStorage } from '../platform/MockRecordingStorage';
import { resolveLocalStoreSeed } from '../recorder/localStoreScenarios';
import { resolveRecorderScenario } from '../recorder/recorderScenarios';
import { createScenarioStoreFrom } from '../scenarios';

const seed = (search: string) => resolveLocalStoreSeed(createScenarioStoreFrom({ search }));

describe('resolveLocalStoreSeed', () => {
  it.each([
    ['', 'none'],
    ['?scenario=recorder:crash-recovered', 'crash-recovered'],
    ['?scenario=recorder:local-retention-exceeded', 'local-retention-exceeded'],
    ['?scenario=recorder:web-background-warning', 'none'],
  ] as const)('%s → %s', (search, expected) => {
    expect(seed(search)).toBe(expected);
  });

  it('local-retention-exceeded 는 녹음기 계획에 사건을 만들지 않는다 (어댑터 무관)', () => {
    const plan = resolveRecorderScenario(
      createScenarioStoreFrom({ search: '?scenario=recorder:local-retention-exceeded' }),
    );
    expect(plan).toMatchObject({
      key: 'local-retention-exceeded',
      permission: 'granted',
      interruptions: [],
      backgroundOnce: false,
      autoTimeout: false,
      crashRecovered: false,
    });
  });
});

describe('MockRecordingStorage — Mock 디코드 규칙 (M-4 · M-6 재현)', () => {
  it('part 첫 청크(seq 1)가 맨 앞이면 성공, 길이 = 청크 수 × 1초', async () => {
    const storage = createMockRecordingStorage();
    const bytes = new Uint8Array([
      ...mockChunkBytes(1),
      ...mockChunkBytes(2),
      ...mockChunkBytes(3),
    ]);
    expect(await storage.decoder.decode(bytes, 'audio/webm')).toStrictEqual({
      ok: true,
      durationSeconds: 3,
    });
  });

  it('첫 청크가 없으면 실패한다 (실제 WebM 과 같다 — spike §4.1-3)', async () => {
    const storage = createMockRecordingStorage();
    const bytes = new Uint8Array([...mockChunkBytes(2), ...mockChunkBytes(3)]);
    expect(await storage.decoder.decode(bytes, 'audio/webm')).toStrictEqual({ ok: false });
  });

  it('값은 복제본으로 저장된다 (호출자가 바꿔도 저장값 불변)', async () => {
    const storage = createMockRecordingStorage();
    const value = { a: 1 };
    await storage.kv.put('recordings', 'k', value);
    value.a = 2;
    expect(await storage.kv.get('recordings', 'k')).toStrictEqual({ a: 1 });
  });
});
