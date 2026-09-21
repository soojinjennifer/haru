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
 * **왜 여기에는 PII 가 들어올 수 없는가**
 *  1. 메시지는 호출자가 문자열을 넘기지 못하고 아래 `DEV_WARN_MESSAGE` 의 **고정
 *     문구**에서만 고른다 (`DevWarnIssue` 리터럴 유니온). 자유 입력 문구가 출력
 *     경로에 닿을 수 없다.
 *  2. 유일한 런타임 값 `subject` 는 `sanitizeToken` 이 `[A-Za-z0-9:_-]` 밖의 문자를
 *     `_` 로 바꾸고 64자로 자른다. 공백·문장·경로가 원형으로 남지 않는다.
 *  3. `packages/ui` 는 도메인 지식이 없다(`no-ui-to-contracts`). 호출자가 넘길 수
 *     있는 값은 컴포넌트 이름 · prop 이름 · 아이콘 이름 같은 개발자 식별자뿐이다.
 */

/** 출력 가능한 경고 종류. 새 경고는 여기에 문구를 추가해야만 쓸 수 있다. */
export type DevWarnIssue = 'missing-accessible-name';

const DEV_WARN_MESSAGE: Readonly<Record<DevWarnIssue, string>> = {
  'missing-accessible-name': 'needs either a `label` or `decorative` (Design Spec §4.2).',
};

/** 개발자 식별자만 남긴다 — 자유 입력·PII 형태의 문자열을 무력화한다. */
function sanitizeToken(value: string): string {
  const safe = value.replace(/[^\w:.-]/g, '_').slice(0, 64);
  return safe.length > 0 ? safe : 'unknown';
}

/**
 * 타입 단계에서 이미 막히는 조합을 JS 소비자에게 런타임에서도 알린다.
 * 정상적으로 타입을 지킨 코드에서는 호출되지 않는다.
 */
export function devWarn(component: string, issue: DevWarnIssue, subject?: string): void {
  const target = subject === undefined ? '' : ` "${sanitizeToken(subject)}"`;

  console.warn(`[haru/ui] ${sanitizeToken(component)}${target} ${DEV_WARN_MESSAGE[issue]}`);
}
