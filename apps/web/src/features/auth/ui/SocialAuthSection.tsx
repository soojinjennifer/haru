/**
 * 소셜 로그인 묶음 — 버튼 + 결과 안내.
 *
 * **취소는 오류가 아니다** (AC-2-08): `session: null` 로 성공 반환되면 같은 화면을 유지하고
 * `InlineAlert tone=info` 로 "다른 방법을 고를 수 있다"고만 알린다 (Design Spec §8).
 *
 * 성공(세션 발급) 후 이동 경로는 **Route Guard 가 판정한다** — 동의가 없으면 `/auth/consent`
 * 로 간다 (C-2). 그래서 이 컴포넌트는 화면 이동을 하지 않는다.
 */
import type { AuthProvider } from '@haru/contracts';
import { InlineAlert } from '@haru/ui';
import { useState } from 'react';

import { authCopy } from '../copy';
import { authErrorMessage } from '../model/authErrorMessage';
import { useSignInWithProvider } from '../model/authMutations';

export interface SocialAuthSectionProps {
  children: (props: {
    onSelect: (provider: AuthProvider) => void;
    pendingProvider: AuthProvider | undefined;
  }) => React.ReactNode;
}

export function SocialAuthSection({ children }: SocialAuthSectionProps) {
  const mutation = useSignInWithProvider();
  const [cancelled, setCancelled] = useState(false);

  const pendingProvider = mutation.isPending ? mutation.variables : undefined;
  const failure = mutation.isError ? authErrorMessage(mutation.error, 'sign-in') : undefined;

  return (
    <div className="flex flex-col gap-3">
      {children({
        pendingProvider,
        onSelect: (provider) => {
          setCancelled(false);
          mutation.mutate(provider, {
            onSuccess: (result) => {
              // 세션이 없다 = 사용자가 provider 화면에서 취소했다.
              setCancelled(result.session === null);
            },
          });
        },
      })}
      {cancelled ? (
        <InlineAlert
          tone="info"
          title={authCopy.providerCancelled.title}
          description={authCopy.providerCancelled.description}
        />
      ) : null}
      {failure === undefined ? null : (
        <InlineAlert tone="error" title={failure.title} description={failure.description} />
      )}
    </div>
  );
}
