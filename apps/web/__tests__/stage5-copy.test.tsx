/**
 * Stage 5 `S5-D` copy 리뷰 (AC-5-44) — 회고 카드 · 피드백 화면이 사용자에게 보일 수 있는 **모든** 문구.
 *
 * | 원천 | 근거 |
 * |---|---|
 * | `features/reflection/copy.ts` | 회고 카드 (Figma `91:691` 원문 + Spec §2.2 초안) |
 * | `features/session-feedback/copy.ts` | 피드백 화면 (Spec §2.3 초안) — 이 파일의 금칙어 검사는 `copy.test.ts` 에도 있다 |
 * | `shared/copy/error-copy.ts` | 두 화면이 재사용하는 공통 오류 문구 — `errorCopyForCode` 는 **어떤 code 든** 띄울 수 있어 전부 본다 |
 * | Mock `shortFeedback.text` fixture | 생성 문구는 API(Mock) 값만 표시한다 — Mock 예시도 같은 언어 규칙을 따라야 한다 |
 *
 * 금칙어 = Plan AC-5-44 목록. 문구가 copy 모듈 밖(컴포넌트 JSX 리터럴)에 없다는 점은 `S5-D` grep 으로 확인했다
 * (`docs/qa/stage-5-handoff.md` H5-6).
 */
import { describe, expect, it } from 'vitest';

import { reflectionCopy } from '../src/features/reflection';
import { sessionFeedbackCopy } from '../src/features/session-feedback';
import {
  ERROR_COPY,
  networkErrorCopy,
  retryLabel,
  unknownErrorCopy,
} from '../src/shared/copy/error-copy';
import {
  MOCK_SHORT_FEEDBACK,
  MOCK_SHORT_FEEDBACK_LOW_QUALITY,
  MOCK_SHORT_FEEDBACK_MISSING,
} from '../src/mocks/fixtures/analysis';

const FORBIDDEN = [
  'diagnos',
  'delay',
  'behind',
  'normal',
  'score',
  'worse',
  'better than',
  'peers',
] as const;

function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (typeof value === 'object' && value !== null) return Object.values(value).flatMap(strings);
  return [];
}

/** 회고 카드 문구 — 함수 문구(제목 이름 슬롯 · 별 개수)는 실제 인자로 펼친다. */
const reflectionTexts: readonly string[] = [
  ...strings({ ...reflectionCopy, title: undefined, star: undefined }),
  reflectionCopy.title('Nova'),
  ...[1, 2, 3, 4, 5].map((count) => reflectionCopy.star(count)),
];

const SOURCES: readonly { name: string; texts: readonly string[] }[] = [
  { name: 'reflectionCopy', texts: reflectionTexts },
  { name: 'sessionFeedbackCopy', texts: strings(sessionFeedbackCopy) },
  {
    name: 'error-copy',
    texts: strings([ERROR_COPY, networkErrorCopy, unknownErrorCopy, retryLabel]),
  },
  {
    name: 'mock shortFeedback',
    texts: [MOCK_SHORT_FEEDBACK, MOCK_SHORT_FEEDBACK_LOW_QUALITY, MOCK_SHORT_FEEDBACK_MISSING]
      .map((feedback) => feedback.text)
      .filter((text): text is string => text !== null),
  },
];

describe('Stage 5 copy — 진단·판정·비교 표현 0 (AC-5-44)', () => {
  for (const source of SOURCES) {
    it(`${source.name}: 금칙어 0`, () => {
      expect(source.texts.length).toBeGreaterThan(0);
      const hits = source.texts.flatMap((text) =>
        FORBIDDEN.filter((word) => text.toLowerCase().includes(word)).map(
          (word) => `${word} ← ${text}`,
        ),
      );
      expect(hits).toStrictEqual([]);
    });
  }

  it('회고 카드 문구는 아이에 대한 평가를 만들지 않는다 — 이름은 제목 슬롯에만 들어간다', () => {
    const withName = reflectionTexts.filter((text) => text.includes('Nova'));
    expect(withName).toStrictEqual(['How was storytime with Nova?']);
  });

  it('Mock 피드백 문구에 아이 이름 · 수치 0 (전사·지표 표현 없음, AC-5-45)', () => {
    for (const feedback of [MOCK_SHORT_FEEDBACK, MOCK_SHORT_FEEDBACK_LOW_QUALITY]) {
      expect(feedback.text).not.toMatch(/\d/);
      expect(feedback.text).not.toMatch(/Nova|Emma/);
    }
  });
});
