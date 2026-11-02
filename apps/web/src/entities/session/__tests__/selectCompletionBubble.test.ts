/** 완료 버블 표시 판정 — AC-4-139 ② ⑦ (`D4-87` · `D4-95`). 값을 가공하지 않는다. */
import { describe, expect, it } from 'vitest';

import { selectCompletionBubble } from '../useSessionCompletion';

describe('selectCompletionBubble', () => {
  it('값을 그대로 돌려준다', () => {
    expect(selectCompletionBubble({ text: 'Well done', subtext: 'Sticker earned' })).toStrictEqual({
      text: 'Well done',
      subtext: 'Sticker earned',
    });
  });

  it.each([
    ['null', { text: 'Well done', subtext: null }],
    ['빈 문자열', { text: 'Well done', subtext: '' }],
    ['key 없음', { text: 'Well done' }],
  ])('`subtext` %s → 주 문구만', (_name, copy) => {
    expect(selectCompletionBubble(copy)).toStrictEqual({ text: 'Well done', subtext: null });
  });

  it.each([
    ['응답 없음', undefined],
    ['null', null],
    ['text null + subtext', { text: null, subtext: 'Sticker earned' }],
    ['text 빈 문자열 + subtext', { text: '', subtext: 'Sticker earned' }],
  ])('%s → 버블 없음', (_name, copy) => {
    expect(selectCompletionBubble(copy)).toBeNull();
  });
});
