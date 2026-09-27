/**
 * 보호자 동의 폼 — Design Spec §2.6 (`C13-02`, Figma 없음 → 명세). **Stage 2 Privacy 핵심.**
 *
 * 규칙
 * - 항목 수·순서·라벨·**필수 여부는 전부 API 응답 값**이다. 5개를 하드코딩하지 않는다 (AC-2-10).
 * - "모두 동의" 일괄 체크를 두지 않는다 — 아동 음성 데이터 동의는 개별 의사 확인이 필요하다 (C-1).
 * - 필수 미체크 시 CTA 는 native `disabled` 가 아니라 **`aria-disabled` + 포커스 가능**이다.
 *   그래야 비활성 이유(`aria-describedby`)가 스크린리더에 전달된다 (§2.6 · §10).
 * - 동의 **철회** UI 를 만들지 않는다 (C-4).
 * - 이 화면에서는 **아동 데이터를 입력받지도 전송하지도 않는다** (AC-2-13).
 *
 * 화면 이동은 하지 않는다. 기록이 성공하면 `onRecorded()` 로 알리고 이후 경로는
 * **Route Guard 가 판정한다** (동의 완료 → VPC 또는 온보딩).
 */
import { Button, CheckboxGroup, ErrorState, InlineAlert, Skeleton, Surface, Text } from '@haru/ui';
import { useId, useState, type FormEvent } from 'react';
import type { ConsentSource } from '@haru/contracts';

import { useConsentDocuments, useRecordConsents } from '../../../entities/consent';
import { isHaruApiError, isNetworkError } from '../../../shared/api/helpers';
import { errorCopyForCode, networkErrorCopy } from '../../../shared/copy/error-copy';
import { consentCopy } from '../copy';
import {
  buildRecordConsentsRequest,
  canSubmit,
  EMPTY_SELECTION,
  isSelected,
  toggleSelection,
  type ConsentSelection,
} from '../model/consentSelection';

import { ConsentRow } from './ConsentRow';

export interface GuardianConsentFormProps {
  /** `consent_events.source` — page 가 `me.consentStatus` 로 판단해 넘긴다. */
  source: ConsentSource;
  /** 재동의 안내를 띄울지 (이전 동의 기록이 있는데 다시 필요한 상태). */
  reconsent?: boolean;
  /** 동의 기록이 성공한 뒤 호출된다. 화면 이동은 호출자(page)가 한다. */
  onRecorded: () => void;
}

export function GuardianConsentForm({
  source,
  reconsent = false,
  onRecorded,
}: GuardianConsentFormProps) {
  const copy = consentCopy.guardianConsent;
  const reasonId = useId();

  const [selection, setSelection] = useState<ConsentSelection>(EMPTY_SELECTION);

  const query = useConsentDocuments();
  const mutation = useRecordConsents();

  const documents = query.documents ?? [];
  const ready = canSubmit(documents, selection);

  function submissionFailure(): { title: string; description: string } | undefined {
    if (!mutation.isError) return undefined;
    if (isNetworkError(mutation.error)) return networkErrorCopy;

    return errorCopyForCode(isHaruApiError(mutation.error) ? mutation.error.code : undefined);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    // CTA 는 `aria-disabled` 라 포커스·클릭이 가능하다 — 제출은 여기에서 막는다.
    if (!ready) return;

    mutation.mutate(buildRecordConsentsRequest(documents, selection, source), {
      onSuccess: onRecorded,
    });
  }

  if (query.isPending) {
    return (
      <div
        className="flex flex-1 flex-col gap-5 pt-5"
        role="status"
        aria-busy="true"
        aria-label={copy.loadingLabel}
      >
        <Surface fill="strong" radius="card" padding="5">
          <Skeleton shape="text" lines={5} />
        </Surface>
      </div>
    );
  }

  if (query.isError) {
    const message = query.isOffline ? networkErrorCopy : errorCopyForCode(query.errorCode);

    return (
      <div className="flex flex-1 flex-col pt-5">
        <ErrorState
          title={message.title}
          description={message.description}
          onRetry={query.refetch}
          retryLabel={copy.retryLabel}
          tone={query.isOffline ? 'offline' : 'error'}
        />
      </div>
    );
  }

  const failure = submissionFailure();

  return (
    <form className="flex flex-1 flex-col gap-5 pt-5" onSubmit={handleSubmit} noValidate>
      <Text variant="body" tone="primary">
        {copy.intro}
      </Text>

      {reconsent ? (
        <InlineAlert
          tone="info"
          title={copy.reconsentTitle}
          description={copy.reconsentDescription}
        />
      ) : null}

      <Surface fill="strong" radius="card" padding="5">
        {/* `haru-consent-group` 은 `<legend>` 를 시각적으로만 숨긴다 (§2.6, consent.css). */}
        <div className="haru-consent-group">
          <CheckboxGroup legend={copy.legend}>
            {documents.map((document) => (
              <ConsentRow
                key={document.documentId}
                document={document}
                checked={isSelected(selection, document.type)}
                onChange={(checked) => {
                  setSelection((current) => toggleSelection(current, document.type, checked));
                }}
              />
            ))}
          </CheckboxGroup>
        </div>
      </Surface>

      {failure === undefined ? null : (
        <InlineAlert tone="error" title={failure.title} description={failure.description} />
      )}

      {/* 하단 CTA 는 스크롤 컨테이너 **내부** 마지막 블록이다 (§2.2 키보드 가림 방지). */}
      <div className="mt-auto flex flex-col gap-2 pt-10">
        {ready ? null : (
          <Text id={reasonId} variant="caption-1" tone="secondary">
            {copy.blockedReason}
          </Text>
        )}
        <Button
          type="submit"
          variant="accent"
          size="lg"
          fullWidth
          loading={mutation.isPending}
          aria-disabled={ready ? undefined : true}
          aria-describedby={ready ? undefined : reasonId}
        >
          {copy.submit}
        </Button>
      </div>
    </form>
  );
}
