import { afterEach, describe, expect, it } from 'vitest';

import { nextTabbableAfter } from '../focus';

afterEach(() => {
  document.body.innerHTML = '';
});

function mountHtml(html: string): void {
  document.body.innerHTML = html;
}

describe('nextTabbableAfter — 닫혀 사라지는 요소 다음 Tab 대상 (`D4-134` · `VG-H3-04`)', () => {
  it('문서 순서에서 container 뒤의 첫 대상 — container 안 · 앞의 요소는 건너뛴다', () => {
    mountHtml(
      '<button id="before">a</button><div id="box"><button id="inside">b</button></div><button id="after">c</button>',
    );
    const box = document.getElementById('box') as HTMLElement;
    expect(nextTabbableAfter(box)?.id).toBe('after');
  });

  it('disabled · tabindex -1 · hidden · inert · aria-hidden 은 대상이 아니다', () => {
    mountHtml(
      [
        '<div id="box"><button>x</button></div>',
        '<button disabled>1</button>',
        '<div tabindex="-1">2</div>',
        '<div hidden><button>3</button></div>',
        '<div inert><button>4</button></div>',
        '<div aria-hidden="true"><a href="#">5</a></div>',
        '<div id="track" tabindex="0">6</div>',
      ].join(''),
    );
    const box = document.getElementById('box') as HTMLElement;
    expect(nextTabbableAfter(box)?.id).toBe('track');
  });

  it('뒤에 대상이 없으면 null', () => {
    mountHtml('<button>a</button><div id="box"><button>b</button></div>');
    expect(nextTabbableAfter(document.getElementById('box') as HTMLElement)).toBeNull();
  });
});
