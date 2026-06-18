export interface RegistryEntry
{
	name: string;
	slug: string;
	files: string[];
	deps: string[];
}

export const REGISTRY: RegistryEntry[] = [
	{ name: 'AudioPlayer',     slug: 'audioplayer',      files: ['AudioPlayer/AudioPlayer.tsx'],                                                                deps: [] },
	{ name: 'Accordion',       slug: 'accordion',        files: ['Accordion/Accordion.tsx'],                                                                   deps: [] },
	{ name: 'Alert',           slug: 'alert',            files: ['Alert/Alert.tsx'],                                                                           deps: [] },
	{ name: 'Avatar',          slug: 'avatar',           files: ['Avatar/Avatar.tsx'],                                                                         deps: [] },
	{ name: 'Badge',           slug: 'badge',            files: ['Badge/Badge.tsx'],                                                                           deps: [] },
	{ name: 'Breadcrumb',      slug: 'breadcrumb',       files: ['Breadcrumb/Breadcrumb.tsx'],                                                                 deps: [] },
	{ name: 'Button',          slug: 'button',           files: ['Button/Button.tsx'],                                                                         deps: [] },
	{ name: 'Canvas',          slug: 'canvas',           files: ['Canvas/Canvas.tsx'],                                                                         deps: [] },
	{ name: 'Card',            slug: 'card',             files: ['Card/Card.tsx'],                                                                             deps: [] },
	{ name: 'Carousel',        slug: 'carousel',         files: ['Carousel/Carousel.tsx'],                                                                     deps: [] },
	{ name: 'Charts',          slug: 'charts',           files: ['Charts/Charts.tsx'],                                                                         deps: ['recharts'] },
	{ name: 'Checkbox',        slug: 'checkbox',         files: ['Checkbox/Checkbox.tsx'],                                                                     deps: [] },
	{ name: 'CodeBlock',       slug: 'code-block',       files: ['CodeBlock/CodeBlock.tsx'],                                                                   deps: [] },
	{ name: 'Collapsible',     slug: 'collapsible',      files: ['Collapsible/Collapsible.tsx'],                                                               deps: [] },
	{ name: 'Combobox',        slug: 'combobox',         files: ['Combobox/Combobox.tsx'],                                                                     deps: [] },
	{ name: 'CommandPalette',  slug: 'command-palette',  files: ['CommandPalette/CommandPalette.tsx'],                                                         deps: [] },
	{ name: 'CountUp',         slug: 'count-up',         files: ['CountUp/CountUp.tsx'],                                                                       deps: [] },
	{ name: 'DataTable',       slug: 'data-table',       files: ['DataTable/DataTable.tsx', 'DataTable/Paginator.tsx'],                                        deps: [] },
	{ name: 'DatePicker',      slug: 'date-picker',      files: ['DatePicker/DatePicker.tsx'],                                                                 deps: [] },
	{ name: 'Drawer',          slug: 'drawer',           files: ['Drawer/Drawer.tsx'],                                                                         deps: [] },
	{ name: 'DropdownMenu',    slug: 'dropdown-menu',    files: ['DropdownMenu/DropdownMenu.tsx'],                                                             deps: [] },
	{ name: 'Form',            slug: 'form',             files: ['Form/Form.tsx'],                                                                             deps: [] },
	{ name: 'FunctionPlotter', slug: 'function-plotter', files: ['FunctionPlotter/FunctionPlotter.tsx'],                                                       deps: [] },
	{ name: 'Graph',           slug: 'graph',            files: ['Graph/Graph.tsx'],                                                                           deps: ['d3-force', '@types/d3-force'] },
	{ name: 'Input',           slug: 'input',            files: ['Input/Input.tsx'],                                                                           deps: [] },
	{ name: 'Kanban',          slug: 'kanban',           files: ['Kanban/Kanban.tsx'],                                                                         deps: ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'] },
	{ name: 'Modal',           slug: 'modal',            files: ['Modal/Modal.tsx'],                                                                           deps: [] },
	{ name: 'Mosaic',          slug: 'mosaic',           files: ['Mosaic/Mosaic.tsx'],                                                                         deps: [] },
	{ name: 'OTPInput',        slug: 'otp-input',        files: ['OTPInput/OTPInput.tsx'],                                                                     deps: [] },
	{ name: 'Popover',         slug: 'popover',          files: ['Popover/Popover.tsx'],                                                                       deps: [] },
	{ name: 'Progress',        slug: 'progress',         files: ['Progress/Progress.tsx'],                                                                     deps: [] },
	{ name: 'Radio',           slug: 'radio',            files: ['Radio/Radio.tsx'],                                                                           deps: [] },
	{ name: 'Reveal',          slug: 'reveal',           files: ['Reveal/Reveal.tsx'],                                                                         deps: [] },
	{ name: 'Select',          slug: 'select',           files: ['Select/Select.tsx'],                                                                         deps: [] },
	{ name: 'Sidebar',         slug: 'sidebar',          files: ['Sidebar/Sidebar.tsx'],                                                                       deps: [] },
	{ name: 'Skeleton',        slug: 'skeleton',         files: ['Skeleton/Skeleton.tsx'],                                                                     deps: [] },
	{ name: 'Slider',          slug: 'slider',           files: ['Slider/Slider.tsx'],                                                                         deps: [] },
	{ name: 'Spinner',         slug: 'spinner',          files: ['Spinner/Spinner.tsx'],                                                                       deps: [] },
	{ name: 'Switch',          slug: 'switch',           files: ['Switch/Switch.tsx'],                                                                         deps: [] },
	{ name: 'Table',           slug: 'table',            files: ['Table/Table.tsx'],                                                                           deps: [] },
	{ name: 'Tabs',            slug: 'tabs',             files: ['Tabs/Tabs.tsx'],                                                                             deps: [] },
	{ name: 'TextShimmer',     slug: 'text-shimmer',     files: ['TextShimmer/TextShimmer.tsx'],                                                               deps: [] },
	{ name: 'Textarea',        slug: 'textarea',         files: ['Textarea/Textarea.tsx'],                                                                     deps: [] },
	{ name: 'Tilt',            slug: 'tilt',             files: ['Tilt/Tilt.tsx'],                                                                             deps: [] },
	{ name: 'Timeline',        slug: 'timeline',         files: ['Timeline/Timeline.tsx'],                                                                     deps: [] },
	{ name: 'Toast',           slug: 'toast',            files: ['Toast/Toast.tsx'],                                                                           deps: [] },
	{ name: 'ToggleGroup',     slug: 'toggle-group',     files: ['ToggleGroup/ToggleGroup.tsx'],                                                               deps: [] },
	{ name: 'Tooltip',         slug: 'tooltip',          files: ['Tooltip/Tooltip.tsx'],                                                                       deps: [] },
	{ name: 'Tree',            slug: 'tree',             files: ['Tree/Tree.tsx'],                                                                             deps: [] },
	{ name: 'Typewriter',      slug: 'typewriter',       files: ['Typewriter/Typewriter.tsx'],                                                                 deps: [] },
	{ name: 'WorkflowBuilder', slug: 'workflow-builder', files: ['WorkflowBuilder/WorkflowBuilder.tsx'],                                                       deps: ['@xyflow/react'] },
];

export function findBySlug(slug: string): RegistryEntry | undefined
{
	return REGISTRY.find(e => e.slug === slug);
}

export function findByName(name: string): RegistryEntry | undefined
{
	return REGISTRY.find(e => e.name.toLowerCase() === name.toLowerCase());
}

export function resolve(input: string): RegistryEntry | undefined
{
	return findBySlug(input) ?? findByName(input);
}
