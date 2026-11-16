import type { SlideElement } from '../SlideCanvas/SlideCanvas';
import type { CustomTheme, FontId, ThemeId } from './themes';
import type { RevealEffect } from '../Reveal/Reveal';
import type { IconName } from './glyphs';

export type TextAlign = 'left' | 'center' | 'right';
export type ShapeKind = 'rect' | 'ellipse';
export type ImageFit = 'cover' | 'contain';
export type ChartKind = 'bar' | 'line' | 'area';

export type TransitionType = 'none' | 'fade' | 'push' | 'zoom' | 'wipe';
/** Reveal's entrance effects, plus two text-only entrances from the Typewriter and TextScramble effects. */
export type EffectType = 'none' | RevealEffect | 'typewriter' | 'scramble';
export type AmbientType = 'none' | 'particles' | 'meteors';

export interface SlideTransition {
	type:     TransitionType;
	/** Milliseconds. */
	duration: number;
}

export interface ElementEffect {
	type:  EffectType;
	/** Milliseconds after the slide's transition finishes. */
	delay: number;
}

export interface ChartRow {
	label: string;
	value: number;
}

export type DeckElement = SlideElement & { effect?: ElementEffect } & (
	/** `font` overrides the theme's font for this element; omit to follow the theme. */
	/** `bold` is the box's base weight (marks can still bold or unbold runs); `placeholder` shows while it's empty in the editor. */
	| { type: 'text';  html: string; fontSize: number; color: string; font?: FontId; bold?: boolean; placeholder?: string }
	| { type: 'shape'; shape: ShapeKind; fill: string; radius: number }
	| { type: 'image'; src: string; alt: string; fit: ImageFit }
	| { type: 'icon';  icon: IconName; color: string }
	/** Endpoints are fractions (0–1) of the element's box, so resizing the box scales the line. */
	| { type: 'line';  x1: number; y1: number; x2: number; y2: number; stroke: string; strokeWidth: number; arrow: boolean }
	| { type: 'table'; rows: string[][]; header: boolean; fontSize: number; font?: FontId }
	| { type: 'chart'; chart: ChartKind; seriesLabel: string; data: ChartRow[] }
);

export type ElementType = DeckElement['type'];

export interface Slide {
	id:         string;
	background: string;
	notes:      string;
	transition: SlideTransition;
	ambient:    AmbientType;
	/** Kept in the deck but left out when presenting (and hidden in PowerPoint). */
	skipped:    boolean;
	elements:   DeckElement[];
}

export interface Deck {
	title:        string;
	theme:        ThemeId;
	/** Used when `theme` is `'custom'`. */
	customTheme?: CustomTheme;
	slides:       Slide[];
}

export const SLIDE_WIDTH = 1280;
export const SLIDE_HEIGHT = 720;

export const newId = () => Math.random().toString(36).slice(2, 10);

export const NO_TRANSITION: SlideTransition = { type: 'none', duration: 500 };

export const createSlide = (elements: DeckElement[] = []): Slide => ({
	id: newId(), background: '', notes: '', transition: NO_TRANSITION, ambient: 'none', skipped: false, elements,
});

/** A copy with fresh ids for the slide and every element, so it can sit beside the original. */
export const duplicateSlide = (slide: Slide): Slide => ({
	...slide,
	id:       newId(),
	elements: slide.elements.map(el => ({ ...el, id: newId() })),
});
