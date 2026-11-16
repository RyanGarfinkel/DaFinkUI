import type { Deck, DeckElement } from './deck';
import { describe, it, expect } from 'vitest';
import { addMotion } from './pptxMotion';
import { createSlide } from './deck';
import JSZip from 'jszip';

const SLIDE_XML = '<p:sld><p:cSld><p:spTree>'
	+ '<p:sp><p:nvSpPr><p:cNvPr id="2" name="title"/></p:nvSpPr></p:sp>'
	+ '<p:sp><p:nvSpPr><p:cNvPr id="3" name="body"/></p:nvSpPr></p:sp>'
	+ '</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>';

const shape = (id: string, effect?: DeckElement['effect']): DeckElement => ({ id, label: id, type: 'shape', shape: 'rect', fill: '', radius: 0, x: 0, y: 0, width: 10, height: 10, effect });

const build = async (deck: Deck) => {
	const zip = new JSZip();
	deck.slides.forEach((_, i) => zip.file(`ppt/slides/slide${i + 1}.xml`, SLIDE_XML));
	const result = await addMotion(await zip.generateAsync({ type: 'arraybuffer' }), deck);
	const out = await JSZip.loadAsync(await result.arrayBuffer());
	return Promise.all(deck.slides.map((_, i) => out.file(`ppt/slides/slide${i + 1}.xml`)!.async('string')));
};

describe('addMotion', () =>
{
	it('writes transitions after clrMapOvr, mapping type and speed', async () =>
	{
		const [xml] = await build({
			title: 't', theme: 'app',
			slides: [{ ...createSlide([shape('title')]), transition: { type: 'push', duration: 900 } }],
		});
		expect(xml).toContain('</p:clrMapOvr><p:transition spd="slow"><p:push dir="l"/></p:transition>');
	});

	it('writes fade entrances targeting the named shapes, with each element\'s delay', async () =>
	{
		const [xml] = await build({
			title: 't', theme: 'app',
			slides: [{ ...createSlide([shape('title', { type: 'slide-up', delay: 0 }), shape('body', { type: 'fade', delay: 400 }), shape('plain')]) }],
		});
		expect(xml).toContain('<p:spTgt spid="2"/>');
		expect(xml).toContain('<p:spTgt spid="3"/>');
		expect(xml).toContain('<p:cond delay="400"/>');
		expect(xml.match(/presetClass="entr"/g)).toHaveLength(2);
		// Transition (none here) would come first; timing sits right after clrMapOvr.
		expect(xml.indexOf('<p:timing>')).toBe(xml.indexOf('</p:clrMapOvr>') + '</p:clrMapOvr>'.length);
	});

	it('gives shapes that share an id (pptxgenjs does this for tables) their own id before targeting them', async () =>
	{
		const zip = new JSZip();
		zip.file('ppt/slides/slide1.xml', SLIDE_XML.replace('id="3"', 'id="2"'));
		const deck: Deck = { title: 't', theme: 'app', slides: [createSlide([shape('title'), shape('body', { type: 'fade', delay: 0 })])] };
		const out = await JSZip.loadAsync(await (await addMotion(await zip.generateAsync({ type: 'arraybuffer' }), deck)).arrayBuffer());
		const xml = await out.file('ppt/slides/slide1.xml')!.async('string');

		const ids = [...xml.matchAll(/<p:cNvPr id="(\d+)"/g)].map(m => m[1]);
		expect(new Set(ids).size).toBe(ids.length);
		expect(xml).toContain(`<p:spTgt spid="${xml.match(/<p:cNvPr id="(\d+)" name="body"/)![1]}"/>`);
	});

	it('leaves slides without motion untouched', async () =>
	{
		const [xml] = await build({ title: 't', theme: 'app', slides: [createSlide([shape('title')])] });
		expect(xml).toBe(SLIDE_XML);
	});
});
