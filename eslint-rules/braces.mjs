const interfaceBrace = {
	meta: {
		type:     'layout',
		fixable:  'whitespace',
		schema:   [],
		messages: { sameLine: 'The opening brace of an interface goes on the same line as its declaration.' },
	},
	create(context)
	{
		const { sourceCode } = context;

		return {
			TSInterfaceDeclaration(node)
			{
				const openBrace   = sourceCode.getFirstToken(node.body);
				const beforeBrace = sourceCode.getTokenBefore(openBrace);

				if(beforeBrace.loc.end.line === openBrace.loc.start.line) return;

				context.report({
					node:      node.body,
					loc:       openBrace.loc,
					messageId: 'sameLine',
					fix:       sourceCode.commentsExistBetween(beforeBrace, openBrace) ? null : (fixer) => fixer.replaceTextRange([beforeBrace.range[1], openBrace.range[0]], ' '),
				});
			},
		};
	},
};

const arrowBrace = {
	meta: {
		type:     'layout',
		fixable:  'whitespace',
		schema:   [],
		messages: { sameLine: 'The opening brace of an arrow function assigned to a variable goes on the same line as the `=>`.' },
	},
	create(context)
	{
		const { sourceCode } = context;

		return {
			ArrowFunctionExpression(node)
			{
				if(node.body.type !== 'BlockStatement' || node.parent.type !== 'VariableDeclarator') return;

				const arrow     = sourceCode.getTokenBefore(node.body, (token) => token.type === 'Punctuator' && token.value === '=>');
				const openBrace = sourceCode.getFirstToken(node.body);

				if(arrow.loc.end.line === openBrace.loc.start.line) return;

				context.report({
					node:      node.body,
					loc:       openBrace.loc,
					messageId: 'sameLine',
					fix:       sourceCode.commentsExistBetween(arrow, openBrace) ? null : (fixer) => fixer.replaceTextRange([arrow.range[1], openBrace.range[0]], ' '),
				});
			},
		};
	},
};

const plugin = {
	rules: { 'interface-brace': interfaceBrace, 'arrow-brace': arrowBrace },
};

export default plugin;
