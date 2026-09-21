/**
 * Gallery 공통 셸 — 상단 내비게이션 + `Outlet`.
 *
 * 제품 Layout(`app/layouts/*`)을 쓰지 않는다. gallery 는 화면이 아니라 **검사 도구**이며,
 * 앱 컬럼 규칙을 관찰 대상으로 두어야 하기 때문이다.
 */
import { NavLink, Outlet } from 'react-router';

import { galleryCopy } from './gallery-copy';

const LINKS = [
  { to: 'tokens', label: galleryCopy.nav.tokens },
  { to: 'components', label: galleryCopy.nav.components },
  { to: 'states', label: galleryCopy.nav.states },
  { to: 'responsive', label: galleryCopy.nav.responsive },
  { to: 'a11y', label: galleryCopy.nav.a11y },
] as const;

export function GalleryLayout() {
  return (
    <>
      <nav className="haru-dev-nav" aria-label="UI gallery">
        <p className="haru-dev-nav__brand">{galleryCopy.nav.brand}</p>
        {LINKS.map((link) => (
          <NavLink key={link.to} to={link.to} className="haru-dev-nav__link" end>
            {link.label}
          </NavLink>
        ))}
      </nav>
      <main className="haru-dev-main">
        <Outlet />
      </main>
    </>
  );
}
