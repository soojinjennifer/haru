/**
 * 발전 역량 화면 문구 — Stage 6 Spec §10.2 (`C13-10` 온보딩 · `C13-S6-4` 설정, `D6-6` · `D6-8`).
 *
 * - 사용자 노출 언어는 영어. 진단·판정·비교 표현 0 (Spec §10.5 금칙어 점검).
 * - 4역량 표시 라벨은 `shared/copy/capability-copy` (Stage 0 #14) 가 소유한다 — 여기에는 설명 문장만 둔다.
 * - 설정 모드 안내 문장은 **"제안 없음" 문구** (`D6-8` 보충 — contract 에 제시값 필드가 없다, `M6-3` · `N6-36`).
 */
import type { Capability } from '@haru/contracts';

export const growthCapabilityCopy = {
  onboarding: {
    title: 'Pick one to focus on together',
    meta: 'Suggested',
    changeLater: 'You can change this anytime in Settings.',
    cta: 'Start with this',
    /** TopBar 뒤로 (→ 프로필, `N6-24` ⓐ). */
    backLabel: 'Back',
    /** 조회 실패 시 보조 링크 — 온보딩 끝에서 막히지 않게 (`N6-37`). */
    continueToHome: 'Continue to Home',
  },
  settings: {
    /** TopBar 제목 (= h1). `pages/settings/GrowthCapabilityTopBar` 가 조립한다 (`S6-D`). */
    topBarTitle: 'Growth focus',
    meta: 'Current',
    cta: 'Save',
    savedToast: 'Saved',
    backLabel: 'Back',
  },
  intro: {
    suggested: "We've suggested a place to begin. You can choose any of the four.",
    noSuggestion: "Choose the one you'd like to explore together first.",
  },
  /** RadioGroup legend — 시각 숨김, 그룹 접근성 이름 (Spec §2.3). */
  legend: 'Growth focus',
  descriptions: {
    emotion_regulation: 'Noticing big feelings and finding ways back to calm, with your help.',
    self_directed_agency: 'Making small choices and trying things on their own.',
    cognitive_flexibility: 'Looking at things another way and adjusting when plans change.',
    intrinsic_motivation: 'Following their own curiosity and enjoying the effort for its own sake.',
  } satisfies Record<Capability, string>,
  /** CTA 비활성 사유 — 선택이 없을 때만 (Spec §2.3.2 · `N6-45`). */
  disabledReason: 'Choose one to continue.',
  saveFailed: {
    title: "We couldn't save your choice right now",
    description: 'Your selection is still here. Try again.',
  },
  offline: {
    title: "You're offline",
    description: "Your selection is still here. Tap the button again when you're back online.",
  },
  loading: 'Loading',
} as const;
