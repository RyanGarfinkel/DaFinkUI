import { ComponentPreview } from '@/app/_docs/components/ComponentPreview';
import { Card, CardHeader, CardContent } from '@/src/components/Card/Card';
import { DarkModeToggle } from '@/app/_docs/components/DarkModeToggle';
import { CodeBlock } from '@/src/components/CodeBlock/CodeBlock';
import { Tooltip } from '@/src/components/Tooltip/Tooltip';
import { themes } from '@/src/themes';
import { styles } from '@/src/styles';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Theme',
	description: 'Switch between built-in DaFink UI color palettes and surface styles, toggle light/dark mode, and learn how to create your own by overriding CSS custom property tokens.',
};

const THEME_DESCRIPTIONS: Record<string, string> = {
	default: 'Pure white surfaces with a jet-black brand — a neutral premium look that works in any context.',
	ocean:   'Deep sky blue brand over cool blue-tinted surfaces. Dark mode drops into a true deep navy with precise elevation steps.',
	ember:   'Warm orange brand with amber-tinted surfaces. Dark mode goes to a near-black with deep warm undertones — rich without being aggressive.',
	forest:  'Fresh emerald brand over subtly green-tinted surfaces. Dark mode is a true deep forest — near-black with green undertones and clear hierarchy.',
	noir:    'Cool slate surfaces with a deep charcoal brand. Quieter than Zinc — every surface has a blue undertone that reads refined and editorial.',
	plum:    'Rich violet brand over barely-tinted surfaces. Dark mode is deep violet-black — luxurious, design-forward, and high contrast.',
};

const SWATCH_LABELS: Record<string, string> = {
	'--color-brand':          'Brand',
	'--color-surface':        'Surface',
	'--color-surface-border': 'Border',
	'--color-text-muted':     'Text',
};

const SWATCH_TOKENS = ['--color-brand', '--color-surface', '--color-surface-border', '--color-text-muted'] as const;

interface StyleDetail
{
	traits:    string;
	a11y:      string;
	a11yTone:  'strong' | 'caution' | 'note';
	whenToUse: string;
}

const STYLE_DETAILS: Record<string, StyleDetail> = {
	minimal: {
		traits:    'Restrained radius, hairline borders, little to no shadow, generous whitespace, neutral surfaces. The closest fit to a clean, unopinionated default.',
		a11y:      'Strong. High contrast and clear separation come naturally, with few effects to compromise legibility.',
		a11yTone:  'strong',
		whenToUse: 'Content-heavy apps, enterprise tools, reading experiences — anything that prioritizes clarity and longevity.',
	},
	neumorph: {
		traits:    'The surface is locked to a neutral gray so dual shadows (white top-left, dark bottom-right) are visible. Depth comes entirely from shadow, with no border and a medium-to-large radius. Form fields use an inset version of the shadow to feel sunken.',
		a11y:      'The weakest style for accessibility. Borders vanish and contrast between elements is low. Treat it as opt-in and use it sparingly — toggles, sliders, and cards only — while keeping the rest of the UI flat.',
		a11yTone:  'caution',
		whenToUse: 'Sparingly, for tactile accents on individual controls. Do not build a whole interface in Neumorph.',
	},
	brutalist: {
		traits:    'Radius 0, thick solid borders (2–4px), and a hard offset shadow (e.g. 4px 4px 0 with no blur). High contrast, with bold or monospaced type.',
		a11y:      'Generally strong. High contrast and visible, heavy borders make boundaries and focus easy to perceive.',
		a11yTone:  'strong',
		whenToUse: 'Brands that want to stand out — portfolios, editorial sites, developer tools, and marketing pages.',
	},
};

const TONE_LABEL: Record<StyleDetail['a11yTone'], string> = {
	strong:  'Accessibility — strong',
	caution: 'Accessibility — caution',
	note:    'Accessibility — note',
};

const TONE_DOT: Record<StyleDetail['a11yTone'], string> = {
	strong:  'bg-success',
	caution: 'bg-warning',
	note:    'bg-text-muted',
};

const THEME_SHAPE_SNIPPET = `import type { Theme } from '@/src/themes/types';

export const myTheme: Theme = {
  name:   'my-theme',
  label:  'My Theme',
  accent: '#0ea5e9', // swatch hex shown in the picker

  light: {
    '--color-brand':        '#0284c7',
    '--color-brand-hover':  '#0369a1',
    '--color-brand-active': '#075985',
    '--color-brand-ring':   '#0284c7',
    '--color-brand-fg':     '#ffffff',

    // surface, text, input tokens ...
  },

  dark: {
    '--color-brand':        '#38bdf8',
    '--color-brand-hover':  '#7dd3fc',
    '--color-brand-active': '#bae6fd',
    '--color-brand-ring':   '#38bdf8',
    '--color-brand-fg':     '#0c4a6e',

    // surface, text, input tokens ...
  },
};`;

const APPLY_SNIPPET = `// Wrap your preview area with the theme's token map
import { oceanTheme } from '@/src/themes/ocean';

<div style={oceanTheme.light as React.CSSProperties}>
  <YourApp />
</div>`;

const InlineCode = ({ children }: { children: string }) =>
{
	return (
		<code className='font-mono text-sm text-text bg-surface-active rounded px-1.5 py-0.5'>
			{children}
		</code>
	);
};

const TraitRow = ({ label, children }: { label: string; children: React.ReactNode }) =>
{
	return (
		<div className='flex flex-col gap-1'>
			<span className='text-xs font-semibold uppercase tracking-wide text-text-muted'>{label}</span>
			<p className='text-sm text-text-muted leading-relaxed'>{children}</p>
		</div>
	);
};

const ThemePage = () =>
{
	return (
		<div className='flex flex-col gap-10'>

			{/* Header */}
			<div className='flex flex-col gap-2'>
				<h1 className='text-3xl font-semibold tracking-tight text-text'>Theme</h1>
				<p className='text-base text-text-muted leading-relaxed'>
					DaFink UI is fully themeable via CSS custom properties. A color palette, a
					surface style, and light/dark mode compose freely and independently — swap any
					one of them without touching a single component.
				</p>
			</div>

			{/* Light & dark mode */}
			<div className='flex flex-col gap-4'>
				<h2 className='text-xl font-semibold text-text'>Light & dark mode</h2>
				<p className='text-sm text-text-muted leading-relaxed'>
					Mode is class-based — toggling adds or removes <InlineCode>.dark</InlineCode>{' '}
					on <InlineCode>&lt;html&gt;</InlineCode>, which flips every theme and style to
					its <InlineCode>dark</InlineCode> token map. The choice is stored in{' '}
					<InlineCode>localStorage</InlineCode> and mirrored to a cookie so the server
					renders the correct mode on first paint, with no flash.
				</p>
				<ComponentPreview>
					<DarkModeToggle />
				</ComponentPreview>
			</div>

			{/* Color palettes */}
			<div className='flex flex-col gap-5'>
				<div className='flex flex-col gap-1'>
					<h2 className='text-xl font-semibold text-text'>Color palettes</h2>
					<p className='text-sm text-text-muted'>
						Six color palettes ship with DaFink UI as built-in themes, imported from{' '}
						<InlineCode>@/src/themes</InlineCode>. Each is a color swap only — radius,
						shadow, and border come from the active Style, not the Theme. Hover or focus
						a swatch for its hex value.
					</p>
				</div>

				<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
					{themes.map((theme) => (
						<Card key={theme.name} variant='outline' className='p-5'>
							<div className='flex flex-col gap-3'>
								<div className='flex items-center justify-between gap-3'>
									<div className='flex flex-col gap-0.5'>
										<span className='text-sm font-semibold text-text'>{theme.label}</span>
										<InlineCode>{theme.name}</InlineCode>
									</div>
									<div className='flex items-center gap-1'>
										{SWATCH_TOKENS.map((token) => (
											<Tooltip key={token} content={`${SWATCH_LABELS[token]} ${theme.light[token]}`}>
												<span
													tabIndex={0}
													aria-label={`${SWATCH_LABELS[token]}: ${theme.light[token]}`}
													className='h-5 w-5 rounded-full border border-surface-border shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring'
													style={{ backgroundColor: theme.light[token] }}
												/>
											</Tooltip>
										))}
									</div>
								</div>
								<p className='text-sm text-text-muted leading-relaxed'>
									{THEME_DESCRIPTIONS[theme.name] ?? ''}
								</p>
							</div>
						</Card>
					))}
				</div>
			</div>

			{/* The styles */}
			<div className='flex flex-col gap-5'>
				<div className='flex flex-col gap-1'>
					<h2 className='text-xl font-semibold text-text'>The styles</h2>
					<p className='text-sm text-text-muted'>
						Three surface styles ship with DaFink UI. Each composes with any theme.
					</p>
				</div>

				<div className='flex flex-col gap-4'>
					{styles.map((style) => {
						const detail = STYLE_DETAILS[style.name];
						if(!detail) return null;

						return (
							<Card key={style.name} variant='outline'>
								<CardHeader>
									<div className='flex flex-col gap-1'>
										<h3 className='text-lg font-semibold text-text'>{style.label}</h3>
										<p className='text-sm text-text-muted leading-relaxed'>{style.description}</p>
									</div>
								</CardHeader>
								<CardContent>
									<div className='flex flex-col gap-4'>
										<TraitRow label='Visual traits'>{detail.traits}</TraitRow>
										<div className='flex flex-col gap-1'>
											<span className='flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-text-muted'>
												<span
													className={`h-2 w-2 rounded-full shrink-0 ${TONE_DOT[detail.a11yTone]}`}
													aria-hidden='true'
												/>
												{TONE_LABEL[detail.a11yTone]}
											</span>
											<p className='text-sm text-text-muted leading-relaxed'>{detail.a11y}</p>
										</div>
										<TraitRow label='When to use it'>{detail.whenToUse}</TraitRow>
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			</div>

			{/* How to apply */}
			<div className='flex flex-col gap-4'>
				<h2 className='text-xl font-semibold text-text'>Applying a theme</h2>
				<p className='text-sm text-text-muted leading-relaxed'>
					Every component in DaFink UI is styled through token classes like{' '}
					<InlineCode>bg-brand</InlineCode> and <InlineCode>text-text-muted</InlineCode>,
					which resolve to CSS custom properties defined in{' '}
					<InlineCode>globals.css</InlineCode>. Pass a theme&apos;s{' '}
					<InlineCode>light</InlineCode> or <InlineCode>dark</InlineCode> token map as an
					inline style on any wrapper element, and every DaFink UI component beneath it
					re-themes automatically.
				</p>
				<CodeBlock code={APPLY_SNIPPET} />
				<p className='text-sm text-text-muted leading-relaxed'>
					This docs site uses this pattern in the top nav&apos;s theme and style dropdowns
					— selecting a value injects the token map onto a <InlineCode>style</InlineCode>{' '}
					override that wraps the whole preview area.
				</p>
			</div>

			{/* Custom themes */}
			<div className='flex flex-col gap-4'>
				<h2 className='text-xl font-semibold text-text'>Creating a custom theme</h2>
				<p className='text-sm text-text-muted leading-relaxed'>
					A theme is a plain TypeScript object that satisfies the{' '}
					<InlineCode>Theme</InlineCode> interface from{' '}
					<InlineCode>@/src/themes/types</InlineCode>. You only need to override the
					tokens you want to change — start from a copy of{' '}
					<InlineCode>defaultTheme</InlineCode> and adjust the brand and surface palette.
				</p>
				<CodeBlock code={THEME_SHAPE_SNIPPET} />
				<p className='text-sm text-text-muted leading-relaxed'>
					Define both <InlineCode>light</InlineCode> and <InlineCode>dark</InlineCode>{' '}
					token maps. Do not rely on cascade fallbacks — if a token is not in the map it
					will fall back to the global default, which may not match your intended palette.
				</p>
			</div>

			{/* Installation / CSS variable approach */}
			<div className='flex flex-col gap-4 border-t border-surface-border pt-8'>
				<h2 className='text-xl font-semibold text-text'>CSS variable approach</h2>
				<p className='text-sm text-text-muted leading-relaxed'>
					The global token defaults live in <InlineCode>app/globals.css</InlineCode>{' '}
					under the <InlineCode>@theme</InlineCode> block. These define the baseline
					palette used by all components when no theme wrapper is present. Dark mode
					overrides sit immediately below in the <InlineCode>.dark</InlineCode> selector.
				</p>
				<p className='text-sm text-text-muted leading-relaxed'>
					These values are generated, not hand-written. The source of truth is the set
					of JSON files in <InlineCode>tokens/</InlineCode> (one per theme, per mode —
					e.g. <InlineCode>tokens/zinc.light.json</InlineCode>), plus{' '}
					<InlineCode>tokens/motion.json</InlineCode>. Running{' '}
					<InlineCode>npm run tokens</InlineCode> compiles those files into{' '}
					<InlineCode>src/tokens/colors.ts</InlineCode> and the CSS custom properties in{' '}
					<InlineCode>globals.css</InlineCode>. Edit the JSON, then re-run the script —
					do not edit the generated files directly.
				</p>
				<p className='text-sm text-text-muted leading-relaxed'>
					Themes do not need to redefine every token — only the ones that differ from
					the defaults. The recommended starting point is to override the five brand
					tokens (<InlineCode>--color-brand</InlineCode>,{' '}
					<InlineCode>--color-brand-hover</InlineCode>,{' '}
					<InlineCode>--color-brand-active</InlineCode>,{' '}
					<InlineCode>--color-brand-ring</InlineCode>,{' '}
					<InlineCode>--color-brand-fg</InlineCode>) and adjust the surface palette if
					your brand color is strongly chromatic.
				</p>
			</div>

		</div>
	);
};

export default ThemePage;
