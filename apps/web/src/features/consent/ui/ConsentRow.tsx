/**
 * 동의 항목 1행 — Design Spec §2.6 `ConsentRow`.
 *
 * 표시되는 모든 값(`title` · `required` · `version` · `url`)은 **API 응답**에서 온다.
 * 이 컴포넌트는 필수/선택을 스스로 판단하지 않는다 (AC-2-10).
 *
 * 링크를 `<label>` 안에 넣지 않는다 — label 안의 링크는 클릭이 체크박스 토글로 새어
 * 사용자가 문서를 열 수 없게 된다. 그래서 행은 `Checkbox` 와 `TextLink` **형제 배치**다.
 */
import { Checkbox, TextLink } from '@haru/ui';
import type { ConsentDocument } from '@haru/contracts';

import { consentCopy } from '../copy';

export interface ConsentRowProps {
  document: ConsentDocument;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function ConsentRow({ document, checked, onChange }: ConsentRowProps) {
  const copy = consentCopy.guardianConsent;
  const requirement = document.required ? copy.requiredLabel : copy.optionalLabel;

  return (
    <div className="haru-consent-row">
      <div className="haru-consent-row__main">
        <Checkbox
          checked={checked}
          onChange={onChange}
          label={document.title}
          /* 색 단독으로 필수 여부를 전달하지 않는다 — 문구로 적는다 (WCAG 1.4.1). */
          description={copy.meta(requirement, document.version)}
          required={document.required}
        />
      </div>
      {/*
        결정 `D-4` — 문서는 **외부 링크**로 연다. `/legal/*` page 도 본문 fixture 도 만들지 않는다.
        `external` 이 `target="_blank" rel="noopener noreferrer"` 와 외부 링크 아이콘을 붙인다.
      */}
      {/* `D8-3` (`H8-6-N4`) — 행 안 단독 링크: 보이는 모습 그대로, 누르는 영역만 44. */}
      <TextLink
        href={document.url}
        external
        externalHint={consentCopy.guardianConsent.externalHint}
        hitArea="touch"
      >
        <span className="haru-visually-hidden">{copy.viewLabelFor(document.title)}</span>
        <span aria-hidden="true">{copy.viewLabel}</span>
      </TextLink>
    </div>
  );
}
