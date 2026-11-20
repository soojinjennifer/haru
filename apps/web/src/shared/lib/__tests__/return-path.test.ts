/**
 * 로그인 후 복귀 경로 — AC-7-46 (`D7-6` ⑨). 같은 출처의 앱 안 경로만 받는다 (open redirect 방지).
 */
import { describe, expect, it } from 'vitest';

import { createReturnPathStore, toSafeReturnPath } from '../return-path';

describe('toSafeReturnPath — 앱 안 경로만', () => {
  it.each([
    [
      '/progress/reports/e7e7e7e7-0000-4000-8000-000000000002',
      '/progress/reports/e7e7e7e7-0000-4000-8000-000000000002',
    ],
    ['/progress?week=2026-05-04', '/progress?week=2026-05-04'],
    ['/library#saved', '/library#saved'],
    ['/', '/'],
    // 정규화 — `..` 은 같은 출처 안에서 접힌다
    ['/progress/../library', '/library'],
  ])('%s → %s', (candidate, expected) => {
    expect(toSafeReturnPath(candidate)).toBe(expected);
  });

  it.each([
    ['절대 URL', 'https://evil.example/progress'],
    ['http 절대 URL', 'http://localhost:5173/progress'],
    ['protocol-relative', '//evil.example/progress'],
    ['역슬래시 protocol-relative', '/\\evil.example'],
    ['경로 안 역슬래시', '/progress\\..\\evil'],
    ['javascript scheme', 'javascript:alert(1)'],
    ['data scheme', 'data:text/html,hi'],
    ['상대 경로', 'progress/reports/x'],
    ['탭 끼움 (파서가 지우면 //)', '/\t/evil.example'],
    ['개행', '/progress\n'],
    ['공백', '/ /evil.example'],
    ['빈 문자열', ''],
    ['/auth/* (로그인 고리)', '/auth/log-in'],
    ['/auth 자체', '/auth'],
  ])('%s 거절', (_label, candidate) => {
    expect(toSafeReturnPath(candidate)).toBeNull();
  });

  it('문자열이 아니면 거절', () => {
    expect(toSafeReturnPath(undefined)).toBeNull();
    expect(toSafeReturnPath(null)).toBeNull();
    expect(toSafeReturnPath(42)).toBeNull();
  });
});

describe('createReturnPathStore — 메모리 1칸', () => {
  it('remember → peek(지우지 않음) → clear', () => {
    const store = createReturnPathStore();
    expect(store.peek()).toBeNull();
    store.remember('/progress/reports/x');
    expect(store.peek()).toBe('/progress/reports/x');
    expect(store.peek()).toBe('/progress/reports/x');
    store.clear();
    expect(store.peek()).toBeNull();
  });

  it('안전하지 않은 경로는 기억하지 않고 이전 값도 지운다', () => {
    const store = createReturnPathStore();
    store.remember('/progress');
    store.remember('https://evil.example');
    expect(store.peek()).toBeNull();
  });
});
