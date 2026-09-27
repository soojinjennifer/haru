/** `features/settings` 공개 진입점 — pages 만 소비한다 (rules/architecture §3). */
export { settingsCopy } from './copy';
export { SettingsMenu } from './ui/SettingsMenu';
export type { SettingsMenuProps } from './ui/SettingsMenu';
export { useSignOut } from './model/useSignOut';
export type { SignOutMutation, UseSignOutOptions } from './model/useSignOut';
