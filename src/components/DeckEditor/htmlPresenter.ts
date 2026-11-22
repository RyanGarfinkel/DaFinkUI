import { downloadBlob, escapeHtml, fileName, findStage } from './exporters';
import { SLIDE_HEIGHT, SLIDE_WIDTH } from './deck';
import type { Deck, Slide } from './deck';

// A self-contained presenter, with slides cloned from the editor's thumbnails so they look the same.

const collectCss = () => [...document.styleSheets]
	.map(sheet =>
	{
		try
		{
			return [...sheet.cssRules].map(rule => rule.cssText).join('\n');
		}
		catch
		{
			return '';
		}
	})
	.join('\n');

// Typewriter and Scramble need JS per character; in the export they fade in.
const effectName = (type: string) => (type === 'typewriter' || type === 'scramble' ? 'fade' : type);

const cleanStage = (slide: Slide) => {
	const stage = findStage(slide.id);
	const clone = stage.cloneNode(true) as HTMLElement;
	clone.style.cssText = stage.style.cssText;
	clone.style.transform = 'none';
	clone.querySelectorAll<HTMLElement>('[data-slide-element]').forEach(node =>
	{
		['role', 'aria-pressed', 'aria-roledescription', 'aria-label'].forEach(attr => node.removeAttribute(attr));
		node.className = 'absolute';
		const effect = slide.elements.find(el => el.id === node.dataset.slideElement)?.effect;
		if(effect && effect.type !== 'none')
		{
			node.dataset.effect = effectName(effect.type);
			node.style.setProperty('--fx-delay', `${effect.delay}ms`);
		}
	});
	clone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
	// Nothing on a slide is interactive here (Recharts marks its SVG tabindex=0).
	clone.querySelectorAll('[tabindex]').forEach(el => el.removeAttribute('tabindex'));
	return clone.outerHTML;
};

const STYLES = `
	html, body { margin: 0; height: 100%; background: #0b0b0d; color: #f4f4f5; font-family: system-ui, sans-serif; overflow: hidden; }
	.viewer { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 12px; }
	.deck { position: relative; width: min(100vw - 32px, (100vh - 88px) * ${SLIDE_WIDTH} / ${SLIDE_HEIGHT}); aspect-ratio: ${SLIDE_WIDTH} / ${SLIDE_HEIGHT}; }
	.slide { position: absolute; inset: 0; overflow: hidden; border-radius: 6px; visibility: hidden; cursor: pointer; }
	.slide.active, .slide.leaving { visibility: visible; }
	.slide.active { z-index: 2; }
	.slide > [data-slide-stage] { transform-origin: 0 0; transform: scale(var(--scale, 1)) !important; }
	.controls { display: flex; align-items: center; gap: 6px; }
	.controls button { min-width: 40px; height: 36px; padding: 0 10px; border: 1px solid #3f3f46; border-radius: 6px; background: #18181b; color: inherit; font: inherit; font-size: 14px; cursor: pointer; }
	.controls button:hover { background: #27272a; }
	.controls button:focus-visible { outline: 2px solid #a5b4fc; outline-offset: 2px; }
	.controls button[disabled] { opacity: .4; cursor: default; }
	.counter { min-width: 64px; text-align: center; font-variant-numeric: tabular-nums; color: #a1a1aa; font-size: 14px; }
	.notes { max-width: min(100vw - 32px, 960px); max-height: 20vh; overflow: auto; color: #d4d4d8; font-size: 15px; white-space: pre-wrap; }
	.notes[hidden] { display: none; }
	body.overview { overflow: auto; }
	body.overview .viewer { height: auto; min-height: 100%; justify-content: flex-start; padding: 24px 16px; box-sizing: border-box; }
	body.overview .deck { width: min(100%, 1200px); aspect-ratio: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
	body.overview .slide { position: relative; aspect-ratio: ${SLIDE_WIDTH} / ${SLIDE_HEIGHT}; visibility: visible; outline: 2px solid transparent; }
	body.overview .slide.active { outline-color: #a5b4fc; }
	body.overview .slide [data-effect] { animation: none !important; }

	@keyframes fade-in { from { opacity: 0; } }
	@keyframes fade-out { to { opacity: 0; } }
	@keyframes push-in { from { transform: translateX(calc(var(--dir) * 100%)); } }
	@keyframes push-out { to { transform: translateX(calc(var(--dir) * -100%)); } }
	@keyframes zoom-in { from { opacity: 0; transform: scale(.92); } }
	@keyframes wipe-in { from { clip-path: inset(0 0 0 100%); } }
	@keyframes wipe-in-back { from { clip-path: inset(0 100% 0 0); } }
	.slide.enter-fade { animation: fade-in var(--duration) cubic-bezier(.2,0,0,1) both; }
	.slide.enter-zoom { animation: zoom-in var(--duration) cubic-bezier(.2,0,0,1) both; }
	.slide.leaving.leave-zoom { animation: fade-out var(--duration) both; }
	.slide.enter-push { animation: push-in var(--duration) cubic-bezier(.2,0,0,1) both; }
	.slide.leaving.leave-push { animation: push-out var(--duration) cubic-bezier(.2,0,0,1) both; }
	.slide.enter-wipe { animation: wipe-in var(--duration) cubic-bezier(.2,0,0,1) both; }
	.slide.enter-wipe.back { animation-name: wipe-in-back; }

	@keyframes fx-fade { from { opacity: 0; } }
	@keyframes fx-slide-up { from { opacity: 0; transform: translateY(32px); } }
	@keyframes fx-slide-left { from { opacity: 0; transform: translateX(32px); } }
	@keyframes fx-slide-right { from { opacity: 0; transform: translateX(-32px); } }
	@keyframes fx-scale { from { opacity: 0; transform: scale(.85); } }
	.slide.active [data-effect] { animation: .5s cubic-bezier(0,0,.2,1) calc(var(--enter-delay, 0ms) + var(--fx-delay, 0ms)) both; }
	.slide.active [data-effect="fade"] { animation-name: fx-fade; }
	.slide.active [data-effect="slide-up"] { animation-name: fx-slide-up; }
	.slide.active [data-effect="slide-left"] { animation-name: fx-slide-left; }
	.slide.active [data-effect="slide-right"] { animation-name: fx-slide-right; }
	.slide.active [data-effect="scale"] { animation-name: fx-scale; }

	@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; } }
	.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
`;

const SCRIPT = `
	const slides = [...document.querySelectorAll('.slide')];
	const counter = document.querySelector('.counter');
	const live = document.querySelector('[aria-live]');
	const notes = document.querySelector('.notes');
	const prev = document.querySelector('[data-action=prev]');
	const next = document.querySelector('[data-action=next]');
	let index = Math.min(slides.length - 1, Math.max(0, (parseInt(location.hash.slice(1), 10) || 1) - 1));

	const fit = () => slides.forEach(s => s.style.setProperty('--scale', s.clientWidth / ${SLIDE_WIDTH}));

	const show = (target, animate) => {
		if(target < 0 || target >= slides.length) return;
		const from = slides[index];
		const to = slides[target];
		const direction = target >= index ? 1 : -1;
		const type = to.dataset.transition;
		const duration = Number(to.dataset.duration) || 0;
		slides.forEach(s => s.classList.remove('active', 'leaving', 'enter-' + s.dataset.transition, 'leave-' + s.dataset.transition, 'back'));
		if(animate && from !== to && type !== 'none' && !document.body.classList.contains('overview')) {
			to.style.setProperty('--dir', direction);
			from.style.setProperty('--dir', direction);
			to.style.setProperty('--enter-delay', duration + 'ms');
			to.classList.add('enter-' + type);
			if(direction < 0) to.classList.add('back');
			from.classList.add('leaving', 'leave-' + type);
			setTimeout(() => from.classList.remove('leaving', 'leave-' + type), duration);
		} else {
			to.style.setProperty('--enter-delay', '0ms');
		}
		// Restart entrance effects by re-adding .active on the next frame.
		requestAnimationFrame(() => to.classList.add('active'));
		index = target;
		counter.textContent = (index + 1) + ' / ' + slides.length;
		live.textContent = 'Slide ' + (index + 1) + ' of ' + slides.length;
		notes.textContent = to.dataset.notes || 'No notes for this slide.';
		prev.disabled = index === 0;
		next.disabled = index === slides.length - 1;
		history.replaceState(null, '', '#' + (index + 1));
	};

	const toggleOverview = () => {
		document.body.classList.toggle('overview');
		requestAnimationFrame(fit);
	};

	document.querySelector('.controls').addEventListener('click', e => {
		const action = e.target.closest('button')?.dataset.action;
		if(action === 'prev') show(index - 1, true);
		if(action === 'next') show(index + 1, true);
		if(action === 'overview') toggleOverview();
		if(action === 'notes') notes.hidden = !notes.hidden;
		if(action === 'fullscreen') (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()).catch(() => {});
	});

	slides.forEach((s, i) => s.addEventListener('click', () => {
		if(document.body.classList.contains('overview')) { toggleOverview(); show(i, false); }
		else show(index + 1, true);
	}));

	addEventListener('keydown', e => {
		if(e.target.closest && e.target.closest('button') && (e.key === ' ' || e.key === 'Enter')) return;
		const keys = { ArrowRight: 1, ArrowDown: 1, PageDown: 1, ' ': 1, ArrowLeft: -1, ArrowUp: -1, PageUp: -1 };
		if(e.key in keys) show(index + keys[e.key], true);
		else if(e.key === 'Home') show(0, true);
		else if(e.key === 'End') show(slides.length - 1, true);
		else if(e.key === 'o' || e.key === 'O' || (e.key === 'Escape' && document.body.classList.contains('overview'))) toggleOverview();
		else if(e.key === 'n' || e.key === 'N') notes.hidden = !notes.hidden;
		else if(e.key === 'f' || e.key === 'F') document.querySelector('[data-action=fullscreen]').click();
		else return;
		e.preventDefault();
	});

	let touchX = null;
	addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
	addEventListener('touchend', e => {
		if(touchX === null) return;
		const dx = e.changedTouches[0].clientX - touchX;
		touchX = null;
		if(Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1), true);
	});

	addEventListener('resize', fit);
	fit();
	show(index, false);
`;

const buildPresenter = (deck: Deck) => {
	const slides = deck.slides.filter(slide => !slide.skipped);
	if(!slides.length) throw new Error('Every slide is skipped, so there\'s nothing to export.');

	const sections = slides.map((slide, i) => `<section class="slide" role="group" aria-roledescription="slide" aria-label="Slide ${i + 1} of ${slides.length}"`
		+ ` data-transition="${slide.transition.type}" data-duration="${slide.transition.type === 'none' ? 0 : slide.transition.duration}"`
		+ ` style="--duration:${slide.transition.duration}ms" data-notes="${escapeHtml(slide.notes)}">${cleanStage(slide)}</section>`).join('\n');

	return `<!doctype html>
<html lang="en" class="${escapeHtml(document.documentElement.className)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(deck.title)}</title>
<style>${collectCss()}</style>
<style>${STYLES}</style>
</head>
<body>
<main class="viewer">
	<h1 class="sr-only">${escapeHtml(deck.title)}</h1>
	<div class="deck">
${sections}
	</div>
	<nav class="controls" aria-label="Presentation controls">
		<button type="button" data-action="prev" aria-label="Previous slide">&#8592;</button>
		<span class="counter" aria-hidden="true"></span>
		<button type="button" data-action="next" aria-label="Next slide">&#8594;</button>
		<button type="button" data-action="overview" aria-label="All slides (O)">All slides</button>
		<button type="button" data-action="notes" aria-label="Speaker notes (N)">Notes</button>
		<button type="button" data-action="fullscreen" aria-label="Fullscreen (F)">Fullscreen</button>
	</nav>
	<div class="notes" hidden></div>
	<p class="sr-only" aria-live="polite"></p>
</main>
<script>${SCRIPT}</script>
</body>
</html>`;
};

export const exportHtml = (deck: Deck) => {
	downloadBlob(new Blob([buildPresenter(deck)], { type: 'text/html' }), fileName(deck, 'html'));
};
