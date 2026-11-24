import { describe, it, expect } from 'vitest';
import { buildDocx } from './docx';
import JSZip from 'jszip';

const read = async (html: string, part = 'word/document.xml') => {
	const zip = await JSZip.loadAsync(await buildDocx(html, 'Report'));
	return zip.file(part)!.async('string');
};

describe('buildDocx', () =>
{
	it('packages every part Word needs', async () =>
	{
		const zip = await JSZip.loadAsync(await buildDocx('<p>Hi</p>', 'Report'));

		expect(Object.keys(zip.files).sort()).toEqual([
			'[Content_Types].xml',
			'_rels/.rels',
			'docProps/core.xml',
			'word/_rels/document.xml.rels',
			'word/document.xml',
			'word/numbering.xml',
			'word/styles.xml',
		]);
	});

	it('writes well-formed XML in every part', async () =>
	{
		const html = '<h1>Title</h1><p>Some <strong>bold</strong> & <a href="https://a.test/?x=1&y=2">a link</a></p><ul><li><p>One</p></li></ul><ol><li><p>A</p></li></ol>';
		const zip = await JSZip.loadAsync(await buildDocx(html, 'A & B'));

		for(const name of Object.keys(zip.files).filter((file) => /\.(xml|rels)$/.test(file)))
		{
			const doc = new DOMParser().parseFromString(await zip.file(name)!.async('string'), 'application/xml');
			expect(doc.querySelector('parsererror'), name).toBeNull();
		}
	});

	it('maps headings and paragraphs to Word styles', async () =>
	{
		const xml = await read('<h1>Title</h1><h2>Sub</h2><p>Body</p>');

		expect(xml).toContain('<w:pStyle w:val="Heading1"/>');
		expect(xml).toContain('<w:pStyle w:val="Heading2"/>');
		expect(xml).toContain('<w:t xml:space="preserve">Body</w:t>');
	});

	it('keeps inline formatting, nested', async () =>
	{
		const xml = await read('<p><strong><em>both</em></strong> <u>under</u> <s>gone</s> <code>mono</code></p>');

		expect(xml).toMatch(/<w:b\/><w:i\/><\/w:rPr><w:t xml:space="preserve">both/);
		expect(xml).toContain('<w:u w:val="single"/>');
		expect(xml).toContain('<w:strike/>');
		expect(xml).toContain('w:ascii="Consolas"');
	});

	it('turns links into external hyperlinks', async () =>
	{
		const html = '<p><a href="https://a.test/?x=1&amp;y=2">site</a></p>';

		expect(await read(html)).toContain('<w:hyperlink r:id="rIdLink1">');
		expect(await read(html, 'word/_rels/document.xml.rels')).toContain('Target="https://a.test/?x=1&amp;y=2" TargetMode="External"');
	});

	it('numbers bullet lists with one list and restarts each ordered list', async () =>
	{
		const xml = await read('<ul><li><p>a</p></li></ul><ol><li><p>one</p></li></ol><ol><li><p>again</p></li></ol>');

		expect(xml).toContain('<w:numId w:val="1"/>');
		expect(xml).toContain('<w:numId w:val="2"/>');
		expect(xml).toContain('<w:numId w:val="3"/>');
		expect(await read('<ol><li><p>x</p></li></ol>', 'word/numbering.xml')).toContain('<w:num w:numId="2">');
	});

	it('nests list items one level deeper', async () =>
	{
		const xml = await read('<ul><li><p>outer</p><ul><li><p>inner</p></li></ul></li></ul>');

		expect(xml).toContain('<w:ilvl w:val="0"/>');
		expect(xml).toContain('<w:ilvl w:val="1"/>');
	});

	it('carries alignment, quotes and rules', async () =>
	{
		const xml = await read('<p style="text-align: center">mid</p><blockquote><p>said</p></blockquote><hr>');

		expect(xml).toContain('<w:jc w:val="center"/>');
		expect(xml).toContain('<w:pStyle w:val="Quote"/>');
		expect(xml).toContain('<w:pBdr><w:bottom');
	});

	it('escapes markup characters in text and the title', async () =>
	{
		expect(await read('<p>a &lt; b &amp; c</p>')).toContain('a &lt; b &amp; c');
		expect(await read('<p>x</p>', 'docProps/core.xml')).toContain('<dc:title>Report</dc:title>');
	});

	it('still produces a valid body for an empty document', async () =>
	{
		expect(await read('')).toContain('<w:p></w:p>');
	});
});
