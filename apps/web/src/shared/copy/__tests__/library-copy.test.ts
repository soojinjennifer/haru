/**
 * `library-copy` — Figma 문구 조립 규칙 (Library Design Spec §6.4).
 *
 * 날짜 형식은 **`Intl` 결과에 의존**하므로 리터럴을 단정하지 않는다 — 테스트가 실행 환경의
 * 타임존·ICU 판에 묶이면 CI 와 로컬이 갈린다. 대신 **구조**(조각이 있나/없나, 구분자, 생략
 * 규칙)를 고정한다. 그게 이 모듈이 실제로 책임지는 것이다.
 */
import { describe, expect, it } from 'vitest';

import { GiftRequestStatusSchema } from '@haru/contracts';

import {
  finishedMeta,
  giftRequestStatusCopy,
  lastReadMeta,
  libraryCopy,
  librarySectionEmpty,
  librarySectionTitle,
  nightsMeta,
  ratingText,
  requestedMeta,
} from '../library-copy';

/** 2026-03-03T12:00:00Z — 정오라 대부분의 타임존에서 같은 날짜가 된다. */
const NOON = '2026-03-03T12:00:00.000Z';

describe('섹션 제목 — Figma 문구 그대로', () => {
  it('Figma 의 4개 제목을 쓴다', () => {
    expect(libraryCopy.sectionTitles).toStrictEqual({
      readingNow: 'Reading now',
      curated: 'Our curated shelf',
      favorites: 'Favorites',
      finished: 'Finished together',
    });
  });

  it('`My Saved` · `Books you own` 을 **쓰지 않는다** (`L-D1` · approvals §14.1)', () => {
    const everything = JSON.stringify(libraryCopy) + JSON.stringify(librarySectionEmpty);
    expect(everything).not.toContain('My Saved');
    expect(everything).not.toContain('Books you own');
  });

  it('섹션 key 3개 전부에 제목과 0건 안내가 있다', () => {
    expect(Object.keys(librarySectionTitle).sort()).toStrictEqual([
      'curated',
      'favorites',
      'finished',
    ]);
    expect(Object.keys(librarySectionEmpty).sort()).toStrictEqual([
      'curated',
      'favorites',
      'finished',
    ]);
  });

  it('`Favorites` 0건 문구는 **다음에 할 일**을 알려준다 (결핍·판정 언어를 쓰지 않는다)', () => {
    const { title, description } = librarySectionEmpty.favorites;
    expect(description).toContain('Save');
    for (const banned of ['should', 'need to', 'failed', 'behind', 'only', 'less than']) {
      expect(`${title} ${description}`.toLowerCase()).not.toContain(banned);
    }
  });
});

describe('`nightsMeta` — `{a} of {b} nights` (`L-OPEN-17`)', () => {
  it('회차가 있으면 Figma 문구를 만든다', () => {
    expect(nightsMeta(3, 5)).toBe('3 of 5 nights');
  });

  it('`plannedNights === null` 이면 **문구를 만들지 않는다**', () => {
    expect(nightsMeta(3, null)).toBeUndefined();
  });
});

describe('`lastReadMeta` — `Last read {day} · {min} min`', () => {
  it('두 조각이 ` · ` 로 이어진다', () => {
    const value = lastReadMeta(NOON, 12);
    expect(value).toMatch(/^Last read \w+ · 12 min$/);
  });

  it('분이 없으면 **그 조각만** 생략한다', () => {
    expect(lastReadMeta(NOON, null)).toMatch(/^Last read \w+$/);
  });

  it('날짜가 없으면 분만 남는다', () => {
    expect(lastReadMeta(null, 12)).toBe('12 min');
  });

  it('둘 다 없으면 문구를 만들지 않는다', () => {
    expect(lastReadMeta(null, null)).toBeUndefined();
  });
});

describe('`finishedMeta` — `{n} sessions · finished {date}`', () => {
  it('세션 수와 날짜를 이어 붙인다', () => {
    expect(finishedMeta(4, NOON)).toMatch(/^4 sessions · finished .+$/);
  });

  it('1회는 단수다', () => {
    expect(finishedMeta(1, null)).toBe('1 session');
  });

  it('날짜가 없으면 세션 수만 남는다', () => {
    expect(finishedMeta(3, null)).toBe('3 sessions');
  });
});

describe('`ratingText` — 서버 값 표시 (가공하지 않는다)', () => {
  it('소수는 한 자리로 보인다', () => {
    expect(ratingText(4.5)).toBe('4.5');
  });

  it('정수는 소수점을 붙이지 않는다', () => {
    expect(ratingText(5)).toBe('5');
  });

  it('등급·우열 문구를 더하지 않는다 — 접두는 Figma 의 `Rated ` 뿐이다', () => {
    expect(libraryCopy.ratedPrefix).toBe('Rated ');
  });
});

describe('`requestedMeta` — `Requested {date}` (§7.3)', () => {
  it('날짜 조각을 이어 붙인다', () => {
    expect(requestedMeta(NOON)).toMatch(/^Requested .+$/);
  });
});

describe('`giftRequestStatusCopy` — contract 6종 (FR-22, §7.3)', () => {
  it('enum 6종을 **빠짐없이** 덮는다 (값이 늘면 컴파일·이 테스트가 잡는다)', () => {
    expect(Object.keys(giftRequestStatusCopy).sort()).toStrictEqual(
      [...GiftRequestStatusSchema.options].sort(),
    );
  });

  it('`rejected` 는 아이·보호자에 대한 판정 표현을 쓰지 않는다', () => {
    expect(giftRequestStatusCopy.rejected).toBe('Not approved');
    /* 진단·판정 어휘 금지 (`rules/frontend.md` §8). */
    for (const label of Object.values(giftRequestStatusCopy)) {
      expect(label).not.toMatch(/fail|bad|poor|behind|worse|better/i);
    }
  });
});

describe('2라운드-2 문구 — 진단·판정·비교 표현이 없다', () => {
  const sentences = [
    ...Object.values(libraryCopy.shelfSheet),
    ...Object.values(libraryCopy.entryActions),
    libraryCopy.bookSheet.promptsUnavailable,
    libraryCopy.bookSheet.requestBook,
    libraryCopy.add.noResultsTitle,
    libraryCopy.add.noResultsDescription,
    libraryCopy.add.duplicateTitle,
    libraryCopy.add.duplicateDescription,
    libraryCopy.giftRequests.noticeTitle,
    libraryCopy.giftRequests.noticeDescription,
    libraryCopy.giftRequests.emptyTitle,
    libraryCopy.giftRequests.emptyDescription,
  ];

  it('모두 영어 문구이며 비어 있지 않다', () => {
    for (const sentence of sentences) {
      expect(typeof sentence).toBe('string');
      expect(sentence.length).toBeGreaterThan(0);
      // 한글이 섞이면 사용자 노출 언어 규칙 위반이다 (영어 1차).
      expect(sentence).not.toMatch(/[\u3131-\uD79D]/);
    }
  });

  it('판정·비교·개발 단계 노출 어휘가 없다', () => {
    for (const sentence of sentences) {
      expect(sentence).not.toMatch(/coming soon|not yet available|score|rank|compare/i);
    }
  });

  it('`D-15` 접수 안내에 수치·기한이 없다 (운영 확정 전 약속 금지, approvals §8.2)', () => {
    const notice = `${libraryCopy.giftRequests.noticeTitle} ${libraryCopy.giftRequests.noticeDescription}`;
    expect(notice).not.toMatch(/\d/);
    expect(notice).not.toMatch(/day|week|business/i);
  });
});
