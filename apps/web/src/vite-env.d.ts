/// <reference types="vite/client" />

/**
 * `.env.example` 에 정의된 값만 선언한다. Secret 은 `VITE_*` 로 노출하지 않는다
 * (`.claude/rules/architecture.md` §9).
 *
 * `VITE_API_MODE` 는 Adapter 선택 지점(`app/providers/apiClients.ts`) 한 곳에서만 읽는다.
 * `VITE_API_BASE_URL` · `VITE_MOCK_SCENARIO` 는 `shared/lib/env.ts` 가 읽는다.
 */
interface ImportMetaEnv {
  readonly VITE_API_MODE?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_MOCK_SCENARIO?: string;
}
