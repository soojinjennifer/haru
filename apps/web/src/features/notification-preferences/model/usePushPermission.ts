/**
 * `usePushPermission` — push 권한 **사전 안내 → 요청 → 기기 등록** 흐름의 상태 (FR-08 Frontend 부분,
 * Stage 3 `D-16` · Design Spec §2.14, 이월 `QA-3-001`, AC-4-81).
 *
 * ```
 * (화면) → usePushPermission ─┬ PushPermissionPort (app/providers 가 Web | Mock 선택)
 *                              └ notificationApi.registerPushDevice → Mock | Http
 * ```
 *
 * 규칙 (Design Spec §2.14 "권한 사전 안내" · "권한 거부")
 *  - **마운트만으로 권한을 묻지 않는다.** 상태만 읽는다. OS 프롬프트는 `request()` — 사용자가 안내를 읽고
 *    버튼을 누른 뒤 — 에서만 뜬다.
 *  - `denied` 이면 다시 묻지 않는다 (포트가 프롬프트 없이 `denied` 를 돌려준다). 재요청 버튼을 두지 않는 것은
 *    화면의 몫이다.
 *  - `granted` 가 되면(이미 허용돼 있던 경우 포함) 기기를 **한 번** 등록한다 — 같은 token 은 같은 기기다
 *    (`RU-10`, 서버 upsert). 실패해도 권한 상태는 그대로 두고 `registerFailed` 만 알린다.
 *  - token 을 로그·상태에 남기지 않는다 (응답 `PushDevice` 에도 token 이 없다 — AC-4-18).
 *
 * ⚠️ **화면(표면)은 이 단위에 없다** — `/settings/notifications` 는 Stage 4 Out of Scope(`D-18` · AC-4-02)이고
 * 다른 진입점은 Figma 에 없다. 표면 결정 전까지 이 hook 은 **소비자가 없다** (`S4-J` handoff NEEDS_DECISION).
 */
import { useMutation } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import type { PushDevice } from '@haru/contracts';

import { useApiClients } from '../../../shared/api/context';
import {
  usePushPermissionPort,
  type PushPermissionStatus,
} from '../../../shared/platform/push-permission';

export interface PushPermissionState {
  /** 아직 읽는 중이면 `undefined`. */
  status: PushPermissionStatus | undefined;
  /** OS 프롬프트가 떠 있는 동안 `true`. */
  isRequesting: boolean;
  /** 등록된 기기 (token 없음). */
  device: PushDevice | undefined;
  isRegistering: boolean;
  registerFailed: boolean;
  /** 사전 안내를 읽은 사용자가 누를 때만 부른다. `prompt` 가 아니면 아무것도 하지 않는다. */
  request: () => void;
  /** 등록 실패 후 다시 시도. */
  retryRegister: () => void;
}

export function usePushPermission(): PushPermissionState {
  const port = usePushPermissionPort();
  const { notifications } = useApiClients();
  const [status, setStatus] = useState<PushPermissionStatus | undefined>(undefined);
  const [isRequesting, setIsRequesting] = useState(false);
  const registeredOnce = useRef(false);

  const register = useMutation({
    mutationFn: async (): Promise<PushDevice> => {
      const token = await port.getToken();
      if (token === null) throw new Error('push token unavailable');
      return notifications.registerPushDevice({ body: { platform: port.platform, token } });
    },
  });
  const { mutate } = register;

  // 상태만 읽는다 — 묻지 않는다.
  useEffect(() => {
    let cancelled = false;
    void port.getStatus().then((next) => {
      if (!cancelled) setStatus(next);
    });
    return () => {
      cancelled = true;
    };
  }, [port]);

  // `granted` 가 되면 한 번 등록한다.
  useEffect(() => {
    if (status !== 'granted' || registeredOnce.current) return;
    registeredOnce.current = true;
    mutate();
  }, [status, mutate]);

  return {
    status,
    isRequesting,
    device: register.data,
    isRegistering: register.isPending,
    registerFailed: register.isError,
    request: () => {
      if (status !== 'prompt' || isRequesting) return;
      setIsRequesting(true);
      void port
        .request()
        .then(setStatus)
        .finally(() => {
          setIsRequesting(false);
        });
    },
    retryRegister: () => {
      if (status === 'granted') mutate();
    },
  };
}
