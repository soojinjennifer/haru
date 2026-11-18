/**
 * `GrowthCapabilityPicker` — 발전 역량 **한 컴포넌트 2모드** (Stage 6 Spec §2.3 · §2.3.1 · §2.3.2, `D6-6`).
 *
 * ```
 * onboarding (`/onboarding/growth-capability`, `C13-10`) — TopBar = 뒤로만(→ 프로필)
 *   h1 "Pick one to focus on together" → 제안 문구 → 차트 카드(축 탭) → RadioGroup(대체 선택 목록, meta Suggested)
 *   → 선택 설명(aria-live) → "You can change this anytime in Settings." → CTA "Start with this" → PUT → Home(replace)
 * settings (`/settings/growth-capability`, `C13-S6-4`, `S6-D`) — TopBar "Growth focus" 가 h1
 *   안내 문장(제안 없음 문구, `D6-8` 보충) → 차트 카드 → RadioGroup(meta Current) → 선택 설명
 *   → CTA "Save"(변경 없으면 비활성) → PUT → Toast "Saved" → 뒤로
 * ```
 *
 * - 선택 수단은 **RadioGroup 하나** — 차트 축 버튼은 보조 포인터 단축키(`aria-hidden` · `tabIndex −1`, `DiamondChart`).
 *   둘 다 같은 state 를 바꾼다 (Spec §6 "축 탭 = RadioGroup 값 변경과 동일 경로").
 * - *Suggested* / *Current* 표시는 **원래 옵션에 남는다** — 선택이 옮겨 가도 그것이 "제안과 다르다"의 유일한 표현 (§2.3.1).
 * - `growthCapability: null`(제안 없음) → 미선택 시작 · CTA 비활성 + 사유 *"Choose one to continue."* (§2.3.2 · `N6-45`).
 * - null 축 역량도 선택할 수 있다 (`N6-11` ⓐ). 숫자 표시 0.
 * - 낙관적 갱신 없음 — 응답으로 캐시를 채운다 (`useSetGrowthCapability`). 실패 시 **선택 보존** + CTA 위 InlineAlert.
 * - CTA 비활성은 native `disabled` 가 아니라 `aria-disabled` — 포커스가 남아 사유(`aria-describedby`)가 읽힌다.
 * - `R-SHADOW-1`: 카드 그림자 `--shadow-bubble`(번짐 좌우 4 · 아래 10) ≤ 거터 24 · 섹션 간격 20 → 새 overflow 0.
 */
import type { Capability, ChildProfile } from '@haru/contracts';
import {
  Button,
  ErrorState,
  InlineAlert,
  RadioGroup,
  Skeleton,
  Text,
  TextLink,
  useToast,
} from '@haru/ui';
import { useId, useState } from 'react';
import { useNavigate } from 'react-router';

import {
  CAPABILITY_AXIS_ORDER,
  CapabilityDiamond,
  ProfileCard,
  useCurrentChildProfile,
  useSetGrowthCapability,
  type CurrentChildProfileState,
} from '../../../entities/child-profile';
import { ROUTES } from '../../../shared/config/routes';
import { capabilityCopy } from '../../../shared/copy/capability-copy';
import { errorCopyForCode, networkErrorCopy, retryLabel } from '../../../shared/copy/error-copy';
import { growthCapabilityCopy as copy } from '../copy';

export type GrowthCapabilityMode = 'onboarding' | 'settings';

export interface GrowthCapabilityPickerProps {
  mode: GrowthCapabilityMode;
}

function toCapability(value: string): Capability | null {
  return CAPABILITY_AXIS_ORDER.find((capability) => capability === value) ?? null;
}

function PickerSkeleton() {
  return (
    <div
      className="flex flex-col gap-5"
      role="status"
      aria-busy="true"
      aria-label={copy.loading}
      data-state="loading"
    >
      <Skeleton shape="text" lines={2} />
      <ProfileCard as="div">
        <span className="haru-growth-focus__chart-skeleton">
          <Skeleton shape="rect" />
        </span>
      </ProfileCard>
      <div className="flex flex-col gap-2">
        {CAPABILITY_AXIS_ORDER.map((capability) => (
          <span key={capability} className="haru-growth-focus__row-skeleton">
            <Skeleton shape="rect" />
          </span>
        ))}
      </div>
    </div>
  );
}

function PickerError({
  mode,
  state,
  onRetry,
}: GrowthCapabilityPickerProps & {
  state: Extract<CurrentChildProfileState, { kind: 'error' }>;
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

function PickerContent({ mode, profile }: GrowthCapabilityPickerProps & { profile: ChildProfile }) {
  const navigate = useNavigate();
  const toast = useToast();
  const reasonId = useId();
  /** 온보딩 = 서버 제시값(`D-2 ⑤`) · 설정 = 현재값. meta 는 이 옵션에 남는다. */
  const original = profile.growthCapability;
  const [selected, setSelected] = useState<Capability | null>(original);

  const saving = useSetGrowthCapability(profile.child.id, {
    onSaved: () => {
      if (mode === 'onboarding') {
        void navigate(ROUTES.home, { replace: true });
        return;
      }
      toast.show({ tone: 'success', message: copy.settings.savedToast });
      void navigate(-1);
    },
  });

  const canSubmit = selected !== null && (mode === 'onboarding' || selected !== original);
  const meta = mode === 'onboarding' ? copy.onboarding.meta : copy.settings.meta;
  const failure = saving.isError ? (saving.isOffline ? copy.offline : copy.saveFailed) : null;

  const choose = (capability: Capability) => {
    if (saving.isPending) return;
    if (saving.isError) saving.reset();
    setSelected(capability);
  };

  const intro =
    mode === 'onboarding' && original !== null ? copy.intro.suggested : copy.intro.noSuggestion;

  return (
    <div className="flex flex-1 flex-col gap-5" data-state="ready">
      {/* h1 ↔ 안내 20 — Figma DRAFT `320:1493` `gap 20` (`S6-G` G-5, `D6-9` ④ `VG6-E2-07` → `E1-12`). */}
      <header className="flex flex-col gap-5 break-words">
        {mode === 'onboarding' ? (
          <Text as="h1" variant="title-3" weight="bold" tone="primary">
            {copy.onboarding.title}
          </Text>
        ) : null}
        <Text variant="subheadline" tone="primary">
          {intro}
        </Text>
      </header>

      <ProfileCard as="div">
        <CapabilityDiamond
          firstName={profile.child.firstName}
          context={mode === 'onboarding' ? 'starting' : 'current'}
          scores={profile.latestSnapshot.scores}
          strengths={profile.strengths}
          growingEdges={profile.growingEdges}
          mode="selectable"
          selected={selected}
          onSelect={choose}
          disabled={saving.isPending}
        />
      </ProfileCard>

      <RadioGroup
        legend={copy.legend}
        legendVisuallyHidden
        name="growth-focus"
        variant="card"
        value={selected}
        disabled={saving.isPending}
        options={CAPABILITY_AXIS_ORDER.map((capability) => ({
          value: capability,
          label: capabilityCopy[capability],
          ...(capability === original ? { meta } : {}),
        }))}
        onChange={(value) => {
          const capability = toCapability(value);
          if (capability !== null) choose(capability);
        }}
      />

      {/*
        선택 설명 ↔ *You can change…* 20 — Figma DRAFT `320:1439`(설명 y594+45 → 문구 y659, `gap 20`) (`S6-G` G-5,
        `VG6-E2-06`). 선택 전에는 설명이 비어 있고 DRAFT `320:1691` 은 문구가 RadioGroup 바로 아래(섹션 간격 20)다 —
        빈 live 영역이 간격을 한 번 더 만들지 않게 그때는 gap 을 두지 않는다.
      */}
      <div
        className={
          selected === null ? 'flex flex-col break-words' : 'flex flex-col gap-5 break-words'
        }
      >
        <div aria-live="polite" data-selected-description="">
          {selected === null ? null : (
            <Text variant="subheadline" tone="primary">
              {copy.descriptions[selected]}
            </Text>
          )}
        </div>
        {mode === 'onboarding' ? (
          /* 대비 4.5:1 이상 — 그래디언트 끝 배경 위라 진한 텍스트(`strong` = ink-800) (`S6-G` G-3, `D6-9` ③ · `QA-6-004`). */
          <Text variant="footnote" tone="strong">
            {copy.onboarding.changeLater}
          </Text>
        ) : null}
      </div>

      <div className="mt-auto flex flex-col gap-3 pt-8">
        {failure === null ? null : (
          <InlineAlert tone="error" title={failure.title} description={failure.description} />
        )}
        {selected === null ? (
          /* 대비 4.5:1 이상 — CTA 가 `mt-auto` 로 그래디언트 끝에 놓인다(`S6-G` G-3, `D6-9` ③ · `QA-6-004`, 가값 P-34 미등록). */
          <Text id={reasonId} variant="footnote" tone="strong">
            {copy.disabledReason}
          </Text>
        ) : null}
        <Button
          variant="accent"
          size="lg"
          fullWidth
          loading={saving.isPending}
          aria-disabled={canSubmit ? undefined : true}
          aria-describedby={selected === null ? reasonId : undefined}
          onPress={() => {
            if (!canSubmit || selected === null) return;
            saving.select(selected);
          }}
        >
          {mode === 'onboarding' ? copy.onboarding.cta : copy.settings.cta}
        </Button>
      </div>
    </div>
  );
}

export function GrowthCapabilityPicker({ mode }: GrowthCapabilityPickerProps) {
  const { state, retry } = useCurrentChildProfile();

  return (
    <div className="haru-growth-focus flex flex-1 flex-col pt-6" data-mode={mode}>
      {state.kind === 'loading' ? <PickerSkeleton /> : null}
      {state.kind === 'error' ? <PickerError mode={mode} state={state} onRetry={retry} /> : null}
      {state.kind === 'ready' ? (
        <PickerContent key={state.profile.child.id} mode={mode} profile={state.profile} />
      ) : null}
    </div>
  );
}
