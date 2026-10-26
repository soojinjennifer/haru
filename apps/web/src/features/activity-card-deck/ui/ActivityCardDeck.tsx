/**
 * `ActivityCardDeck` — Home 의 Activity Card 영역 (Figma `163:2648` + dots `261:1233`).
 *
 * ```
 * ActivityCardTrack (가로 scroll-snap)
 * └ ActivityOptionCard × 3   (앞면 409 / 뒷면 415, flip 은 카드 안에서 끝난다)
 * PageIndicator               카드 하단에서 12 아래
 * ```
 *
 * ── 1차 구현에서 사라진 것 (Figma 에 없다 — 최우선 규칙 2·3) ──
 *  - `SwipeDeck` Z축 스택 + 좌우 `IconButton` 2개 → 가로 트랙의 네이티브 키보드 경로로 대체
 *  - 덱 위 파란 안내 카드(지난 날짜) → `AC-3-11` 폐기
 *  - `Pick a time` → 그 자리는 **`★ Save`** 다. Reading Context 진입점은 **이월**되었다
 *    (approvals §12.3 ⑧) — 그래서 이 화면은 `POST …/selection` 을 호출하지 않는다.
 *    Prompt 전체와 코칭 문장은 **카드 뒷면**이 보여 준다 (`AC-3-16` 수정).
 *
 * ── `Start Session` (Stage 4 `S4-F1` — `D-3` 해제, AC-4-38·AC-4-86) ──
 *   누름 → Reading Context 시트(`D4-35`) → `POST …/selection`(선택 확정, AC-3-24) →
 *   `POST /v1/sessions`(1회) → `/session/:id`. 오프라인 캐시 카드(`isCached`)에서는 **비활성**이고
 *   사유는 TopBar 밑 배너 제목이 대신한다 — `aria-disabled` + `aria-describedby`(`D4-33` · `D4-39`).
 *   Save 는 그 상태에서도 활성이다 (AC-4-124).
 */
import {
  Button,
  EmptyState,
  ErrorState,
  InlineAlert,
  PageIndicator,
  Skeleton,
  useToast,
} from '@haru/ui';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import type { ActivityCardOption } from '@haru/contracts';

import {
  ActivityOptionCard,
  optionHeadline,
  SaveButton,
  useSelectActivityOption,
  useTodayActivityCard,
} from '../../../entities/activity-card';
import { useToggleSavedBook } from '../../../entities/library';
import { useCreateSession } from '../../../entities/session';
import { sessionPath } from '../../../shared/config/routes';
import { activityDeckCopy } from '../copy';

import { ActivityCardTrack } from './ActivityCardTrack';
import { ACTIVITY_CARD_OFFLINE_TITLE_ID } from './ActivityCardOfflineBanner';
import { ReadingContextSheet, type ReadingContextChoice } from './ReadingContextSheet';

export function ActivityCardDeck() {
  const copy = activityDeckCopy;
  const { card, isPending, isEmpty, isError, isOffline, isCached, refetch } =
    useTodayActivityCard();
  const [index, setIndex] = useState(0);
  const toast = useToast();

  const save = useToggleSavedBook(() => {
    toast.show({ message: copy.card.saveFailed, tone: 'error' });
  });

  const navigate = useNavigate();
  /** Reading Context 시트가 열려 있는 옵션 (`null` = 닫힘). */
  const [starting, setStarting] = useState<ActivityCardOption | null>(null);
  /** 시트를 연 옵션 id — 다른 옵션으로 다시 열면 선택을 새로 시작한다 (닫을 때는 유지해 퇴장 모션을 살린다). */
  const [sheetKey, setSheetKey] = useState('none');
  const [choice, setChoice] = useState<ReadingContextChoice | null>(null);
  const createSession = useCreateSession((session) => {
    setStarting(null);
    void navigate(sessionPath(session.id));
  });
  const selectOption = useSelectActivityOption();

  /*
    오프라인이어도 **최근 카드가 있으면 카드를 그대로 보여 준다** (`D-11`, AC-4-82). 그때 Offline Banner 는
    TopBar 밑(`ActivityCardOfflineBanner` — Page 가 헤더에 조립)이 맡는다. 카드가 없을 때만 이 안내를 쓴다.
  */
  if (isOffline && card === undefined) {
    return (
      <div className="haru-activity-deck">
        <div className="haru-activity-deck__slot">
          <InlineAlert
            tone="offline"
            title={copy.states.offlineTitle}
            description={copy.states.offlineDescription}
            action={{ label: copy.states.retry, onPress: refetch }}
          />
        </div>
      </div>
    );
  }

  if (isPending) return <DeckSkeleton />;

  /*
    **실패를 빈 상태로 보여 주지 않는다.** `isError` 를 뒤에 두면 parse 실패·서버 오류가
    "오늘 카드가 아직 없다" 로 둔갑해 재시도 경로가 사라진다.
  */
  if (isError && !isCached) {
    return (
      <div className="haru-activity-deck">
        <div className="haru-activity-deck__slot">
          <ErrorState
            title={copy.states.errorTitle}
            onRetry={refetch}
            retryLabel={copy.states.retry}
            announce="status"
            titleAs="h2"
          />
        </div>
      </div>
    );
  }

  if (isEmpty || card === undefined) {
    return (
      <div className="haru-activity-deck">
        <div className="haru-activity-deck__slot">
          <EmptyState
            icon="book-open"
            title={copy.states.emptyTitle}
            description={copy.states.emptyDescription}
            titleAs="h2"
          />
        </div>
      </div>
    );
  }

  const options = card.options;
  const total = options.length;
  const current = options[index];
  const cardId = card.id;

  /*
    선택 확정(`POST …/selection` — AC-3-24) → 세션 생성(`POST /v1/sessions` — AC-4-38) 순서다.
    둘 중 하나라도 실패하면 시트에 남아 오류를 보여 주고 선택은 보존된다 (Stage 3 Spec §2.4 상태 행).
  */
  const confirmReadingContext = (picked: ReadingContextChoice) => {
    if (starting === null) return;
    const option = starting;
    setChoice(picked);
    createSession.reset();
    selectOption.select(
      {
        cardId,
        selection: {
          optionId: option.id,
          readingContext: picked.readingContext,
          ...(picked.customTime === undefined ? {} : { customTime: picked.customTime }),
        },
      },
      () => {
        createSession.create({
          mode: 'recorded',
          activityCardOptionId: option.id,
          bookId: option.book.id,
          childBookId: null,
          readingContext: picked.readingContext,
          customTime: picked.customTime,
        });
      },
    );
  };

  function renderOption(option: ActivityCardOption) {
    return (
      <ActivityOptionCard
        key={option.id}
        option={option}
        copy={{
          showBack: copy.card.showBack,
          showFront: copy.card.showFront,
          backTitle: copy.card.backTitle,
          promptsLabel: copy.card.promptsLabel,
        }}
        actionBar={
          <>
            <SaveButton
              saved={option.saved}
              busy={save.isPending}
              copy={{ save: copy.card.save, saved: copy.card.saved }}
              onToggle={() => {
                save.toggle({ bookId: option.book.id, saved: !option.saved });
              }}
            />
            <Button
              variant="accent"
              /*
                오프라인 캐시 카드에서만 비활성 (`D4-33`). `disabled` 속성만 쓰면 스크린리더가 건너뛰어
                사유를 읽지 못하므로 **`aria-disabled` + 포커스 가능** — 사유 = 배너 제목 (`D4-39`).
                시각은 전역 `opacity .5` 그대로다 (신규 비활성 스타일 0건 — AC-4-123 ②).
              */
              {...(isCached
                ? {
                    'aria-disabled': true,
                    'aria-describedby': ACTIVITY_CARD_OFFLINE_TITLE_ID,
                  }
                : copy.card.startSession.reason === null
                  ? {}
                  : { 'aria-describedby': `${option.id}-start-reason` })}
              onPress={() => {
                selectOption.reset();
                createSession.reset();
                setChoice(null);
                setSheetKey(option.id);
                setStarting(option);
              }}
            >
              {copy.card.startSession.label}
            </Button>
            {copy.card.startSession.reason === null ? null : (
              <span className="haru-visually-hidden" id={`${option.id}-start-reason`}>
                {copy.card.startSession.reason}
              </span>
            )}
          </>
        }
      />
    );
  }

  return (
    <div className="haru-activity-deck">
      <ActivityCardTrack
        label={copy.deck.label}
        index={index}
        onIndexChange={setIndex}
        itemLabel={(position) => {
          const option = options[position];
          return option === undefined
            ? copy.deck.label
            : copy.deck.itemLabel(
                position + 1,
                total,
                optionHeadline(option).title,
                copy.deck.kindLabel(option.kind),
              );
        }}
        statusLabel={
          current === undefined
            ? ''
            : copy.deck.announcement(index + 1, total, optionHeadline(current).title)
        }
      >
        {options.map((option) => renderOption(option))}
      </ActivityCardTrack>

      <PageIndicator count={total} index={index} />

      <ReadingContextSheet
        key={sheetKey}
        open={starting !== null}
        onClose={() => {
          if (selectOption.isPending || createSession.isPending) return;
          setStarting(null);
          setChoice(null);
        }}
        onConfirm={confirmReadingContext}
        submitting={selectOption.isPending || createSession.isPending}
        failed={choice !== null && (selectOption.isError || createSession.isError)}
      />
    </div>
  );
}

/**
 * 덱 Skeleton (`AC-3-14` 수정) — **가로 트랙 1장 + peek 8** 형태다.
 * ActionBar 자리는 `Skeleton rect` 로 둔다: `saved` 를 아직 모르는 상태에서 `Save`/`Saved`
 * 중 하나를 보여 주면 **틀린 상태를 먼저 보여 주고 뒤집히는** 깜빡임이 생긴다 (audit §16.5).
 */
function DeckSkeleton() {
  return (
    <div className="haru-activity-deck">
      <div className="haru-activity-track haru-activity-track--skeleton">
        <div className="haru-activity-track__item">
          <div className="haru-activity-card-flip">
            <div className="haru-activity-card-flip__face haru-activity-card-flip__face--front haru-activity-card haru-activity-card--front">
              <div className="haru-activity-card__header">
                <Skeleton shape="rect" />
              </div>
              <div className="haru-activity-card__book">
                <Skeleton shape="rect" />
                <div className="haru-activity-card__book-text">
                  <Skeleton shape="text" lines={3} />
                </div>
              </div>
              <div className="haru-prompt-preview">
                <Skeleton shape="text" lines={4} />
              </div>
              <div className="haru-activity-card__actions">
                <Skeleton shape="rect" />
              </div>
            </div>
          </div>
        </div>
        {/* peek 자리 — 다음 카드가 있다는 신호를 로딩 중에도 유지한다. */}
        <div className="haru-activity-track__item" aria-hidden="true" />
      </div>
    </div>
  );
}
