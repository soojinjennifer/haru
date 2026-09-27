/**
 * `features/consent` 문구 — `.claude/rules/frontend.md` §8.
 *
 * - 사용자 노출 언어는 영어다. 문구를 컴포넌트에 흩어두지 않는다.
 * - 진단·판정·비교 표현을 쓰지 않는다.
 * - **동의 항목 자체의 문구(`title`)는 여기에 없다.** 항목 이름·개수·순서·필수 여부는 전부
 *   API(Mock) 응답 `ConsentDocument` 값이다 (AC-2-10, C-1). 여기에 있는 것은 화면 골격 문구뿐이다.
 * - 약관·개인정보방침 **본문**도 여기에 없다. 외부 링크로만 연다 (결정 D-4, AC-2-18).
 */
export const consentCopy = {
  guardianConsent: {
    /** Design Spec §2.6 TopBar */
    title: 'Before we begin',
    intro: 'Please review each item. You can open any document to read it in full.',
    /** CheckboxGroup `<legend>` — 시각적으로는 숨긴다. */
    legend: 'Consent items',
    requiredLabel: 'Required',
    optionalLabel: 'Optional',
    /** 문서 열기 링크. 링크 텍스트만으로 목적지를 알 수 있도록 문서 제목을 덧붙인다. */
    viewLabel: 'View',
    viewLabelFor: (title: string) => `View ${title}`,
    externalHint: 'Opens in a new tab',
    /** 항목 아래 한 줄 — 필수 여부 + 문서 버전 (§2.6 "버전 각주"). */
    meta: (requirement: string, version: string) => `${requirement} · Version ${version}`,
    /** CTA 를 아직 누를 수 없는 이유. `aria-describedby` 로 버튼에 연결한다 (§2.6). */
    blockedReason: 'Select the required items to continue.',
    submit: 'Continue',
    /** 문서를 불러오는 동안 (Skeleton 컨테이너의 접근성 안내). */
    loadingLabel: 'Loading consent items',
    retryLabel: 'Try again',
    /**
     * 이전에 동의했지만 문서 버전이 올라가 다시 필요한 상태 (`consent-version-outdated`).
     * 잘못을 지적하는 표현을 쓰지 않는다.
     */
    reconsentTitle: 'These items have been updated',
    reconsentDescription: 'Please review them once more to continue.',
  },

  verifyParent: {
    /** Design Spec §2.7 TopBar */
    title: 'One more step',
    cardTitle: 'A quick check with the grown-up',
    /**
     * **교체 지점** — VPC 실제 방식이 법무 `L-01` 로 정해지면 이 한 키만 바뀐다 (§2.7).
     * 지금은 방식을 말하지 않고 목적만 알린다.
     */
    bodySlot:
      'HARU confirms that a parent or guardian is setting this up before any recording begins.',
    continue: 'Continue',
    /** 진행 중 — `role="status"` 로 읽힌다. */
    pending: "We're confirming this step.",
    /** 실패 — 사용자 귀책·판정 표현을 쓰지 않는다 ("verification failed" · "invalid" 금지). */
    failedTitle: "We couldn't complete this step yet.",
    failedDescription: 'You can try again now, or come back in a little while.',
    tryAgain: 'Try again',
  },
} as const;
