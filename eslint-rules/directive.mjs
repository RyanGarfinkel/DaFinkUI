const useClientSpacing = {
	meta: {
		type:     'layout',
		fixable:  'whitespace',
		schema:   [],
		messages: { spacing: "'use client' must be a single `'use client';` followed by exactly one blank line before the first import." },
	},
	create(context)
	{
		const { sourceCode } = context;

		return {
			Program(program)
			{
				const [directive, ...rest] = program.body;
				if(directive?.type !== 'ExpressionStatement' || directive.directive !== 'use client') return;

				const next = rest.find((node) => node.type !== 'EmptyStatement');
				if(!next) return;

				const directiveText = sourceCode.getText(directive);
				const gap           = sourceCode.text.slice(directive.range[1], next.range[0]);
				const onlyBlanks    = /^[\s;]*$/.test(gap);

				if(directiveText.endsWith(';') && (!onlyBlanks || gap === '\n\n')) return;

				context.report({
					node:      directive,
					messageId: 'spacing',
					fix:       !onlyBlanks ? null : (fixer) => fixer.replaceTextRange([directive.range[0], next.range[0]], `${directiveText.replace(/;*$/, '')};\n\n`),
				});
			},
		};
	},
};

const plugin = {
	rules: { 'use-client-spacing': useClientSpacing },
};

export default plugin;
