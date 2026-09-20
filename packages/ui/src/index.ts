/*
 * HARU Shared UI — 공개 진입점 (Stage 1 Plan §9.3, Design Spec §4)
 *
 * Stage 1-D1 범위: Button + ButtonGroup · IconButton · TextField + FieldGroup ·
 * Checkbox + CheckboxGroup · RadioGroup · Chip · Tag · ProgressBar.
 * 나머지 Shared UI 는 후속 단계에서 추가한다.
 *
 * 스타일은 `@haru/ui/styles.css` 를 앱에서 한 번 import 한다.
 */

export { Button } from './button/Button';
export type { ButtonProps, ButtonSize, ButtonVariant } from './button/Button';

export { ButtonGroup } from './button/ButtonGroup';
export type { ButtonGroupLayout, ButtonGroupProps } from './button/ButtonGroup';

export { IconButton } from './button/IconButton';
export type { IconButtonProps, IconButtonVariant } from './button/IconButton';

export { FieldGroup } from './field/FieldGroup';
export type { FieldGroupProps } from './field/FieldGroup';

export { TextField } from './field/TextField';
export type { TextFieldProps, TextFieldTrailingAction, TextFieldType } from './field/TextField';

export { Checkbox } from './field/Checkbox';
export type { CheckboxProps } from './field/Checkbox';

export { CheckboxGroup } from './field/CheckboxGroup';
export type { CheckboxGroupProps } from './field/CheckboxGroup';

export { RadioGroup } from './field/RadioGroup';
export type {
  RadioGroupProps,
  RadioGroupVariant,
  RadioOption,
  RadioOptionVariant,
} from './field/RadioGroup';

export { Chip } from './chip/Chip';
export type { ChipProps, ChipVariant } from './chip/Chip';

export { Tag } from './tag/Tag';
export type { TagProps, TagSize, TagTone } from './tag/Tag';

export { ProgressBar } from './progress/ProgressBar';
export type { ProgressBarProps, ProgressBarSize, ProgressBarTone } from './progress/ProgressBar';
