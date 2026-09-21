/*
 * HARU Shared UI — 공개 진입점 (Stage 1 Plan §9.3, Design Spec §4.23)
 *
 * Design Spec §4.23 의 22종을 모두 제공한다 (Stage 1-D1 8종 + Stage 1-D2 14종).
 * 스타일은 `@haru/ui/styles.css` 를 앱에서 한 번 import 한다.
 */

export { Button } from './button/Button';
export type { ButtonProps, ButtonSize, ButtonVariant } from './button/Button';

export { ButtonGroup } from './button/ButtonGroup';
export type { ButtonGroupLayout, ButtonGroupProps } from './button/ButtonGroup';

export { IconButton } from './button/IconButton';
export type { IconButtonProps, IconButtonSize, IconButtonVariant } from './button/IconButton';

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

export { Text } from './text/Text';
export type {
  TextAlign,
  TextElement,
  TextProps,
  TextTone,
  TextTruncate,
  TextVariant,
  TextWeight,
} from './text/Text';

export { Icon } from './icon/Icon';
export type { IconName, IconProps, IconSize, IconTone } from './icon/Icon';

export { Surface } from './surface/Surface';
export type {
  SurfaceElement,
  SurfaceFill,
  SurfaceMaterial,
  SurfacePadding,
  SurfaceProps,
  SurfaceRadius,
} from './surface/Surface';

export { AppBackground } from './surface/AppBackground';
export type { AppBackgroundProps, AppBackgroundVariant } from './surface/AppBackground';

export { AppColumn } from './layout/AppColumn';
export type { AppColumnElement, AppColumnProps } from './layout/AppColumn';

export { TopBar } from './top-bar/TopBar';
export type { TopBarProps, TopBarVariant } from './top-bar/TopBar';

export { BottomTabBar } from './tab-bar/BottomTabBar';
export type { BottomTabBarProps, TabBarItem } from './tab-bar/BottomTabBar';

export { Spinner } from './feedback/Spinner';
export type { SpinnerProps, SpinnerSize, SpinnerTone } from './feedback/Spinner';

export { Skeleton } from './feedback/Skeleton';
export type { SkeletonLines, SkeletonProps, SkeletonShape } from './feedback/Skeleton';

export { ErrorState } from './feedback/ErrorState';
export type { ErrorStateProps, ErrorStateTone } from './feedback/ErrorState';

export { EmptyState } from './feedback/EmptyState';
export type { EmptyStateAction, EmptyStateProps } from './feedback/EmptyState';

export { InlineAlert } from './feedback/InlineAlert';
export type {
  InlineAlertAction,
  InlineAlertPlacement,
  InlineAlertProps,
  InlineAlertTone,
} from './feedback/InlineAlert';

export { Toast } from './feedback/Toast';
export type { ToastAction, ToastProps, ToastState, ToastTone } from './feedback/Toast';

export { ToastProvider, useToast } from './feedback/ToastProvider';
export type { ToastController, ToastOptions, ToastProviderProps } from './feedback/ToastProvider';

export { PageIndicator } from './progress/PageIndicator';
export type { PageIndicatorProps } from './progress/PageIndicator';

export { SpeechBubble } from './bubble/SpeechBubble';
export type { SpeechBubbleAlign, SpeechBubbleProps, SpeechBubbleTail } from './bubble/SpeechBubble';

export { Sheet } from './sheet/Sheet';
export type { SheetProps, SheetVariant } from './sheet/Sheet';

export { Scrim } from './sheet/Scrim';
export type { ScrimLevel, ScrimProps } from './sheet/Scrim';

export { Dialog } from './dialog/Dialog';
export type { DialogProps, DialogVariant } from './dialog/Dialog';

export { ConfirmDialog } from './dialog/ConfirmDialog';
export type { ConfirmDialogProps } from './dialog/ConfirmDialog';
