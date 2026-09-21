import { IdSchema } from '@haru/contracts';
import { describe, expect, it } from 'vitest';

import { createRandomIdFactory, createSeededIdFactory } from '../idFactory';

describe('idFactory — 주입 가능한 ID 생성기 (Plan §8.3)', () => {
  it('같은 seed 는 같은 수열을 만든다 (결정성)', () => {
    const first = createSeededIdFactory('haru-mock');
    const second = createSeededIdFactory('haru-mock');

    const a = [first.next(), first.next(), first.next()];
    const b = [second.next(), second.next(), second.next()];

    expect(a).toStrictEqual(b);
  });

  it('다른 seed 는 다른 수열을 만든다', () => {
    expect(createSeededIdFactory('a').next()).not.toBe(createSeededIdFactory('b').next());
  });

  it('같은 생성기의 연속 호출은 서로 다른 ID 를 만든다', () => {
    const factory = createSeededIdFactory('haru-mock');
    const ids = new Set(Array.from({ length: 50 }, () => factory.next()));

    expect(ids.size).toBe(50);
  });

  it('contracts IdSchema(uuid) 를 통과한다', () => {
    const factory = createSeededIdFactory('haru-mock');

    for (let index = 0; index < 20; index += 1) {
      expect(IdSchema.safeParse(factory.next()).success).toBe(true);
    }
  });

  it('random 생성기도 uuid 형식을 만든다 (Http Adapter 경로)', () => {
    expect(IdSchema.safeParse(createRandomIdFactory().next()).success).toBe(true);
  });
});
