/**
 * `packages/ui` 개발자 경고 — Design Spec §4.2 ("런타임 경고 + 타입 에러").
 *
 * ┌ 불변 규칙 ───────────────────────────────────────────────────────────────┐
 * │ `packages/ui` 에서 `console` 에 직접 접근하는 곳은 **이 파일 하나** 뿐   │
 * │ 이다. 루트 `eslint.config.js` 가 이 경로만 `no-console` 예외로 두고,     │
 * │ 나머지 전부는 `no-console: error` 로 차단한다 (QA-1-001).                │
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * **왜 `apps/web` 의 PII 금지 logger 를 쓰지 않는가**
 * `packages/ui` 는 `apps/web` 을 import 할 수 없다 (`rules/architecture.md` §2
 * 의존 방향표 · dependency-cruiser `no-package-to-app`). logger 를 주입받게 하면
 * 도메인 없는 Shared UI 가 앱 인프라에 결합되므로, 같은 원칙(화이트리스트 기반
 * 살균)을 이 파일에서 독립적으로 구현한다.
 *
 * **PII 노출 면을 어디까지 줄였는가 (QA-1-004)**
 *  1. 메시지는 호출자가 문자열을 넘기지 못하고 아래 `DEV_WARN_MESSAGE` 의 **고정
 *     문구**에서만 고른다 (`DevWarnIssue` 리터럴 유니온). 자유 입력 문구가 출력
 *     경로에 닿을 수 없다.
 *  2. 유일한 런타임 값 `subject` 는 `sanitizeToken` 이 `[A-Za-z0-9_:.-]`(= `\w` + `:` `.`
 *     `-`) **밖의** 문자를 `_` 로 바꾸고 64자로 자른다. 공백·문장 부호가 사라지므로 문장이
 *     원형으로 남지 않는다.
 *  3. `packages/ui` 는 도메인 지식이 없다(`no-ui-to-contracts`). 호출자가 넘길 수
 *     있는 값은 컴포넌트 이름 · prop 이름 · 아이콘 이름 같은 개발자 식별자뿐이다.
 *  4. 그리고 **개발 빌드에서만 출력한다** (아래 `DEV` 게이트). Production 번들에서는
 *     `import.meta.env.DEV` 가 `false` 리터럴로 치환되어 호출 자체가 사라진다.
 *
 * ⚠ 살균은 **완전한 보장이 아니다.** 공백 없는 단일 토큰(예: 이메일 주소)은 `.`·`-`·`_` 가
 * 통과하므로 읽을 수 있는 형태로 남는다. 실제 안전장치는 ①·③ — "자유 입력 값이 애초에
 * 이 경로에 오지 않는다" 이며, 살균은 마지막 방어선이다. 새 `subject` 호출 지점을 추가할 때
 * 개발자 식별자만 넘기는지 확인해야 한다.
 */

/** 출력 가능한 경고 종류. 새 경고는 여기에 문구를 추가해야만 쓸 수 있다. */
export type DevWarnIssue = 'missing-accessible-name' | 'missing-external-hint';

const DEV_WARN_MESSAGE: Readonly<Record<DevWarnIssue, string>> = {
  'missing-accessible-name': 'needs either a `label` or `decorative` (Design Spec §4.2).',
  'missing-external-hint':
    'needs an `externalHint` so the new tab is announced (Stage 2 Design Spec §4.6).',
};

/** 개발자 식별자만 남긴다 — 자유 입력·PII 형태의 문자열을 무력화한다. */
function sanitizeToken(value: string): string {
  const safe = value.replace(/[^\w:.-]/g, '_').slice(0, 64);
  return safe.length > 0 ? safe : 'unknown';
}

/**
 * 타입 단계에서 이미 막히는 조합을 JS 소비자에게 런타임에서도 알린다.
 * 정상적으로 타입을 지킨 코드에서는 호출되지 않는다.
 *
 * **개발 빌드 전용이다** (QA-1-004): `apps/web` 의 `logger` 가 Production 에서 no-op 인 것과
 * 달리 이 함수에는 게이트가 없어 Production 번들에 남아 있었다.
 */
export function devWarn(component: string, issue: DevWarnIssue, subject?: string): void {
  // Vite 가 빌드 시 `import.meta.env.DEV` 를 `false` 리터럴로 치환하므로 Production 번들에서는
  // 이 아래가 통째로 제거된다 (`app/router.tsx` 의 dev 전용 route 와 같은 방식).
  if (!import.meta.env.DEV) return;

  const target = subject === undefined ? '' : ` "${sanitizeToken(subject)}"`;

  console.warn(`[haru/ui] ${sanitizeToken(component)}${target} ${DEV_WARN_MESSAGE[issue]}`);
}
