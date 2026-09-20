/**
 * HARU Design Tokens — CSS custom property 스캐너.
 *
 * 빌드(build-tokens.mjs)와 테스트(__tests__/*)가 **같은 파서**를 쓰도록 분리했다.
 * 정규식 한 줄 매칭이 아니라 중괄호/괄호 깊이를 추적해 여러 줄에 걸친 선언
 * (box-shadow, linear-gradient, color-mix …)을 하나의 선언으로 읽는다.
 *
 * @typedef {'primitive' | 'semantic' | 'component'} TokenTier
 *
 * @typedef {object} TokenDeclaration
 * @property {string} name        토큰 이름 (`--color-fg-primary`)
 * @property {string} value       선언 값 (세미콜론 제외, 공백 정규화)
 * @property {TokenTier} tier     3-tier 구분
 * @property {string} file        패키지 기준 상대 경로 (`src/semantic/color.css`)
 * @property {'@theme' | ':root' | string} block  선언이 들어 있는 블록 셀렉터/at-rule
 * @property {string | null} provisional          `P-xx` (바로 위 주석) 또는 null
 * @property {string | null} acceptedDeviation    `D-xx` (바로 위 주석) 또는 null
 * @property {string[]} references                값이 참조하는 `var(--…)` 이름 목록
 */

const PROVISIONAL_RE = /provisional:\s*(P-\d{2})/;
const ACCEPTED_RE = /accepted deviation:\s*(D-\d{2})/;

/** @param {string} value @returns {string[]} */
export function extractVarReferences(value) {
  /** @type {string[]} */
  const found = [];
  const re = /var\(\s*(--[a-zA-Z0-9_-]+)/g;
  let m;
  while ((m = re.exec(value)) !== null) {
    if (m[1]) found.push(m[1]);
  }
  return found;
}

/**
 * 주석을 제거하되, 각 주석의 끝 위치와 내용을 기억해 "선언 바로 위 주석"을 판정할 수 있게 한다.
 * @param {string} source
 */
export function stripComments(source) {
  let out = '';
  /** @type {{ end: number; text: string }[]} */
  const comments = [];
  let i = 0;
  while (i < source.length) {
    if (source[i] === '/' && source[i + 1] === '*') {
      const close = source.indexOf('*/', i + 2);
      const end = close === -1 ? source.length : close + 2;
      comments.push({ end: out.length, text: source.slice(i + 2, close === -1 ? end : close) });
      i = end;
      continue;
    }
    out += source[i];
    i += 1;
  }
  return { code: out, comments };
}

/**
 * 파일 하나를 스캔해 custom property 선언 목록을 돌려준다.
 *
 * @param {string} source CSS 원문
 * @param {{ file: string; tier: TokenTier }} meta
 * @returns {TokenDeclaration[]}
 */
export function parseTokenFile(source, meta) {
  const { code, comments } = stripComments(source);
  /** @type {TokenDeclaration[]} */
  const declarations = [];
  /** @type {string[]} */
  const blockStack = [];
  let buffer = '';
  let parenDepth = 0;

  const currentBlock = () => blockStack[blockStack.length - 1] ?? '(top-level)';

  /**
   * 선언 시작 오프셋 바로 앞 주석에서 태그를 찾는다.
   * @param {number} offset
   */
  const tagsAt = (offset) => {
    let provisional = null;
    let acceptedDeviation = null;
    for (const comment of comments) {
      // 선언 직전(공백만 사이에 둔) 주석만 인정한다.
      if (comment.end > offset) break;
      if (code.slice(comment.end, offset).trim() !== '') continue;
      const p = PROVISIONAL_RE.exec(comment.text);
      const a = ACCEPTED_RE.exec(comment.text);
      if (p?.[1]) provisional = p[1];
      if (a?.[1]) acceptedDeviation = a[1];
    }
    return { provisional, acceptedDeviation };
  };

  for (let i = 0; i < code.length; i += 1) {
    const ch = code[i];
    if (ch === '(') parenDepth += 1;
    if (ch === ')') parenDepth -= 1;

    if (parenDepth === 0 && ch === '{') {
      blockStack.push(buffer.trim());
      buffer = '';
      continue;
    }
    if (parenDepth === 0 && ch === '}') {
      blockStack.pop();
      buffer = '';
      continue;
    }
    if (parenDepth === 0 && ch === ';') {
      const raw = buffer.trim();
      const colon = raw.indexOf(':');
      if (raw.startsWith('--') && colon !== -1) {
        const name = raw.slice(0, colon).trim();
        const value = raw
          .slice(colon + 1)
          .trim()
          .replace(/\s+/g, ' ');
        // 선언 이름이 시작하는 오프셋 (buffer 앞쪽 공백을 제외해야 "바로 위 주석" 판정이 맞는다)
        const nameStart = i - buffer.length + buffer.indexOf('--');
        const { provisional, acceptedDeviation } = tagsAt(nameStart);
        declarations.push({
          name,
          value,
          tier: meta.tier,
          file: meta.file,
          block: currentBlock(),
          provisional,
          acceptedDeviation,
          references: extractVarReferences(value),
        });
      }
      buffer = '';
      continue;
    }
    buffer += ch;
  }

  return declarations;
}

/**
 * `@import './x.css';` 을 재귀적으로 펼쳐 하나의 CSS 문자열로 만든다.
 * 상대 경로만 펼친다 (패키지 import 는 그대로 둔다 — 이 패키지에는 없어야 정상).
 *
 * @param {string} entryPath 절대 경로
 * @param {{ readFile: (p: string) => string; resolve: (from: string, spec: string) => string }} io
 * @param {Set<string>} [seen]
 * @returns {string}
 */
export function inlineImports(entryPath, io, seen = new Set()) {
  if (seen.has(entryPath)) return '';
  seen.add(entryPath);

  const source = io.readFile(entryPath);
  return source.replace(
    /^[ \t]*@import\s+(?:url\()?['"](\.[^'"]+)['"]\)?\s*;[ \t]*$/gm,
    (_match, spec) => {
      const target = io.resolve(entryPath, spec);
      return `\n/* ──── inlined: ${spec} ──── */\n${inlineImports(target, io, seen)}`;
    },
  );
}

/**
 * 주석을 제거한 CSS 본문만 돌려준다 (주석 안의 예시 문자열이 검사에 걸리지 않도록).
 * @param {string} source
 * @returns {string}
 */
export function stripCssComments(source) {
  return stripComments(source).code;
}
