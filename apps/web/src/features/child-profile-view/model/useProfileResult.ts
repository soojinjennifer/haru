/**
 * 프로필 결과 화면의 데이터 상태 — Stage 6 Spec §2.1 · §2.2 · §2.7 (`D6-5` — 두 모드 모두 `GET /profile`).
 *
 * 구현은 `entities/child-profile` `useCurrentChildProfile` 이다 (`S6-E2` — 발전 역량 화면과 공유하려고 내렸다).
 * 이 feature 의 공개 이름은 그대로 둔다.
 */
export {
  useCurrentChildProfile as useProfileResult,
  type CurrentChildProfileState as ProfileResultState,
  type UseCurrentChildProfile as UseProfileResult,
} from '../../../entities/child-profile';
