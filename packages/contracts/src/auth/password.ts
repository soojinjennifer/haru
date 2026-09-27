/**
 * 비밀번호 최소 길이 — `docs/API_CONTRACTS.md` §3.4 (`z.string().min(8)`).
 *
 * 가입(`SignUpWithEmailInput`)과 재설정(`UpdatePasswordInput`)이 같은 값을 쓴다.
 * 화면의 안내 문구도 이 상수를 참조해 규칙이 어긋나지 않게 한다.
 */
export const PASSWORD_MIN_LENGTH = 8;
