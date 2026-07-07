const iconProps = {
	width:           16,
	height:          16,
	viewBox:         '0 0 24 24',
	fill:            'none',
	stroke:          'currentColor',
	strokeWidth:     2,
	strokeLinecap:   'round' as const,
	strokeLinejoin:  'round' as const,
	'aria-hidden':   true as const,
};

export const HomeIcon = () => (
	<svg {...iconProps}>
		<path d='M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' />
		<path d='M9 22V12h6v10' />
	</svg>
);

export const InstallationIcon = () => (
	<svg {...iconProps}>
		<path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
		<polyline points='7 10 12 15 17 10' />
		<line x1='12' y1='15' x2='12' y2='3' />
	</svg>
);

export const ThemeIcon = () => (
	<svg {...iconProps}>
		<path d='M12 2.7s6 6.1 6 10.3a6 6 0 1 1-12 0c0-4.2 6-10.3 6-10.3Z' />
	</svg>
);

export const TypographyIcon = () => (
	<svg {...iconProps}>
		<polyline points='4 7 4 4 20 4 20 7' />
		<line x1='9' y1='20' x2='15' y2='20' />
		<line x1='12' y1='4' x2='12' y2='20' />
	</svg>
);

export const ComponentsIcon = () => (
	<svg {...iconProps}>
		<rect x='3' y='3' width='7' height='7' />
		<rect x='14' y='3' width='7' height='7' />
		<rect x='14' y='14' width='7' height='7' />
		<rect x='3' y='14' width='7' height='7' />
	</svg>
);

export const BlocksIcon = () => (
	<svg {...iconProps}>
		<rect x='3' y='3' width='18' height='18' rx='2' />
		<line x1='3' y1='9' x2='21' y2='9' />
		<line x1='9' y1='9' x2='9' y2='21' />
	</svg>
);

export const McpIcon = () => (
	<svg {...iconProps}>
		<rect x='2' y='3' width='20' height='7' rx='1' />
		<rect x='2' y='14' width='20' height='7' rx='1' />
		<line x1='6' y1='6.5' x2='6.01' y2='6.5' />
		<line x1='6' y1='17.5' x2='6.01' y2='17.5' />
	</svg>
);

export const SkillIcon = () => (
	<svg {...iconProps}>
		<polygon points='13 2 3 14 12 14 11 22 21 10 12 10 13 2' />
	</svg>
);

export const ReliabilityIcon = () => (
	<svg {...iconProps}>
		<rect x='8' y='2' width='8' height='4' rx='1' />
		<path d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2' />
		<path d='m9 14 2 2 4-4' />
	</svg>
);

export const ArrowRightIcon = () => (
	<svg {...iconProps}>
		<line x1='5' y1='12' x2='19' y2='12' />
		<polyline points='12 5 19 12 12 19' />
	</svg>
);

export const PlaygroundIcon = () => (
	<svg {...iconProps}>
		<path d='M5 3v18l14-9L5 3Z' />
	</svg>
);

export const GithubIcon = () => (
	<svg width={16} height={16} viewBox='0 0 24 24' fill='currentColor' aria-hidden='true'>
		<path d='M12 .5C5.73.5.5 5.73.5 12c0 5.09 3.29 9.4 7.86 10.94.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.11-3.2.7-3.88-1.36-3.88-1.36-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.72-1.55-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.8 1.18 1.83 1.18 3.09 0 4.42-2.69 5.4-5.25 5.68.42.36.78 1.08.78 2.18 0 1.58-.01 2.85-.01 3.24 0 .31.2.66.79.55A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z' />
	</svg>
);

export const ChangelogIcon = () => (
	<svg {...iconProps}>
		<path d='M4 19.5A2.5 2.5 0 0 1 6.5 17H20' />
		<path d='M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z' />
		<line x1='9' y1='7' x2='15' y2='7' />
		<line x1='9' y1='11' x2='15' y2='11' />
	</svg>
);

export const PackageIcon = () => (
	<svg {...iconProps}>
		<path d='M12.89 1.45l8 4A2 2 0 0 1 22 7.24v9.53a2 2 0 0 1-1.11 1.79l-8 4a2 2 0 0 1-1.79 0l-8-4a2 2 0 0 1-1.1-1.8V7.24a2 2 0 0 1 1.11-1.79l8-4a2 2 0 0 1 1.78 0z' />
		<polyline points='2.32 6.16 12 11 21.68 6.16' />
		<line x1='12' y1='22.76' x2='12' y2='11' />
	</svg>
);
