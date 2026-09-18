// HARU shared Prettier config (Stage 1 Plan §9.1)
/** @type {import('prettier').Config} */
export const haruPrettierConfig = {
  semi: true,
  singleQuote: true,
  jsxSingleQuote: false,
  trailingComma: 'all',
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  arrowParens: 'always',
  bracketSpacing: true,
  endOfLine: 'lf',
  quoteProps: 'as-needed',
  overrides: [
    { files: ['*.md', '*.mdx'], options: { proseWrap: 'preserve' } },
    { files: ['*.json', '*.jsonc'], options: { trailingComma: 'none' } },
    { files: ['*.yaml', '*.yml'], options: { singleQuote: false } },
  ],
};

export default haruPrettierConfig;
