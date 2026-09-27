/**
 * `/__dev/ui/components` — Stage 2-UI 신규 6종 (Stage 2 Design Spec §4 · 결정 D-8).
 *
 * dev 전용 화면이다. 도메인 데이터를 쓰지 않고 문구는 `gallery-copy.ts` 에 모은다.
 * 시각 비교 블록 id 는 Stage 2 Design Spec §11.2 의 `s2-*` 다 (영역 클립 baseline — D-12).
 */
import {
  Checkbox,
  DividerWithLabel,
  Icon,
  IconButton,
  InfoRow,
  ListGroup,
  ListRow,
  SelectTrigger,
  SwipeDeck,
  Text,
  TextLink,
} from '@haru/ui';
import { useState } from 'react';

import { galleryCopy } from './gallery-copy';
import { Row, Section, Stack, Stage, SubHead } from './primitives';

const copy = galleryCopy.stage2;

const YEAR_OPTIONS = [
  { value: '2018', label: '2018' },
  { value: '2019', label: '2019' },
  { value: '2020', label: '2020' },
  { value: '2021', label: '2021' },
];

const GENDER_OPTIONS = [
  { value: 'girl', label: copy.selectOptionGirl },
  { value: 'boy', label: copy.selectOptionBoy },
  { value: 'prefer_not_to_say', label: copy.selectOptionPreferNot },
];

function SelectTriggerSection() {
  const [year, setYear] = useState<string | null>(null);
  const [gender, setGender] = useState<string | null>('boy');

  return (
    <Section
      id="s2-selecttrigger"
      title="23. SelectTrigger"
      note="row 단일 · placeholder / filled / error / disabled — 옵션 UI 는 기존 Sheet 재사용 (D-8, Figma 179:1740)"
    >
      <Stage>
        <Stack>
          <SelectTrigger
            label={copy.selectLabelYear}
            value={year}
            placeholder={copy.selectPlaceholder}
            options={YEAR_OPTIONS}
            onChange={setYear}
            sheetTitle={copy.selectSheetTitle}
          />
          <SelectTrigger
            label={copy.selectLabelGender}
            value={gender}
            placeholder={copy.selectPlaceholder}
            options={GENDER_OPTIONS}
            onChange={setGender}
          />
          <SelectTrigger
            label={copy.selectLabelYear}
            value={null}
            placeholder={copy.selectPlaceholder}
            options={YEAR_OPTIONS}
            onChange={() => undefined}
            error={copy.selectError}
            required
          />
          <SelectTrigger
            label={copy.selectDisabled}
            value={null}
            placeholder={copy.selectPlaceholder}
            options={GENDER_OPTIONS}
            onChange={() => undefined}
            disabled
          />
        </Stack>
      </Stage>
    </Section>
  );
}

function SwipeDeckSection() {
  const [index, setIndex] = useState(0);
  const cards = copy.deckCards;

  return (
    <Section
      id="s2-deck"
      title="24. SwipeDeck"
      note="depth 3 · Pointer Events + transform (scroll-snap 미사용 — D-9). 버튼·키보드가 1급 경로"
    >
      <Stage>
        <SwipeDeck
          items={cards}
          index={index}
          onIndexChange={setIndex}
          renderItem={(card) => <Text variant="headline">{card}</Text>}
          label={copy.deckLabel}
          prevLabel={copy.deckPrev}
          nextLabel={copy.deckNext}
          statusLabel={copy.deckStatus(index + 1, cards.length)}
        />
      </Stage>
    </Section>
  );
}

function ListSection() {
  const [selected, setSelected] = useState(false);

  return (
    <Section
      id="s2-listrow"
      title="25. ListGroup · ListRow (basic)"
      note="title / subtitle / trailing(chevron · Checkbox · IconButton) · pressed · disabled (Figma 163:2145)"
    >
      <Stage>
        <Stack>
          <ListGroup label={copy.listGroupLabel}>
            <ListRow
              title={copy.listRowTitle}
              onPress={() => undefined}
              trailing={<Icon name="chevron-right" size="sm" decorative />}
            />
            <ListRow
              title={copy.listRowBookTitle}
              subtitle={copy.listRowBookAuthor}
              trailing={
                <Checkbox
                  checked={selected}
                  onChange={setSelected}
                  label={copy.listRowSelectLabel}
                />
              }
              selected={selected}
            />
            <ListRow
              title={copy.listRowBookTitle}
              trailing={
                <IconButton
                  icon={<Icon name="x" decorative />}
                  label={copy.listRowRemoveLabel}
                  variant="plain"
                  onPress={() => undefined}
                />
              }
            />
            <ListRow title={copy.listRowDisabled} onPress={() => undefined} disabled />
          </ListGroup>
        </Stack>
      </Stage>
    </Section>
  );
}

function InfoRowSection() {
  return (
    <Section
      id="s2-inforow"
      title="26. InfoRow"
      note="glass pill + icon · 표시 전용 (Figma 179:1759 · 179:1764, radius 흡수 AD-S2-8)"
    >
      <Stage>
        <Stack>
          <InfoRow icon={<Icon name="clock" decorative />}>{copy.infoRowTime}</InfoRow>
          <InfoRow icon={<Icon name="list-checks" decorative />}>{copy.infoRowSteps}</InfoRow>
        </Stack>
      </Stage>
    </Section>
  );
}

function DividerSection() {
  return (
    <Section
      id="s2-dividerlabel"
      title="27. DividerWithLabel"
      note="rule + label + rule (Figma 179:1839–1841)"
    >
      <Stage>
        <DividerWithLabel label={copy.dividerLabel} />
      </Stage>
    </Section>
  );
}

function TextLinkSection() {
  return (
    <Section
      id="s2-textlink"
      title="28. TextLink"
      note="default(본문 안) · standalone · external(새 탭 + 안내) — 색 + 밑줄 이중 구분"
    >
      <Stage>
        <Stack>
          <Text variant="footnote">
            {copy.textLinkSentence} <TextLink href="/auth/log-in">{copy.textLinkInline}</TextLink>
          </Text>
          <SubHead>standalone</SubHead>
          <Row>
            <TextLink href="/auth/forgot-password" tone="standalone">
              {copy.textLinkStandalone}
            </TextLink>
          </Row>
          <SubHead>external</SubHead>
          <Row>
            <TextLink
              href="https://example.com/privacy"
              external
              externalHint={copy.textLinkExternalHint}
            >
              {copy.textLinkExternal}
            </TextLink>
          </Row>
        </Stack>
      </Stage>
    </Section>
  );
}

export function Stage2Section() {
  return (
    <>
      <SelectTriggerSection />
      <SwipeDeckSection />
      <ListSection />
      <InfoRowSection />
      <DividerSection />
      <TextLinkSection />
    </>
  );
}
