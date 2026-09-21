/**
 * 터치 타깃 실측 — AC-1-21 (시각 크기와 무관하게 hit area ≥ 44×44).
 *
 * `getBoundingClientRect()` 만 보면 `::before { inset: -3px }` 로 확장한 IconButton 을
 * 38×38 로 잘못 판정한다. 그래서 요소 중심에서 바깥으로 1px 씩 짚어 가며
 * `elementFromPoint` 가 **여전히 그 요소를 돌려주는 범위**(= 실제로 눌리는 범위)를 잰다.
 *
 * 옆 요소가 위에 덮고 있으면 그 지점은 "닿지 않음" 으로 센다 — 눌러도 다른 요소가 눌리기 때문이다.
 */
export const TOUCH_TARGET_MIN = 44;

export interface HitAreaResult {
  readonly label: string;
  readonly tag: string;
  /** 눈에 보이는 크기 (border box). */
  readonly width: number;
  readonly height: number;
  /** 실제로 이 요소가 눌리는 범위 (`::before` 확장 포함, 이웃에 가려진 부분 제외). */
  readonly hitWidth: number;
  readonly hitHeight: number;
  readonly reaches: boolean;
}

function accessibleLabel(element: Element): string {
  const aria = element.getAttribute('aria-label');
  if (aria !== null && aria.length > 0) return aria;

  const text = element.textContent?.trim() ?? '';
  return text.length > 0 ? text.slice(0, 40) : element.tagName.toLowerCase();
}

/**
 * 실제로 **눌리는 단위**를 고른다.
 *
 * 폼 컨트롤의 조작 단위는 input 자체가 아니라 라벨이 연결된 행이다 (Design Spec §9.3 —
 * "Checkbox: 라벨 포함 행 전체가 클릭 영역"). input 만 재면 시각적으로 숨긴 컨트롤이
 * 실제보다 작게 나온다.
 */
function resolveTarget(element: Element): Element {
  if (element.tagName.toLowerCase() !== 'input') return element;

  const wrapping = element.closest('label');
  if (wrapping !== null) return wrapping;

  const id = element.getAttribute('id');
  const label =
    id === null ? null : element.ownerDocument.querySelector(`label[for="${CSS.escape(id)}"]`);
  if (label === null) return element;

  // 라벨과 컨트롤을 함께 담는 가장 가까운 조상 = 조작 행.
  let node: Element | null = element.parentElement;
  while (node !== null && !node.contains(label)) node = node.parentElement;

  return node ?? element;
}

/**
 * 그 지점을 누르면 이 요소가 눌리는가.
 *
 * 조상 요소(`hit.contains(element)`)는 **성공으로 치지 않는다.** 그렇게 하면 요소 밖의
 * 빈 여백까지 hit area 로 세어 검사가 항상 통과한다.
 */
export function hitsElement(element: Element, x: number, y: number): boolean {
  const hit = element.ownerDocument.elementFromPoint(x, y);
  return hit !== null && (hit === element || element.contains(hit));
}

/** 중심에서 한 방향으로 몇 px 까지 이 요소가 눌리는지. */
function reach(element: Element, x: number, y: number, dx: number, dy: number): number {
  const limit = Math.ceil(TOUCH_TARGET_MIN / 2);
  let steps = 0;

  for (let distance = 1; distance <= limit; distance += 1) {
    if (!hitsElement(element, x + dx * distance, y + dy * distance)) break;
    steps = distance;
  }

  return steps;
}

export function measureHitArea(candidate: Element): HitAreaResult {
  const element = resolveTarget(candidate);

  // `elementFromPoint` 는 **viewport 좌표**로 동작한다. 화면 밖 요소는 측정할 수 없으므로
  // 측정 대상을 화면 가운데로 끌어온다 (호출자가 원래 스크롤 위치를 복원한다).
  element.scrollIntoView({ block: 'center', inline: 'center' });

  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const hitWidth = hitsElement(element, centerX, centerY)
    ? reach(element, centerX, centerY, -1, 0) + reach(element, centerX, centerY, 1, 0) + 1
    : 0;
  const hitHeight = hitsElement(element, centerX, centerY)
    ? reach(element, centerX, centerY, 0, -1) + reach(element, centerX, centerY, 0, 1) + 1
    : 0;

  return {
    label: accessibleLabel(element),
    tag: element.tagName.toLowerCase(),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
    hitWidth,
    hitHeight,
    reaches: hitWidth >= TOUCH_TARGET_MIN && hitHeight >= TOUCH_TARGET_MIN,
  };
}

/**
 * `*[tabindex]` 의 `*` 는 없어도 되는 universal selector 다.
 * 다만 `[tabindex]:` 로 시작하면 lint 의 Tailwind arbitrary variant 패턴에 걸리므로 남겨 둔다.
 */
export const INTERACTIVE_SELECTOR = [
  'button',
  'a[href]',
  'input:not([type="hidden"])',
  'select',
  'textarea',
  '*[tabindex]:not([tabindex="-1"])',
].join(', ');

export function measureInteractive(root: ParentNode): HitAreaResult[] {
  const scrollX = globalThis.scrollX;
  const scrollY = globalThis.scrollY;

  const results = Array.from(root.querySelectorAll(INTERACTIVE_SELECTOR))
    .filter((element) => element.getBoundingClientRect().width > 0)
    .map(measureHitArea);

  // 측정 때문에 화면이 움직인 것을 되돌린다 (시각 baseline 이 흔들리지 않게).
  globalThis.scrollTo(scrollX, scrollY);

  return results;
}
