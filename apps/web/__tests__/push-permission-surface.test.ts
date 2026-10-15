// @vitest-environment node
/**
 * 이월 `QA-3-001` 정적 증거 (Stage 4 `S4-J`, AC-4-81 · `D-16` · `D4-1` · `R4-01`).
 *
 * 1. `PushPermissionPort` interface 파일에 DOM · Notification 타입이 **실행 코드로** 나오지 않는다 —
 *    후속 `S4N-D` 가 Native 구현을 **추가만** 하면 된다.
 * 2. 앱 소스 어디에도 실제 Web Push 구독 · provider SDK · Capacitor push 플러그인이 없다
 *    (`PushManager` · `pushManager` · `serviceWorker` · VAPID · `applicationServerKey` · OneSignal · Firebase).
 * 3. `Notification` 전역은 Web 구현 파일 **한 곳**에서만 만진다.
 * 4. 앱 매니페스트에 push provider · Capacitor push 의존이 없다.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

import { describe, expect, it } from 'vitest';

const WEB = join(import.meta.dirname, '..');
const WEB_SRC = join(WEB, 'src');
const PORT_DIR = join(WEB_SRC, 'shared', 'platform', 'push-permission');
const INTERFACE_FILE = join(PORT_DIR, 'push-permission-port.ts');
const WEB_IMPL = join(PORT_DIR, 'web-push-permission.ts');

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry: string) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

function codeOf(file: string): string {
  return readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

const sources = walk(WEB_SRC).filter(
  (file) => /\.(ts|tsx)$/.test(file) && !file.includes(`${'__tests__'}`),
);

describe('R4-01 — PushPermissionPort interface 에 DOM 타입이 없다', () => {
  const code = codeOf(INTERFACE_FILE);

  it('interface 가 있다 (검사가 헛돌지 않도록)', () => {
    expect(code).toContain('export interface PushPermissionPort');
  });

  it.each([
    'Notification',
    'NotificationPermission',
    'PushManager',
    'PushSubscription',
    'ServiceWorkerRegistration',
    'Navigator',
    'Window',
  ])('`%s` 0건', (name) => {
    expect(code).not.toMatch(new RegExp(`\\b${name}\\b`));
  });
});

describe('D-16 — 실제 Web Push 구독 · provider SDK 0건', () => {
  it('소스가 있다', () => {
    expect(sources.length).toBeGreaterThan(100);
  });

  it.each([
    'PushManager',
    'pushManager',
    'serviceWorker',
    'applicationServerKey',
    'VAPID',
    'vapid',
    'onesignal',
    'OneSignal',
    'firebase',
    '@capacitor/push-notifications',
  ])('`%s` 0건', (needle) => {
    const offenders = sources.filter((file) => codeOf(file).includes(needle));
    expect(offenders.map((file) => relative(WEB_SRC, file))).toStrictEqual([]);
  });

  it('`Notification` 전역은 Web 구현 한 곳만 만진다', () => {
    const touches = (file: string): boolean =>
      /\bNotification\s*[.(]|globalThis[^;]*Notification/.test(codeOf(file));
    // 검사가 헛돌지 않는다 — Web 구현 자신은 이 패턴에 걸린다.
    expect(touches(WEB_IMPL)).toBe(true);
    const offenders = sources.filter((file) => file !== WEB_IMPL && touches(file));
    expect(offenders.map((file) => relative(WEB_SRC, file))).toStrictEqual([]);
  });

  it('apps/web 매니페스트에 push provider · Capacitor push 의존이 없다', () => {
    const manifest = readFileSync(join(WEB, 'package.json'), 'utf8');
    expect(manifest).not.toMatch(/onesignal|firebase|@capacitor\/push|web-push/i);
  });
});
