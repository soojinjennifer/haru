/**
 * Gallery 데모 문구 — Design Spec §5.0.
 *
 * 이 문구는 **gallery 데모용 기본값**이다. 제품 화면 문구는 각 Stage 의 feature copy 모듈이
 * 소유한다 (`.claude/rules/frontend.md` §8). 여기에 도메인·아동 데이터를 넣지 않는다.
 *
 * 톤 규칙(§5.0): 영어 · 짧은 평서형 · 느낌표/이모지 없음 · 진단/판정/비교 표현 금지.
 * 패턴 = `<무슨 일이 있었는지> + <다음에 할 수 있는 것>`.
 */
export const galleryCopy = {
  nav: {
    brand: 'HARU dev',
    tokens: 'Tokens',
    components: 'Components',
    states: 'States',
    responsive: 'Responsive',
    a11y: 'Accessibility',
  },

  states: {
    screenTitle: 'Reading log',
    loading: {
      srLabel: 'Loading',
    },
    empty: {
      title: 'Nothing here yet',
      description: 'Sessions you finish together will show up on this page.',
      actionLabel: 'Start a session',
    },
    error: {
      title: 'We could not load this',
      description: 'The connection did not come through. You can try again.',
      retryLabel: 'Try again',
    },
    offline: {
      title: "You're offline",
      description: 'We will reconnect automatically.',
    },
    toast: {
      message: 'Saved',
      actionLabel: 'Undo',
      dismissLabel: 'Dismiss',
      triggerLabel: 'Show toast',
    },
    dialog: {
      title: 'Delete this recording?',
      description: 'The audio is removed from this device and from HARU.',
      confirmLabel: 'Delete',
      cancelLabel: 'Keep',
      triggerLabel: 'Open confirm dialog',
    },
    live: {
      title: 'Live scenario — health',
      okLabel: 'Service status',
      retryLabel: 'Try again',
    },
  },

  components: {
    buttonLabel: 'Start session',
    secondaryLabel: 'Save',
    iconButtonBack: 'Back',
    iconButtonSettings: 'Settings',
    iconButtonClose: 'Close',
    sheetTitle: 'Reading prompts',
    sheetBody: 'Prompts that fit this moment appear here during a session.',
    sheetTrigger: 'Open sheet',
    dialogTrigger: 'Open dialog',
    dialogTitle: 'Leave this screen?',
    dialogDescription: 'Your notes stay saved.',
    dialogConfirm: 'Leave',
    dialogCancel: 'Stay',
    fieldEmailLabel: 'Email',
    fieldPasswordLabel: 'Password',
    fieldNameLabel: 'Name',
    fieldHelper: 'We use this to send your weekly summary.',
    fieldError: 'Enter an email address to continue.',
    fieldShow: 'Show',
    checkboxLabel: 'I agree to the recording notice',
    checkboxDescription: 'You can change this later in Settings.',
    checkboxGroupLegend: 'Consents',
    radioLegend: 'How often does this happen?',
    progressLabel: 'Onboarding progress',
    pageIndicatorLabel: '2 of 3',
    bubbleText: 'Ask what the bear was feeling on this page.',
    tabsLabel: 'Main',
    topBarTitle: 'Storytime',
    topBarSubtitle: 'Today',
  },

  /** Stage 2-UI 신규 6종 (Stage 2 Design Spec §4 · 결정 D-8). */
  stage2: {
    selectLabelYear: 'Birth year',
    selectLabelGender: 'Gender',
    selectPlaceholder: 'Not selected',
    selectSheetTitle: 'Select a year',
    selectOptionGirl: 'Girl',
    selectOptionBoy: 'Boy',
    selectOptionPreferNot: 'Prefer not to say',
    selectError: 'HARU is built for ages 3 to 9 right now.',
    selectDisabled: 'Relationship',
    deckLabel: 'Sample card deck',
    deckPrev: 'Previous card',
    deckNext: 'Next card',
    deckStatus: (index: number, total: number) => `Card ${index} of ${total}`,
    deckCards: ['First card', 'Second card', 'Third card', 'Fourth card'],
    listGroupLabel: 'Sample list',
    listRowTitle: 'Log out',
    listRowBookTitle: 'The Rainbow Fish',
    listRowBookAuthor: 'Marcus Pfister',
    listRowSelectLabel: 'Select The Rainbow Fish',
    listRowRemoveLabel: 'Remove The Rainbow Fish',
    listRowDisabled: 'Not available yet',
    infoRowTime: 'About 5 minutes, and you can pause any time.',
    infoRowSteps: '5 short steps about your child.',
    dividerLabel: 'or with email',
    textLinkSentence: 'Already have an account?',
    textLinkInline: 'Log in',
    textLinkStandalone: 'Forgot password?',
    textLinkExternal: 'Privacy Policy',
    textLinkExternalHint: 'Opens in a new tab',
  },

  /** Library 1라운드 토대 (Library Design Spec §3.1 · §3.5 · §4.1). */
  stage3Library: {
    sectionCurated: 'Our curated shelf',
    sectionFavorites: 'Favorites',
    sectionFinished: 'Finished together',
    sectionReadingNow: 'Reading now',
    seeAll: 'See all',
    readingNowMeta: '3 of 5 nights',
    coverTitle: 'The Most Magnificent Idea',
    coverAuthor: 'Ashley Spires',
    coverPlaceholderNote:
      'No cover art here — the placeholder shows title initials and carries no label.',
    listLabel: 'Sample book list',
    rowMeta: '3 sessions · finished Apr 2',
    rowRating: 'Rated 4.5',
    rowUnratedTitle: 'Grumpy Monkey: Play All Day',
    rowMetaUnrated: '1 session · finished Mar 28',
    rowEntryTitle: 'Add a book you own',
    weekChipLabel: '2 this week',
    weekChipAccessibleLabel: '2 storytimes this week',
    weekChipEmptyLabel: 'None yet this week',
    weekChipEmptyAccessibleLabel: 'No storytimes yet this week',
    weekChipNote:
      'The same chip renders in the Home header and the Library header — it carries its own size, padding and icon.',
  },

  /** Stage 4b `S4-F2` — RecordControl 5변형 · Button sm (Prompts 칩). 접근성 이름 = 4b Spec §9.1. */
  stage4Session: {
    recordStart: 'Tap to recording, Start recording',
    recordPause: 'Pause recording',
    recordResume: 'Tap to resume, Resume recording',
    micOff: 'Mic is off', // `D8-5` — 보이는 캡션과 같은 이름
    captionRecord: 'Tap to recording',
    captionResume: 'Tap to resume',
    captionMicOff: 'Mic is off',
    prompts: 'Prompts',
  },

  /* Stage 7 `S7-B` — Progress · 4주 리포트 Shared UI (Stage 7 Spec §3.1 · §3.4 · §3.7). dev 전용 문구. */
  stage7: {
    statSessionsValue: '5',
    statSessionsLabel: 'sessions',
    statMinutesValue: '62m',
    statMinutesLabel: 'together',
    barSummary: 'Minutes read each day this week',
    barDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    barNoValue: '—',
    barMinutes: (day: string, minutes: number) => `${day}, ${String(minutes)} minutes`,
    barNoStorytime: (day: string) => `${day}, no storytime`,
    barValue: (minutes: number) => `${String(minutes)}m`,
    diamondSummary:
      'Growth themes for Emma in this report. The dashed outline shows the previous report.',
    diamondMissing: 'Not seen yet',
    legendPrevious: 'Earlier',
    legendCurrent: 'This report',
    axisAgency: 'Self-Direction',
    axisEmotion: 'Emotion Regulation',
    axisFlexibility: 'Cognitive Flexibility',
    axisMotivation: 'Intrinsic Motivation',
    surfaceCard: 'fill="card" — white 82% + blur 12 · Glass Rest',
    decorativeNote: 'decorative — no progressbar role (M7-11)',
  },

  a11y: {
    focusTourTitle: 'Focus order',
    touchTargetTitle: 'Touch targets',
    contrastTitle: 'Contrast',
    overlayToggle: 'Show touch target overlay',
    measureLabel: 'Measured',
  },

  responsive: {
    frameLabel: (width: number) => `${width}px frame`,
  },
} as const;
