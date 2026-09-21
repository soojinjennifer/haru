import { Surface, Tag, Text } from '@haru/ui';

import { appCopy } from '../../shared/copy/app-copy';

/**
 * 임시 placeholder 화면 (Plan §3.1 · §9.5).
 *
 * Stage 2 에서 Home 화면 골격으로 **교체**된다. 실제 화면 내용을 미리 만들지 않는다.
 * Page 는 Composition 만 한다 — API 호출 · Recording · 복잡한 로직 없음 (rules/frontend.md §3).
 */
export function PlaceholderPage() {
  return (
    <div className="flex flex-col gap-4 py-8">
      <Surface fill="glass" radius="card" padding="6">
        <div className="flex flex-col items-start gap-3">
          <Tag label={appCopy.placeholder.note} tone="neutral" size="sm" />
          <Text as="h1" variant="title-2" weight="bold" tone="primary">
            {appCopy.placeholder.title}
          </Text>
          <Text variant="body" tone="secondary">
            {appCopy.placeholder.description}
          </Text>
        </div>
      </Surface>
    </div>
  );
}
