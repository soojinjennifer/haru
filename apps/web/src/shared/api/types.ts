/**
 * `ApiClients` — 앱이 쓰는 도메인 API Client Interface 의 집합.
 *
 * Adapter(Mock | Http) 선택은 `app/providers/ApiClientProvider.tsx` **한 곳**에서만 한다
 * (`.claude/rules/architecture.md` §4, Plan §5.2). Component·Page·Feature·Query hook 은
 * 이 타입만 보고, 어떤 Adapter 가 들어왔는지 알지 못한다 — 그래서 Mock ↔ Http 교체 시
 * UI·Feature·Query 코드가 바뀌지 않는다.
 *
 * Stage 1 은 `health` 만 구현한다 (Plan §16 D-8). 나머지 11개 도메인
 * (auth · children · onboarding · activities · library · sessions · recordings ·
 * analysis · reports · notifications · data-management) 은 해당 Stage 에서 이 타입에 추가한다.
 * 빈 stub 은 만들지 않는다.
 */
import type { HealthApi } from './health-api';

export interface ApiClients {
  readonly health: HealthApi;
}
