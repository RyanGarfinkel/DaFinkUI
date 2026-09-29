import { styles, SURFACE_TOKENS, Style } from '@/src/styles';

export const getFullStyleRegistry = (): Style[] => {
	return styles;
};

export const listStyles = (): string => {
	return JSON.stringify(styles.map(({ name, label, description }) => ({ name, label, description })));
};

export const getStyle = (name: string): string => {
	const lower = name.toLowerCase();
	const style = styles.find((s) => s.name.toLowerCase() === lower || s.label.toLowerCase() === lower);

	if(!style)
	{
		const names = styles.map((s) => s.name);
		throw new Error(`No style found for: ${name}. Available: ${names.join(', ')}`);
	}

	return JSON.stringify(style);
};

export const getSurfaceTokenNames = (): string => {
	return JSON.stringify(SURFACE_TOKENS);
};
