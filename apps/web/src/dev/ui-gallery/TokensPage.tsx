/**
 * `/__dev/ui/tokens` — 색 · 타입 · spacing · radius · shadow · material swatch (Design Spec §11-5).
 * Figma `17:366` Foundations 와 대조하는 시각 비교 대상이다 (§10.2 V-8).
 *
 * 토큰 목록은 손으로 적지 않고 **적용된 스타일시트에서 읽는다** (`tokenScan.ts`).
 * 그래야 `packages/design-tokens` 가 바뀌면 이 화면도 같이 바뀐다.
 */
import { Surface, Text } from '@haru/ui';
import { useEffect, useMemo, useState, type ReactNode } from 'react';

import { PROVISIONAL_ITEMS } from './provisionalItems';
import { Grid, Row, Section, Stack, Stage, SubHead } from './primitives';
import { collectRootTokens, tokensWithPrefix, withoutModifiers, type RootToken } from './tokenScan';

function Swatch({ token, kind }: { token: RootToken; kind: 'color' | 'shadow' | 'gradient' }) {
  const style =
    kind === 'color'
      ? { backgroundColor: `var(${token.name})` }
      : kind === 'gradient'
        ? { backgroundImage: `var(${token.name})` }
        : { boxShadow: `var(${token.name})` };

  return (
    <div className="haru-dev-swatch">
      <div className="haru-dev-swatch__box" style={style} />
      <span className="haru-dev-swatch__name">{token.name}</span>
      <span className="haru-dev-swatch__value">{token.computed}</span>
    </div>
  );
}

function ValueRow({ token, render }: { token: RootToken; render: (name: string) => ReactNode }) {
  return (
    <div className="haru-dev-swatch">
      {render(token.name)}
      <span className="haru-dev-swatch__name">{token.name}</span>
      <span className="haru-dev-swatch__value">{token.computed}</span>
    </div>
  );
}

export function TokensPage() {
  const [tokens, setTokens] = useState<readonly RootToken[]>([]);

  useEffect(() => {
    // 폰트·CSS 가 모두 적용된 뒤에 읽는다 (dev 서버는 스타일을 비동기로 주입한다).
    let cancelled = false;

    void document.fonts.ready.then(() => {
      if (!cancelled) setTokens(collectRootTokens());
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const groups = useMemo(
    () => ({
      colors: tokensWithPrefix(tokens, '--color-'),
      primitives: tokensWithPrefix(tokens, '--haru-'),
      gradients: tokensWithPrefix(tokens, '--gradient-'),
      text: withoutModifiers(tokensWithPrefix(tokens, '--text-')),
      weights: tokensWithPrefix(tokens, '--font-weight-'),
      space: tokensWithPrefix(tokens, '--space-'),
      sizes: tokensWithPrefix(tokens, '--size-'),
      radius: tokensWithPrefix(tokens, '--radius-'),
      shadow: tokensWithPrefix(tokens, '--shadow-'),
      material: tokensWithPrefix(tokens, '--material-'),
      motion: tokensWithPrefix(tokens, '--motion-'),
      layout: tokensWithPrefix(tokens, '--layout-'),
      zIndex: tokensWithPrefix(tokens, '--z-'),
    }),
    [tokens],
  );

  return (
    <>
      <p className="haru-dev-lede" data-token-count={tokens.length}>
        적용된 스타일시트에서 읽은 `:root` custom property {tokens.length}개. 값은 계산값이며
        `var()` 참조가 해석된 결과다. Figma `17:366` Foundations 와 대조한다 (§10.2 V-8).
      </p>

      <Section
        id="v8-color-semantic"
        title="Color — Tier 2 semantic"
        note={`${groups.colors.length}개`}
      >
        <Grid>
          {groups.colors.map((token) => (
            <Swatch key={token.name} token={token} kind="color" />
          ))}
        </Grid>
      </Section>

      <Section
        id="v8-color-primitive"
        title="Color — Tier 1 primitive"
        note={`${groups.primitives.length}개 (@theme 미노출)`}
      >
        <Grid>
          {groups.primitives.map((token) => (
            <Swatch key={token.name} token={token} kind="color" />
          ))}
        </Grid>
      </Section>

      <Section id="v8-gradient" title="Gradient" note="배경 gradient — stop 46% (가값 P-14)">
        <Grid wide>
          {groups.gradients.map((token) => (
            <Swatch key={token.name} token={token} kind="gradient" />
          ))}
        </Grid>
      </Section>

      <Section id="v8-typography" title="Typography" note="11 스타일 + weight 5 (Figma 17:298)">
        <Stage plain>
          <Stack>
            {groups.text.map((token) => (
              <div key={token.name}>
                <span
                  style={{
                    fontSize: `var(${token.name})`,
                    lineHeight: `var(${token.name}--line-height)`,
                    fontWeight: `var(${token.name}--font-weight)`,
                    letterSpacing: `var(${token.name}--letter-spacing)`,
                  }}
                >
                  {token.name.replace('--text-', '')} — Reading together
                </span>
                <span className="haru-dev-swatch__value"> {token.computed}</span>
              </div>
            ))}
          </Stack>
          <SubHead>font-weight</SubHead>
          <Row>
            {groups.weights.map((token) => (
              <span key={token.name} style={{ fontWeight: `var(${token.name})` }}>
                {token.name.replace('--font-weight-', '')} {token.computed}
              </span>
            ))}
          </Row>
        </Stage>
      </Section>

      <Section
        id="v8-space"
        title="Spacing"
        note="2 · 4 · 6 · 8 · 10 · 12 · 14 · 16 · 20 · 24 · 32"
      >
        <Stage plain>
          <Stack>
            {groups.space.map((token) => (
              <ValueRow
                key={token.name}
                token={token}
                render={(name) => (
                  <div className="haru-dev-bar" style={{ width: `var(${name})` }} />
                )}
              />
            ))}
          </Stack>
        </Stage>
      </Section>

      <Section id="v8-size" title="Size" note="button · icon · medallion · touch">
        <Stage plain>
          <Grid>
            {groups.sizes.map((token) => (
              <ValueRow
                key={token.name}
                token={token}
                render={(name) => (
                  <div
                    className="haru-dev-swatch__box"
                    style={{ width: `var(${name})`, height: `var(${name})` }}
                  />
                )}
              />
            ))}
          </Grid>
        </Stage>
      </Section>

      <Section
        id="v8-radius"
        title="Radius"
        note="indicator · control · field · surface · card · pill"
      >
        <Stage plain>
          <Row top>
            {groups.radius.map((token) => (
              <ValueRow
                key={token.name}
                token={token}
                render={(name) => (
                  <div className="haru-dev-box" style={{ borderRadius: `var(${name})` }} />
                )}
              />
            ))}
          </Row>
        </Stage>
      </Section>

      <Section id="v8-shadow" title="Shadow" note="Figma HARU Effect Style (§10.3 AD-3)">
        <Stage>
          <Grid>
            {groups.shadow.map((token) => (
              <Swatch key={token.name} token={token} kind="shadow" />
            ))}
          </Grid>
        </Stage>
      </Section>

      <Section
        id="v2-material"
        title="Material"
        note="Glass Rest / Raised / Pressed (Figma 17:332 · 16:24)"
      >
        <Stage>
          <Row top>
            <Surface material="rest" fill="glass" radius="card" padding="6">
              <Text variant="footnote">glass rest</Text>
            </Surface>
            <Surface material="raised" fill="glass" radius="card" padding="6">
              <Text variant="footnote">glass raised</Text>
            </Surface>
            <Surface material="pressed" fill="glass" radius="card" padding="6">
              <Text variant="footnote">glass pressed</Text>
            </Surface>
            <Surface material="rest" fill="strong" radius="card" padding="6">
              <Text variant="footnote">strong</Text>
            </Surface>
          </Row>
          <SubHead>material token</SubHead>
          <Grid>
            {groups.material.map((token) => (
              <div className="haru-dev-swatch" key={token.name}>
                <span className="haru-dev-swatch__name">{token.name}</span>
                <span className="haru-dev-swatch__value">{token.computed}</span>
              </div>
            ))}
          </Grid>
        </Stage>
      </Section>

      <Section id="v8-motion-layout" title="Motion · Layout · z-index" note="수치 확인용">
        <Stage plain>
          <table className="haru-dev-table">
            <thead>
              <tr>
                <th>token</th>
                <th>value</th>
              </tr>
            </thead>
            <tbody>
              {[...groups.motion, ...groups.layout, ...groups.zIndex].map((token) => (
                <tr key={token.name}>
                  <td>{token.name}</td>
                  <td className="haru-dev-mono">{token.computed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Stage>
      </Section>

      <Section
        id="v9-provisional"
        title="가값 (provisional) 승인 자료"
        note="Plan §17 · Design Spec §12.3 — 확정 11건 / 디자이너 대기 6건 (P-17 = Stage 2 신규, 결정 D-14)."
      >
        <Stage plain>
          <table className="haru-dev-table">
            <thead>
              <tr>
                <th>P</th>
                <th>항목</th>
                <th>Stage 1 채택값</th>
                <th>확인 화면</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {PROVISIONAL_ITEMS.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.title}</td>
                  <td>{item.adopted}</td>
                  <td>{item.where}</td>
                  <td>
                    {item.status === 'confirmed' ? '확정' : '디자이너 대기'} — {item.decision}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Stage>
      </Section>
    </>
  );
}
