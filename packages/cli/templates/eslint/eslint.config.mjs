import reactHooks from 'eslint-plugin-react-hooks';
import dafinkConfig from './eslint.dafink.mjs';
import tseslint from 'typescript-eslint';

export default [
	{
		ignores: ['node_modules/**', 'dist/**', 'build/**', 'out/**', '.next/**'],
	},
	...tseslint.configs.recommended,
	{
		files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
		languageOptions: {
			parserOptions: {
				ecmaFeatures: { jsx: true },
			},
		},
		plugins: {
			'react-hooks': reactHooks,
		},
		rules: {
			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'warn',
		},
	},
	...dafinkConfig,
];
