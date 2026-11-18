/**
 * `entities/child-profile` 표시 문구 — Stage 6 Spec §9.2 · §10.1 (`N6-29` · `D6-8`).
 *
 * 차트 대체 텍스트(summary)는 **copy 템플릿 + 서버 배열**(strengths · growingEdges · 결측 축)로만 조립한다.
 * 숫자·"out of 5"·"high/low" 를 말하지 않는다 — Frontend 가 점수를 말로 바꾸지 않는다 (가공 금지).
 * 진단·판정·비교 표현 0 (`rules/frontend.md` §8, Spec §10.5 금칙어).
 */
export const childProfileCopy = {
  chart: {
    /** 미관찰 축 캡션 — 시각 (`P-32`). SR 은 summary 의 *not observed yet* 으로 듣는다. */
    missingLabel: 'Not seen yet',
    /** summary 첫 구 — 온보딩(시작점) · 재방문(현재). */
    startingLead: (firstName: string) => `Starting point for ${firstName}.`,
    currentLead: (firstName: string) => `Where ${firstName} is right now.`,
    strengths: (list: string) => `What we saw most: ${list}.`,
    growingEdges: (list: string) => `Where we'll look next: ${list}.`,
    notObserved: (list: string) => `Not observed yet: ${list}.`,
  },
  highlights: {
    /** SR 전용 h2 — 시각은 SectionLabel 2개 (Spec §9.1). */
    heading: 'Strengths and next steps',
    strengthsLabel: 'WHAT WE SAW MOST',
    growingEdgesLabel: "WHERE WE'LL LOOK NEXT",
    /** 빈 묶음 — 묶음을 숨기지 않는다 (Spec §3.5). */
    empty: "We'll see more as you read together.",
  },
  persona: {
    /** 대문자는 copy 가 쓴다 (SectionLabel recipe — Spec §2.0). */
    eyebrow: (firstName: string) => `${firstName.toLocaleUpperCase('en-US')}'S STORYTIME PERSONA`,
  },
} as const;

/** 영어 목록 — `A` · `A and B` · `A, B, and C` (Spec §9.2 변형 C 예문의 Oxford comma). */
export function joinCapabilityList(labels: readonly string[]): string {
  if (labels.length <= 1) return labels[0] ?? '';
  if (labels.length === 2) return `${labels[0] ?? ''} and ${labels[1] ?? ''}`;
  return `${labels.slice(0, -1).join(', ')}, and ${labels[labels.length - 1] ?? ''}`;
}
