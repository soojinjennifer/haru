import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { Checkbox } from '../../field/Checkbox';
import { Icon } from '../../icon/Icon';
import { InfoRow } from '../InfoRow';
import { ListGroup } from '../ListGroup';
import { ListRow } from '../ListRow';

/**
 * Library 1라운드 확장 (Library Design Spec §3.5) — `media` · `meta` 슬롯.
 *
 * `tone`(ListGroup) · `titleVariant`(ListRow) 는 **만들지 않았다**: Stage 2 가 추정한 기본값을
 * Figma 실근거로 정규화해서(`L-NEW-06`·`L-NEW-07`) 기본값이 이미 Library 값이다.
 */
describe('ListRow — media / meta 슬롯 (Library §3.5)', () => {
  it('media 를 넘기면 행에 `--media` 변형이 붙는다 (최소 높이 56 → 74)', () => {
    const { container } = render(
      <ListGroup>
        <ListRow title="Grumpy Monkey" media={<span data-testid="cover" />} />
      </ListGroup>,
    );

    expect(container.querySelector('.haru-list-row--media')).not.toBeNull();
    expect(container.querySelector('.haru-list-row__media')).not.toBeNull();
    expect(screen.getByTestId('cover')).toBeTruthy();
  });

  it('media 가 없으면 변형이 붙지 않는다 (Settings 행은 그대로다)', () => {
    const { container } = render(
      <ListGroup>
        <ListRow title="Log out" />
      </ListGroup>,
    );

    expect(container.querySelector('.haru-list-row--media')).toBeNull();
  });

  it('meta 는 보조 1행의 우측에 들어간다', () => {
    const { container } = render(
      <ListGroup>
        <ListRow title="Grumpy Monkey" subtitle="3 sessions" meta="Rated 4.5" />
      </ListGroup>,
    );

    const metaRow = container.querySelector('.haru-list-row__meta-row');
    expect(metaRow).not.toBeNull();
    expect(metaRow?.querySelector('.haru-list-row__subtitle')?.textContent).toBe('3 sessions');
    expect(metaRow?.querySelector('.haru-list-row__meta')?.textContent).toBe('Rated 4.5');
  });

  /*
   * `unrated` (`L-OPEN-22`) — 평점이 없으면 **빈 자리에 대체 문구를 넣지 않고** 좌측 메타의
   * 좌측 정렬을 유지한다. 그래서 래퍼 자체를 만들지 않는다.
   */
  it('meta 가 없으면 래퍼를 만들지 않는다 (기존 subtitle 행의 DOM 이 그대로다)', () => {
    const { container } = render(
      <ListGroup>
        <ListRow title="Grumpy Monkey" subtitle="3 sessions" />
      </ListGroup>,
    );

    expect(container.querySelector('.haru-list-row__meta-row')).toBeNull();
    expect(container.querySelector('.haru-list-row__subtitle')?.textContent).toBe('3 sessions');
  });

  /*
   * `metaWrap` (Stage 8 `D8-2` ② · `VG8-B-08`, Spec §8.1) — opt-in. 기본(off) 은 class · DOM 변화 0 (기존 사용처 diff 0).
   * 실제 줄 나눔(meta 가 다음 줄 시작으로)은 레이아웃이라 e2e(`settings-data.spec.ts` 320 · 393 실측 + baseline)가 본다.
   */
  it('metaWrap 기본 off — meta-row 의 class 가 지금과 같다 (변형 class 0)', () => {
    const { container } = render(
      <ListGroup>
        <ListRow title="Grumpy Monkey" subtitle="3 sessions" meta="Rated 4.5" />
      </ListGroup>,
    );

    expect(container.querySelector('.haru-list-row__meta-row')?.className).toBe(
      'haru-list-row__meta-row',
    );
  });

  it('metaWrap — meta-row 에 wrap 변형이 붙는다 · DOM 순서(subtitle → meta)는 같다', () => {
    const { container } = render(
      <ListGroup>
        <ListRow
          title="Storytime"
          subtitle="Dec 28, 2025 · 12 min"
          meta="Not uploaded yet"
          metaWrap
        />
      </ListGroup>,
    );

    const metaRow = container.querySelector('.haru-list-row__meta-row');
    expect(metaRow?.className).toBe('haru-list-row__meta-row haru-list-row__meta-row--wrap');
    expect([...(metaRow?.children ?? [])].map((child) => child.className)).toStrictEqual([
      'haru-list-row__subtitle',
      'haru-list-row__meta',
    ]);
  });

  it('metaWrap 은 meta 가 없으면 효과가 없다 (래퍼 0)', () => {
    const { container } = render(
      <ListGroup>
        <ListRow title="Grumpy Monkey" subtitle="3 sessions" metaWrap />
      </ListGroup>,
    );

    expect(container.querySelector('.haru-list-row__meta-row')).toBeNull();
  });

  it('행 접근성 이름에 제목·보조·평점이 모두 들어간다', () => {
    render(
      <ListGroup>
        <ListRow
          title="Grumpy Monkey"
          subtitle="3 sessions"
          meta="Rated 4.5"
          media={<span aria-hidden="true" />}
          trailing={<Icon name="chevron-right" size="sm" decorative />}
          onPress={() => undefined}
        />
      </ListGroup>,
    );

    expect(
      screen.getByRole('button', { name: /Grumpy Monkey.*3 sessions.*Rated 4\.5/ }),
    ).toBeTruthy();
  });
});

describe('ListGroup / ListRow (Stage 2 Design Spec §4.3)', () => {
  it('행은 목록 항목으로 렌더되고 그룹은 이름을 가질 수 있다', () => {
    render(
      <ListGroup label="Settings">
        <ListRow title="Log out" />
      </ListGroup>,
    );

    expect(screen.getByRole('list', { name: 'Settings' })).toBeTruthy();
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
  });

  it('목록이 1행이어도 카드 형태를 유지한다 (Stage 3·6·8 에서 행이 늘어난다 — C-16)', () => {
    const { container } = render(
      <ListGroup>
        <ListRow title="Log out" />
      </ListGroup>,
    );

    expect(container.querySelector('.haru-list-group')).not.toBeNull();
  });

  it('onPress 가 있으면 행 전체가 버튼이고 이름은 title + subtitle 이다', () => {
    const onPress = vi.fn();
    render(
      <ListGroup>
        <ListRow title="The Rainbow Fish" subtitle="Marcus Pfister" onPress={onPress} />
      </ListGroup>,
    );

    const row = screen.getByRole('button', { name: /The Rainbow Fish/ });
    // 접근성 이름에 subtitle 이 함께 들어간다 (§4.3).
    expect(row.textContent).toContain('Marcus Pfister');
    fireEvent.click(row);
    expect(onPress).toHaveBeenCalledOnce();
  });

  it('onPress 가 없으면 버튼이 아니며 trailing 컨트롤이 독립적으로 동작한다', () => {
    const onChange = vi.fn();
    render(
      <ListGroup>
        <ListRow
          title="The Rainbow Fish"
          trailing={
            <Checkbox checked={false} onChange={onChange} label="Select The Rainbow Fish" />
          }
        />
      </ListGroup>,
    );

    expect(screen.queryByRole('button')).toBeNull();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select The Rainbow Fish' }));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('disabled 행은 눌리지 않는다', () => {
    const onPress = vi.fn();
    render(
      <ListGroup>
        <ListRow title="Log out" onPress={onPress} disabled />
      </ListGroup>,
    );

    const row = screen.getByRole('button', { name: 'Log out' });
    expect(row).toHaveProperty('disabled', true);
    fireEvent.click(row);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('selected 행은 aria-current 로 알린다 (색 단독 표시 아님)', () => {
    render(
      <ListGroup>
        <ListRow title="The Rainbow Fish" onPress={vi.fn()} selected />
      </ListGroup>,
    );

    expect(
      screen.getByRole('button', { name: 'The Rainbow Fish' }).getAttribute('aria-current'),
    ).toBe('true');
  });

  it('행이 0개여도 그룹이 렌더된다 (검색 결과 없음 등 0개 상태)', () => {
    render(<ListGroup label="Results">{null}</ListGroup>);

    expect(screen.getByRole('list', { name: 'Results' })).toBeTruthy();
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });
});

describe('InfoRow (Stage 2 Design Spec §4.4)', () => {
  it('아이콘은 접근성 트리에서 숨고 정보는 텍스트가 전달한다', () => {
    const { container } = render(
      <InfoRow icon={<Icon name="clock" decorative />}>About 5 minutes</InfoRow>,
    );

    expect(screen.getByText('About 5 minutes')).toBeTruthy();
    expect(container.querySelector('.haru-info-row__icon')?.getAttribute('aria-hidden')).toBe(
      'true',
    );
  });

  it('인터랙티브 요소가 아니다 (표시 전용)', () => {
    render(<InfoRow icon={<Icon name="list-checks" decorative />}>5 short steps</InfoRow>);

    expect(screen.queryByRole('button')).toBeNull();
  });
});
