// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import perfectionist from 'eslint-plugin-perfectionist';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Build artifacts
    'storybook-static/**',
  ]),
  {
    plugins: {
      perfectionist,
    },
    rules: {
      'quotes': ['error', 'single', { 'avoidEscape': true }],
      'jsx-quotes': ['error', 'prefer-single'],
      'func-style': ['error', 'expression', { allowArrowFunctions: true }],
      'prefer-arrow-callback': 'error',
      'perfectionist/sort-imports': [
        'error',
        {
          type: 'line-length',
          order: 'desc',
          groups: ['unknown'],
        },
      ],
    }
  }
]);

export default eslintConfig;
