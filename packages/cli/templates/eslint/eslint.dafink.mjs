import perfectionist from 'eslint-plugin-perfectionist';
import directive from './eslint-rules/directive.mjs';
import comments from './eslint-rules/comments.mjs';
import braces from './eslint-rules/braces.mjs';

const dafinkConfig = [
	{
		plugins: {
			perfectionist,
			braces,
			directive,
			comments,
		},
		rules: {
			'quotes': ['error', 'single', { 'avoidEscape': true }],
			'jsx-quotes': ['error', 'prefer-single'],
			'func-style': ['error', 'expression', { allowArrowFunctions: true }],
			'prefer-arrow-callback': 'error',
			'braces/interface-brace': 'error',
			'braces/arrow-brace': 'error',
			'directive/use-client-spacing': 'error',
			'comments/no-banner': 'error',
			'perfectionist/sort-imports': [
				'error',
				{
					type: 'line-length',
					order: 'desc',
					groups: ['unknown'],
				},
			],
		},
	},
	{
		files: ['**/*.tsx', '**/*.jsx'],
		rules: {
			'no-restricted-syntax': [
				'error',
				{
					selector: 'JSXAttribute[name.name="className"] Literal[value=/\\b(bg-white|text-white|bg-black|text-black)\\b/]',
					message: 'Use design tokens (bg-surface, text-text, etc.) instead of hardcoded white/black Tailwind classes.',
				},
			],
		},
	},
];

export default dafinkConfig;
