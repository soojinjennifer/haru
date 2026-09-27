/**
 * 소셜 로그인 버튼 — Design Spec §4.7 ("신규 컴포넌트를 만들지 않는다").
 * `Button variant=glass` + `packages/ui/src/icon/brand` 의 **공식 브랜드 마크** 조합이다.
 *
 * 결정 `D-15`: Apple 규격이 `Button variant=glass` 표면과 충돌하면 **Apple 규격이 우선**이다.
 * 현재 구현이 지키는 Apple 규격:
 *   - 공식 로고를 왜곡 없이(814:1000) 라벨 왼쪽에 둔다
 *   - 버튼 높이 56 ≥ Apple 최소 44
 *   - 밝은 표면 위이므로 **검정 로고**
 *   - 승인 라벨 문구("Continue with Apple")만 쓴다
 * 허용 차이(`AD-S2-13`, handoff 기록): 표면이 solid white 가 아니라 반투명 glass 다.
 *
 * 실제 OAuth 흐름은 이 Stage 범위 밖이다 — Gateway Mock 까지만 (`BACKEND_INTEGRATION_PENDING`).
 */
import type { AuthProvider } from '@haru/contracts';
import { BrandMark, Button } from '@haru/ui';

export interface SocialAuthButtonsProps {
  googleLabel: string;
  appleLabel: string;
  onSelect: (provider: AuthProvider) => void;
  /** 진행 중인 provider. 해당 버튼만 loading 이다. */
  pendingProvider?: AuthProvider | undefined;
  disabled?: boolean;
}

export function SocialAuthButtons({
  googleLabel,
  appleLabel,
  onSelect,
  pendingProvider,
  disabled = false,
}: SocialAuthButtonsProps) {
  return (
    <div className="flex flex-col gap-3">
      <Button
        variant="glass"
        size="lg"
        fullWidth
        leadingIcon={<BrandMark name="brand:google" />}
        loading={pendingProvider === 'google'}
        disabled={disabled}
        onPress={() => {
          onSelect('google');
        }}
      >
        {googleLabel}
      </Button>
      <Button
        variant="glass"
        size="lg"
        fullWidth
        leadingIcon={<BrandMark name="brand:apple" />}
        loading={pendingProvider === 'apple'}
        disabled={disabled}
        onPress={() => {
          onSelect('apple');
        }}
      >
        {appleLabel}
      </Button>
    </div>
  );
}
