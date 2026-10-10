/**
 * 픽셀 프로브 공통 도우미 — PNG 디코드 + WCAG 대비 계산.
 *
 * 시각 baseline(PNG 비교)으로는 잴 수 없는 것을 **수치로** 재기 위한 모듈이다.
 * baseline 은 "무엇이 달라졌다"만 알려주고 **얼마나 달라졌는지**는 알려주지 않는다.
 * 경계 단차(채널 차)·제목 대비(비율) 처럼 임계값이 명시된 요구는 여기서 직접 계산한다.
 *
 * 외부 의존성을 쓰지 않는다 — `node:zlib` 만으로 Playwright 스크린샷(8-bit, non-interlaced)
 * 을 푼다. `e2e/shadow.spec.ts` 가 같은 목적의 **1×1 전용** 디코더를 따로 들고 있는데, 영역
 * 단위로 재려면 스캔라인 필터를 풀어야 해서 이 모듈이 따로 있다.
 */
import { inflateSync } from 'node:zlib';

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

/** 디코드 결과 — `data` 는 항상 RGBA 4채널이다 (입력이 RGB 면 alpha 를 255 로 채운다). */
export interface Bitmap {
  width: number;
  height: number;
  data: Uint8Array;
}

/**
 * 8-bit non-interlaced PNG(colorType 2 = RGB · 6 = RGBA) 한 장을 RGBA 로 푼다.
 *
 * Playwright 의 `page.screenshot()` 산출물이 이 두 형식이다. 그 밖의 형식이 들어오면
 * **조용히 잘못된 값을 돌려주지 않고 던진다** — 프로브가 헛도는 것보다 실패가 낫다.
 */
export function decodePng(png: Buffer): Bitmap {
  let offset = 8; // PNG signature
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  let interlace = 0;
  const idat: Buffer[] = [];

  while (offset + 8 <= png.length) {
    const length = png.readUInt32BE(offset);
    const type = png.toString('ascii', offset + 4, offset + 8);
    const body = png.subarray(offset + 8, offset + 8 + length);

    if (type === 'IHDR') {
      width = body.readUInt32BE(0);
      height = body.readUInt32BE(4);
      bitDepth = body[8] ?? 0;
      colorType = body[9] ?? 0;
      interlace = body[12] ?? 0;
    } else if (type === 'IDAT') {
      idat.push(body);
    }

    offset += 12 + length;
  }

  if (bitDepth !== 8) throw new Error(`지원하지 않는 PNG bitDepth: ${bitDepth}`);
  if (interlace !== 0) throw new Error('interlaced PNG 은 지원하지 않는다');
  const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : 0;
  if (channels === 0) throw new Error(`지원하지 않는 PNG colorType: ${colorType}`);

  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const out = new Uint8Array(width * height * 4);
  let previous = new Uint8Array(stride);
  let cursor = 0;

  for (let y = 0; y < height; y += 1) {
    const filter = raw[cursor] ?? 0;
    cursor += 1;
    const current = new Uint8Array(stride);

    for (let i = 0; i < stride; i += 1) {
      const x = raw[cursor + i] ?? 0;
      const a = i >= channels ? (current[i - channels] ?? 0) : 0; // 왼쪽
      const b = previous[i] ?? 0; // 위
      const c = i >= channels ? (previous[i - channels] ?? 0) : 0; // 왼쪽 위

      let value: number;
      if (filter === 0) value = x;
      else if (filter === 1) value = x + a;
      else if (filter === 2) value = x + b;
      else if (filter === 3) value = x + ((a + b) >> 1);
      else if (filter === 4) {
        // Paeth
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        value = x + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
      } else throw new Error(`알 수 없는 PNG 스캔라인 필터: ${filter}`);

      current[i] = value & 0xff;
    }

    cursor += stride;

    for (let x = 0; x < width; x += 1) {
      const source = x * channels;
      const target = (y * width + x) * 4;
      out[target] = current[source] ?? 0;
      out[target + 1] = current[source + 1] ?? 0;
      out[target + 2] = current[source + 2] ?? 0;
      out[target + 3] = channels === 4 ? (current[source + 3] ?? 255) : 255;
    }

    previous = current;
  }

  return { width, height, data: out };
}

export function pixelAt(image: Bitmap, x: number, y: number): Rgb {
  const i = (y * image.width + x) * 4;
  return { r: image.data[i] ?? 0, g: image.data[i + 1] ?? 0, b: image.data[i + 2] ?? 0 };
}

/** 두 색의 **채널별 차이 중 최댓값**. 채널 합이 아니라 최댓값이라 1채널만 어긋난 경우도 잡는다. */
export function maxChannelDelta(a: Rgb, b: Rgb): number {
  return Math.max(Math.abs(a.r - b.r), Math.abs(a.g - b.g), Math.abs(a.b - b.b));
}

/** WCAG 2.x 상대 휘도. */
function relativeLuminance({ r, g, b }: Rgb): number {
  const channel = (value: number): number => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };

  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG 2.x 대비비 (1 … 21). */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** `getComputedStyle().color` 가 돌려주는 `rgb(r, g, b)` / `rgba(...)` 를 파싱한다. */
export function parseCssRgb(value: string): Rgb {
  const parts = value.match(/-?[\d.]+/g);
  if (parts === null || parts.length < 3) throw new Error(`색을 파싱하지 못했다: ${value}`);
  return {
    r: Number(parts[0]),
    g: Number(parts[1]),
    b: Number(parts[2]),
  };
}
