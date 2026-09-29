import { themes, Theme } from '@/src/themes';

export const getFullThemeRegistry = (): Theme[] => {
	return themes;
};

export const listThemes = (): string => {
	return JSON.stringify(themes.map(({ name, label, accent }) => ({ name, label, accent })));
};

export const getTheme = (name: string): string => {
	const lower = name.toLowerCase();
	const theme = themes.find((t) => t.name.toLowerCase() === lower || t.label.toLowerCase() === lower);

	if(!theme)
	{
		const names = themes.map((t) => t.name);
		throw new Error(`No theme (palette) found for: ${name}. Available: ${names.join(', ')}`);
	}

	return JSON.stringify(theme);
};
