/**
 * `PermissionService` — 마이크 권한 확인·요청 (PRD §13 마이크 권한 거부, AC-4-63 의 판정 부분).
 *
 * 플랫폼 차이는 `RecorderAdapter` 가 흡수한다. 이 서비스는 **언제 묻는가**만 정한다:
 * - 이미 허용 → 묻지 않는다.
 * - 이미 거부 → 다시 묻지 않는다 (브라우저는 재요청 프롬프트를 띄우지 않는다) — 안내·설정 딥링크·
 *   "대화만 하기" 는 화면(`S4-F`, `C13-5`)이 담당한다.
 * - 아직 모름(`prompt`) → 요청한다.
 */
import type {
  MicPermissionResult,
  MicPermissionState,
  RecorderAdapter,
} from '../../../shared/platform/recorder';

export interface PermissionService {
  /** 현재 상태 — 프롬프트를 띄우지 않는다. */
  check(): Promise<MicPermissionState>;
  /** 녹음 직전에 부른다. 필요할 때만 프롬프트를 띄운다. */
  ensure(): Promise<MicPermissionResult>;
}

export function createPermissionService(
  adapter: Pick<RecorderAdapter, 'checkPermission' | 'requestPermission'>,
): PermissionService {
  return {
    check: () => adapter.checkPermission(),
    async ensure() {
      const state = await adapter.checkPermission();
      if (state === 'prompt') return adapter.requestPermission();
      return state;
    },
  };
}
