import { FONTS, THEMES, customFromTheme, resolveTheme, textFontFamily, themeStageStyle } from './themes';
import { applyOp, applyOps, DeckOpError, diffDecks } from './ops';
import { createSlideFromLayout } from './layouts';
import { describe, it, expect } from 'vitest';
import { DECK_REFERENCE } from './reference';
import { createSlide } from './deck';
import type { Deck } from './deck';

const deck = (): Deck => ({ title: 'T', theme: 'ocean', slides: [{ ...createSlide(), id: 's1' }] });

describe('theme tokens', () =>
{
	it('exposes radius, margin and the heading font as stage variables', () =>
	{
		const style = themeStageStyle(resolveTheme('ocean')) as Record<string, string>;
		expect(style['--deck-radius']).toBe('20px');
		expect(style['--deck-margin']).toBe('96px');
		expect(style['--deck-heading-font']).toBe(FONTS.rounded.stack);
		expect(themeStageStyle(resolveTheme('app'))).toMatchObject({ '--deck-radius': '12px' });
	});

	it('gives every preset a radius and margin, and custom themes defaults', () =>
	{
		THEMES.forEach(t => expect(t.radius >= 0 && t.margin > 0).toBe(true));
		expect(resolveTheme('custom', { colors: customFromTheme(resolveTheme('ocean')).colors })).toMatchObject({ radius: 12, margin: 96, headingFont: null });
	});

	it('picks a heading font only for headings without their own font', () =>
	{
		expect(textFontFamily({ style: 'heading' })).toContain('--deck-heading-font');
		expect(textFontFamily({ style: 'footer' })).toBeUndefined();
		expect(textFontFamily({})).toBeUndefined();
		expect(textFontFamily({ style: 'title', font: 'mono' })).toBe(FONTS.mono.stack);
	});
});

describe('updateTheme', () =>
{
	it('seeds a custom theme from the current preset and merges colors per slot', () =>
	{
		const next = applyOp(deck(), { type: 'updateTheme', patch: { colors: { accent: '#e11d48' }, headingFont: 'serif', radius: 24 } });
		expect(next.theme).toBe('custom');
		expect(next.customTheme).toMatchObject({ headingFont: 'serif', radius: 24, margin: 96 });
		expect(next.customTheme?.colors).toMatchObject({ accent: '#e11d48', background: '#f0f7fb' });
	});

	it('keeps editing the existing custom theme', () =>
	{
		const once = applyOp(deck(), { type: 'updateTheme', patch: { radius: 4 } });
		const twice = applyOp(once, { type: 'updateTheme', patch: { margin: 40 } });
		expect(twice.customTheme).toMatchObject({ radius: 4, margin: 40 });
	});

	it('rejects bad values with a clear message', () =>
	{
		expect(() => applyOp(deck(), { type: 'updateTheme', patch: { headingFont: 'comic' as never } })).toThrow(/Use one of/);
		expect(() => applyOp(deck(), { type: 'updateTheme', patch: { radius: -2 } })).toThrow(DeckOpError);
		expect(() => applyOp(deck(), { type: 'updateTheme', patch: { colors: { accent: 'red' } } })).toThrow(/#rgb or #rrggbb/);
	});

	it('round-trips new custom theme fields through diffDecks', () =>
	{
		const to = applyOp(deck(), { type: 'updateTheme', patch: { headingFont: 'mono', radius: 0 } });
		expect(applyOps(deck(), diffDecks(deck(), to))).toEqual(to);
	});
});

describe('layouts follow the theme', () =>
{
	it('insets by the margin and gives text boxes their styles', () =>
	{
		const [title, body] = createSlideFromLayout('titleContent', { margin: 40 }).elements;
		expect(title).toMatchObject({ x: 40, width: 1200, style: 'heading' });
		expect(body).toMatchObject({ style: 'body' });
	});

	it('addSlideFromLayout uses the deck margin and predictable ids', () =>
	{
		const custom = applyOp(deck(), { type: 'updateTheme', patch: { margin: 64 } });
		const next = applyOp(custom, { type: 'addSlideFromLayout', layout: 'titleContent', slideId: 's2' });
		expect(next.slides[1].elements.map(e => e.id)).toEqual(['s2:title', 's2:body']);
		expect(next.slides[1].elements[0].x).toBe(64);
		expect(() => applyOp(next, { type: 'addSlideFromLayout', layout: 'titleContent', slideId: 's2' })).toThrow(/already exists/);
		expect(() => applyOp(next, { type: 'addSlideFromLayout', layout: 'poster' as never, slideId: 's3' })).toThrow(/layout/);
	});

});

describe('text styles', () =>
{
	const base = { id: 't', label: 'T', type: 'text', html: '<p>x</p>', x: 0, y: 0, width: 400, height: 40 } as const;

	it('fills size, weight and color when a styled element is added without them', () =>
	{
		const added = applyOp(deck(), { type: 'addElement', slideId: 's1', element: { ...base, style: 'footer' } as never });
		expect(added.slides[0].elements[0]).toMatchObject({ style: 'footer', fontSize: 18, bold: false, color: 'var(--color-text-muted)' });
	});

	it('lets explicit values beat the style on add', () =>
	{
		const added = applyOp(deck(), { type: 'addElement', slideId: 's1', element: { ...base, style: 'title', fontSize: 60, color: '' } });
		expect(added.slides[0].elements[0]).toMatchObject({ style: 'title', fontSize: 60, bold: true });
	});

	it('applies the preset when an update sets a style, and keeps an explicit size', () =>
	{
		const added = applyOp(deck(), { type: 'addElement', slideId: 's1', element: { ...base, fontSize: 30, color: '' } });
		const heading = applyOp(added, { type: 'updateElement', slideId: 's1', elementId: 't', patch: { style: 'heading' } });
		expect(heading.slides[0].elements[0]).toMatchObject({ style: 'heading', fontSize: 48, bold: true });
		const sized = applyOp(added, { type: 'updateElement', slideId: 's1', elementId: 't', patch: { style: 'caption', fontSize: 22 } });
		expect(sized.slides[0].elements[0]).toMatchObject({ style: 'caption', fontSize: 22, color: 'var(--color-text-muted)' });
	});

	it('clears a style without touching the box, and rejects unknown ones', () =>
	{
		const added = applyOp(deck(), { type: 'addElement', slideId: 's1', element: { ...base, fontSize: 30, color: '', style: 'heading' } });
		const cleared = applyOp(added, { type: 'updateElement', slideId: 's1', elementId: 't', patch: { style: undefined } });
		expect(cleared.slides[0].elements[0]).toMatchObject({ fontSize: 30 });
		expect(cleared.slides[0].elements[0]).not.toHaveProperty('style', 'heading');
		expect(() => applyOp(added, { type: 'updateElement', slideId: 's1', elementId: 't', patch: { style: 'h1' as never } })).toThrow(/Use one of: title, heading, subheading, body, caption, header, footer/);
	});

	it('is documented for agents, including header and footer', () =>
	{
		expect(DECK_REFERENCE).toContain('style is a preset');
		expect(DECK_REFERENCE).toContain('Header and footer are just styles');
	});
});

describe('agent reference', () =>
{
	it('documents the theme fields and every preset', () =>
	{
		['updateTheme', 'headingFont', 'radius', 'margin', 'addSlideFromLayout', ...THEMES.map(t => t.id)].forEach(word => expect(DECK_REFERENCE).toContain(word));
	});
});
