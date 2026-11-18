/**
 * TopBar 뒤로 ↔ 수정 폼 연결 (Stage 6 Spec §2.5 *"leading ← Back (dirty 면 ConfirmDialog)"*).
 *
 * TopBar 는 layout(`StackLayout topBar`)에 주입되는 별도 route element 라 폼의 변경 여부를 모른다.
 * 폼이 마운트되어 있는 동안 자신의 `requestBack` 을 이곳에 등록하고, TopBar 는 이것만 부른다.
 * 등록이 없으면(Loading · Error 상태) 그냥 뒤로 간다.
 *
 * 모듈 단위 등록 지점 1개 — 이 화면은 한 번에 하나만 마운트된다. 값(입력)은 담지 않는다.
 */
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';

let registered: (() => void) | null = null;

/** 폼이 호출한다 — 마운트 동안 TopBar 뒤로를 가로챈다. */
export function useRegisterChildInfoEditBack(handler: () => void): void {
  const latest = useRef(handler);

  useEffect(() => {
    latest.current = handler;
  });

  useEffect(() => {
    const forward = () => {
      latest.current();
    };
    registered = forward;
    return () => {
      if (registered === forward) registered = null;
    };
  }, []);
}

/** TopBar 가 호출한다 — 폼이 있으면 폼에 묻고, 없으면 뒤로 간다. */
export function useChildInfoEditBack(): () => void {
  const navigate = useNavigate();

  return () => {
    if (registered !== null) {
      registered();
      return;
    }
    void navigate(-1);
  };
}
