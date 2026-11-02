/**
 * `haru:sticker-thumb` — 출석 스티커 타일의 20×20 엄지 (Figma `90:602`, `get_design_context(29:62)` 에셋 원문).
 *
 * master 가 노출되지 않아 정체는 미확정이다(Stage 4 Spec §12.4-⑯). Figma 는 **채움** 글리프이고 Lucide
 * `thumbs-up` 은 외곽선이라 대체할 수 없어 export 한다 (Stage 0 #21). 빈 `<g>` · clipPath 는 도형에 영향이
 * 없어 뺐고, `white` 는 `currentColor` 로 바꿨다 — 색은 사용 지점이 토큰으로 준다.
 */
export function StickerThumb() {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false">
      <path
        d="M1 18H4.27273V8.4H1V18ZM19 9.2C19 8.32 18.2636 7.6 17.3636 7.6H12.2009L12.9782 3.944L13.0027 3.688C13.0027 3.36 12.8636 3.056 12.6427 2.84L11.7755 2L6.39182 7.272C6.08909 7.56 5.90909 7.96 5.90909 8.4V16.4C5.90909 17.28 6.64545 18 7.54545 18H14.9091C15.5882 18 16.1691 17.6 16.4145 17.024L18.8855 11.384C18.9591 11.2 19 11.008 19 10.8V9.2Z"
        fill="currentColor"
      />
    </svg>
  );
}
