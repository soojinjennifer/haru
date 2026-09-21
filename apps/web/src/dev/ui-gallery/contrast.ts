/**
 * 대비 측정 — Design Spec §9.4 (D-01 수용 예외 · 가값 P-01 · P-02 · P-11).
 *
 * 문서에 적힌 값을 다시 적지 않고 **실제 렌더된 색**을 읽어 계산한다.
 * 그래야 토큰 값이 바뀌면 gallery 수치도 같이 바뀌고, 가값 승인 자료(§12.3)가 코드와 어긋나지 않는다.
 *
 * 반투명 색은 지정한 배경 위에 합성해서 계산한다 (§9.4 계산 방법과 동일).
 * blur·그림자는 반영하지 않는다.
 */

interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

/** 브라우저가 돌려준 색 문자열에서 채널 값을 뽑는다 (색 함수 이름에 의존하지 않는다). */
function parseColor(value: string): Rgba | null {
  const numbers = value.match(/-?\d*\.?\d+/g);
  if (numbers === null || numbers.length < 3) return null;

  const [r, g, b, a] = numbers;
  if (r === undefined || g === undefined || b === undefined) return null;

  return {
    r: Number(r),
    g: Number(g),
    b: Number(b),
    a: a === undefined ? 1 : Number(a),
  };
}

function composite(front: Rgba, back: Rgba): Rgba {
  return {
    r: front.r * front.a + back.r * (1 - front.a),
    g: front.g * front.a + back.g * (1 - front.a),
    b: front.b * front.a + back.b * (1 - front.a),
    a: 1,
  };
}

function channelLuminance(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance({ r, g, b }: Rgba): number {
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}

export function contrastRatio(front: Rgba, back: Rgba): number {
  const a = relativeLuminance(front);
  const b = relativeLuminance(back);
  const [light, dark] = a >= b ? [a, b] : [b, a];
  return (light + 0.05) / (dark + 0.05);
}

/** `var(--token)` 을 실제 색 값으로 해석한다. 해석할 수 없으면 `null`. */
export function resolveTokenColor(token: string, doc: Document = document): Rgba | null {
  const probe = doc.createElement('span');
  probe.style.display = 'none';
  probe.style.color = `var(${token})`;
  doc.body.appendChild(probe);

  const computed = doc.defaultView?.getComputedStyle(probe).color ?? '';
  probe.remove();

  return parseColor(computed);
}

export interface ContrastPair {
  readonly id: string;
  readonly label: string;
  readonly foreground: string;
  readonly background: string;
  /** 반투명 배경을 합성할 바닥색. 기본은 앱 배경 시작색. */
  readonly base?: string;
  /** 판정 기준 — 본문 텍스트 4.5, 큰 텍스트·비텍스트 3.0 (WCAG AA). */
  readonly threshold: number;
  /** 가값 / 수용 예외 라벨 (Design Spec §9.4). */
  readonly marker: string;
}

export interface ContrastResult extends ContrastPair {
  readonly ratio: number | null;
}

export function measurePairs(
  pairs: readonly ContrastPair[],
  doc: Document = document,
): ContrastResult[] {
  return pairs.map((pair) => {
    const base = resolveTokenColor(pair.base ?? '--color-bg-app-start', doc);
    const background = resolveTokenColor(pair.background, doc);
    const foreground = resolveTokenColor(pair.foreground, doc);

    if (base === null || background === null || foreground === null) {
      return { ...pair, ratio: null };
    }

    const flatBackground = composite(background, base);
    const flatForeground = composite(foreground, flatBackground);

    return { ...pair, ratio: contrastRatio(flatForeground, flatBackground) };
  });
}
