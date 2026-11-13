/**
 * `features/session-feedback` 사용자 노출 문구 — 영어 1차 (`rules/frontend.md` §8). Stage 5 `S5-C` 피드백 · 분석 상태
 * 화면 (Figma 없음 — `C13-S5-1` design-agent 명세, Spec §2.3). 문구는 Spec §2.3 초안 → `D5-4` 승인
 * (`N5-24` *"문구 Spec 초안대로"*).
 *
 * | 키 | 근거 |
 * |---|---|
 * | `title` | Spec §2.3 h1 *"Storytime notes"* |
 * | `close` | Spec §2.3 close bar *"Close"* |
 * | `loading` | Spec §2.3 Loading — Spinner 접근성 이름 *"Loading"* |
 * | `pending` · `lowQuality` · `failed` · `noRecording` | Spec §2.3 표 |
 * | `goHome` | Spec §2.3 `RESOURCE_NOT_FOUND` / `FORBIDDEN` action *"Go home"* |
 *
 * 그 밖의 문구는 기존 `shared/copy/error-copy` 를 그대로 쓴다 — `ANALYSIS_NOT_AVAILABLE`(대화 전용) ·
 * `networkErrorCopy`(offline) · `errorCopyForCode`(error · not-found) · `retryLabel`(*"Try again"*).
 *
 * ⛔ 짧은 피드백 문구는 여기에 없다 — API(Mock) 응답 `shortFeedback.text` 만 표시한다 (AC-5-37).
 * 진단·판정·비교 표현 0 (AC-5-44 — `__tests__/copy.test.ts` 금칙어 검사). 수치·기한 약속 0 (AC-5-36).
 */
import { ERROR_COPY, type ErrorMessage } from '../../shared/copy/error-copy';

export const sessionFeedbackCopy = {
  title: 'Storytime notes',
  close: 'Close',
  loading: 'Loading',
  goHome: 'Go home',
  pending: {
    title: "We're preparing today's notes",
    description: "They're usually ready by tomorrow. You can close this screen.",
  },
  lowQuality: {
    title: 'It was a little hard to hear this time',
    description: 'Your storytime is saved. A quieter spot next time helps HARU listen.',
  },
  failed: {
    title: 'This one is taking a little longer',
    description: "No need to do anything — we'll keep working on it.",
  },
  /** 녹음 없음 (`recording-deleted`, `N5-12` ⓐ) — 제목은 `ANALYSIS_NOT_AVAILABLE` 재사용, 설명만 사유. */
  noRecording: {
    title: ERROR_COPY.ANALYSIS_NOT_AVAILABLE.title,
    description: "The recording for this storytime isn't available, so there are no notes.",
  },
} as const satisfies {
  title: string;
  close: string;
  loading: string;
  goHome: string;
  pending: ErrorMessage;
  lowQuality: ErrorMessage;
  failed: ErrorMessage;
  noRecording: ErrorMessage;
};
