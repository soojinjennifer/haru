import { z } from 'zod';

import { BookSummarySchema } from '../books/search.js';
import { IsoDateTimeSchema } from '../common/datetime.js';
import { IdSchema } from '../common/id.js';
import { AnalysisOutcomeSchema } from '../enums/analysis-outcome.js';
import { CompletedReasonSchema } from '../enums/completed-reason.js';
import { ReadingContextSchema } from '../enums/reading-context.js';
import { SessionModeSchema } from '../enums/session-mode.js';
import { SessionStatusSchema } from '../enums/session-status.js';
import { StickerTypeSchema } from '../enums/sticker.js';
import { PromptSchema } from '../prompts/prompt.js';
import { RecordingStatusSchema } from '../recordings/status.js';
import { MAX_RECORDED_SECONDS } from '../rules/recording-limits.js';

/**
 * 세션 표시 모델 — `docs/API_CONTRACTS.md` §3.2 · §3.2.1, Stage 4 Plan §7.2.
 */

/**
 * 캐릭터 버블 문구 (검수 템플릿 결과, FR-10).
 *
 * - `SessionSummary.bubble` 은 ready 화면 버블(Figma `139:2803`)의 **제목 줄**에 그대로 표시된다
 *   (`D4-20`). 그 아래 pill 은 `prompts` 다 — 두 값은 섞이지 않는다.
 * - `null` 이거나 `text` 가 `null`/빈 문자열이면 제목 줄을 렌더하지 않는다 (`D4-22`).
 *   Frontend 는 대체 문구를 만들지 않는다 — fallback 은 Backend 책임이다.
 * - 길이 상한(≤240px @ SF Pro Semibold 16, ≈28자)은 **생성 측 요구**이며 schema 제약이 아니다
 *   (`D4-21`, `P4-BIP-11`). 넘치는 응답을 parse 에서 거부하면 화면이 비므로 `.max()` 를 두지 않는다.
 */
export const SessionBubbleCopySchema = z
  .object({
    text: z.string().nullable(),
    /** 검수 템플릿 추적용 (FR-10 · `P4-BIP-11`). 화면에 표시하지 않는다. */
    templateId: z.string().min(1).optional(),
    /**
     * 완료 버블(Figma `88:929`) 보조 줄 — `API_CONTRACTS.md` §3.2.3 (`D4-87`).
     *
     * - 공유 schema 라 ready · 리마인드 응답에 key 를 강제하지 않는다 — 생략 가능 (`D4-94`).
     *   `bubble` · `reminderBubble` 에 값이 있어도 화면은 그리지 않는다.
     * - `null` · 빈 문자열 · key 없음 = 줄을 렌더하지 않는다. `text` 가 없으면 이 값이 있어도 버블이 없다 (`D4-95`).
     * - 길이 상한(≤240px @ SF Pro Regular 13, ≈36자)은 생성 측 요구다 (`D4-98`, `P4B-BIP-02`) — `.max()` 없음.
     */
    subtext: z.string().nullable().optional(),
  })
  .nullable();

export type SessionBubbleCopy = z.infer<typeof SessionBubbleCopySchema>;

/**
 * 출석 스티커 지급 — `POST /v1/sessions/:sessionId/transitions` 응답의 `stickerAward`,
 * `SessionDetail.sticker` (PRD FR-19 · §7.6, `DATA_MODEL §8 sticker_awards`).
 *
 * - 표시 문구(`title` · `message`)는 **응답 값**이다. Frontend 는 만들지 않는다 (`D4-2`, `P4-BIP-18`).
 *   확정 부제 = `You read together today` (`D4-10`, 허용 차이 `AD-S4-1`).
 * - ⛔ 연속 일수·회차 필드를 두지 않는다 — streak 중립 (`D4-2`, `D-6`, PRD §7.4).
 * - 같은 세션의 재요청은 같은 지급을 돌려준다 (`sticker_awards.session_id UNIQUE`, FR-19 중복 표시 방지).
 *
 * 배치: Plan §7.2 표는 이 schema 를 `transition.ts` 에 두었으나, `SessionDetail.sticker` 도 쓰므로
 * 순환 import 를 피하려고 이 파일에 둔다. `index.ts` 가 함께 re-export 하므로 소비자 경로는 같다.
 */
export const StickerAwardSchema = z.object({
  id: IdSchema,
  sessionId: IdSchema,
  stickerType: StickerTypeSchema,
  awardedAt: IsoDateTimeSchema,
  /** 칩 제목 (Figma `29:84`). */
  title: z.string().min(1),
  /** 칩 부제 (Figma `29:85` 자리). */
  message: z.string().min(1),
});

export type StickerAward = z.infer<typeof StickerAwardSchema>;

export const SessionSummarySchema = z.object({
  id: IdSchema,
  status: SessionStatusSchema,
  mode: SessionModeSchema,
  book: BookSummarySchema.nullable(),
  /** 서재 경로는 `null` 일 수 있다 (`D4-25`). Activity Card 경로는 선택 시점에 필수다 (`D-9`). */
  readingContext: ReadingContextSchema.nullable(),
  readyAt: IsoDateTimeSchema,
  startedAt: IsoDateTimeSchema.nullable(),
  completedAt: IsoDateTimeSchema.nullable(),
  completedReason: CompletedReasonSchema.nullable(),
  /** 실제 녹음 시간 (일시정지 제외, #17-②). */
  recordedSeconds: z.int().min(0).max(MAX_RECORDED_SECONDS),
  analysisOutcome: AnalysisOutcomeSchema.nullable(),
  /** Prompt 모아보기(FR-11) + ready 버블 pill (`D4-14`·`D4-20`). */
  prompts: z.array(PromptSchema),
  bubble: SessionBubbleCopySchema,
  /**
   * ready 5분 리마인드(`D4-46`, 1회) 시 같은 ready 버블의 **제목 줄만** 이 문구로 바꾼다
   * (`D4-59`, `API_CONTRACTS.md` §3.2.2). 필수 + nullable — `null` 이거나 `text` 가
   * `null`/빈 문자열이면 리마인드 시각 변화가 없다. 길이 요구는 `bubble` 과 같다(`D4-21`).
   */
  reminderBubble: SessionBubbleCopySchema,
});

export type SessionSummary = z.infer<typeof SessionSummarySchema>;

/**
 * `GET /v1/sessions/:sessionId` 응답.
 *
 * - `recording` — 서버가 본 업로드 상태 (§3.9). 녹음이 없는 세션(대화 전용 등)은 `null`.
 * - `sticker` — 재진입 시 스티커 중복 표시 방지용 (FR-19, `C4-OPEN-6`). 미지급이면 `null`.
 * - `completionBubble` — 재진입 시 완료 버블 (`D4-88`, §3.2.3). 완료 계열(`completed` · `analyzing` ·
 *   `analyzed` · `failed`) = 전이 때 고른 값 그대로(또는 `null`), 그 밖의 상태 = `null`.
 *   key 는 필수다 — `sticker` 와 같다. 오프라인 제출은 전이 응답이 없어 이 필드로 해결되지 않는다.
 * - `reflection` 은 Stage 5 에서 추가한다 (`C4-OPEN-6`).
 */
export const SessionDetailSchema = SessionSummarySchema.extend({
  recording: RecordingStatusSchema.nullable(),
  sticker: StickerAwardSchema.nullable(),
  completionBubble: SessionBubbleCopySchema,
});

export type SessionDetail = z.infer<typeof SessionDetailSchema>;
