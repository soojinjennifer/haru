/**
 * `ProfileResultView` — 프로필 결과 2모드 (Stage 6 `C13-09`, Figma 없음 → design-agent 명세 Spec §2.1 · §2.2).
 *
 * ```
 * onboarding (`/onboarding/profile`, TopBar 없음 — 뒤로 없음 `N6-24` ⓐ)
 *   h1 + "판정 아님" 안내 → 차트 카드 "Starting point" → 강점 · growing edge 카드 → 페르소나 카드 → CTA Next
 * revisit (`/settings/profile`, TopBar "Profile" 이 h1)
 *   차트 카드 "Where {firstName} is right now" → 강점 · growing edge 카드 → 페르소나 카드 (CTA 없음 · 링크 없음 `N6-38`)
 * ```
 *
 * - 순서 근거: 강점이 먼저, 성장 여지는 다음 (요청서 §2.1). 모든 변형(A/B/C)·fallback 에서 CTA 활성.
 * - 표시 문구(페르소나 · 강점 · growing edge)는 **응답 값 그대로** — 선정·정렬·가공 0 (AC-6-59).
 * - 아이 이름은 `firstName` 만 (AC-6-56).
 * - FR-15 업데이트 표시(UpdateNote, `S6-E2`)는 **재방문 모드에서만** — `profileUpdatedAt` non-null +
 *   `latestSnapshot.source` 가 `session_analysis`·`survey_update` 일 때 카드 위 한 줄 (Spec §2.2, AC-6-36).
 * - `R-SHADOW-1`: 카드 그림자 `--shadow-bubble` 번짐 좌우 4 · 아래 10 ≤ 거터 24 · 섹션 간격 20 → 새 overflow 0.
 */
import { Button, ErrorState, Icon, Skeleton, Text, TextLink } from '@haru/ui';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import {
  CapabilityDiamond,
  CapabilityTagList,
  childProfileCopy,
  PersonaCard,
  ProfileCard,
} from '../../../entities/child-profile';
import { ROUTES } from '../../../shared/config/routes';
import { createSystemClock } from '../../../shared/lib/clock';
import { formatMonthDay } from '../../../shared/lib/date-format';
import { errorCopyForCode, networkErrorCopy, retryLabel } from '../../../shared/copy/error-copy';
import { childProfileViewCopy as copy } from '../copy';
import { useProfileResult, type ProfileResultState } from '../model/useProfileResult';

export type ProfileResultMode = 'onboarding' | 'revisit';

export interface ProfileResultViewProps {
  mode: ProfileResultMode;
}

type ReadyProfile = Extract<ProfileResultState, { kind: 'ready' }>['profile'];

function ProfileSkeleton({ mode }: ProfileResultViewProps) {
  return (
    <div
      className="flex flex-col gap-5"
      role="status"
      aria-busy="true"
      aria-label={copy.loading}
      data-state="loading"
    >
      {mode === 'onboarding' ? <Skeleton shape="text" lines={2} /> : null}
      <ProfileCard as="div">
        <span className="haru-profile-view__chart-skeleton">
          <Skeleton shape="rect" />
        </span>
      </ProfileCard>
      <ProfileCard as="div">
        <Skeleton shape="text" lines={2} />
      </ProfileCard>
      <ProfileCard as="div">
        <Skeleton shape="text" lines={3} />
      </ProfileCard>
    </div>
  );
}

function ProfileError({
  mode,
  state,
  onRetry,
}: ProfileResultViewProps & {
  state: Extract<ProfileResultState, { kind: 'error' }>;
  onRetry: () => void;
}) {
  const navigate = useNavigate();
  const message = state.offline ? networkErrorCopy : errorCopyForCode(state.code);

  return (
    <div className="flex flex-col items-center gap-5" data-state="error">
      <div className="self-stretch">
        <ErrorState
          title={message.title}
          description={message.description}
          tone={state.offline ? 'offline' : 'error'}
          titleAs={mode === 'onboarding' ? 'h1' : 'h2'}
          retryLabel={retryLabel}
          onRetry={onRetry}
        />
      </div>
      {mode === 'onboarding' ? (
        <TextLink
          onPress={() => {
            void navigate(ROUTES.home, { replace: true });
          }}
        >
          {copy.onboarding.continueToHome}
        </TextLink>
      ) : null}
    </div>
  );
}

/**
 * UpdateNote — Spec §2.2 (FR-15 · `N6-03` ⓐ · `N6-42`). 재방문 모드 카드 위 한 줄 · 배지 0 · live 아님
 * (진입 시 이미 존재 — Spec §9.1). 날짜는 절대 표기(`formatMonthDay`, 해가 다르면 연도 포함).
 * 문구를 고를 수 없는 경우(`onboarding_survey` · `profileUpdatedAt: null`)는 렌더 0.
 */
function UpdateNote({ profile }: { profile: ReadyProfile }) {
  const [nowMs] = useState(() => createSystemClock().now());
  const at = profile.profileUpdatedAt;
  const source = profile.latestSnapshot.source;
  if (at === null || source === 'onboarding_survey') return null;

  return (
    /*
      2줄(320 폭)일 때 아이콘 = 첫 줄 정렬 (`S6-G` G-7, `D6-9` ④ `VG6-E2-20`). 아이콘 상자를 첫 줄 높이
      (footnote line-height)로 두고 그 안에서 가운데 — 1줄일 때 위치는 그대로다.
    */
    <p className="flex items-start gap-2" data-update-note="">
      <span className="haru-update-note__icon">
        <Icon name="rotate-ccw" size="sm" decorative />
      </span>
      <Text as="span" variant="footnote" tone="primary">
        {copy.revisit.updateNote[source](formatMonthDay(Date.parse(at), nowMs))}
      </Text>
    </p>
  );
}

function ProfileContent({ mode, profile }: ProfileResultViewProps & { profile: ReadyProfile }) {
  const navigate = useNavigate();
  const firstName = profile.child.firstName;
  const scores = profile.latestSnapshot.scores;
  const allMissing = scores.every((score) => score.score === null);
  const chartTitle =
    mode === 'onboarding' ? copy.onboarding.chartTitle : copy.revisit.chartTitle(firstName);

  return (
    <div className="flex flex-1 flex-col gap-5" data-state="ready">
      {mode === 'onboarding' ? (
        /* h1 ↔ 안내 20 — Figma DRAFT `319:1425` `gap 20` (`S6-G` G-5, `D6-9` ④ `VG6-E1-12`). */
        <header className="flex flex-col gap-5 break-words">
          <Text as="h1" variant="title-3" weight="bold" tone="primary">
            {copy.onboarding.title(firstName)}
          </Text>
          <Text variant="subheadline" tone="primary">
            {copy.onboarding.notice(firstName)}
          </Text>
        </header>
      ) : null}

      {mode === 'revisit' ? <UpdateNote profile={profile} /> : null}

      <ProfileCard>
        <Text as="h2" variant="subheadline" weight="bold" tone="primary">
          {chartTitle}
        </Text>
        <CapabilityDiamond
          firstName={firstName}
          context={mode === 'onboarding' ? 'starting' : 'current'}
          scores={scores}
          strengths={profile.strengths}
          growingEdges={profile.growingEdges}
        />
        {allMissing ? (
          <Text variant="footnote" tone="primary" align="center">
            {copy.chartEmptyCaption}
          </Text>
        ) : null}
      </ProfileCard>

      <ProfileCard>
        <h2 className="haru-visually-hidden">{childProfileCopy.highlights.heading}</h2>
        <CapabilityTagList
          label={childProfileCopy.highlights.strengthsLabel}
          capabilities={profile.strengths}
        />
        <hr className="m-0 border-0 border-t border-divider" />
        <CapabilityTagList
          label={childProfileCopy.highlights.growingEdgesLabel}
          capabilities={profile.growingEdges}
        />
      </ProfileCard>

      <PersonaCard firstName={firstName} persona={profile.persona} />

      {mode === 'onboarding' ? (
        <div className="mt-auto pt-8">
          <Button
            variant="accent"
            size="lg"
            fullWidth
            onPress={() => {
              void navigate(ROUTES.onboarding.growthCapability);
            }}
          >
            {copy.onboarding.next}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export function ProfileResultView({ mode }: ProfileResultViewProps) {
  const { state, retry } = useProfileResult();

  return (
    <div className="haru-profile-view flex flex-1 flex-col pt-6" data-mode={mode}>
      {state.kind === 'loading' ? <ProfileSkeleton mode={mode} /> : null}
      {state.kind === 'error' ? <ProfileError mode={mode} state={state} onRetry={retry} /> : null}
      {state.kind === 'ready' ? <ProfileContent mode={mode} profile={state.profile} /> : null}
    </div>
  );
}
