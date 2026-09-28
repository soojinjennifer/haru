/**
 * `packages/ui` 가 쓰는 build-time 환경 플래그 선언 — **`DEV` 하나뿐이다** (QA-1-004).
 *
 * `packages/ui` 는 도메인·앱 인프라를 모르지만, 개발자 경고(`lib/devWarn.ts`)는 Production
 * 번들에서 제거되어야 한다. 그 판정을 위해 Vite 가 치환하는 `import.meta.env.DEV` 만 선언한다.
 *
 * 형태를 `vite/client` 와 **같은 구조**(`ImportMeta.env: ImportMetaEnv`)로 맞춘 이유:
 * 이 선언이 `vite/client` 를 참조하는 프로그램(`apps/web`)과 한 번에 합쳐지더라도 interface
 * 병합이 충돌하지 않는다. `VITE_*` 변수는 여기에 선언하지 않는다 — 앱의 관심사다.
 */
interface ImportMetaEnv {
  readonly DEV: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
