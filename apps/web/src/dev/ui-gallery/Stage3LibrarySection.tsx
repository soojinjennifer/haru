/**
 * `/__dev/ui/components` — Library 1라운드 토대 (Library Design Spec §3.1 · §3.5 · §4.1 · §5.2).
 *
 * dev 전용 화면이다. 도메인 데이터를 쓰지 않고(표지는 placeholder 경로를 쓴다) 문구는
 * `gallery-copy.ts` 에 모은다. 시각 비교 블록 id 는 `s3-*` 다 (영역 클립 baseline — `D-12`).
 *
 * ⚠ 서재 **화면**(섹션 조립 · 시트 · 진입점)은 여기에 없다 — 2라운드다.
 * 이 섹션은 Shared UI / `BookCover` 가 **실제로 어떻게 렌더되는지** 보기 위한 자리다.
 */
import { Icon, ListGroup, ListRow, SectionHeader, Text } from '@haru/ui';

import { BookCover } from '../../entities/book';

import { galleryCopy } from './gallery-copy';
import { Row, Section, Stack, Stage, SubHead } from './primitives';

const copy = galleryCopy.stage3Library;

function SectionHeaderSection() {
  return (
    <Section
      id="s3-section-header"
      title="29. SectionHeader (action · meta)"
      note="제목 17/Bold + 우측 슬롯 12/Medium — action 은 button(hit 44), meta 는 비대화형 span (Figma 163:1624 · 145:1142)"
    >
      <Stage>
        <Stack>
          <SubHead>action</SubHead>
          <SectionHeader
            title={copy.sectionFavorites}
            action={{ label: copy.seeAll, onPress: () => undefined }}
          />
          <SubHead>action — disabled (섹션 0건)</SubHead>
          <SectionHeader
            title={copy.sectionCurated}
            action={{ label: copy.seeAll, onPress: () => undefined, disabled: true }}
          />
          <SubHead>meta — 비대화형</SubHead>
          <SectionHeader title={copy.sectionReadingNow} meta={copy.readingNowMeta} />
          <SubHead>우측 슬롯 없음</SubHead>
          <SectionHeader title={copy.sectionFinished} />
        </Stack>
      </Stage>
    </Section>
  );
}

function BookCoverSection() {
  return (
    <Section
      id="s3-book-cover"
      title="30. BookCover (sm · md · lg · xl)"
      note="sm 34×48 / md 58 / lg 퍼센트 폭 · 비 107/151 / xl 64×90 — radius 8 · 8 · 12 · 10 (Figma 30:142 · 85:536 · 113:1972 · 145:1146)"
    >
      <Stage>
        <Stack>
          <Row top>
            <BookCover title={copy.coverTitle} author={copy.coverAuthor} size="sm" />
            <BookCover title={copy.coverTitle} author={copy.coverAuthor} size="md" />
            <BookCover title={copy.coverTitle} author={copy.coverAuthor} size="xl" />
          </Row>
          <SubHead>lg — 폭은 호출 측 그리드가 정한다</SubHead>
          <div className="haru-dev-shelf-column">
            <BookCover title={copy.coverTitle} author={copy.coverAuthor} size="lg" />
          </div>
          <Text variant="caption-1" tone="secondary">
            {copy.coverPlaceholderNote}
          </Text>
        </Stack>
      </Stage>
    </Section>
  );
}

function BookListRowSection() {
  return (
    <Section
      id="s3-list-media"
      title="31. ListRow (media · meta)"
      note="media 34×48 + 제목 15 + 좌측 메타 / 우측 평점 + chevron, 최소 높이 74 (Figma 30:141 · 163:2100)"
    >
      <Stage>
        <Stack>
          <ListGroup label={copy.listLabel}>
            <ListRow
              title={copy.coverTitle}
              subtitle={copy.rowMeta}
              meta={copy.rowRating}
              media={<BookCover title={copy.coverTitle} size="sm" decorative />}
              trailing={<Icon name="chevron-right" size="sm" decorative />}
              onPress={() => undefined}
            />
            {/* `unrated` — 평점이 없으면 우측을 비우고 좌측 정렬을 유지한다 (`L-OPEN-22`). */}
            <ListRow
              title={copy.rowUnratedTitle}
              subtitle={copy.rowMetaUnrated}
              media={<BookCover title={copy.rowUnratedTitle} size="sm" decorative />}
              trailing={<Icon name="chevron-right" size="sm" decorative />}
              onPress={() => undefined}
            />
            {/* media 없는 행 — 진입점 행과 같은 모양이고 최소 높이가 56 이다. */}
            <ListRow
              title={copy.rowEntryTitle}
              trailing={<Icon name="chevron-right" size="sm" decorative />}
              onPress={() => undefined}
            />
          </ListGroup>
        </Stack>
      </Stage>
    </Section>
  );
}

export function Stage3LibrarySection() {
  return (
    <>
      <SectionHeaderSection />
      <BookCoverSection />
      <BookListRowSection />
    </>
  );
}
