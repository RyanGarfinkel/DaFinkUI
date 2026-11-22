import { createSlideFromLayout } from '../../components/DeckEditor/layouts';
import type { LayoutId } from '../../components/DeckEditor/layouts';
import type { ThemeId } from '../../components/DeckEditor/themes';
import type { Deck } from '../../components/DeckEditor/deck';

// Starter decks, built from layouts so every placeholder follows the theme.
// New decks are created through `createDeck({ deck })`, so the server only ever
// sees ordinary, validated decks and doesn't need to know templates exist.

interface Template {
	id:      string;
	label:   string;
	theme:   ThemeId;
	layouts: LayoutId[];
}

export const TEMPLATES: Template[] = [
	{ id: 'pitch',     label: 'Pitch',            theme: 'midnight', layouts: ['title', 'titleContent', 'imageText', 'chart', 'comparison', 'section'] },
	{ id: 'quarterly', label: 'Quarterly review', theme: 'ocean',    layouts: ['title', 'chart', 'twoColumns', 'titleContent'] },
	{ id: 'lesson',    label: 'Lesson',           theme: 'paper',    layouts: ['title', 'section', 'titleContent', 'twoColumns', 'titleContent'] },
];

export const buildTemplate = (template: Template): Deck => ({
	title:  template.label,
	theme:  template.theme,
	slides: template.layouts.map(layout => createSlideFromLayout(layout)),
});
