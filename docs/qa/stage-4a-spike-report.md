# Stage 4a `S4-A` — Web 녹음 spike 측정 리포트

Status: **MEASURED (2026-10-14, development-agent)** · 작업 단위 `S4-A` (Plan `docs/plans/stage-4-plan.md` §16.1)
대상 결정: **`C4-OPEN-1`**(`partNo` 상한) · **`C4-OPEN-2`**(`mimeType` 집합) · **AC-4-108**(Web 백그라운드 한계 측정) · **`N4-09`**(로컬 보관 상한 판단 근거)

> **이 문서는 측정 기록이다. 결론 중 contract·설계를 바꾸는 항목은 전부 "승인 필요" 로 표시했다** —
> `rules/workflow.md` §2. spike 가 스스로 contract 를 고치지 않았다 (`packages/contracts` 변경 0건).
>
> ⚠️ **`rules/frontend.md` §6-2 ⑤**: *"'측정했다' 는 서술 자체는 증거가 아니다 — 무엇을 어떻게 쟀는지가 증거다."*
> 그래서 항목마다 **측정 환경 · 측정 방법 · 원시 수치**를 함께 적었고, **재지 못한 것은 재지 못했다고 적었다**.
> 잴 수 없었던 항목(⑥)은 **무엇을 몇 가지 방법으로 시도해서 왜 실패했는지**를 남겼다.

---

## 0. 요약 — 7개 항목 판정

| # | 항목 | 판정 | 한 줄 결론 |
|---|---|---|---|
| ① | `MediaRecorder` timeslice 청크 | ✅ **측정됨 (Chromium)** | 된다. 1000ms 요청 → **median 1018.9ms** 간격으로 **정확히 1개씩**. 30분이면 **약 1766개** |
| ② | 청크 → OPFS/IndexedDB 영속 | ✅ **측정됨 (Chromium)** | 된다. 청크당 **OPFS median 3.7ms + IndexedDB median 0.5ms**. 1000ms 예산의 **0.4%** — 녹음을 끊지 않는다 |
| ③ | 크래시 복구 | ✅ **측정됨 (Chromium)** | 된다. 탭 강제 종료 후 **8/8 청크 복원 → 8.1초로 디코드**. ⚠️ **첫 청크를 잃으면 전체가 재생 불가** · 꼬리가 잘려도(40% 남김) **7.44초까지 살아난다** |
| ④ | 브라우저별 실제 `mimeType` | ✅ **측정됨 (Chromium + WebKit)** | **Chromium `audio/webm;codecs=opus`** / **WebKit `audio/mp4; codecs=mp4a.40.2`**(⚠️ **세미콜론 뒤 공백**). `isTypeSupported` 는 **못 믿는다** |
| ⑤ | Web 인터럽션 3종 | ⚠️ **부분 측정** | `visibilitychange` 리스너 = 등록됨(발생은 ⑥ 사유로 미측정) · `devicechange` = **발생시킬 수 없어 미측정** · `MediaStreamTrack` 종료 = **측정됨** (`ended` **발생 안 함**, 녹음은 **즉시 멈추고 recorder 가 `inactive` 로 간다**) |
| ⑥ | 백그라운드 / 탭 비활성 중 청크 수신 | ⛔ **측정 불가 (NOT MEASURED)** | **4가지 방법으로 시도했고 네 번 다 페이지를 `hidden` 으로 만들지 못했다.** 이 환경에서는 잴 수 없다 — **실기기 수동 측정이 필요**하다 (§7) |
| ⑦ | OPFS 할당량 | ✅ **측정됨** | 30분 녹음 **약 28.7MB** vs 할당량 **10.7GB**(Chromium) / **20.6GB**(WebKit) → **0.27% / 0.14%**. 여유는 충분. ⚠️ `persisted()` 는 **false**(브라우저가 비울 수 있다) |

**핵심 답 3개**

1. **청크 녹음은 가능하다 — 단 "조건부" 다.** Chromium 에서는 **조건 없이 된다**(①②③ 전부 실측). **WebKit 은 이 환경에서 소리를 한 바이트도 못 만들어** 청크 흐름을 재지 못했다 — WebKit 의 청크 가능 여부는 **미확정**이고, iOS 가 WebKit 이므로 **실기기 측정 전에는 확정할 수 없다** (§4·§7).
2. **`C4-OPEN-1`**: `partNo ≤ 20` 은 **`ARCHITECTURE §10.5-3` 의 part 정의대로라면 안전하다.** 다만 **청크 수(30분 ≈ 1766)를 `partNo` 에 매핑하면 즉시 터진다** — 그 혼동을 막는 문장이 contract 에 있어야 한다 (§5).
3. **`C4-OPEN-2`**: 현재 enum `['audio/webm','audio/mp4','audio/aac','audio/m4a']` 은 **실측과 4항목 전부 어긋난다.** 실제로 나오는 문자열은 **파라미터가 붙어 있고 엔진마다 공백까지 다르다**. `audio/aac`·`audio/m4a` 는 **두 엔진 모두 생성자가 던진다**(죽은 값) (§6).

---

## 1. 측정 환경

| 항목 | 값 | 출처 |
|---|---|---|
| OS | **macOS 26.5 (25F71)**, darwin arm64 | `sw_vers` · `process.platform` |
| Node | **v24.21.0** | `process.version` |
| Playwright | **1.63.0** | `npx playwright --version` |
| Chromium | **153.0.8010.12** (`chromium-1243`, Playwright 번들 · `chrome-headless-shell`) | `context.browser().version()` · UA `HeadlessChrome/153.0.8010.12` |
| WebKit | **26.6** (`webkit-2359`, Playwright 번들) · UA `AppleWebKit/605.1.15 … Version/26.6` | 〃 |
| 하드웨어 동시성 | 8 | `navigator.hardwareConcurrency` |
| 대상 | dev 서버 `http://127.0.0.1:5173/__dev/ui/recording-spike` | — |
| 측정 시각 | **2026-10-13T15:59:03Z** (최종 회차, 소요 **218초**) | 드라이버 출력 |
| 회차 | 같은 측정을 **3회** 돌려 수치 재현성을 확인했다 (§8.1) | — |

**측정하지 못한 환경** (`rules/qa.md` 상 `NOT VERIFIED` 대상)

| 환경 | 왜 못 썼는가 |
|---|---|
| **실제 Safari.app** | Playwright 로 구동할 수 없다. AppleScript 경로도 막혔다 — `osascript` 가 **AppleEvent 시간 초과(-1712)** 로 거부된다(실측, §4.3) |
| **실제 Google Chrome.app** | 설치되어 있고 Playwright `channel: 'chrome'` 로 띄우는 데까지는 성공했지만 **오디오 클럭이 같은 이유로 멈춰 있어**(§2.1) 측정에 쓸 수 없었다 |
| **Firefox** | Playwright 브라우저가 설치되어 있지 않다 (`~/Library/Caches/ms-playwright` 에 `chromium-1243`·`webkit-2359` 만 있다) |
| **iOS Safari 실기기** | 사람이 기기에서 해야 한다. 절차는 §7 |
| **Android 모바일 Web** | 기기 없음 (`D4-4`) → Plan `N4-21` 그대로 |

### 1.1 ⭐ 이 환경의 치명적 제약 — 오디오 장치가 없다

**브라우저가 오디오 출력 장치를 열 수 없다.** 그래서 `AudioContext` 의 렌더 루프가 **한 quantum(256프레임 = 5.33ms)만 돌고 멈춘다**. 실측:

```
AudioContext.state = 'running'   ← 상태는 정상이라고 한다
currentTime 1초 뒤 증가량 = 0.0053s   ← 실제로는 멈춰 있다 (= baseLatency 와 같은 값)
→ 인코더에 샘플이 안 들어간다
→ dataavailable 이 stop() 때 size 0 으로 단 1번만 온다
```

이것이 처음 3회차 측정을 전부 **거짓 음성(false negative)** 으로 만들었다. *"timeslice 청크가 안 온다"* 는 결과는 **`MediaRecorder` 의 거동이 아니라 소리 원천이 멈춘 것**이었다.

**Chromium 해결**: 실행 인자 **`--disable-audio-output`** 을 주면 타이머로 구동되는 널 싱크를 쓰게 되어 클럭이 돈다.

| 인자 | `AudioContext` 1초 증가량 | 청크 (1000ms timeslice, 4.3초) |
|---|---|---|
| 없음 | **0.0053s** | `[0]` — stop 때 0바이트 1개 |
| `--disable-audio-output` | **1.0080s** | `[15618, 16438, 16438, 16438, 3879]` — 1024ms 간격 |

**WebKit 해결책 없음**: Chromium 인자를 받지 않고, `AudioContext` 증가량은 **0.0000s**, `HTMLMediaElement.captureStream()` **미지원**, `getUserMedia` **`NotAllowedError`**. → **WebKit 은 소리 원천을 전혀 만들 수 없다.**

**마이크는 쓰지 않았다** (의도 + 환경 제약 둘 다). `--use-fake-device-for-media-stream` 을 줘서 가짜 입력 장치 3개가 `enumerateDevices()` 에 뜨고 `navigator.permissions.query({name:'microphone'})` 가 **`granted`** 인데도, `getUserMedia({audio:true})` 가 **거부가 아니라 무응답**이다(8초 상한 초과). 사람·아동 음성은 **한 번도 녹음하지 않았다** — 소리 원천은 전부 페이지가 합성한 **440Hz 사인파**다.

> ⚠️ **순서가 결과를 바꾼 사례**: 무응답으로 끝난 `getUserMedia` 는 그 뒤에 만든 `AudioContext` 까지 멈추게 한다. 마이크 단계를 크래시 복구 **앞**에 두었을 때 복구 측정의 청크가 9초 동안 **0개**로 나왔고, 마이크 단계를 **맨 뒤로 옮기자 8개**가 나왔다. 드라이버는 이 순서를 코드에 박아 두었다 (`recording-spike-measure.mjs` — 해당 주석).

---

## 2. ① `MediaRecorder` timeslice 청크

**측정 방법**: `apps/web/src/dev/recording-spike/spike-core.ts` 의 `startRun({timesliceMs, source:'synthetic'})` → **15초 유지** → `stopRun()`. 각 `dataavailable` 마다 `performance.now()` 차 · `BlobEvent.data.size` · `BlobEvent.data.type` · 그 순간의 `document.visibilityState` · `AudioContext.currentTime` 을 기록했다. timeslice 3종을 같은 페이지에서 순차로 돌리고 사이사이 저장소를 비웠다.

### 2.1 Chromium (`--disable-audio-output`) — **된다**

| 요청 timeslice | 청크 수 (15초) | 첫 청크 | 간격 min/median/max | 청크 크기 median | 0바이트 청크 |
|---|---|---|---|---|---|
| **1000ms** | **15개** | **1184.0ms** | 729.2 / **1018.9** / 1023.9 ms | **16,438 B** | 0 |
| **3000ms** | **5개** | **3006.9ms** | 2879.9 / **3055.4** / 3062.2 ms | **48,316 B** | 0 |
| **5000ms** | **3개** | **5043.5ms** | 4922.7 / **5041.1** / 5041.1 ms | **80,340 B** | 0 |

읽은 사실:

1. **주기성은 신뢰할 수 있다.** 요청 대비 **+1.9%**(1000→1018.9) 느리고 지터가 작다. `min` 이 낮게 찍힌 것은 **`stop()` 이 만든 마지막 조각**이다(부분 구간).
2. **첫 청크 지연 = 요청 timeslice + α.** 1000ms 요청에서 **1184ms**. ⚠️ 이 값이 **AC-4-50(녹음 시작 지연 ≤ 1s)과 다른 축**임을 혼동하면 안 된다 — 녹음은 `start()` 즉시 시작되고, 1184ms 는 **"첫 바이트가 손에 들어오는 시각"** 이다. **AC-4-50 은 녹음 시작**이고, 첫 청크 지연은 **크래시 시 잃는 양**과 관계된다.
3. **비트레이트 = 약 131.5 kbps**(16,438 B/s). `audioBitsPerSecond` 를 지정하지 않은 기본값이다.
4. **30분(1800초) 환산**
   - 1000ms timeslice → **약 1766개** 청크 (1800초 ÷ 1.0189초)
   - 3000ms → 약 589개 · 5000ms → 약 357개
   - 총 바이트 **약 28.7MB** (§7의 할당량 계산과 같은 값)

### 2.2 WebKit — **미확정 (청크 흐름을 재지 못했다)**

세 timeslice 모두 **청크 1개 · 크기 0바이트 · `stop()` 시각(15.0초)에 도착**. `AudioContext.currentTime` 증가량 **0.0000s** 이므로 이것은 **WebKit 의 `MediaRecorder` 거동이 아니라 소리 원천이 없는 상태**다 (§1.1). **WebKit 의 timeslice 청크 가능 여부는 이 측정으로 판단할 수 없다.**

단 **포맷 협상은 소리 없이도 관측된다** — 그 결과가 §4다.

---

## 3. ② 청크 → OPFS / IndexedDB 영속

**측정 방법**: `spike-store.ts`. 모델은 `ARCHITECTURE §10.5-1` 그대로 — **바이트는 OPFS 파일 1청크 = 1파일**(`haru-spike/<runId>/chunk-0001.bin`), **색인(run·chunk 레코드)은 IndexedDB**. `dataavailable` 핸들러는 **await 하지 않고** 쓰기를 직렬 체인에 이어 붙인다(쓰기 지연이 청크 수신을 막는지 보려면 핸들러가 멈추면 안 된다). 계층별로 `performance.now()` 차를 따로 쟀다.

### 3.1 저장소 능력 (양 엔진 동일)

| 능력 | Chromium | WebKit |
|---|---|---|
| `navigator.storage.getDirectory()` | ✅ | ✅ |
| `FileSystemFileHandle.createWritable()` **창 컨텍스트에서 실제 쓰기 성공** | ✅ | ✅ |
| `createSyncAccessHandle()` 창 컨텍스트 | ❌ (Worker 전용 — 정상) | ❌ (〃) |
| IndexedDB | ✅ | ✅ |
| 실제 바이트 저장 계층 | **OPFS** | **OPFS** |

> ⭐ **설계에 영향**: `createWritable()` 이 **양 엔진 모두 창 컨텍스트에서 동작**한다. `S4-E` 의 `LocalRecordingStore` 는 **Worker 없이** 만들 수 있다. 능력 탐지는 프로토타입이 아니라 **실제 핸들에 써 보는 것**이어야 한다(프로토타입에 메서드가 있어도 던지는 경우가 있다) — `spike-store.ts` 의 `probeOpfs()` 가 그 방식이다.

### 3.2 쓰기 지연 (Chromium, 청크 전수)

| timeslice | 청크 수 | OPFS min/median/max | IndexedDB min/median/max | 1청크 총 쓰기(median) | timeslice 예산 대비 |
|---|---|---|---|---|---|
| 1000ms | 15/15 | 2.4 / **3.7** / 4.2 ms | 0.2 / **0.5** / 0.7 ms | **4.2ms** | **0.42%** |
| 3000ms | 5/5 | 1.4 / **4.0** / 4.3 ms | 0.2 / **0.5** / 0.6 ms | 4.5ms | 0.15% |
| 5000ms | 3/3 | 3.9 / **5.3** / 6.6 ms | 0.3 / **0.4** / 0.5 ms | 5.7ms | 0.11% |

**답: 청크를 받는 즉시 저장된다. 쓰기 지연은 녹음을 끊지 않는다.** 누락 0건(청크 수 = 쓰기 수), 간격 지터도 쓰기와 상관이 보이지 않는다(§2.1 의 간격 분산이 쓰기 시간보다 크다).

⚠️ **한계**: 이 수치는 **16KB 청크 · 빈 저장소 · SSD** 기준이다. 30분이면 **파일 1766개**가 한 디렉토리에 쌓인다 — 파일 수가 늘었을 때의 `getFileHandle` 비용은 **재지 않았다**. `S4-E` 에서 **timeslice 를 5000ms 로 두면 파일이 357개**로 줄어 이 위험이 1/5 이 된다(§8.3 권고).

---

## 4. ③ 크래시 복구

**측정 방법**: persistent context(프로필 디렉토리 고정)로 띄운 뒤 ① 저장소를 비우고 ② 1000ms timeslice 로 **9초** 녹음하고 ③ **`page.close({runBeforeUnload:false})` 로 탭을 정리 없이 닫는다** — `MediaRecorder.stop()` 을 **부르지 않는다**. ④ 같은 origin 의 새 탭을 열어 IndexedDB 색인대로 OPFS 바이트를 되읽고 ⑤ 이어 붙인 Blob 을 **`AudioContext.decodeAudioData`** 와 **`<audio>` 메타데이터** 두 경로로 디코드한다.

### 4.1 Chromium 결과

| 측정 | 값 |
|---|---|
| 죽기 전 핸들러가 본 청크 | **8개** |
| 죽은 뒤 되읽은 청크 | **8개** (유실 0) |
| 복원에 쓴 컨테이너 타입 | `audio/webm;codecs=opus` (청크가 적어 둔 값) |
| run 레코드의 `closed` | `false` → **미완료 레코드로 식별된다** (`ARCHITECTURE §10.5-2` 의 `recovering` 판정 근거가 실제로 작동한다) |
| **전체 이어 붙임 → `decodeAudioData`** | ✅ **8.1초** |
| **첫 청크를 뺀 경우** | ⛔ **`EncodingError: Unable to decode audio data`** |
| **마지막 청크만** | ⛔ **`EncodingError`** |
| **마지막 청크를 40%만 남긴 경우** | ✅ **7.44초** (= 마지막 청크 약 0.66초만 잃는다) |

읽은 사실:

1. **복구는 된다.** 저장된 청크만으로 **재생 가능한 파일이 복원된다**.
2. **9초 녹음 → 8.1초 복원.** 잃은 것은 **진행 중이던 timeslice 1개**(≈0.9초)다. **timeslice 길이가 곧 크래시 시 최대 손실량**이다 — 5000ms 로 늘리면 파일 수는 1/5 이 되지만 **최악 손실이 5초**가 된다. 이것이 §8.3 의 교환 관계다.
3. ⭐ **첫 청크는 특별하다.** WebM 컨테이너 헤더가 첫 청크에만 있어서, **첫 청크를 잃으면 뒤가 전부 멀쩡해도 전체가 재생 불가**다. `S4-E` 의 `LocalRecordingStore` 는 **첫 청크를 특별히 보호**해야 한다(별도 복제 또는 쓰기 확인 후 녹음 진행).
4. ⭐ **꼬리는 관대하다.** 쓰기 도중 전원이 끊겨 마지막 파일이 잘려 있어도 **앞부분이 살아난다**. 즉 **"부분 파일을 버리는" 복구 로직을 만들면 안 된다** — 잘린 채로 이어 붙이는 쪽이 더 많이 건진다.
5. **`<audio>` 경로**: `media error code=4` 로 메타데이터를 못 읽는 경우가 있다(이어 붙인 WebM 은 탐색 불가 스트림). **복구 성공 판정에 `<audio>.duration` 을 쓰면 안 된다** — `decodeAudioData` 를 쓴다.

### 4.2 WebKit 결과 — **미확정**

청크가 0개(소리 원천 없음, §1.1)라 복구할 바이트가 없었다. `decodeAudioData` 가 `EncodingError: Decoding failed` 를 던진 것은 **빈 입력** 때문이며 WebKit 의 복구 능력과 무관하다.

### 4.3 더 해 본 것 (전부 실패 — 기록용)

| 시도 | 결과 |
|---|---|
| headed Chromium (번들) | 오디오 클럭 **0.0053s** 그대로 |
| `ignoreDefaultArgs: ['--mute-audio']` | 그대로 |
| `--disable-features=AudioServiceOutOfProcess` | 그대로 |
| `HTMLMediaElement.captureStream()` (WAV 를 페이지에서 합성 → `<audio>` 재생) | **Chromium + `--disable-audio-output` 에서는 성공**(청크 흐름 확인) · `--disable-audio-output` 없으면 `el.currentTime` 이 0.021s 에서 멈춘다 · **WebKit 은 `captureStream` 미지원** |
| **실제 Google Chrome.app** (`channel: 'chrome'`, headed) | 띄우는 데 성공, 오디오 클럭 **0.0053s** → 청크 0개 |
| `osascript` 로 Chrome 창 최소화 | **AppleEvent 시간 초과(-1712)** — 이 환경에서 Apple Events 자동화가 거부된다. `System Events` 의 `AXMinimized` 경로도 같은 오류 |

---

## 5. ④ 브라우저별 실제 `mimeType` — `C4-OPEN-2` 의 답

**측정 방법**: `isTypeSupported` 를 믿지 않는다. 요청값 6종에 대해 **① `isTypeSupported` ② 생성 직후 `recorder.mimeType` ③ `start()` 후 `recorder.mimeType` ④ 실제 `BlobEvent.data.type` ⑤ blob 크기**를 **모두 따로** 기록했다. 소리가 없어도 포맷 협상은 관측된다.

### 5.1 `isTypeSupported` 매트릭스 (양 엔진 **완전히 동일**)

| 질의 | Chromium | WebKit |
|---|---|---|
| `audio/webm` | ✅ | ✅ |
| `audio/webm;codecs=opus` | ✅ | ✅ |
| `audio/mp4` | ✅ | ✅ |
| `audio/mp4;codecs=opus` | ✅ | ✅ |
| `audio/mp4;codecs=mp4a.40.2` | ✅ | ✅ |
| `audio/webm;codecs=vorbis` · `audio/ogg` · `audio/ogg;codecs=opus` · `audio/aac` · `audio/m4a` · `audio/x-m4a` · `audio/mpeg` · `audio/wav` | ❌ | ❌ |

### 5.2 ⭐ 실제로 생성된 Blob 의 `type` (= contract 가 받는 값)

| 요청값 | Chromium `BlobEvent.data.type` | 크기 | WebKit `BlobEvent.data.type` | 크기 |
|---|---|---|---|---|
| **(지정 안 함)** | **`audio/webm;codecs=opus`** | 15,618 B | **`audio/mp4; codecs=mp4a.40.2`** | 0 B |
| `audio/webm` | `audio/webm;codecs=opus` | 15,618 B | `audio/webm; codecs=opus` | **5 B** |
| `audio/webm;codecs=opus` | `audio/webm;codecs=opus` | 15,618 B | `audio/webm; codecs=opus` | **5 B** |
| `audio/mp4` | **`audio/mp4;codecs=opus`** | 641 B | `audio/mp4; codecs=mp4a.40.2` | 0 B |
| `audio/mp4;codecs=mp4a.40.2` | `audio/mp4;codecs=mp4a.40.2` | 667 B | `audio/mp4; codecs=mp4a.40.2` | 0 B |
| `audio/aac` | ⛔ `NotSupportedError: Failed to construct 'MediaRecorder': … (audio/aac) is not supported.` | — | ⛔ `NotSupportedError: mimeType is not supported` | — |

### 5.3 읽은 사실 — 현재 contract enum 과 4가지가 어긋난다

현재 값 (`docs/API_CONTRACTS.md` :244): `z.enum(['audio/webm', 'audio/mp4', 'audio/aac', 'audio/m4a'])`

1. ⛔ **`audio/webm` · `audio/mp4` 는 그대로 나오지 않는다.** 요청해도 엔진이 **파라미터를 붙여 정규화**한다. 두 값은 **실측에서 한 번도 Blob 의 type 으로 등장하지 않았다.**
2. ⛔ **`audio/aac` · `audio/m4a` 는 죽은 값이다.** 두 엔진 모두 **생성자가 던진다**. Web 에서는 절대 생기지 않는다.
3. ⛔ **WebKit 은 세미콜론 뒤에 공백을 넣는다** — `audio/mp4; codecs=mp4a.40.2`. Chromium 은 넣지 않는다. **문자열 동일성 비교가 엔진마다 깨진다.**
4. ⚠️ **`isTypeSupported` 로 enum 을 닫으면 틀린다.** WebKit 은 `audio/webm` 을 **"지원한다"고 답하면서** 기본값으로 **mp4** 를 고르고, webm 을 명시 요청하면 **5바이트짜리 쓰레기**를 만든다. **권위 있는 값은 `BlobEvent.data.type` 하나뿐**이다.

### 5.4 추가 사실 — `recorder.mimeType` 을 `start()` 직후에 읽으면 안 된다

| 읽는 시점 | Chromium | WebKit |
|---|---|---|
| 생성 직후 (요청값 없음) | `''` | `''` |
| **`start()` 직후 동기적으로** | **`''`** (드라이버 측정) | **`''`** (〃) |
| 첫 `dataavailable` / `stop()` 이후 | `audio/webm;codecs=opus` | `audio/mp4; codecs=mp4a.40.2` |

→ `S4-D`/`S4-E` 는 **컨테이너 타입을 첫 청크에서 확정**해야 한다. 이 spike 도 처음에 `start()` 직후 값을 저장했다가 **복구 시 빈 문자열로 Blob 을 만들어 디코드가 실패**했고, **청크 레코드에 `blobType` 을 넣어** 고쳤다 (`spike-store.ts` `ChunkRecord.blobType` 주석).

### 5.5 → `C4-OPEN-2` 권고 (**승인 필요** — contract 변경)

> `D4-1` 주의사항 유지: **enum 을 Web 값으로 닫지 않는다** (후속 네이티브 단계가 AAC 등을 추가할 수 있다).

**권고 A (추천)** — `mimeType` 필드를 **`BlobEvent.data.type` 원문 문자열**로 받고(정규화하지 않음), **별도 `container` enum**(`webm` | `mp4`)을 둔다. 검증은 enum 이 아니라 **정규화 후 base type 검사**(`;` 앞을 잘라 `trim()` → `audio/webm` | `audio/mp4`). 근거: §5.3-③ 의 공백 차이를 Frontend 가 흡수하고, Backend 는 원문을 그대로 보관해 재생·분석 시 코덱 정보를 잃지 않는다.

**권고 B** — enum 을 **실측된 전체 문자열 4종**(`audio/webm;codecs=opus` · `audio/webm; codecs=opus` · `audio/mp4; codecs=mp4a.40.2` · `audio/mp4;codecs=opus`)으로 바꾼다. **반대 사유**: 엔진 버전이 바뀌면 또 깨진다. 공백 변종을 enum 에 적는 것은 계약으로서 취약하다.

어느 쪽이든 **`audio/aac` · `audio/m4a` 제거**가 전제다(죽은 값). ⚠️ 단 `D4-1` 주의에 따라 **후속 네이티브 단계에서 추가될 수 있음을 Handoff 에 명시**한다.

---

## 6. ⑤ Web 인터럽션 3종

### 6.1 `MediaStreamTrack` 종료 — ✅ 측정됨 (Chromium)

**측정 방법**: 1000ms timeslice 로 4초 녹음 → `track.stop()` 으로 트랙을 끊고 → **6초 더 둔다** → `stopRun()`. ⚠️ **장치 물리 탈착을 자동화로 만들 수 없으므로 이것은 대리 측정**이다.

| 측정 | 값 |
|---|---|
| 끊기 전 청크 | **3개** |
| 끊은 직후 `track.readyState` | **`ended`** |
| 끊은 직후 `recorder.state` | **`recording`** |
| 끊은 뒤 6초 동안 도착한 청크 | **1개** (= 종료 조각) |
| **`ended` 이벤트 발생** | ⛔ **false** |
| `mute` 이벤트 발생 | ⛔ false |
| 6초 뒤 `recorder.state` | **`inactive`** (스스로 끝났다) |

읽은 사실 — **설계에 직접 영향**:

1. ⭐ **`MediaStreamTrack.onended` 에 의존하면 인터럽션을 놓친다.** 명세대로 **`stop()` 은 `ended` 를 발생시키지 않고**, 트랙이 죽어도 이벤트가 오지 않았다. `rules/architecture.md` §7 과 Plan AC-4-68 ③ 이 거론하는 `onended` 는 **감지 수단으로 충분하지 않다**.
2. ⭐ **대신 `recorder.state` 가 `recording` → `inactive` 로 스스로 넘어간다.** 즉 **감지 가능한 신호는 "청크가 끊긴 것"과 "`recorder.state`"** 다. `S4-D` 의 `RecordingController` 는 **① `track.readyState` 폴링 ② 청크 수신 watchdog(마지막 청크 이후 `timeslice × N` 경과) ③ `recorder.state`** 를 같이 봐야 한다.
3. **끊긴 시점까지의 녹음은 보존된다** (종료 조각이 온다). 유실은 진행 중 timeslice 1개.

### 6.2 `visibilitychange` — ⚠️ 리스너 등록만 확인, 발생은 미측정

리스너는 등록되고 제거된다(코드 경로 실행 확인). **발생 자체는 ⑥ 과 같은 이유로 만들 수 없었다** (§7).

### 6.3 `devicechange` — ⛔ 미측정

**장치 추가·제거를 자동화로 만들 수 없다.** `navigator.mediaDevices.addEventListener('devicechange', …)` 등록·해제만 확인했다. 가짜 장치를 켜고 끄는 Playwright/CDP 수단이 없다 (CDP 에 오디오 장치 핫플러그 도메인이 없다). **실기기 수동 절차(§7)로 넘긴다** — 유선 이어폰 연결·해제가 가장 쉬운 재현이다.

---

## 7. ⑥ 백그라운드 / 탭 비활성 — ⛔ **측정 불가** (AC-4-108)

**이 항목은 측정되지 않았다.** 아래는 "안 했다" 가 아니라 **"4가지 방법으로 시도해서 네 번 다 실패했다"** 는 기록이다.

### 7.1 왜 실패했는가 — 페이지를 `hidden` 으로 만들 수 없다

| 시도 | 결과 (`document.visibilityState`) | 원인 |
|---|---|---|
| `context.newPage()` + `bringToFront()` | **`visible`** | headless 에는 창 관리자가 없다. headed 에서는 Playwright 가 **별도 창**을 띄워 가려지지 않는다 |
| `window.open('about:blank','_blank')` (같은 창 새 탭) | **`visible`** | 〃 |
| CDP `Emulation.setFocusEmulationEnabled({enabled:false})` 후 위 조작 | **`visible`** | 포커스 에뮬레이션만 끄는 것으로는 visibility 가 바뀌지 않는다 |
| CDP `Page.setWebLifecycleState({state:'frozen'})` | **`visible`** — 호출은 성공하는데 **아무 일도 일어나지 않는다**(10초 동안 청크 계속 도착 · 오디오 클럭 +15.02s) | 보이는 페이지는 실제로 freeze 되지 않는다. `state:'hidden'` 은 **`Unidentified lifecycle state`** 로 거부된다 |
| `osascript` 로 창 최소화 / `cmd+H` | — | **AppleEvent 시간 초과(-1712)** — 이 환경에서 Apple Events 자동화가 거부된다 |

이 5가지 시도는 드라이버의 **`probeHideTechniques()`** 에 그대로 들어가 있어 **재실행하면 같은 기록이 다시 나온다**. 측정 결과 JSON 의 `hidden.hideAttempts` · `hidden.hideAchieved` 가 그 증거다.

### 7.2 ⚠️ 거짓 결론을 적을 뻔했다 — 기록으로 남긴다

숨기기 확인을 넣기 전, 드라이버는 *"hidden 구간 청크 **0개**"* 를 출력했다. 그대로 적으면 **"Chromium 은 탭이 비활성이면 녹음이 끊긴다"** 는 **틀린 결론**이 된다. 실제로는:

- `visibilitychange` 이벤트 **0건**
- 전체 26개 청크의 `visibility` 가 **전부 `'visible'`**
- 간격이 **1018.8ms median 으로 26초 내내 균일** — 끊긴 구간이 **없다**
- `AudioContext` 클럭 **+15.003s / 15s**, `setInterval(250)` **60틱 / 15.06초**, rAF **904틱** — 전부 정상

즉 *"hidden 구간 청크 0개"* 는 **hidden 구간이 아예 없었다**는 뜻이었다. `R-BASELINE-1` ①②(버그·과도기 상태를 결과로 굳히지 않는다)와 `R-FIGMA-1` ⑤(앞선 보고를 옮겨 적기 전에 검증한다)가 가리키는 바로 그 유형이다.

### 7.3 부수적으로 얻은 사실 (전경 구간 측정)

Playwright Chromium 은 `--disable-background-timer-throttling` · `--disable-renderer-backgrounding` · `--disable-backgrounding-occluded-windows` 를 **기본으로** 켠다. ⭐ **그래서 이 브라우저 설정으로는 백그라운드 throttle 을 재는 것이 원리적으로 불가능하다** — 잰다 해도 **제품 사용자의 브라우저와 다른 설정**이다. `S4-K` 의 e2e 로 이 항목을 재려는 시도를 하지 않는 편이 낫다.

### 7.4 → 해야 할 일: 실기기 수동 측정 절차

`D4-4`(iOS 실기기 있음)에 따라 **사람이 기기에서** 재야 한다. 그 도구를 만들어 두었다: **`/__dev/ui/recording-spike`**.

**절차 (iOS Safari — AC-4-108 ③ 화면 잠금)**

1. Mac 에서 `pnpm --filter @haru/web run dev --host` 로 dev 서버를 띄우고 **같은 Wi-Fi** 의 iPhone Safari 에서 `http://<Mac IP>:5173/__dev/ui/recording-spike` 를 연다.
2. **① user activation** → **③ 녹음 시작** (timeslice 는 **1000ms** 기본) 을 누른다. 화면에 청크가 1초마다 늘어나는 것을 확인한다.
3. **즉시 전원 버튼으로 화면을 잠근다.** **60초** 기다린다.
4. 깨워서 **④ 녹음 종료** → **⑤ 복구 검사** 를 누른다.
5. 읽을 것: `chunks` 의 **`gapMs` 가 크게 벌어진 구간**(= 수신이 끊긴 구간) · `tOffsetMs` 와 `audioClock` 의 **벌어짐**(= 소리 원천까지 멈췄는지) · `recover()` 의 `decodedDurationSec` **대 경과 시간**(= 실제로 몇 초가 남았는지).
6. 같은 절차를 **② 홈 버튼으로 앱 전환** · **③ Safari 탭 전환** 에 대해 반복한다.

**절차 (데스크톱 — AC-4-108 ①②)**: 2까지 같고, 3 에서 **다른 탭으로 전환**(①) / **창 최소화**(②) 한다.

**`devicechange`(§6.3)**: 녹음 중 **유선 이어폰을 꽂았다 뺀다**. 화면의 `events` 에 `devicechange` · `track-mute` · `track-ended` 가 찍히는지 본다.

⚠️ **iOS Safari 에서는 `getUserMedia` 권한 허용이 필요하다.** 이 spike 페이지는 **합성 사인파**를 쓰므로 마이크 권한 없이 돈다 — 다만 그래서 **"실제 마이크 캡처가 백그라운드에서 유지되는가" 와는 다른 질문**을 재게 된다. 그 차이를 기록하고, 가능하면 `S4-D` 의 `RecorderAdapter` 가 완성된 뒤 **실제 마이크로 다시** 재는 것이 좋다.

---

## 8. ⑦ OPFS 할당량

**측정 방법**: `navigator.storage.estimate()` 를 측정 직후 호출. 30분 크기는 **§2.1 의 실측 `bytesPerSecond` × 1800** 으로 환산.

| 엔진 | `quota` | 측정 직후 `usage` | 30분 녹음 예상 | **할당량 대비** | `persisted()` | `persist()` 존재 |
|---|---|---|---|---|---|---|
| Chromium | **10,737,487,533 B** (≈10.0 GiB) | 69,293 B | **28,701,360 B** (≈27.4 MiB) | **0.267%** | **false** | ✅ |
| WebKit | **20,615,843,021 B** (≈19.2 GiB) | 2,498 B | (환산 불가 — bytes/s 0) | — | **false** | ✅ |

읽은 사실:

1. **용량은 문제가 아니다.** 30분 세션 하나가 할당량의 **0.27%**. 미업로드 세션이 **370개** 쌓여야 Chromium 할당량에 닿는다.
2. ⚠️ **`persisted()` 가 `false` 다** — 저장소가 **best-effort** 이고 **브라우저가 임의로 비울 수 있다**. `navigator.storage.persist()` 가 두 엔진 모두 **존재**하므로 `S4-E` 는 **녹음 시작 전에 `persist()` 를 요청**해야 한다. ⚠️ 승인 여부는 브라우저 정책(참여도 신호)에 달려 있어 **보장되지 않는다** — 이 사실이 `N4-09` 판단의 핵심이다.
3. ⛔ **할당량 초과 거동은 재지 않았다** — 10GB 를 실제로 채우려면 수십 분과 디스크가 필요하다. `S4-E` 에서 **주입 테스트**(쓰기 어댑터가 `QuotaExceededError` 를 던지게)로 다루는 것이 맞다.
4. ⛔ **브라우저의 임의 비움도 재지 않았다** — 유발 수단이 없다.

### 8.1 재현성

같은 측정을 **3회** 돌렸다. Chromium 1000ms timeslice 의 값:

| 회차 | 청크 수 | 첫 청크 | 간격 median | bytes/s |
|---|---|---|---|---|
| 1 | 15 | 1182.2ms | 1018.8ms | 15,948.6 |
| 2 | 15 | 1184.0ms | 1018.9ms | 15,945.2 |
| 3 (headed) | 15 | 1209.6ms | 1018.5ms | 15,916.9 |

→ 간격은 **±0.2ms**, 첫 청크는 **±27ms**, 비트레이트는 **±0.2%**. **결정적이라고 볼 수 있다.** headed/headless 차이는 첫 청크 지연에만 작게 보인다.

### 8.2 → `N4-09`(로컬 보관 상한) 판단 근거

- 용량 압박은 **없다** (0.27%/세션).
- 그러나 **`persisted()` 가 false** → **브라우저가 언제든 비울 수 있다**. 즉 **"상한을 두지 않아도 안전하다" 는 근거는 용량에서만 나오고, 영속성에서는 나오지 않는다.**
- 따라서 Plan 의 권고(**14일 + 7일 시점 안내**)는 **용량 때문이 아니라 프라이버시·최소 보관 원칙 때문에** 정당하다. 이 spike 는 **그 권고를 뒤집는 근거를 찾지 못했다.** ⚠️ 결정은 사용자 몫이다(삭제는 유실).
- 추가 권고: **`persist()` 요청 + `persisted()` 결과를 세션에 기록**하고, false 인 기기에서는 **업로드를 더 서둘러야 한다**는 것을 `S4-E` 의 큐 우선순위에 반영한다. (**승인 필요** — 새 동작이다)

### 8.3 → `S4-E` 를 위한 timeslice 교환 관계 (**승인 필요** — 기본값 결정)

| timeslice | 30분 청크 수 | OPFS 파일 수 | 크래시 시 최대 손실 | 1청크 쓰기(median) |
|---|---|---|---|---|
| 1000ms | ≈1766 | ≈1766 | **≈1.0초** | 4.2ms |
| 3000ms | ≈589 | ≈589 | ≈3.0초 | 4.5ms |
| **5000ms** | **≈357** | **≈357** | ≈5.0초 | 5.7ms |

쓰기 비용은 세 경우 다 무시할 수준이므로 **선택 기준은 "파일 수" 대 "크래시 손실"** 이다. 측정만으로는 어느 쪽이 맞다고 말할 수 없다 — **PRD 에 "크래시 시 최대 몇 초 손실까지 허용" 기준이 없다.** `S4-E` 착수 전 결정이 필요하다.

---

## 9. `C4-OPEN-1` — `partNo` 상한

### 9.1 먼저 용어

`ARCHITECTURE §10.5-3`: *"업로드 단위: 녹음 1건 = 1..n **part**(정상 1개, 크래시·인터럽션 재시작 시 추가)"*.
→ **part ≠ timeslice 청크.** part 는 **연속 녹음 구간 1개**(= `MediaRecorder` 세션 1개)이고, 그 안에 청크가 수백~수천 개 들어간다.

### 9.2 측정에서 나온 수

| 측정 | 값 |
|---|---|
| 30분 세션의 **청크 수** (1000ms) | **≈1766** |
| 30분 세션의 **청크 수** (5000ms) | **≈357** |
| 크래시 1회가 늘리는 **part 수** | **+1** (실측: 탭 강제 종료 → 미완료 run 1건, 재시작하면 새 run) |
| 크래시 1회의 **손실** | **≈1 timeslice** (9초 녹음 → 8.1초 복원) |

### 9.3 답 — **`partNo ≤ 20` 은 유지해도 된다. 단 두 가지를 contract 에 박아야 한다** (**승인 필요**)

1. ✅ **상한 20 은 part 정의대로라면 안전하다.** 20을 넘으려면 **한 세션에서 크래시·인터럽션이 20번** 나야 한다. 15분 세션(PRD 기준)에서 현실적이지 않다.
2. ⛔ **그러나 "청크 = part" 로 구현하면 1766 ≫ 20 으로 즉시 schema parse 가 막힌다.** 이것이 `C4-OPEN-1` 의 실제 위험이고, **측정으로 수치가 확정되었다.** → `docs/API_CONTRACTS.md` 의 `partNo` 에 **"part 는 연속 녹음 구간이며 timeslice 청크가 아니다 (30분 세션의 청크는 약 1766개)"** 를 **주석으로 명시**해야 한다.
3. ⚠️ **권고**: 상한을 **20 → 50** 으로 올려 두는 것도 비용이 거의 없다. 근거: 인터럽션 재시작이 반복되는 최악 경우(`R4-05` 가 말하는 Web 백그라운드 불안정 + ⑥ 이 **미측정**이라 상한을 안다고 말할 수 없다)에 대한 여유다. **`partNo` 가 막으면 업로드 자체가 불가능**해지므로 비대칭 위험이다. ⚠️ **사용자 결정 필요** — 숫자를 Agent 가 바꾸지 않는다.

---

## 10. 설계 변경이 필요한 지점 (전부 **승인 필요**)

| # | 지점 | 측정 근거 | 영향 작업 단위 |
|---|---|---|---|
| **M-1** | `RecordingPart.mimeType` 의 형태 — enum → **원문 문자열 + `container` enum + 정규화 검증** | §5.3 (4항목 어긋남) · §5.2 | **`S4-B`** (contracts) |
| **M-2** | `partNo` 상한 **20 유지 + 정의 주석** (또는 50으로 상향) | §9 | **`S4-B`** |
| **M-3** | 컨테이너 타입은 **첫 `dataavailable` 에서 확정**한다. `recorder.mimeType` 을 `start()` 직후에 읽지 않는다 | §5.4 (이 spike 가 실제로 그 버그를 냈다) | **`S4-D`**·**`S4-E`** |
| **M-4** | **첫 청크 특별 보호** — 잃으면 전체 재생 불가 | §4.1-3 | **`S4-E`** |
| **M-5** | 복구 시 **잘린 마지막 청크를 버리지 않는다** (버리면 더 잃는다) | §4.1-4 | **`S4-E`** |
| **M-6** | 복구 성공 판정은 **`decodeAudioData`**. `<audio>.duration` 을 쓰지 않는다 | §4.1-5 | **`S4-E`** |
| **M-7** | 인터럽션 감지를 **`track.onended` 에 의존하지 않는다** — `readyState` 폴링 + **청크 watchdog** + `recorder.state` | §6.1-1·2 | **`S4-D`** |
| **M-8** | **`navigator.storage.persist()` 요청** + `persisted()` 결과 기록 | §8-2 | **`S4-E`** |
| **M-9** | **timeslice 기본값 결정** (파일 수 ↔ 크래시 손실) | §8.3 | **`S4-E`** |
| **M-10** | `LocalRecordingStore` 는 **Worker 없이** `createWritable()` 로 만들 수 있다 | §3.1 | **`S4-E`** |
| **M-11** | **백그라운드 한계(AC-4-108)를 e2e 로 재려 하지 않는다** — Playwright Chromium 은 throttle 을 끄고 돈다 | §7.3 | **`S4-K`** |
| **M-12** | **WebKit/iOS 의 청크 가능 여부가 미확정**이다. `S4-D`·`S4-E` 를 WebKit 미검증 상태로 진행할지 결정이 필요하다 | §2.2·§4.2 | **`S4-D`**·**`S4-E`** |
| **M-13** | `docs/API_CONTRACTS.md` §5.4 **`web-background-warning`** 은 *"중단 여부·조건은 `S4-A` ⑥ 실측으로 채운다"* 고 적는데 **⑥ 이 측정 불가**다 → ⓐ 실기기 측정을 기다린다 / ⓑ 조건 없는 *"Web 에서는 보장 불가"* 안내로 먼저 만든다 | §7 | **`S4-C`**·**`S4-H2`** |

---

## 11. 측정하지 못한 것 (전수)

| 항목 | 이유 | 대안 |
|---|---|---|
| **WebKit 의 청크 흐름·크래시 복구** | Playwright WebKit 이 이 환경에서 **오디오를 전혀 만들지 못한다**(클럭 0.0000s · `captureStream` 미지원 · `getUserMedia` `NotAllowedError`) | **실기기 iOS Safari** (§7.4) 또는 실제 Safari.app 에서 수동 |
| **⑥ 탭 비활성 / 백그라운드 / 화면 잠금** | 페이지를 `hidden` 으로 만드는 **5가지 수단 전부 실패** (§7.1) | **실기기 수동 절차** (§7.4) — AC-4-108 |
| **`devicechange`** | 장치 핫플러그를 유발할 수단이 없다 (CDP 에 해당 도메인 없음) | 실기기에서 유선 이어폰 탈착 (§7.4) |
| **실제 마이크(`getUserMedia`) 경로** | 이 환경에서 **무응답**(Chromium) / **거부**(WebKit). ⚠️ 의도적으로도 사람 음성을 쓰지 않았다 | `S4-D` 의 `RecorderAdapter` 완성 후 실기기 |
| **Firefox** | Playwright 브라우저 미설치 | 필요하면 `npx playwright install firefox` |
| **할당량 초과 거동 · 브라우저 임의 비움** | 유발에 수십 분 + 디스크 / 유발 수단 없음 | `S4-E` 주입 테스트 |
| **파일 수가 많아진 뒤의 OPFS 접근 비용** | 15초 측정에서는 최대 15개 파일뿐 | `S4-E` 에서 1766개 쓰기 부하 테스트 |
| **30분 실세션** | 측정은 15초 단위 × 3 이고 **30분 수치는 환산**이다 (§2.1-4) | `S4-E` 에서 1회 완주 측정 |
| **Android 모바일 Web** | 기기 없음 (`D4-4`) | Plan `N4-21` 그대로 |

---

## 12. 산출물 위치와 재실행

| 산출물 | 경로 | 비고 |
|---|---|---|
| spike 측정 엔진 | `apps/web/src/dev/recording-spike/spike-core.ts` | **dev 전용** |
| 청크 영속 계층 | `apps/web/src/dev/recording-spike/spike-store.ts` | **dev 전용** |
| 수동 측정 화면 | `apps/web/src/dev/recording-spike/RecordingSpikePage.tsx` → `/__dev/ui/recording-spike` | **dev 전용** · §7.4 가 쓴다 |
| route 등록 | `apps/web/src/dev/DevGallery.tsx` | `GalleryLayout` **밖**(baseline 보호) |
| dev CSS 1블록 | `apps/web/src/dev/dev.css` 끝 `.haru-dev-spike-readout` | 토큰만 사용 |
| 자동 측정 드라이버 | `scripts/spike/recording-spike-measure.mjs` | Node + Playwright. ⚠️ `apps/web/scripts/` 에 두면 `apps/web/tsconfig.node.json` 의 `checkJs` 가 `page.evaluate` 반환값 전부에 JSDoc 를 요구한다 — 루트 `scripts/` 가 저장소 툴체인 자리다 |

**재실행**

```bash
pnpm --filter @haru/web run dev                       # 1) dev 서버
node scripts/spike/recording-spike-measure.mjs     # 2) 전체 (chromium,webkit)
node scripts/spike/recording-spike-measure.mjs --only=hidden --headed=true   # 숨기기 시도만
```

⚠️ **`pnpm test:e2e` 와 같이 돌리지 않는다** — 이 저장소에서 Playwright 실행이 겹치면 소요가 4~5분 → 20분대로 늘고 허위 실패가 난다(5회 관측).

**Production 격리**: spike 는 `src/dev/**` 안에 있고 `app/router.tsx` 의 `import.meta.env.DEV` 가드 + 동적 import 뒤에만 닿는다. `pnpm assert:no-mocks` 가 `dist/**` 에서 `__HARU_DEV_SENTINEL__` · `haru-dev-` 0건을 강제한다 (§13).

**이 코드의 수명**: Plan `S4-A` 는 *"spike 코드는 제품 코드에 남기지 않는다"* 고 적는다. 지금 남겨 둔 이유는 **§7.4 의 실기기 수동 측정이 아직 남아 있고 그 도구가 이 화면**이기 때문이다. AC-4-108 의 실기기 측정이 끝나면 **삭제 대상**이다. ⚠️ 제품 코드(`features/recording` 등)에는 **한 줄도 넣지 않았다.**

---

## 13. 검증 명령 결과 (2026-10-14)

| # | 명령 | 결과 | 기준선 대조 |
|---|---|---|---|
| 1 | `pnpm install --frozen-lockfile` | ✅ `Lockfile is up to date` (172ms) | 변화 없음 (의존성 추가 **0건**) |
| 2 | `pnpm typecheck` | ✅ 전 패키지 `Done` | — |
| 3 | `pnpm lint` | ✅ 출력 0건 | — |
| 4 | `pnpm lint:boundaries` | ✅ `no dependency violations found (595 modules, 2090 dependencies cruised)` | — |
| 5 | `pnpm test` | ✅ **1631 passed / 118 files** (57.5s) | 기준선 **1631 / 118** — **동일**. spike 는 테스트를 추가하지 않았다 |
| 6 | `pnpm build` | ✅ `built in 493ms` | 기존 chunk 크기 경고만 (신규 아님) |
| 7 | `pnpm assert:no-mocks` | ✅ `__HARU_MOCK_SENTINEL__` 0건 · **`__HARU_DEV_SENTINEL__` 0건** · **`haru-dev-` 0건** | spike 가 Production 번들에 **들어가지 않음을 직접 증명**한다 |
| 8 | `pnpm test:e2e` (단독) | ✅ **285 passed** (6.8m) | 기준선 **285** — **동일** |

### 13.1 ⚠️ 8번의 1회차는 신뢰할 수 없었다 — 재실행했다

| 회차 | 결과 | 소요 | 판단 |
|---|---|---|---|
| 1회차 | **2 failed** / 283 passed | **31.2m** | ⛔ **믿지 않았다.** 실패 2건의 **개별 소요가 7.9m · 16.3m** 였다 (테스트 timeout 은 60초다 — 프로세스가 CPU 를 못 받았다는 뜻) |
| 2회차 (단독) | **285 passed** / 0 failed | **6.8m** | ✅ 채택. 1회차의 실패 2건(`onboarding.spec.ts:977` · `visual.spec.ts:389 s3-home-deck`)이 **각각 1.5s · 890ms 로 통과** |

이것은 저장소 메모(*"Playwright 가 겹치면 4~5분 → 20분대 + 허위 실패 1건, 단독 재실행하면 사라진다"*)의 **6번째 관측**이다. **소요가 기준선의 5배면 결과를 판정 근거로 쓰지 않는다.**

## 14. 이 작업이 건드리지 않은 것

- `packages/contracts` — **변경 0건**. 전이표 2행 추가(`D4-13`)는 **`S4-B`** 의 일이다.
- `docs/API_CONTRACTS.md` — **변경 0건**. §5.5·§9.3 은 **권고**이며 승인 후 반영한다.
- 제품 코드(`apps/web/src/{app,pages,features,entities,shared}`) — **`app/dev` route 등록 외 변경 0건**. 정확히는 `DevGallery.tsx`(dev 모듈) 1곳이며 `app/router.tsx` 는 건드리지 않았다.
- `apps/api/` · `supabase/` — **생성하지 않았다**.
