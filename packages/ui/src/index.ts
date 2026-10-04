/*
 * HARU Shared UI — 공개 진입점 (Stage 1 Plan §9.3, Design Spec §4.23)
 *
 * Stage 1 Design Spec §4.23 의 22종 + Stage 2 Design Spec §4 의 신규 6종 = 28종을 제공한다
 * (Stage 1-D1 8종 + Stage 1-D2 14종 + Stage 2-UI 6종 — 결정 D-8).
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

export { SelectTrigger } from './field/SelectTrigger';
export type { SelectTriggerOption, SelectTriggerProps } from './field/SelectTrigger';

export { Checkbox } from './field/Checkbox';
export type { CheckboxProps } from './field/Checkbox';

export { CheckboxGroup } from './field/CheckboxGroup';
export type {
  CheckboxCardOption,
  CheckboxGroupProps,
  CheckboxGroupVariant,
} from './field/CheckboxGroup';

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

/* 브랜드 마크 — 공식 에셋(수정 금지). 결정 `D-15`. 일반 아이콘과 분리되어 있다. */
export { BrandMark, BRAND_MARKS, AppleMark, GoogleMark } from './icon/brand';
export type { BrandMarkName, BrandMarkProps } from './icon/brand';

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

/* ===== Stage 2-UI 신규 6종 (Stage 2 Design Spec §4, 결정 D-8) ================ */

export { SwipeDeck } from './deck/SwipeDeck';
export type { SwipeDeckControls, SwipeDeckDepth, SwipeDeckProps } from './deck/SwipeDeck';

export { ListGroup } from './list/ListGroup';
export type { ListGroupProps } from './list/ListGroup';

export { ListRow } from './list/ListRow';
export type { ListRowProps } from './list/ListRow';

export { InfoRow } from './list/InfoRow';
export type { InfoRowProps } from './list/InfoRow';

export { DividerWithLabel } from './divider/DividerWithLabel';
export type { DividerWithLabelProps } from './divider/DividerWithLabel';

export { TextLink } from './link/TextLink';
export type { TextLinkProps, TextLinkTone } from './link/TextLink';

/* 스크롤 컨테이너 context — 결정 D-13 (AppShell 이 ref 를 제공한다). */
export { ScrollContainerProvider, useScrollContainerRef } from './layout/ScrollContainerContext';
export type { ScrollContainerProviderProps } from './layout/ScrollContainerContext';
