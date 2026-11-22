import type { Deck, Slide, SlideTransition } from './deck';

// pptxgenjs has no motion API, so it is written into the slide XML afterwards, finding shapes by the element id pptx.ts names them with. Every entrance becomes PowerPoint's Fade, the closest effect all viewers support.

const TRANSITION_XML: Record<Exclude<SlideTransition['type'], 'none'>, string> = {
	fade: '<p:fade/>',
	push: '<p:push dir="l"/>',
	wipe: '<p:wipe dir="l"/>',
	zoom: '<p:zoom/>',
};

const speed = (ms: number) => (ms < 400 ? 'fast' : ms < 800 ? 'med' : 'slow');

const transitionXml = (transition: SlideTransition) =>
	(transition.type === 'none' ? '' : `<p:transition spd="${speed(transition.duration)}">${TRANSITION_XML[transition.type]}</p:transition>`);

const FADE_MS = 500;

/** Entrance timing for every element with an effect, all starting automatically once the slide appears. */
const timingXml = (slide: Slide, spidFor: (elementId: string) => string | undefined) => {
	let nextId = 5;
	const effects = slide.elements.flatMap(el =>
	{
		const spid = el.effect && el.effect.type !== 'none' ? spidFor(el.id) : undefined;
		if(!spid || !el.effect) return [];
		const [par, set, anim] = [nextId++, nextId++, nextId++];
		return [
			`<p:par><p:cTn id="${par}" presetID="10" presetClass="entr" presetSubtype="0" fill="hold" nodeType="withEffect">`
			+ `<p:stCondLst><p:cond delay="${Math.round(el.effect.delay)}"/></p:stCondLst><p:childTnLst>`
			+ `<p:set><p:cBhvr><p:cTn id="${set}" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn>`
			+ `<p:tgtEl><p:spTgt spid="${spid}"/></p:tgtEl><p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr>`
			+ '<p:to><p:strVal val="visible"/></p:to></p:set>'
			+ `<p:animEffect transition="in" filter="fade"><p:cBhvr><p:cTn id="${anim}" dur="${FADE_MS}"/><p:tgtEl><p:spTgt spid="${spid}"/></p:tgtEl></p:cBhvr></p:animEffect>`
			+ '</p:childTnLst></p:cTn></p:par>',
		];
	});
	if(!effects.length) return '';

	return '<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>'
		+ '<p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>'
		+ '<p:par><p:cTn id="3" fill="hold"><p:stCondLst><p:cond delay="indefinite"/><p:cond evt="onBegin" delay="0"><p:tn val="2"/></p:cond></p:stCondLst><p:childTnLst>'
		+ `<p:par><p:cTn id="4" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>${effects.join('')}</p:childTnLst></p:cTn></p:par>`
		+ '</p:childTnLst></p:cTn></p:par>'
		+ '</p:childTnLst></p:cTn><p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst>'
		+ '<p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq>'
		+ '</p:childTnLst></p:cTn></p:par></p:tnLst></p:timing>';
};

/** pptxgenjs can give a table the same id as the next shape; renumber repeats so every id targets one shape. */
const uniqueShapeIds = (xml: string) => {
	const seen = new Set<string>();
	let next = Math.max(0, ...[...xml.matchAll(/<p:cNvPr\b[^>]*\bid="(\d+)"/g)].map(m => Number(m[1]))) + 1;
	return xml.replace(/(<p:cNvPr\b[^>]*\bid=")(\d+)"/g, (match, prefix: string, id: string) =>
	{
		if(!seen.has(id))
		{
			seen.add(id);
			return match;
		}
		return `${prefix}${next++}"`;
	});
};

/** Shape ids by name: `<p:cNvPr id="7" name="title-1" …>`. */
const shapeIds = (xml: string) => {
	const ids = new Map<string, string>();
	for(const match of xml.matchAll(/<p:cNvPr\b[^>]*\bid="(\d+)"[^>]*\bname="([^"]*)"/g)) ids.set(match[2], match[1]);
	return ids;
};

export const addMotion = async (pptx: ArrayBuffer, deck: Deck): Promise<Blob> => {
	const { default: JSZip } = await import('jszip');
	const zip = await JSZip.loadAsync(pptx);

	await Promise.all(deck.slides.map(async (slide, i) =>
	{
		const path = `ppt/slides/slide${i + 1}.xml`;
		const file = zip.file(path);
		if(!file) throw new Error(`The PowerPoint file is missing ${path}.`);

		const original = await file.async('string');
		const xml = uniqueShapeIds(original);
		const ids = shapeIds(xml);
		const motion = transitionXml(slide.transition) + timingXml(slide, id => ids.get(id));
		if(!motion)
		{
			if(xml !== original) zip.file(path, xml);
			return;
		}

		// Schema order inside <p:sld> is cSld, clrMapOvr, transition, timing.
		const anchor = xml.includes('</p:clrMapOvr>') ? '</p:clrMapOvr>' : '</p:cSld>';
		zip.file(path, xml.replace(anchor, anchor + motion));
	}));

	return zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
};
