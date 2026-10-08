/**
 * `LibraryBook` → 화면에 그릴 조각. 서재 화면·시트가 **같은 규칙**을 쓰도록 한 곳에 모은다.
 *
 * 문장을 만들지 않는다 — 서버 값을 고르고 이어 붙이기만 한다 (`rules/frontend.md` §8).
 * 조각이 없으면 **그 조각만 생략**한다 (placeholder·`—`·"없음" 류를 넣지 않는다).
 */
import type { Capability, LibraryBook } from '@haru/contracts';

import { capabilityCopy } from '../../shared/copy/capability-copy';

/**
 * 표시 제목. 카탈로그에 없는 책은 보호자가 입력한 제목을 쓴다 (`user-entered-book`).
 * `RenderableLibraryBookSchema` 가 "둘 중 하나는 있다" 를 보장하지만, 화면은 관대한
 * `LibraryBookSchema` 로 parse 하므로 빈 문자열 fallback 을 남겨 둔다.
 */
export function bookTitle(item: LibraryBook): string {
  return item.book?.title ?? item.userEnteredTitle ?? '';
}

export function bookAuthor(item: LibraryBook): string | undefined {
  return item.book?.author ?? item.userEnteredAuthor ?? undefined;
}

/** 4대 역량 **표시 라벨** (`#14`). 라벨 문구는 `capability-copy.ts` 가 소유한다. */
export function capabilityLabel(capability: Capability | null): string | undefined {
  return capability === null ? undefined : capabilityCopy[capability];
}

/**
 * 캐러셀 캡션 2행 — 역량 라벨이고, 역량이 없으면 **저자명**이다 (`L-OPEN-15`).
 */
export function bookCaption(item: LibraryBook): string | undefined {
  return item.capability === null ? bookAuthor(item) : capabilityLabel(item.capability);
}

/** `Ashley Spires · Self-Direction` `[실측 145:1148]`. 조각이 없으면 그 조각만 생략한다. */
export function bookSubtitle(item: LibraryBook): string | undefined {
  const parts = [bookAuthor(item), capabilityLabel(item.capability)].filter(
    (part): part is string => part !== undefined,
  );
  return parts.length === 0 ? undefined : parts.join(' · ');
}
