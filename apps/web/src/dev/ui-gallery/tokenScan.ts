/**
 * 적용된 스타일시트에서 `:root` custom property 를 **런타임에** 수집한다.
 *
 * gallery 가 토큰 목록을 손으로 적으면 `packages/design-tokens` 와 곧 어긋난다.
 * 실제 문서에 적용된 값을 읽으면 swatch 페이지가 항상 토큰 정의와 일치한다 (AC-1-24 V-8).
 *
 * - 이름: 스타일시트의 선언 순서 (결정적 — 시각 비교 baseline 이 흔들리지 않는다)
 * - 값  : `getComputedStyle(documentElement)` — `var()` 참조가 해석된 계산값
 */

export interface RootToken {
  readonly name: string;
  /** 선언된 그대로의 값 (`var(--haru-…)` 일 수 있다). */
  readonly declared: string;
  /** 계산된 값 (참조가 해석된 결과). */
  readonly computed: string;
}

function isRootSelector(selector: string): boolean {
  return selector.split(',').some((part) => {
    const trimmed = part.trim();
    return trimmed === ':root' || trimmed === ':host' || trimmed === ':root, :host';
  });
}

function collectFromRules(rules: CSSRuleList, out: Map<string, string>): void {
  for (const rule of Array.from(rules)) {
    if (rule instanceof CSSStyleRule) {
      if (!isRootSelector(rule.selectorText)) continue;

      for (const property of Array.from(rule.style)) {
        if (!property.startsWith('--')) continue;
        // 뒤에 오는 선언이 이긴다 — CSS cascade 와 같은 순서로 덮어쓴다.
        out.set(property, rule.style.getPropertyValue(property).trim());
      }
      continue;
    }

    // `@layer` · `@media` · `@supports` 같은 묶음 규칙 안에도 `:root` 선언이 있다
    // (Tailwind v4 는 `@theme` 을 `@layer theme { :root, :host { … } }` 로 컴파일한다).
    const nested: unknown = (rule as { cssRules?: CSSRuleList }).cssRules;
    if (nested instanceof CSSRuleList) collectFromRules(nested, out);
  }
}

export function collectRootTokens(doc: Document = document): RootToken[] {
  const declared = new Map<string, string>();

  for (const sheet of Array.from(doc.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      // 다른 출처의 스타일시트는 읽을 수 없다. HARU 는 self-host 만 쓰므로 정상 경로가 아니다.
      continue;
    }
    collectFromRules(rules, declared);
  }

  const rootStyle = doc.defaultView?.getComputedStyle(doc.documentElement);

  return Array.from(declared, ([name, value]) => ({
    name,
    declared: value,
    computed: rootStyle?.getPropertyValue(name).trim() ?? '',
  }));
}

/** `--color-fg-*` 처럼 접두어로 그룹을 고른다. 네임스페이스 초기화(`--x-*`)는 제외한다. */
export function tokensWithPrefix(tokens: readonly RootToken[], prefix: string): RootToken[] {
  return tokens.filter((token) => token.name.startsWith(prefix) && !token.name.endsWith('-*'));
}

/** 이름에 `--…--` 가 들어간 타이포 보조 축(`--text-body--line-height`)을 걸러낸다. */
export function withoutModifiers(tokens: readonly RootToken[]): RootToken[] {
  return tokens.filter((token) => !token.name.slice(2).includes('--'));
}
