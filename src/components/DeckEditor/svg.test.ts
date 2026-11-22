import { describe, it, expect } from 'vitest';
import { applyOp, DeckOpError } from './ops';
import { createSlide } from './deck';
import type { Deck } from './deck';
import { checkSvg } from './svg';

const ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></svg>';

describe('checkSvg', () =>
{
	it('accepts a normal drawing', () =>
	{
		expect(checkSvg(ICON)).toBeNull();
		expect(checkSvg(`\n  ${ICON}\n`)).toBeNull();
		expect(checkSvg('<svg viewBox="0 0 10 10"><defs><linearGradient id="g"><stop offset="0" stop-color="#fff"/></linearGradient></defs><rect width="10" height="10" fill="url(#g)"/><use href="#g"/><text x="1" y="5">a &amp; b</text></svg>')).toBeNull();
	});

	it('requires one svg element with a viewBox', () =>
	{
		expect(checkSvg('')).toMatch(/empty/);
		expect(checkSvg('<div></div>')).toMatch(/one <svg>/);
		expect(checkSvg(`${ICON}<p>`)).toMatch(/one <svg>/);
		expect(checkSvg('<svg width="24"><path d="M0 0"/></svg>')).toMatch(/viewBox/);
	});

	it.each([
		['script tags', '<svg viewBox="0 0 1 1"><script>alert(1)</script></svg>', /<script> isn't allowed/],
		['style tags', '<svg viewBox="0 0 1 1"><style>*{}</style></svg>', /<style> isn't allowed/],
		['foreignObject', '<svg viewBox="0 0 1 1"><foreignObject><div/></foreignObject></svg>', /isn't allowed/],
		['image tags', '<svg viewBox="0 0 1 1"><image href="#a"/></svg>', /<image> isn't allowed/],
		['event handlers', '<svg viewBox="0 0 1 1" onload="x()"><path/></svg>', /event attribute/],
		['slash-separated handlers', '<svg viewBox="0 0 1 1"/onload=x()><path/></svg>', /./],
		['single-quoted handlers', '<svg viewBox=\'0 0 1 1\'><path onclick=\'x()\'/></svg>', /event attribute/],
		['external links', '<svg viewBox="0 0 1 1"><use href="https://evil.test/a.svg#x"/></svg>', /same SVG/],
		['javascript urls', '<svg viewBox="0 0 1 1"><a href="javascript:alert(1)"/></svg>', /isn't allowed|same SVG/],
		['css urls', '<svg viewBox="0 0 1 1"><path style="fill:url(https://evil.test/x)"/></svg>', /style attributes/],
		['comments', '<svg viewBox="0 0 1 1"><!-- hi --><path/></svg>', /plain element/],
		['cdata', '<svg viewBox="0 0 1 1"><![CDATA[x]]></svg>', /plain element/],
		['stray angle brackets in attributes', '<svg viewBox="0 0 1 1"><path d="<"/></svg>', /can't contain "<"/],
	])('rejects %s', (_name, markup, message) =>
	{
		expect(checkSvg(markup)).toMatch(message);
	});

	it('caps the size', () =>
	{
		expect(checkSvg(`<svg viewBox="0 0 1 1">${'<path/>'.repeat(20000)}</svg>`)).toMatch(/longer than/);
	});
});

describe('svg elements in ops', () =>
{
	const deck = (): Deck => ({ title: 'T', theme: 'app', slides: [{ ...createSlide(), id: 's1' }] });
	const element = { id: 'logo', label: 'Logo', type: 'svg', svg: ICON, color: '', x: 0, y: 0, width: 96, height: 96 } as const;

	it('adds and updates an svg element', () =>
	{
		const added = applyOp(deck(), { type: 'addElement', slideId: 's1', element });
		expect(added.slides[0].elements[0]).toMatchObject({ type: 'svg', svg: ICON });
		const next = '<svg viewBox="0 0 2 2"><rect width="2" height="2"/></svg>';
		expect(applyOp(added, { type: 'updateElement', slideId: 's1', elementId: 'logo', patch: { svg: next } }).slides[0].elements[0]).toMatchObject({ svg: next });
	});

	it('rejects unsafe markup however it arrives, with the reason', () =>
	{
		const bad = '<svg viewBox="0 0 1 1"><script>x</script></svg>';
		expect(() => applyOp(deck(), { type: 'addElement', slideId: 's1', element: { ...element, svg: bad } })).toThrow(/Invalid svg: <script> isn't allowed/);
		expect(() => applyOp(deck(), { type: 'addSlide', slide: { ...createSlide([{ ...element, svg: bad }]), id: 's2' } })).toThrow(DeckOpError);
		const added = applyOp(deck(), { type: 'addElement', slideId: 's1', element });
		expect(() => applyOp(added, { type: 'updateElement', slideId: 's1', elementId: 'logo', patch: { svg: bad } })).toThrow(DeckOpError);
		expect(() => applyOp(added, { type: 'updateElements', elementType: 'svg', patch: { svg: bad } })).toThrow(DeckOpError);
	});
});
