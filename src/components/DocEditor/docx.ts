import JSZip from 'jszip';

interface RunStyle {
	bold?:      boolean;
	italic?:    boolean;
	underline?: boolean;
	strike?:    boolean;
	code?:      boolean;
	link?:      boolean;
}

interface Context {
	links:   string[];
	numbers: { id: number; level: number }[];
}

interface Paragraph {
	style?:  string;
	list?:   { id: number; level: number };
	indent?: number;
	rule?:   boolean;
	align?:  string;
}

export const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

const NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
const BULLET_ID = 1;
const ORDERED_ABSTRACT_ID = 1;
const FIRST_ORDERED_ID = 2;
const LEVELS = 9;
const INDENT_TWIPS = 720;
const ALIGNMENTS: Record<string, string> = { left: 'left', center: 'center', right: 'right', justify: 'both' };
const HEADINGS: Record<string, string> = { h1: 'Heading1', h2: 'Heading2', h3: 'Heading3', h4: 'Heading3', h5: 'Heading3', h6: 'Heading3' };

const escape = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const alignmentOf = (element: Element) => ALIGNMENTS[/text-align:\s*(\w+)/.exec(element.getAttribute('style') ?? '')?.[1] ?? ''];

const runProperties = ({ bold, italic, underline, strike, code, link }: RunStyle) => {
	const props = [
		link && '<w:rStyle w:val="Hyperlink"/>',
		code && '<w:rFonts w:ascii="Consolas" w:hAnsi="Consolas" w:cs="Consolas"/>',
		bold && '<w:b/>',
		italic && '<w:i/>',
		strike && '<w:strike/>',
		underline && '<w:u w:val="single"/>',
	].filter(Boolean).join('');

	return props ? `<w:rPr>${props}</w:rPr>` : '';
};

const inline = (node: Node, style: RunStyle, context: Context): string => {
	if(node.nodeType === Node.TEXT_NODE)
	{
		const text = node.textContent ?? '';
		return text ? `<w:r>${runProperties(style)}<w:t xml:space="preserve">${escape(text)}</w:t></w:r>` : '';
	}

	if(!(node instanceof Element)) return '';

	const tag = node.tagName.toLowerCase();
	if(tag === 'br') return '<w:r><w:br/></w:r>';

	const next: RunStyle = { ...style };
	if(tag === 'strong' || tag === 'b') next.bold = true;
	if(tag === 'em' || tag === 'i') next.italic = true;
	if(tag === 'u') next.underline = true;
	if(tag === 's' || tag === 'del' || tag === 'strike') next.strike = true;
	if(tag === 'code') next.code = true;

	const href = tag === 'a' ? node.getAttribute('href') : null;
	if(href) next.link = true;

	const runs = [...node.childNodes].map((child) => inline(child, next, context)).join('');
	if(!href) return runs;

	context.links.push(href);
	return `<w:hyperlink r:id="rIdLink${context.links.length}">${runs}</w:hyperlink>`;
};

const paragraph = (runs: string, { style, list, indent, rule, align }: Paragraph) => {
	const props = [
		style && `<w:pStyle w:val="${style}"/>`,
		list && `<w:numPr><w:ilvl w:val="${list.level}"/><w:numId w:val="${list.id}"/></w:numPr>`,
		rule && '<w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="A1A1AA"/></w:pBdr>',
		indent && `<w:ind w:left="${indent}"/>`,
		align && `<w:jc w:val="${align}"/>`,
	].filter(Boolean).join('');

	return `<w:p>${props ? `<w:pPr>${props}</w:pPr>` : ''}${runs}</w:p>`;
};

const inlineChildren = (element: Element, context: Context) => [...element.childNodes].map((child) => inline(child, {}, context)).join('');

const listItem = (item: Element, id: number, level: number, context: Context): string => {
	let numbered = false;
	const continuation = INDENT_TWIPS * (level + 1);

	return [...item.childNodes].map((child) =>
	{
		if(child instanceof Element && /^(ul|ol)$/i.test(child.tagName)) return list(child, level + 1, context);

		const isParagraph = child instanceof Element && child.tagName.toLowerCase() === 'p';
		const runs = isParagraph ? inlineChildren(child, context) : inline(child, {}, context);
		if(!runs) return '';

		const first = !numbered;
		numbered = true;
		return paragraph(runs, { list: first ? { id, level } : undefined, indent: first ? undefined : continuation, align: isParagraph ? alignmentOf(child) : undefined });
	}).join('');
};

const list = (element: Element, level: number, context: Context): string => {
	const ordered = element.tagName.toLowerCase() === 'ol';
	let id = BULLET_ID;

	if(ordered)
	{
		id = FIRST_ORDERED_ID + context.numbers.length;
		context.numbers.push({ id, level });
	}

	return [...element.children].map((item) => listItem(item, id, Math.min(level, LEVELS - 1), context)).join('');
};

const blocks = (parent: Node, context: Context, quote = false): string => [...parent.childNodes].map((node) =>
{
	if(node.nodeType === Node.TEXT_NODE)
	{
		const text = node.textContent?.trim();
		return text ? paragraph(inline(node, {}, context), { style: quote ? 'Quote' : undefined }) : '';
	}

	if(!(node instanceof Element)) return '';

	const tag = node.tagName.toLowerCase();
	if(tag === 'ul' || tag === 'ol') return list(node, 0, context);
	if(tag === 'blockquote') return blocks(node, context, true);
	if(tag === 'hr') return paragraph('', { rule: true });
	if(tag === 'pre') return paragraph((node.textContent ?? '').split('\n').map((line) => `<w:r>${runProperties({ code: true })}<w:t xml:space="preserve">${escape(line)}</w:t></w:r>`).join('<w:r><w:br/></w:r>'), { style: 'Code' });
	if(tag === 'p') return paragraph(inlineChildren(node, context), { style: quote ? 'Quote' : undefined, align: alignmentOf(node) });
	if(HEADINGS[tag]) return paragraph(inlineChildren(node, context), { style: HEADINGS[tag], align: alignmentOf(node) });

	return blocks(node, context, quote);
}).join('');

const bulletLevels = () => Array.from({ length: LEVELS }, (_, level) =>
	`<w:lvl w:ilvl="${level}"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="${['•', '◦', '▪'][level % 3]}"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="${INDENT_TWIPS * (level + 1)}" w:hanging="360"/></w:pPr></w:lvl>`).join('');

const orderedLevels = () => Array.from({ length: LEVELS }, (_, level) =>
	`<w:lvl w:ilvl="${level}"><w:start w:val="1"/><w:numFmt w:val="${['decimal', 'lowerLetter', 'lowerRoman'][level % 3]}"/><w:lvlText w:val="%${level + 1}."/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="${INDENT_TWIPS * (level + 1)}" w:hanging="360"/></w:pPr></w:lvl>`).join('');

const numbering = (context: Context) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering ${NS}>
<w:abstractNum w:abstractNumId="0"><w:multiLevelType w:val="hybridMultilevel"/>${bulletLevels()}</w:abstractNum>
<w:abstractNum w:abstractNumId="${ORDERED_ABSTRACT_ID}"><w:multiLevelType w:val="hybridMultilevel"/>${orderedLevels()}</w:abstractNum>
<w:num w:numId="${BULLET_ID}"><w:abstractNumId w:val="0"/></w:num>
${context.numbers.map(({ id, level }) => `<w:num w:numId="${id}"><w:abstractNumId w:val="${ORDERED_ABSTRACT_ID}"/><w:lvlOverride w:ilvl="${level}"><w:startOverride w:val="1"/></w:lvlOverride></w:num>`).join('\n')}
</w:numbering>`;

const heading = (id: string, name: string, size: number, spaceBefore: number) =>
	`<w:style w:type="paragraph" w:styleId="${id}"><w:name w:val="${name}"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="${spaceBefore}" w:after="120"/></w:pPr><w:rPr><w:b/><w:sz w:val="${size}"/></w:rPr></w:style>`;

const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles ${NS}>
<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/><w:sz w:val="22"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="160" w:line="259" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>
${heading('Heading1', 'heading 1', 40, 360)}
${heading('Heading2', 'heading 2', 32, 280)}
${heading('Heading3', 'heading 3', 26, 200)}
<w:style w:type="paragraph" w:styleId="Quote"><w:name w:val="Quote"/><w:basedOn w:val="Normal"/><w:qFormat/><w:pPr><w:pBdr><w:left w:val="single" w:sz="18" w:space="8" w:color="A1A1AA"/></w:pBdr><w:ind w:left="${INDENT_TWIPS}"/></w:pPr><w:rPr><w:i/><w:color w:val="52525B"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Code"><w:name w:val="Code"/><w:basedOn w:val="Normal"/><w:pPr><w:shd w:val="clear" w:color="auto" w:fill="F4F4F5"/></w:pPr><w:rPr><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas" w:cs="Consolas"/><w:sz w:val="20"/></w:rPr></w:style>
<w:style w:type="character" w:styleId="Hyperlink"><w:name w:val="Hyperlink"/><w:rPr><w:color w:val="0563C1"/><w:u w:val="single"/></w:rPr></w:style>
</w:styles>`;

const CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
<Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>
<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
</Types>`;

const ROOT_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
</Relationships>`;

const documentRels = (links: string[]) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
<Relationship Id="rIdNumbering" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>
${links.map((href, index) => `<Relationship Id="rIdLink${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${escape(href)}" TargetMode="External"/>`).join('\n')}
</Relationships>`;

const coreProperties = (title: string) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>${escape(title)}</dc:title></cp:coreProperties>`;

const SECTION = '<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/></w:sectPr>';

/** The bytes of a .docx file built from the editor's HTML. Supports headings, paragraphs, bold, italic, underline, strike, code, links, lists, quotes, rules and alignment. */
export const buildDocx = async (html: string, title = 'Document'): Promise<Uint8Array> => {
	const body = new DOMParser().parseFromString(html, 'text/html').body;
	const context: Context = { links: [], numbers: [] };
	const content = blocks(body, context) || paragraph('', {});

	const zip = new JSZip();
	const add = (name: string, data: string) => zip.file(name, data, { createFolders: false });

	add('[Content_Types].xml', CONTENT_TYPES);
	add('_rels/.rels', ROOT_RELS);
	add('docProps/core.xml', coreProperties(title));
	add('word/document.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:document ${NS}><w:body>${content}${SECTION}</w:body></w:document>`);
	add('word/styles.xml', STYLES);
	add('word/numbering.xml', numbering(context));
	add('word/_rels/document.xml.rels', documentRels(context.links));

	return zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
};

export const exportDocx = async (html: string, title?: string): Promise<Blob> => new Blob([await buildDocx(html, title) as BlobPart], { type: DOCX_MIME });

/** Builds the .docx and saves it through a temporary link, named `<name>.docx`. */
export const downloadDocx = async (html: string, name: string) => {
	const url = URL.createObjectURL(await exportDocx(html, name));
	const link = Object.assign(document.createElement('a'), { href: url, download: name.endsWith('.docx') ? name : `${name}.docx` });

	link.click();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
};
