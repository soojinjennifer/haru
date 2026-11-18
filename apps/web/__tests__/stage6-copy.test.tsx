/**
 * Stage 6 `S6-F` copy 리뷰 (AC-6-42 · AC-6-33 · AC-6-35 · AC-6-41) — Stage 6 화면이 사용자에게 보일 수 있는 문구 전부.
 *
 * | 원천 | 근거 |
 * |---|---|
 * | `features/settings/copy.ts` (`groups` · `rows`) | 설정 목록 `C13-S6-1` (Spec §10.3) |
 * | `features/child-profile-edit/copy.ts` | 아이 정보 수정 `C13-S6-2` (Spec §10.4) |
 * | `features/survey-update/copy.ts` | 설문 재응답 `C13-S6-3` (Spec §10.3) |
 * | `features/child-profile-view/copy.ts` · `entities/child-profile/copy.ts` | 프로필 2모드 `C13-09` (Spec §10.1 · §9.2) |
 * | `features/growth-capability/copy.ts` | 발전 역량 2모드 `C13-10` · `C13-S6-4` (Spec §10.2) |
 * | Mock 페르소나 · 추천 `reason` fixture | 생성 문구는 API(Mock) 값만 표시한다 — Mock 예시도 같은 언어 규칙을 따른다 |
 *
 * 금칙어 두 벌:
 * - **Plan AC-6-42** = Stage 5 AC-5-44 목록 + `weak` · `lowest` · `below` (부분 문자열) — 위 원천 **전부**.
 * - **Spec §10.5** (더 엄격 — `rating` · `level` · `strong` · `low` · `high` · `fail` · `error` · `!` …) — Stage 6 이
 *   **새로 쓴** copy 모듈에만. 단어 경계로 본다(`Following` 의 `low` 같은 부분 일치는 금칙이 아니다).
 *
 * 범위 밖: `entities/survey` `surveyCardCopy` 는 Stage 2 문구를 **이동만** 했다(R-5) — Stage 2 `copy-language.test.ts`
 * 가 계속 본다 (`notScoredCaption` 의 *scored* 는 Stage 2 승인 문구). 설정 `logOut` 묶음도 Stage 2 문구다.
 * 문구가 copy 모듈 밖(컴포넌트 JSX 리터럴)에 없다는 점은 `S6-F` grep 으로 확인했다 (`docs/qa/stage-6-handoff.md` H6-7).
 */
import { describe, expect, it } from 'vitest';

import { childProfileCopy } from '../src/entities/child-profile';
import { childInfoEditCopy } from '../src/features/child-profile-edit';
import { childProfileViewCopy } from '../src/features/child-profile-view';
import { growthCapabilityCopy } from '../src/features/growth-capability';
import { settingsCopy } from '../src/features/settings/copy';
import { surveyUpdateCopy } from '../src/features/survey-update';
import { STAGE6_DECK_REASONS } from '../src/mocks/fixtures/activity-cards';
import { MOCK_CHANGED_PERSONA_COPY } from '../src/mocks/fixtures/child-profile';
import {
  MOCK_FALLBACK_PERSONA_COPY,
  MOCK_PERSONA_COPY,
} from '../src/mocks/fixtures/profile-result';
import { capabilityCopy } from '../src/shared/copy/capability-copy';

/** Plan AC-6-42 — Stage 5 AC-5-44 + `weak` · `lowest` · `below`. */
const PLAN_FORBIDDEN = [
  'diagnos',
  'delay',
  'behind',
  'normal',
  'score',
  'worse',
  'better than',
  'peers',
  'weak',
  'lowest',
  'below',
] as const;

/** Spec §10.5 — Stage 6 새 copy 모듈 (단어 경계). `measure` 는 부정문 1회 허용(Spec 원문). */
const SPEC_FORBIDDEN =
  /diagnos|\bscor|\brating|\blevel|\bgrade|\bassess|\bweak|\bstrong|\blow(est)?\b|\bhigh|\bbelow\b|\bbehind\b|\baverage|\bnormal|\bbetter\b|\bworse|\bpeers?\b|\bfail|\binvalid|\berror|!/i;

/** 이모지 — Spec §10.5 "이모지 0". */
const EMOJI = /\p{Extended_Pictographic}/u;

const SLOT_NAME = 'Nova';
const SLOT_DATE = 'Nov 14';

/** copy 객체를 문자열로 펼친다 — 템플릿 함수는 슬롯 값(이름 · 날짜 · 목록)을 넣어 펼친다. */
function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (typeof value === 'function') {
    const template = value as (slot: string) => unknown;
    return strings(template(SLOT_NAME)).concat(strings(template(SLOT_DATE)));
  }
  if (typeof value === 'object' && value !== null) return Object.values(value).flatMap(strings);
  return [];
}

/** Stage 6 가 새로 쓴 copy 모듈 — 두 금칙어 목록 모두. */
const NEW_COPY: readonly { name: string; texts: readonly string[] }[] = [
  {
    name: 'settingsCopy (groups · rows)',
    texts: strings({ groups: settingsCopy.groups, rows: settingsCopy.rows }),
  },
  { name: 'childInfoEditCopy', texts: strings(childInfoEditCopy) },
  { name: 'surveyUpdateCopy', texts: strings(surveyUpdateCopy) },
  { name: 'childProfileViewCopy', texts: strings(childProfileViewCopy) },
  { name: 'childProfileCopy (entities)', texts: strings(childProfileCopy) },
  { name: 'growthCapabilityCopy', texts: strings(growthCapabilityCopy) },
];

/** 화면에 그대로 표시되는 Mock 응답 값 · 재사용 라벨 — Plan 목록. */
const SHOWN_VALUES: readonly { name: string; texts: readonly string[] }[] = [
  {
    name: 'Mock 페르소나 (기본 · fallback · 변경)',
    texts: strings([MOCK_PERSONA_COPY, MOCK_FALLBACK_PERSONA_COPY, MOCK_CHANGED_PERSONA_COPY]),
  },
  { name: 'Mock 추천 reason (warm 3 · 하향 1)', texts: STAGE6_DECK_REASONS },
  { name: '4역량 표시 라벨 (Stage 0 #14)', texts: strings(capabilityCopy) },
];

function planHits(texts: readonly string[]): string[] {
  return texts.flatMap((text) =>
    PLAN_FORBIDDEN.filter((word) => text.toLowerCase().includes(word)).map(
      (word) => `${word} ← ${text}`,
    ),
  );
}

describe('Stage 6 copy — 진단·판정·비교 표현 0 (AC-6-42 · Plan 목록)', () => {
  for (const source of [...NEW_COPY, ...SHOWN_VALUES]) {
    it(`${source.name}: 금칙어 0`, () => {
      expect(source.texts.length).toBeGreaterThan(0);
      expect(planHits(source.texts)).toStrictEqual([]);
    });
  }
});

describe('Stage 6 새 copy 모듈 — Spec §10.5 목록 · 이모지 0', () => {
  for (const source of NEW_COPY) {
    it(`${source.name}: 금칙어 · 이모지 0`, () => {
      const hits = source.texts.filter((text) => SPEC_FORBIDDEN.test(text) || EMOJI.test(text));
      expect(hits).toStrictEqual([]);
    });
  }

  it('`measure` 는 프로필 "판정 아님" 안내의 부정문 1회뿐 (Spec §10.5 원문)', () => {
    const all = NEW_COPY.flatMap((source) => source.texts);
    const measures = all.filter((text) => /measure/i.test(text));
    expect(measures.length).toBeGreaterThan(0);
    for (const text of measures) expect(text).toMatch(/isn't a measure of/);
  });

  it('비교 표현 0 — 아이를 다른 아이 · 기준과 견주는 말이 없다 (AC-6-33)', () => {
    const all = [...NEW_COPY, ...SHOWN_VALUES].flatMap((source) => source.texts);
    const comparative = all.filter((text) =>
      /\b(than|compared|percentile|ahead|typical|most kids|other children)\b/i.test(text),
    );
    expect(comparative).toStrictEqual([]);
  });

  it('copy 에 아이 이름 상수 0 — 이름은 템플릿 슬롯으로만 들어간다', () => {
    const all = NEW_COPY.flatMap((source) => source.texts);
    expect(all.filter((text) => /\bEmma\b/.test(text))).toStrictEqual([]);
  });
});
