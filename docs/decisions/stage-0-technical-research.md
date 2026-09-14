# Stage 0 Technical Research (2026-09-14)

Status: REFERENCE — 조사 결과이며 결정이 아니다. 결정은 `docs/ARCHITECTURE.md` §Technical Decisions 에서 CONFIRMED / RECOMMENDED / NEEDS DECISION 으로 관리한다.
Method: 공식 문서 우선 웹 조사 (document-specialist). 제3자 출처·미검증 항목은 표시함. 가격·정책은 변동 가능하므로 결정 시점에 재확인 필요.

---

## 1. Web-first + Wrapper vs RN/Expo vs Native

- Capacitor 현재 v8 (8.4.1, 2026-06-19). https://github.com/ionic-team/capacitor/blob/main/CHANGELOG.md
- Capacitor는 기존 Vite/React 코드를 재사용하고, 네이티브 플러그인으로 iOS `UIBackgroundModes: audio` + background-capable `AVAudioSession` 을 설정하면 화면 잠금 중에도 녹음 지속 가능. https://capawesome.io/docs/plugins/audio-recorder/
- Expo `expo-audio` 도 background mode를 지원하나 iOS 백그라운드 녹음은 managed workflow에서 best-effort로 기술됨.
- 별도 Native(Swift/Kotlin)는 가장 확실하지만 React 코드베이스와 이중 개발.
- 권장: Capacitor 8 + 네이티브 audio-recorder 플러그인 (모바일 빌드에서 web MediaRecorder 미사용). 신뢰도 High.

## 2. Background / Screen-lock Recording

### 2a. iOS Safari / Home Screen PWA
- 화면 잠금 또는 백그라운드 전환 시 getUserMedia/MediaRecorder 캡처가 중단됨 (2026년에도 유효).
  - https://webkit.org/blog/11353/mediarecorder-api/
  - https://developer.apple.com/forums/thread/774239 , https://developer.apple.com/forums/thread/797987
- Safari 18.4: Home Screen web app 화면 dim/lock 방지, Wake Lock 버그 수정 → 완화책일 뿐 잠금 후 녹음 지속은 불가.

### 2b. Android Chrome / PWA
- Android 9+ 백그라운드 앱의 마이크 접근 제한. PWA 예외를 확인한 출처 없음 → **미검증, 신뢰 불가로 간주**, 실기기 테스트 필요.

### 2c. iOS Native (Capacitor)
- Info.plist `UIBackgroundModes: audio`, `AVAudioSession` (예: playAndRecord), App Review 시 백그라운드 마이크 사용 사유 설명 필요 (Guideline 2.5.4 원문은 제출 시 재확인).
- 플러그인: Capawesome Audio Recorder (https://capawesome.io/docs/plugins/audio-recorder/), Cap-go `@capgo/capacitor-audio-recorder` (https://github.com/Cap-go/capacitor-audio-recorder). 둘 다 background, pause/resume, 로컬 파일 기록 지원. Capawesome Audio Session 플러그인으로 interruption 처리 (https://capawesome.io/docs/sdks/capacitor/audio-session/).

### 2d. Android Native
- Android 14+: foreground service type `microphone`, `FOREGROUND_SERVICE_MICROPHONE` 권한, 서비스 시작 시 `RECORD_AUDIO` 허용 상태 필요, 상시 알림 필수.
  - https://developer.android.com/about/versions/14/changes/fgs-types-required
  - https://developer.android.com/develop/background-work/services/fgs/service-types
- Android 15에서 FGS 동작 추가 제한. Android 16 세부사항은 미검증.
- Play Console에서 foreground service type 선언 필요. https://support.google.com/googleplay/android-developer/answer/13392821

## 3. Offline Persistence / Crash Recovery / Upload

- Web: `MediaRecorder` timeslice 청크 → OPFS 저장 + IndexedDB에 메타데이터/복구 포인터. (벤더 공식 패턴이 아닌 엔지니어링 패턴)
- Native: 30–60초 단위 파일 청크를 앱 샌드박스에 기록 (웹보다 단순하고 크래시 안전).
- Supabase Storage resumable upload = TUS. 6MB 초과 파일은 TUS 권장. signed upload URL(`createSignedUploadUrl`) 최대 24시간 유효.
  - https://supabase.com/docs/guides/storage/uploads/resumable-uploads
- 30분 세션 압축 오디오 약 15–30MB → 크기상 필수는 아니나 네트워크 단절 대응을 위해 TUS 권장.

## 4. STT Provider (아동 영어 발화 + 화자 분리)

- 어떤 벤더도 아동 음성/COPPA에 대한 공식 입장을 게시하지 않음 → 벤더에 COPPA 준수를 기대하지 말고 HARU의 동의·보관·삭제 통제로 책임을 진다.
- Deepgram: batch 약 $0.0043/min, diarization 옵션, `mip_opt_out=true` 로 모델 개선 프로그램 opt-out 필요. https://developers.deepgram.com/docs/the-deepgram-model-improvement-partnership-program
- AssemblyAI: 약 $0.37/hr + diarization 약 $0.17/hr, ZDR 경로 문서화. https://support.assemblyai.com/articles/2240096256-does-assemblyai-offer-zero-data-retention
- OpenAI gpt-4o-transcribe / whisper: 약 $0.006/min. diarization 가격은 제3자 비교 자료 → 공식 가격 재확인 필요.
- Google Chirp / AWS Transcribe / Azure: 이번 조사에서 미검증.
- 권장: Deepgram, AssemblyAI를 실제 아동 녹음 샘플로 파일럿 비교. 신뢰도 Medium. **제품/법무 결정 필요.**

## 5. AI Provider (Persona / Short Feedback / Report Narrative)

- Anthropic: ZDR은 계약 기반(영업 승인). API 고객 콘텐츠 기본 비학습. 서비스는 18세 미만 대상이 아니며 COPPA 전용 인프라 없음 → 준수 책임은 HARU.
  - https://platform.claude.com/docs/en/manage-claude/api-and-data-retention
  - 현재 모델 ID: `claude-opus-5`, `claude-sonnet-5`, `claude-fable-5-1`, `claude-haiku-4-5-20251001`
- OpenAI: 2026-08-19 frontier 모델 ZDR 제공 발표. 18세 미만/13세 미만 개인정보는 ZDR 없이 API 처리하지 말라는 가이드 존재.
  - https://developers.openai.com/api/docs/guides/safety-checks/under-18-api-guidance
- 권장: 아동 Transcript 파생 텍스트를 처리하는 Provider는 ZDR 확보 후 사용. Provider 선택은 법무·제품 결정. 신뢰도 Medium-High.

## 6. Push Notification

- iOS PWA web push는 iOS 16.4+ 홈 화면 설치 PWA에서만 동작. Capacitor 앱에서는 네이티브 APNs/FCM이 더 안정적.
- OneSignal 공식 Capacitor 플러그인(FCM + APNs + Web). https://documentation.onesignal.com/docs/en/capacitor-sdk-setup
- 권장: OneSignal (MVP 속도), 약관·데이터 처리 조건이 문제되면 FCM/APNs 직접 연동. 신뢰도 High.
- 주의(Orchestrator 추가): 알림 문구에 아이 이름 등 PII가 포함되면 Push Provider가 아동 개인정보를 처리하게 되므로 개인정보 처리 범위 검토 필요.

## 7. PDF 생성 위치

- Puppeteer/Playwright는 Chromium 인스턴스당 약 200–500MB (제3자 벤치마크) → Render Starter(512MB)에서 OOM 위험.
- `@react-pdf/renderer` 서버 사이드: 브라우저 불필요, 가벼움. 대신 레이아웃을 React-PDF primitive로 별도 작성.
- 권장: API/Worker에서 `@react-pdf/renderer`. 신뢰도 Medium.

## 8. Raw Audio 90일 자동 삭제

- Supabase Storage에는 네이티브 TTL/lifecycle 정책이 없음. https://github.com/orgs/supabase/discussions/20171
- `storage.objects` row를 SQL로 지우면 실제 파일이 남음 → Storage API delete 사용 필수. https://supabase.com/docs/guides/storage/management/delete-objects
- 권장: `recordings.expires_at` 기준 일일 Cron(Render Cron Job 또는 pg_cron → Edge Function)이 Storage API로 삭제 + 메타데이터 갱신 + audit log. 신뢰도 High.

## 9. Apple / Google Auth

- 네이티브 로그인 → Supabase `signInWithIdToken`. nonce: Supabase에는 raw, Provider SDK에는 SHA-256 해시.
  - https://supabase.com/docs/guides/auth/social-login/auth-google
- Apple Guideline 4.8: 2024년 개정으로 Sign in with Apple이 유일한 방식은 아니나, 개인정보 기준 충족 로그인 옵션 필요. PRD가 Apple/Google 둘 다 요구하므로 둘 다 제공.
- 신뢰도 High (제출 시 가이드라인 원문 재확인).

## 10. Trial → Account 전환

- Supabase Anonymous Sign-in: 실제 `auth.users` row 생성, JWT `is_anonymous: true`. `linkIdentity()`(OAuth) 또는 `updateUser`(email/password)로 전환 시 동일 user id 유지 → 데이터 소유권 이전 불필요.
  - https://supabase.com/docs/guides/auth/auth-anonymous
- RLS에서 `auth.jwt() ->> 'is_anonymous'` 로 기능 제한. Manual identity linking 설정 필요.
- 익명 계정 남용 방지(CAPTCHA 등)는 자체 설계 필요.
- 주의(Orchestrator 추가): COPPA 관점에서 보호자 동의 전 익명 Trial 단계에서 아동 정보를 얼마나 수집할지 법무 검토 필요. **결정 필요.**

## 11. Deployment Topology (~100 beta families)

- 옵션: (a) Render Web Service + Background Worker + Cron Job, (b) Supabase pgmq + pg_cron + Edge Functions, (c) pg-boss(Postgres 기반) 또는 BullMQ(Redis) on Render Worker.
- Render Background Worker Starter $7/mo(512MB), Cron Job 초 단위 과금·최대 12시간.
  - https://render.com/docs/background-workers , https://render.com/docs/cronjobs
- 권장: Render Web Service(API) + Render Background Worker(pg-boss, Supabase Postgres 사용) + Render Cron Job(retention, report 스케줄). 신뢰도 Medium.

## 12. COPPA (FTC 2025 개정 Rule)

- Federal Register 게시 2025-04-22, 시행 2025-06-23, 일반 준수 기한 2026-04-22 → **HARU 출시 시점에는 개정 Rule 전면 적용.**
  - https://www.federalregister.gov/documents/2025/04/22/2025-05904/childrens-online-privacy-protection-rule
- 핵심:
  - Verifiable Parental Consent(VPC) 방법 확대 (knowledge-based authentication, 신분증+얼굴 매칭, text-plus 등). 단순 체크박스는 VPC로 불충분할 수 있음.
  - 수집·이용 동의와 **제3자 제공 동의를 분리**해야 함 (서비스에 필수적인 제공 제외).
  - **서면 Data Retention Policy** (삭제 기한 명시) 필수, 개인정보처리방침에 반영.
  - **서면 Information Security Program** 필수 (담당자, 연간 위험평가, 벤더 보안 약정).
  - 음성 파일 예외(2017 FTC 정책)는 즉시 삭제 전제 → **HARU(90일 보관)에는 적용되지 않음.**
- 양육자 대상 앱이라도 아이 음성을 녹음하면 아동으로부터 개인정보를 수집하는 것으로 간주됨.
- **출시 전 미국 변호사 검토 필수.**

---

## Summary

| # | 권장 | 신뢰도 | 결정 필요 |
|---|---|---|---|
| 1 | Capacitor 8 + Vite/React, 모바일은 네이티브 녹음 플러그인 | High | 승인 필요 (Stack 확장) |
| 2 | 모바일 웹/PWA 백그라운드 녹음에 의존 금지, Android 실기기 검증 | Medium | No |
| 3 | 청크 로컬 저장 + TUS resumable upload | High | No |
| 4 | Deepgram / AssemblyAI 파일럿 비교 | Medium | Yes |
| 5 | ZDR 확보한 Provider 사용 | Medium-High | Yes |
| 6 | OneSignal (Capacitor) | High | Yes (벤더 데이터 처리) |
| 7 | `@react-pdf/renderer` 서버 사이드 | Medium | No |
| 8 | Cron + Storage delete API | High | No |
| 9 | `signInWithIdToken` + Apple/Google 네이티브 | High | No |
| 10 | Anonymous sign-in + linkIdentity | High | Yes (COPPA·남용) |
| 11 | Render API + Worker(pg-boss) + Cron | Medium | No |
| 12 | 개정 COPPA 전면 준수, VPC 방식 결정 | High | Yes (법무) |
