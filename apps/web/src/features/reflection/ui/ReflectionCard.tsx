/**
 * 회고 카드 — Figma `29:62` 의 `91:691` Feedback Card (Stage 5 Spec §2.1 · §2.2 `C13-S5-2`, Plan `S5-B`, FR-12).
 *
 * ```
 * ReflectionCard → useSubmitReflection → reflectionApi.submit → MockReflectionApi | HttpReflectionApi
 * ```
 *
 * 상태 (Spec §2.2 — 카드 레이아웃은 모든 상태에서 같다. 새 시각 요소 0):
 * - S0 빈: 별 0 · 칩 미선택 · placeholder · `Save` 비활성(`aria-disabled` — 이유를 SR 이 읽는다, `N5-05` ⓐ)
 * - S1 입력 중: `Save` 활성
 * - S2 저장 중: 별·칩·입력 조작 불가(포커스 유지) · `Save` loading
 * - S3 실패 · S4 오프라인: 입력 보존(메모리) · Toast (`N5-31`) — 다시 누르면 재시도 (같은 body = 같은 key)
 * - S5 저장됨: Toast + 홈 replace (`N5-07` ⓐ)
 * - S6 재진입 읽기 전용: 제출값 표시 · `Save` 비활성 (`N5-08` ⓐ)
 *
 * 닫기 ✕ 는 완료 화면 소유다 — 요청 0 · 확인 없음 · 홈 replace (`N5-06` ⓐ · `N5-23`).
 *
 * Privacy (Plan §5.5, `N5-17`): 입력은 **컴포넌트 상태에만** 있다. 저장소·로그에 쓰지 않는다.
 * `overflow: clip` 근거는 `reflection.css`.
 */
import { Button, Chip, StarRating, TextInput, useToast } from '@haru/ui';
import {
  REFLECTION_NOTE_MAX_LENGTH,
  hasReflectionContent,
  type ErrorCode,
  type Reflection,
  type ReflectionCheckKey,
  type SubmitReflectionRequest,
} from '@haru/contracts';
import { useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { useMe } from '../../../entities/me';
import { useSubmitReflection, useSubmittedReflection } from '../../../entities/reflection';
import { useSessionCompletion } from '../../../entities/session';
import { ROUTES } from '../../../shared/config/routes';
import {
  ERROR_COPY,
  errorCopyForCode,
  joinErrorMessage,
  unknownErrorCopy,
} from '../../../shared/copy/error-copy';
import { useChipRowSplit } from '../../../shared/hooks/useChipRowSplit';
import { REFLECTION_CHECK_ORDER, reflectionCopy as copy } from '../copy';

export interface ReflectionCardProps {
  sessionId: string;
}

interface Draft {
  rating: number;
  checks: ReadonlySet<ReflectionCheckKey>;
  note: string;
}

const EMPTY_DRAFT: Draft = { rating: 0, checks: new Set(), note: '' };

/** 화면 입력 → 요청 body. 빈 `note`(공백만 포함)는 `null` 로 보낸다 (H5-1.6 ③). */
export function toReflectionRequest(draft: Draft): SubmitReflectionRequest {
  const note = draft.note.trim();
  return {
    rating: draft.rating >= 1 ? draft.rating : null,
    checks: REFLECTION_CHECK_ORDER.filter((key) => draft.checks.has(key)),
    note: note.length === 0 ? null : note,
  };
}

function draftOf(reflection: Reflection): Draft {
  return {
    rating: reflection.rating ?? 0,
    checks: new Set(reflection.checks),
    note: reflection.note ?? '',
  };
}

/**
 * 실패 Toast 문구. `SESSION_INVALID_TRANSITION` 의 공통 문구(*"HARU refreshed this storytime…"*)는 회고 저장에서는
 * 사실과 다르므로 일반 문구로 바꾼다 — 서버가 아직 완료 전(Outbox 대기)이고 다시 누르면 된다 (AC-5-28).
 */
function failureMessage(code: ErrorCode | undefined, offline: boolean): string {
  if (offline) return copy.offline;
  if (code === 'SESSION_INVALID_TRANSITION') return joinErrorMessage(unknownErrorCopy);
  return joinErrorMessage(errorCopyForCode(code));
}

export function ReflectionCard({ sessionId }: ReflectionCardProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const titleId = useId();
  const reasonId = useId();
  const savedId = useId();
  const saveRef = useRef<HTMLButtonElement>(null);
  const { me } = useMe();
  const completion = useSessionCompletion(sessionId);
  const submittedNow = useSubmittedReflection(sessionId);
  const submitted = completion.reflection ?? submittedNow;
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  // 칩 줄 사이 hit 영역을 중간선에서 나눈다 (`D5-6`).
  const chipGroupRef = useChipRowSplit();

  const goHome = () => {
    void navigate(ROUTES.home, { replace: true });
  };

  const mutation = useSubmitReflection(sessionId, {
    onSubmitted: () => {
      toast.show({ message: copy.saved, tone: 'success' });
      goHome();
    },
    onFailed: (code, offline) => {
      if (code === 'REFLECTION_ALREADY_SUBMITTED') {
        // 이미 저장돼 있다 — 실패가 아니라 저장된 결과로 다룬다 (S5 와 같은 출구).
        toast.show({ message: joinErrorMessage(ERROR_COPY.REFLECTION_ALREADY_SUBMITTED) });
        goHome();
        return;
      }
      toast.show({ message: failureMessage(code, offline), tone: 'error' });
    },
  });

  const childFirstName = me?.child?.firstName;
  // Guard 를 통과한 완료 화면에는 아이가 있다. 없으면 제목을 만들 수 없으므로 카드를 그리지 않는다.
  if (childFirstName === undefined) return null;

  const readOnly = submitted !== null;
  const shown = readOnly ? draftOf(submitted) : draft;
  const saving = mutation.isPending;
  const locked = readOnly || saving;
  const body = toReflectionRequest(draft);
  const canSave = !readOnly && hasReflectionContent(body);

  const update = (next: Partial<Draft>) => {
    if (locked) return;
    setDraft((current) => ({ ...current, ...next }));
  };

  return (
    <section
      className="haru-reflection-card"
      aria-labelledby={titleId}
      aria-describedby={readOnly ? savedId : undefined}
      data-state={readOnly ? 'submitted' : saving ? 'saving' : 'editing'}
    >
      <h2 className="haru-reflection-card__title" id={titleId}>
        {copy.title(childFirstName)}
      </h2>
      {readOnly ? (
        <span className="haru-visually-hidden" id={savedId}>
          {ERROR_COPY.REFLECTION_ALREADY_SUBMITTED.description}
        </span>
      ) : null}
      <StarRating
        value={shown.rating}
        getStarLabel={copy.star}
        aria-labelledby={titleId}
        readOnly={readOnly}
        disabled={saving}
        onChange={(rating) => {
          update({ rating });
        }}
      />
      <div
        className="haru-reflection-card__checks"
        role="group"
        aria-labelledby={titleId}
        ref={chipGroupRef}
      >
        {REFLECTION_CHECK_ORDER.map((key) => (
          <Chip
            key={key}
            variant="select"
            label={copy.checks[key]}
            selected={shown.checks.has(key)}
            readOnly={locked}
            onToggle={(selected) => {
              const checks = new Set(draft.checks);
              if (selected) checks.add(key);
              else checks.delete(key);
              update({ checks });
            }}
          />
        ))}
      </div>
      <TextInput
        value={shown.note}
        placeholder={copy.notePlaceholder}
        aria-label={copy.notePlaceholder}
        maxLength={REFLECTION_NOTE_MAX_LENGTH}
        readOnly={locked}
        onChange={(note) => {
          update({ note });
        }}
        onFocus={() => {
          // 모바일 소프트 키보드 — 입력과 `Save` 가 함께 보이게 (Spec §6, `R5-05`).
          saveRef.current?.scrollIntoView?.({ block: 'nearest' });
        }}
      />
      {canSave || readOnly ? null : (
        <span className="haru-visually-hidden" id={reasonId}>
          {copy.saveReason}
        </span>
      )}
      <Button
        ref={saveRef}
        variant="accent"
        size="md"
        fullWidth
        loading={saving}
        disabled={readOnly}
        aria-disabled={!readOnly && !canSave ? true : undefined}
        aria-describedby={!readOnly && !canSave ? reasonId : undefined}
        onPress={() => {
          if (!canSave) return;
          mutation.submit(body);
        }}
      >
        {copy.save}
      </Button>
    </section>
  );
}
