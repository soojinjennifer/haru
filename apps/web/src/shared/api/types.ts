/**
 * `ApiClients` — 앱이 쓰는 도메인 API Client Interface 의 집합.
 *
 * Adapter(Mock | Http) 선택은 `app/providers/ApiClientProvider.tsx` **한 곳**에서만 한다
 * (`.claude/rules/architecture.md` §4, Plan §5.2). Component·Page·Feature·Query hook 은
 * 이 타입만 보고, 어떤 Adapter 가 들어왔는지 알지 못한다 — 그래서 Mock ↔ Http 교체 시
 * UI·Feature·Query 코드가 바뀌지 않는다.
 *
 * Stage 1 은 `health` 만, Stage 2-AUTH 는 `me`, Stage 2-CONSENT 는 `consents`,
 * Stage 2-ONBOARDING 은 `onboarding` · `books` 를 추가한다 (Plan §16 D-8). 나머지 도메인
 * (auth · children · activities · library · sessions · recordings ·
 * analysis · reports · notifications · data-management) 은 해당 Stage 에서 이 타입에 추가한다.
 * 빈 stub 은 만들지 않는다.
 */
import type { ActivityApi } from './activity-api';
import type { BooksApi } from './books-api';
import type { ConsentApi } from './consent-api';
import type { HealthApi } from './health-api';
import type { HomeApi } from './home-api';
import type { LibraryApi } from './library-api';
import type { MeApi } from './me-api';
import type { OnboardingApi } from './onboarding-api';

export interface ApiClients {
  readonly health: HealthApi;
  /** Stage 2-AUTH — Route Guard 판정 데이터 (`GET /v1/me`). */
  readonly me: MeApi;
  /** Stage 2-CONSENT — 동의 문서 조회 · 동의 기록 (FR-02). */
  readonly consents: ConsentApi;
  /** Stage 2-ONBOARDING — 온보딩 상태 · 단계 저장 · 제출 (FR-03 · FR-24). */
  readonly onboarding: OnboardingApi;
  /** Stage 2-ONBOARDING — Step 3 책 검색 최소 범위 (D-17). */
  readonly books: BooksApi;
  /** Stage 3 — Home 집계 (`GET …/home`, FR-07). */
  readonly home: HomeApi;
  /** Stage 3 — Activity Card 조회·선택 (FR-07 · FR-08). */
  readonly activities: ActivityApi;
  /** Stage 3 — 서재. Home 재구현 범위는 `★ Save` 뿐이다 (API_CONTRACTS §3.7). */
  readonly library: LibraryApi;
}
