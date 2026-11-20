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
import type { AnalysisApi } from './analysis-api';
import type { BooksApi } from './books-api';
import type { ChildrenApi } from './children-api';
import type { ConsentApi } from './consent-api';
import type { HealthApi } from './health-api';
import type { HighlightClipApi } from './highlight-clip-api';
import type { HomeApi } from './home-api';
import type { LibraryApi } from './library-api';
import type { MeApi } from './me-api';
import type { NotificationApi } from './notification-api';
import type { OnboardingApi } from './onboarding-api';
import type { ProgressApi } from './progress-api';
import type { RecordingApi } from './recording-api';
import type { ReflectionApi } from './reflection-api';
import type { ReportApi } from './report-api';
import type { ReportPdfApi } from './report-pdf-api';
import type { SessionApi } from './session-api';
import type { UploadTransport } from './upload-transport';

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
  /** Stage 4 — Storytime Session 생성 · 전이 · 조회 (FR-09 · FR-10 · FR-19). */
  readonly sessions: SessionApi;
  /** Stage 4 — Recording Upload Contract (FR-14, `API_CONTRACTS` §5.1.1). */
  readonly recordings: RecordingApi;
  /**
   * Stage 4 — part 바이트 전송 (`API_CONTRACTS` §5.1.1). HTTP API 가 아니지만 `recordings` 와
   * **같은 scenario store · 같은 서버 상태**를 공유해야 하므로 같은 선택 지점에서 함께 만든다.
   */
  readonly uploadTransport: UploadTransport;
  /** Stage 4 (이월 `QA-3-001`) — 알림 설정 · 푸시 기기 등록. */
  readonly notifications: NotificationApi;
  /** Stage 5 — 세션 회고 제출 (FR-12, `API_CONTRACTS` §3.10). */
  readonly reflections: ReflectionApi;
  /** Stage 5 — 분석 상태 · 짧은 피드백 조회 (FR-13 · FR-14, `API_CONTRACTS` §3.11). */
  readonly analysis: AnalysisApi;
  /**
   * Stage 6 — 아이 프로필 조회 · 아이 정보 수정 · 발전 역량 · 설문 재응답
   * (FR-04~06 · FR-15 · §7.8, `API_CONTRACTS` Stage 6 절). 히스토리 목록 메서드는 없다 (`N6-12`).
   */
  readonly children: ChildrenApi;
  /** Stage 7 — 주간 Progress (`GET …/progress/weekly`, C7-1 · Figma `31:102`). */
  readonly progress: ProgressApi;
  /** Stage 7 — 4주 리포트 overview · 목록 · 상세 · 열람 기록 (FR-16 · §2.3, C7-2~C7-4 · C7-7). */
  readonly reports: ReportApi;
  /** Stage 7 — 리포트 PDF 요청 · 상태 (FR-17, C7-6). */
  readonly reportPdf: ReportPdfApi;
  /** Stage 7 — 하이라이트 클립 재생 URL (FR-18, C7-8). */
  readonly highlightClips: HighlightClipApi;
}
