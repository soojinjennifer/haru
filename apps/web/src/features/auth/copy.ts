/**
 * `features/auth` 문구 — `.claude/rules/frontend.md` §8.
 *
 * - 사용자 노출 언어는 영어다. 문구를 컴포넌트에 흩어두지 않는다.
 * - 진단·판정·비교 표현을 쓰지 않는다. "무슨 일이 있었는지 + 다음에 할 수 있는 것" 패턴이다.
 * - **계정 존재 여부를 알려주지 않는다** (enumeration 방지 — AC-2-09, NFR 보안).
 * - Figma 원문을 그대로 쓴 문구에는 node id 를 적어 두었다.
 */
export const authCopy = {
  welcome: {
    /** Figma `179:1707` */
    title: 'HARU',
    /** Figma `179:1708` */
    tagline: 'Ten minutes of reading together, shaped around who your child is becoming.',
    /** Figma `179:1709` */
    google: 'Continue with Google',
    /** Figma 에 없음 — C-13 으로 추가한 Apple 공식 버튼 (허용 차이 `AD-S2-2`). */
    apple: 'Continue with Apple',
    /** Figma `179:1715` */
    email: 'Sign up with email',
    /** Figma `179:1720` · `179:1721` */
    hasAccount: 'Already have an account?',
    logIn: 'Log in',
    /** Figma `179:1722` — 동의 기록이 아니라 단순 고지다 (C-1 · C-2). */
    legalPrefix: 'By continuing you agree to our',
    legalTerms: 'Terms',
    legalConjunction: 'and',
    legalPrivacy: 'Privacy Policy',
    legalSuffix: '.',
  },

  signUp: {
    /** Figma `179:1729` */
    title: 'Create your account',
    /** Figma `179:1733` */
    sectionLabel: 'YOU',
    nameLabel: 'Your name',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    /** Figma `179:1736` */
    passwordHelper: 'At least 8 characters.',
    /** Figma `179:1746` */
    submit: 'Create account',
  },

  logIn: {
    /** Figma `179:1831` */
    title: 'Welcome back',
    /** Figma `179:1832` */
    subtitle: "Tonight's book is waiting.",
    /** Figma `179:1841` */
    divider: 'or with email',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    /** Figma `179:1843` */
    forgotPassword: 'Forgot password?',
    /** Figma `179:1844` */
    submit: 'Log in',
    /** Figma `179:1846` · `179:1847` */
    noAccount: 'New to HARU?',
    createAccount: 'Create an account',
  },

  forgotPassword: {
    title: 'Reset password',
    intro: 'Enter the email you use for HARU.',
    emailLabel: 'Email',
    submit: 'Send reset link',
    backToLogIn: 'Back to log in',
    sentTitle: 'Check your email',
    /** 계정 존재 여부를 확인해 주지 않는다 (AC-2-09). */
    sentDescription:
      'If that email is registered, a reset link is on the way. The link works for a limited time.',
  },

  resetPassword: {
    title: 'New password',
    passwordLabel: 'New password',
    confirmLabel: 'Confirm password',
    helper: 'At least 8 characters.',
    submit: 'Save new password',
    successToast: 'Password updated.',
    expiredTitle: "This link isn't active anymore",
    expiredDescription: 'Reset links expire after a while.',
    expiredAction: 'Request a new link',
  },

  password: {
    show: 'Show password',
    hide: 'Hide password',
  },

  backLabel: 'Back',

  /** 외부 문서 링크 — 새 탭 안내를 시각 숨김 텍스트로 병기한다 (§10 접근성). */
  externalHint: 'Opens in a new tab',

  validation: {
    nameRequired: 'Add the name you would like HARU to use.',
    emailRequired: 'Add the email you use for HARU.',
    emailFormat: 'Use an email address like name@example.com.',
    passwordRequired: 'Add your password.',
    passwordMinLength: 'Use at least 8 characters.',
    confirmMismatch: 'Both fields need to match.',
  },

  /** 소셜 로그인 취소 — 오류가 아니다 (AC-2-08). */
  providerCancelled: {
    title: 'That sign-in was not completed',
    description: 'You can pick another way to continue.',
  },

  /** 잘못된 자격 증명 — 계정 존재 여부를 구분해 주지 않는다. */
  credentialsMismatch: {
    title: 'That email and password did not match',
    description: 'Check both fields and try once more.',
  },
} as const;
