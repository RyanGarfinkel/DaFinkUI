const BANNER = /[─━═]{3,}|[-=*#~]{4,}/;

const noBanner = {
	meta: {
		type:     'suggestion',
		fixable:  'code',
		schema:   [],
		messages: { banner: 'Decorative divider comments are not allowed. Let naming and structure show the sections.' },
	},
	create(context)
	{
		const { sourceCode } = context;
		const { text }       = sourceCode;

		return {
			Program()
			{
				for(const comment of sourceCode.getAllComments())
				{
					if(comment.type !== 'Line' || !BANNER.test(comment.value)) continue;

					context.report({
						loc:       comment.loc,
						messageId: 'banner',
						fix(fixer)
						{
							const lineStart = text.lastIndexOf('\n', comment.range[0] - 1) + 1;
							const ownLine   = text.slice(lineStart, comment.range[0]).trim() === '';

							if(!ownLine) return fixer.removeRange([comment.range[0] - (text.slice(0, comment.range[0]).length - text.slice(0, comment.range[0]).trimEnd().length), comment.range[1]]);

							let end = comment.range[1];
							if(text[end] === '\r') end++;
							if(text[end] === '\n') end++;

							const blankBefore = lineStart === 0 || /\n[ \t]*\n$/.test(text.slice(0, lineStart));
							const blankAfter  = /^[ \t]*\r?\n/.exec(text.slice(end));
							if(blankBefore && blankAfter) end += blankAfter[0].length;

							return fixer.removeRange([lineStart, end]);
						},
					});
				}
			},
		};
	},
};

const plugin = {
	rules: { 'no-banner': noBanner },
};

export default plugin;
