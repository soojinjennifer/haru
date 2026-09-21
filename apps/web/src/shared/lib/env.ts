/**
 * 타입이 붙은 실행 환경 접근점.
 *
 * `import.meta.env` 를 읽는 곳을 이 파일로 모은다.
 *
 * **Adapter 모드(`VITE_API_MODE`)는 여기에서 읽지 않는다.** 그 값은 저장소에서 단 한 곳,
 * `app/providers/apiClients.ts` 가 인라인 비교로만 쓴다 (Adapter 선택 지점 1곳 — AC-1-12,
 * 그리고 `http` 빌드의 Mock 제거를 Vite 가 보장하게 하려면 인라인이어야 한다 — AC-1-42).
 */
export interface AppEnv {
  /** Vite dev 서버 또는 `mode=development` 빌드 */
  readonly dev: boolean;
  readonly prod: boolean;
  /** Vite mode 이름 (`development` · `production` · 커스텀) */
  readonly mode: string;
  /** Http Adapter 의 base URL (`https:` 전용). `mock` 모드에서는 쓰이지 않는다. */
  readonly apiBaseUrl: string;
  /** Mock scenario 빌드 기본값 (우선순위: URL query > dev panel > 이 값 > `success`) */
  readonly mockScenario: string;
}

export const env: AppEnv = {
  dev: import.meta.env.DEV,
  prod: import.meta.env.PROD,
  mode: import.meta.env.MODE,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
  mockScenario: import.meta.env.VITE_MOCK_SCENARIO ?? '',
};

/** dev 전용 기능(UI gallery · scenario panel — Stage 1-G)의 노출 조건. */
export function isDevOnlyFeatureEnabled(current: AppEnv = env): boolean {
  return current.dev;
}
