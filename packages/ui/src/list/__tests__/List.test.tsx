import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { Checkbox } from '../../field/Checkbox';
import { Icon } from '../../icon/Icon';
import { InfoRow } from '../InfoRow';
import { ListGroup } from '../ListGroup';
import { ListRow } from '../ListRow';

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
