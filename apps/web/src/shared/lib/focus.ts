/**
 * 포커스 이동 도우미 — 닫혀 사라지는 요소의 포커스가 문서 처음(`BODY`)으로 떨어지지 않게 한다 (WCAG 2.4.3).
 *
 * 쓰는 곳: Home 7일 보관 배너 `Dismiss` (`D4-134` · `VG-H3-04`).
 */

const TABBABLE = [
  'a[href]',
  'button',
  'input',
  'select',
  'textarea',
  'summary',
  '[tabindex]',
  '[contenteditable="true"]',
].join(',');

function isTabbable(element: HTMLElement): boolean {
  if (element.tabIndex < 0) return false;
  if (element.matches(':disabled')) return false;
  if (element.closest('[hidden], [inert], [aria-hidden="true"]') !== null) return false;
  return true;
}

/**
 * 문서 순서에서 `container` **뒤에** 오는 첫 Tab 대상 — `container` 안의 요소는 건너뛴다.
 * 양수 `tabindex` 는 이 앱에서 쓰지 않으므로 문서 순서 = Tab 순서로 본다.
 */
export function nextTabbableAfter(container: Element): HTMLElement | null {
  const candidates = container.ownerDocument.querySelectorAll<HTMLElement>(TABBABLE);
  for (const candidate of candidates) {
    if (container.contains(candidate)) continue;
    if (!(container.compareDocumentPosition(candidate) & Node.DOCUMENT_POSITION_FOLLOWING)) {
      continue;
    }
    if (isTabbable(candidate)) return candidate;
  }
  return null;
}
