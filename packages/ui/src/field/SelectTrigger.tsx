import { useId, useState } from 'react';

import { Icon } from '../icon/Icon';
import { cx } from '../lib/cx';
import { Sheet } from '../sheet/Sheet';

import { RadioGroup, type RadioOption } from './RadioGroup';

/** 선택지. 문구는 소비자가 소유한다 (`packages/ui` 는 copy 를 갖지 않는다 — §4 공통 규칙 9). */
export interface SelectTriggerOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectTriggerProps {
  /** 항상 보이는 라벨. placeholder 로 대체하지 않는다 (§4.1). */
  label: string;
  /** 선택된 값. 선택 없음은 `null`. */
  value: string | null;
  /** 미선택 표현 — 색이 아니라 텍스트로 알린다 (§4.1). */
  placeholder: string;
  options: readonly SelectTriggerOption[];
  onChange: (value: string) => void;
  /** 옵션 Sheet 제목. 없으면 `label` 을 쓴다. */
  sheetTitle?: string;
  /** 값이 있으면 error 상태 — 경계색 + 메시지 (§4 공통 규칙 6). */
  error?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
}

/**
 * SelectTrigger — Stage 2 Design Spec §4.1 (Figma `179:1740` · `31:118`).
 *
 * variant 는 `row` 단일이다 — `FieldGroup` 안의 한 행이며 pill 형태는 만들지 않는다
 * (허용 차이 `AD-S2-6`). state: rest · hover · pressed · focus · filled · placeholder ·
 * error · disabled.
 *
 * 선택 UI 는 **신규 컴포넌트가 아니라 기존 `Sheet variant=bottom` 재사용**이다 (결정 D-8).
 * Sheet 안에서는 `RadioGroup variant=list` 가 native radio 의 화살표 이동을 그대로 쓰고,
 * 항목을 고르면 즉시 반영 후 닫힌다. 닫히면 포커스는 트리거로 돌아온다 (`useFocusTrap`).
 */
export function SelectTrigger({
  label,
  value,
  placeholder,
  options,
  onChange,
  sheetTitle,
  error,
  disabled = false,
  required = false,
  id,
}: SelectTriggerProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const errorId = `${fieldId}-error`;
  const [open, setOpen] = useState(false);

  const selected = options.find((option) => option.value === value) ?? null;
  const radioOptions: readonly RadioOption[] = options.map((option) => ({
    value: option.value,
    label: option.label,
    ...(option.disabled === undefined ? {} : { disabled: option.disabled }),
  }));

  return (
    <div
      className={cx(
        'haru-select-trigger',
        error && 'haru-select-trigger--error',
        disabled && 'haru-select-trigger--disabled',
      )}
    >
      <button
        type="button"
        id={fieldId}
        className="haru-select-trigger__row haru-focus-ring"
        /* 접근성 이름 = label + 현재 값. 값 없음도 placeholder 텍스트로 읽힌다 (§4.1). */
        aria-haspopup="dialog"
        aria-expanded={open}
        /* role=button 은 aria-invalid 를 지원하지 않는다 — 에러는 메시지 연결 + 시각 표시로 알린다. */
        aria-describedby={error ? errorId : undefined}
        disabled={disabled}
        onClick={() => {
          setOpen(true);
        }}
      >
        <span className="haru-select-trigger__main">
          <span className="haru-select-trigger__label">
            {label}
            {required ? (
              <span className="haru-select-trigger__required" aria-hidden="true">
                *
              </span>
            ) : null}
          </span>
          <span
            className={cx(
              'haru-select-trigger__value',
              selected === null && 'haru-select-trigger__value--placeholder',
            )}
          >
            {selected === null ? placeholder : selected.label}
          </span>
        </span>
        <span className="haru-select-trigger__chevron">
          <Icon name="chevron-down" size="sm" decorative />
        </span>
      </button>

      {error ? (
        <p className="haru-select-trigger__message" id={errorId}>
          {error}
        </p>
      ) : null}

      <Sheet
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        title={sheetTitle ?? label}
      >
        <RadioGroup
          legend={label}
          name={`${fieldId}-options`}
          options={radioOptions}
          value={value}
          variant="list"
          onChange={(next) => {
            onChange(next);
            setOpen(false);
          }}
        />
      </Sheet>
    </div>
  );
}
