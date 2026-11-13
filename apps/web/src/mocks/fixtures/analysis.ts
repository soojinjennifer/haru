/**
 * 분석 상태 · 짧은 피드백 fixture — Stage 5 Plan §8 그룹 `analysis` · `docs/API_CONTRACTS.md` §3.11.
 *
 * 규칙
 *  - `shortFeedback.text` 는 **서버 검수 템플릿이 만든 완성문**을 흉내낸 예시다 (`P5-BIP-09`).
 *    화면은 그대로 그린다 — Frontend 조립·보간·대체 문구 0 (AC-5-37).
 *  - 영어 · 아이 이름 없음 · 진단·판정·비교 표현 0 · 실제 아동 데이터 0.
 *  - 전사·발화 원문·지표 수치는 담지 않는다 (contract 에 필드가 없다 — `N5-11`).
 */
import { ShortFeedbackSchema, type ShortFeedback } from '@haru/contracts';

/** `analysis-completed` · Mock worker 완료 · 지난 세션 seed (Plan §8 예시 문구). */
export const MOCK_SHORT_FEEDBACK: ShortFeedback = ShortFeedbackSchema.parse({
  text: 'Today brought lots of feeling words, and a new one — proud.',
  templateId: 'mock-short-feedback',
});

/**
 * `analysis-low-quality` — 서버가 정량 분석에서 뺀 세션에도 남기는 중립 문구 (§13 "세션 기록·피드백 보존").
 * 조용한 곳 안내는 **화면 copy** 가 한다 (Stage 5 `S5-C`) — 이 값은 녹음 품질을 말하지 않는다.
 */
export const MOCK_SHORT_FEEDBACK_LOW_QUALITY: ShortFeedback = ShortFeedbackSchema.parse({
  text: 'Thanks for reading together today.',
  templateId: 'mock-short-feedback-low-quality',
});

/** `analysis-feedback-missing` — 생성 실패 + fallback 없음 → 텍스트 줄 미렌더 (AC-5-37). */
export const MOCK_SHORT_FEEDBACK_MISSING: ShortFeedback = ShortFeedbackSchema.parse({
  text: null,
  templateId: 'mock-short-feedback-missing',
});

/**
 * Mock worker 가 `analyzing` 세션을 `analyzed` 로 옮기기 전까지 `analyzing` 을 돌려주는 조회 횟수.
 * 1·2번째 조회 = `analyzing`, 3번째 조회 = `analyzed` (결정적 — AC-5-14 · AC-5-35).
 */
export const MOCK_ANALYSIS_PENDING_READS = 2;

/** `recording-deleted` 에서 녹음 레코드가 없던 세션에 쓰는 녹음 id (고정 uuid). */
export const MOCK_DELETED_RECORDING_ID = '88888888-8888-4888-8888-0000000000de';
