#!/usr/bin/env node
// Stage 8 `S8-I` — Mock 데모 웹 프리뷰(C-18) 산출물 검사 (Plan §5.6 · AC-8-66 · 67 · 68 · 71).
//
// 대상: `pnpm build:preview` (= `vite build --mode preview`) 가 만든 `apps/web/dist-preview/`.
// `assert:no-mocks` 는 http 빌드(`apps/web/dist/`) 전용으로 그대로 둔다.
//
//   ⓪ Mock 모드 강제    Mock 표식(`__HARU_MOCK_SENTINEL__`)이 **있어야** 한다 — http 빌드를 잘못 올리는 사고 방지
//   ① `.map` 0          sourcemap 파일 · `sourceMappingURL` 주석 0 (`S1-G-7` — 프리뷰에서만 끈다)
//   ② dev 표식 0        dev gallery · Scenario Panel(`__HARU_DEV_SENTINEL__`) · dev CSS(`haru-dev-`) ·
//                       e2e 요청 로그 창 노출(`__HARU_MOCK_REQUEST_LOG__`) 0
//   ③ Secret 0          Service Role · 개인 키 · 클라우드/AI/결제 키 · JWT 패턴 0
//   ④ `VITE_*` 목록     빌드 환경의 `VITE_*` 이름과 값을 출력한다. 이름이 Secret 류면 실패
//   ⑤ 최상위 404.html 0 SPA fallback 은 루트 `wrangler.jsonc` 의 `not_found_handling: "single-page-application"`
//                       (Workers 정적 자산 — H8-13) 이 맡는다. `404.html` · `_redirects` 는 그 처리와 겹치거나 덮을 수
//                       있어 두지 않는다 (Pages Direct Upload 부록 방식에서도 같은 규칙)
//   ⑥ 실제 데이터 0     산출물의 이메일 주소는 예약 도메인(`example.com` 등)만 · 상용 그림책 표지 에셋 0 (`N8-13` ⓐ)
//
// 하나라도 어긋나면 종료 코드 1.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const webRoot = join(repoRoot, 'apps', 'web');
// 인자로 다른 디렉토리를 줄 수 있다 — 검사 자체의 회귀 테스트(`apps/web/__tests__/assert-preview.test.ts`)용.
const distRoot =
  process.argv[2] === undefined ? join(webRoot, 'dist-preview') : resolve(process.argv[2]);
const TAG = '[assert:preview]';
const rel = (/** @type {string} */ file) => relative(repoRoot, file);

if (!existsSync(join(distRoot, 'index.html'))) {
  console.error(
    `${TAG} ${rel(distRoot)}/index.html 이 없습니다. pnpm build:preview 를 먼저 실행하세요.`,
  );
  process.exit(1);
}

/** @param {string} dir @returns {string[]} */
function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const files = walk(distRoot);
const textFiles = files.filter((file) => /\.(js|mjs|cjs|css|html|json|txt|svg|map)$/.test(file));
const texts = new Map(textFiles.map((file) => [file, readFileSync(file, 'utf8')]));

let failed = false;

/**
 * @param {string} label
 * @param {string[]} offenders
 * @param {string} okNote
 */
function report(label, offenders, okNote) {
  if (offenders.length > 0) {
    failed = true;
    console.error(`${TAG} FAIL — ${label}:`);
    for (const offender of offenders) console.error(`  - ${offender}`);
  } else {
    console.log(`${TAG} OK — ${label}: 0건 ${okNote}`);
  }
}

// ⓪ Mock 모드 강제
const mockSentinelFiles = [...texts].filter(([, text]) => text.includes('__HARU_MOCK_SENTINEL__'));
if (mockSentinelFiles.length === 0) {
  failed = true;
  console.error(
    `${TAG} FAIL — ⓪ Mock 표식(__HARU_MOCK_SENTINEL__)이 없습니다. http 빌드이거나 Mock 이 빠졌습니다.`,
  );
} else {
  console.log(
    `${TAG} OK — ⓪ Mock 모드: Mock 표식 ${mockSentinelFiles.length}개 파일 (${mockSentinelFiles.map(([file]) => basename(file)).join(', ')})`,
  );
}

// ① sourcemap 0
report(
  '① sourcemap (.map 파일 · sourceMappingURL)',
  [
    ...files.filter((file) => file.endsWith('.map')).map(rel),
    ...[...texts]
      .filter(([, text]) => /[#@]\s*sourceMappingURL=/.test(text))
      .map(([file]) => rel(file)),
  ],
  `(${files.length}개 파일)`,
);

// ② dev 표식 0
const DEV_MARKERS = ['__HARU_DEV_SENTINEL__', 'haru-dev-', '__HARU_MOCK_REQUEST_LOG__'];
for (const marker of DEV_MARKERS) {
  report(
    `② dev 표식 ${marker}`,
    [...texts].filter(([, text]) => text.includes(marker)).map(([file]) => rel(file)),
    `(${texts.size}개 텍스트 파일)`,
  );
}

// ③ Secret 0
const SECRET_PATTERNS = [
  { name: 'Supabase service role', re: /service_role|SERVICE_ROLE/ },
  { name: 'private key block', re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { name: 'JWT', re: /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/ },
  { name: 'OpenAI/Anthropic 류 키', re: /\bsk-(?:proj-|ant-)?[A-Za-z0-9_-]{20,}/ },
  { name: 'Stripe live 키', re: /\b[sr]k_live_[A-Za-z0-9]{10,}/ },
  { name: 'AWS access key', re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: 'Google API key', re: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { name: 'GitHub token', re: /\bgh[pousr]_[A-Za-z0-9]{36,}\b/ },
  { name: 'Slack token', re: /\bxox[abpors]-[A-Za-z0-9-]{10,}/ },
];
for (const pattern of SECRET_PATTERNS) {
  report(
    `③ Secret 패턴 ${pattern.name}`,
    [...texts].filter(([, text]) => pattern.re.test(text)).map(([file]) => rel(file)),
    '',
  );
}

// ④ VITE_* 목록 — 빌드 환경(process.env) + apps/web 의 .env* 파일
const SECRET_NAME = /KEY|SECRET|TOKEN|PASSWORD|PRIVATE|SERVICE_ROLE|CREDENTIAL/i;
const viteVars = new Map();
for (const [name, value] of Object.entries(process.env)) {
  if (name.startsWith('VITE_')) viteVars.set(name, { value: value ?? '', source: 'process.env' });
}
for (const entry of readdirSync(webRoot).filter((name) => name.startsWith('.env'))) {
  for (const line of readFileSync(join(webRoot, entry), 'utf8').split('\n')) {
    const match = line.match(/^\s*(VITE_[A-Z0-9_]+)\s*=\s*(.*)$/);
    if (match !== null && !viteVars.has(match[1])) {
      viteVars.set(match[1], { value: match[2], source: `apps/web/${entry}` });
    }
  }
}
console.log(`${TAG} ④ VITE_* 목록 (${viteVars.size}개):`);
if (viteVars.size === 0) {
  console.log('  (없음 — VITE_API_MODE 는 --mode preview 가 mock 으로 고정한다)');
}
const secretNamed = [];
for (const [name, { value, source }] of viteVars) {
  console.log(`  ${name}=${value}  (${source})`);
  if (SECRET_NAME.test(name)) secretNamed.push(`${name} (${source})`);
}
report('④ Secret 류 이름의 VITE_* 변수', secretNamed, '');
const leakedViteNames = [...texts]
  .filter(([, text]) => /VITE_[A-Z0-9_]*(KEY|SECRET|TOKEN|PASSWORD)/.test(text))
  .map(([file]) => rel(file));
report('④ 산출물 안 Secret 류 VITE_* 이름', leakedViteNames, '');

// ⑤ 최상위 404.html · _redirects 0
report(
  '⑤ 최상위 404.html · _redirects (SPA fallback)',
  ['404.html', '_redirects']
    .filter((name) => existsSync(join(distRoot, name)))
    .map((name) => `dist-preview/${name}`),
  '',
);

// ⑥ 실제 데이터 0 — 이메일은 예약 도메인만 (RFC 2606 · 6761), 상용 표지 에셋 0
const RESERVED_EMAIL_DOMAIN =
  /@(?:[a-z0-9-]+\.)*(?:example\.(?:com|net|org)|example|test|invalid|localhost|local)$/i;
const emails = new Set();
for (const [, text] of texts) {
  for (const match of text.matchAll(
    /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g,
  )) {
    emails.add(match[0]);
  }
}
report(
  '⑥ 예약 도메인 밖의 이메일 주소',
  [...emails].filter((email) => !RESERVED_EMAIL_DOMAIN.test(email)),
  `(발견 ${emails.size}개: ${[...emails].join(', ') || '없음'})`,
);
const COMMERCIAL_COVER = /where-the-wild-things-are|the-most-magnificent-idea|grumpy-monkey/;
report(
  '⑥ 상용 그림책 표지 에셋',
  files
    .filter(
      (file) => /\.(png|webp|avif|jpe?g|gif)$/.test(file) && COMMERCIAL_COVER.test(basename(file)),
    )
    .map(rel),
  '(N8-13 ⓐ)',
);

if (failed) {
  console.error(`${TAG} 실패 — 위 항목을 고친 뒤 pnpm build:preview 부터 다시 실행하세요.`);
  process.exit(1);
}
console.log(
  `${TAG} 통과 — apps/web/dist-preview 를 그대로 배포할 수 있습니다 (docs/qa/stage-8-preview-deploy.md).`,
);
