const IMPORT_EXPORT_LINE = /(^|\r?\n)([ \t]*)(import|export)\b([^\r\n]*?)\bfrom(\s*)(['"])(\.\/[^'"]+)\6/g;

export function rewriteImportSpecifiers(content: string, aliasMap: Record<string, string>): string
{
	return content.replace(IMPORT_EXPORT_LINE, (match: string, lineStart: string, indent: string, keyword: string, middle: string, fromSpace: string, quote: string, specifier: string) =>
	{
		const replacement = aliasMap[specifier];

		if(!replacement)
			return match;

		return `${lineStart}${indent}${keyword}${middle}from${fromSpace}${quote}${replacement}${quote}`;
	});
}
