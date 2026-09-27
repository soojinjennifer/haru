/**
 * `/onboarding` 소개 — Design Spec §2.8 (Figma `179:1748`).
 *
 * **`S2-COPY-1`** (approvals §6 ②): Figma `179:1763` / `179:1767` 의 안내 문구는
 * 5단계 소개 화면인데 Step 5 만 설명한다. 대체 문구가 **기획 결정 대기**라
 * `copy.intro.durationSlot` · `formatSlot` 은 **빈 슬롯**이다. 값이 `null` 이면 해당 InfoRow
 * 자체를 렌더하지 않는다 — 플레이스홀더 문구를 만들지 않는다.
 *
 * 저장된 draft 가 있으면 CTA 문구만 바뀌고, 진입 단계는 draft 의 `currentStep` 이다 (FR-03).
 */
import { Button, Icon, InfoRow, Surface, Text } from '@haru/ui';
import { useNavigate } from 'react-router';

import { CharacterMedallion } from '../../../entities/character';
import type { Clock } from '../../../shared/lib/clock';
import type { OnboardingDraftStore } from '../../../shared/lib/onboarding-draft';
import { onboardingCopy } from '../copy';
import { DEFAULT_ONBOARDING_INSTRUMENT } from '../model/defaultInstrument';
import { FIRST_STEP, pathForStep } from '../model/steps';
import { hasAnyAnswers, useOnboardingDraft } from '../model/useOnboardingDraft';

import { DraftDiscardNotice, TrialNotice } from './OnboardingNotices';

export interface OnboardingIntroProps {
  /** 미인증 체험 구간인가 (page 가 세션으로 판단해 넘긴다). */
  isTrial: boolean;
  store?: OnboardingDraftStore | undefined;
  clock?: Clock | undefined;
}

export function OnboardingIntro({ isTrial, store, clock }: OnboardingIntroProps) {
  const copy = onboardingCopy.intro;
  const navigate = useNavigate();

  // 소개 화면은 서버를 호출하지 않는다 — draft 를 읽어 "이어서" 여부만 판단한다.
  const draft = useOnboardingDraft({
    instrument: DEFAULT_ONBOARDING_INSTRUMENT,
    store,
    clock,
  });

  const resuming = hasAnyAnswers(draft.answers);
  const target = resuming ? draft.currentStep : FIRST_STEP;

  return (
    <div className="flex flex-1 flex-col items-center gap-7 pt-6">
      <CharacterMedallion asset="headphones" size="md" />

      <Surface fill="strong" radius="card" padding="5">
        <div className="flex flex-col gap-2">
          <Text variant="title-3" tone="primary" as="h1">
            {copy.title}
          </Text>
          <Text variant="subheadline" tone="secondary">
            {copy.body}
          </Text>
        </div>
      </Surface>

      <div className="flex w-full flex-col gap-2">
        {/* `S2-COPY-1` — 문구 미확정. 슬롯이 비어 있으면 행을 그리지 않는다. */}
        {copy.durationSlot === null ? null : (
          <InfoRow icon={<Icon name="clock" decorative />}>{copy.durationSlot}</InfoRow>
        )}
        {copy.formatSlot === null ? null : (
          <InfoRow icon={<Icon name="list-checks" decorative />}>{copy.formatSlot}</InfoRow>
        )}
      </div>

      <div className="w-full">
        <DraftDiscardNotice reason={draft.discarded} onDismiss={draft.dismissDiscardNotice} />
      </div>
      <div className="w-full">
        <TrialNotice isTrial={isTrial} />
      </div>

      <div className="mt-auto w-full pt-8">
        <Button
          variant="accent"
          size="lg"
          fullWidth
          onPress={() => {
            void navigate(pathForStep(target));
          }}
        >
          {resuming ? copy.resume : copy.start}
        </Button>
      </div>
    </div>
  );
}
