export interface RegistryEntry
{
	name: string;
	slug: string;
	files: string[];
	deps: string[];
	registryDependencies: string[];
}

export const REGISTRY: RegistryEntry[] = [
	{ name: 'AudioPlayer',     slug: 'audioplayer',      files: ['AudioPlayer/AudioPlayer.tsx'],                                                                deps: [], registryDependencies: [] },
	{ name: 'Accordion',       slug: 'accordion',        files: ['Accordion/Accordion.tsx'],                                                                   deps: [], registryDependencies: [] },
	{ name: 'Alert',           slug: 'alert',            files: ['Alert/Alert.tsx'],                                                                           deps: [], registryDependencies: [] },
	{ name: 'Attachment',      slug: 'attachment',       files: ['Attachment/Attachment.tsx'],                                                                 deps: [], registryDependencies: [] },
	{ name: 'Avatar',          slug: 'avatar',           files: ['Avatar/Avatar.tsx'],                                                                         deps: [], registryDependencies: [] },
	{ name: 'Badge',           slug: 'badge',            files: ['Badge/Badge.tsx'],                                                                           deps: [], registryDependencies: [] },
	{ name: 'Breadcrumb',      slug: 'breadcrumb',       files: ['Breadcrumb/Breadcrumb.tsx'],                                                                 deps: [], registryDependencies: [] },
	{ name: 'Button',          slug: 'button',           files: ['Button/Button.tsx'],                                                                         deps: [], registryDependencies: [] },
	{ name: 'Canvas',          slug: 'canvas',           files: ['Canvas/Canvas.tsx'],                                                                         deps: [], registryDependencies: [] },
	{ name: 'Card',            slug: 'card',             files: ['Card/Card.tsx'],                                                                             deps: [], registryDependencies: [] },
	{ name: 'Carousel',        slug: 'carousel',         files: ['Carousel/Carousel.tsx'],                                                                     deps: [], registryDependencies: [] },
	{ name: 'Charts',          slug: 'charts',           files: ['Charts/Charts.tsx'],                                                                         deps: ['recharts'], registryDependencies: [] },
	{ name: 'Checkbox',        slug: 'checkbox',         files: ['Checkbox/Checkbox.tsx'],                                                                     deps: [], registryDependencies: [] },
	{ name: 'CodeBlock',       slug: 'code-block',       files: ['CodeBlock/CodeBlock.tsx'],                                                                   deps: [], registryDependencies: ['toggle-group'] },
	{ name: 'CodeEditor',      slug: 'code-editor',      files: ['CodeEditor/CodeEditor.tsx'],                                                                 deps: ['@uiw/react-codemirror', '@codemirror/lang-javascript', '@codemirror/autocomplete'], registryDependencies: [] },
	{ name: 'Collapsible',     slug: 'collapsible',      files: ['Collapsible/Collapsible.tsx'],                                                               deps: [], registryDependencies: [] },
	{ name: 'Combobox',        slug: 'combobox',         files: ['Combobox/Combobox.tsx'],                                                                     deps: [], registryDependencies: [] },
	{ name: 'CommandPalette',  slug: 'command-palette',  files: ['CommandPalette/CommandPalette.tsx'],                                                         deps: [], registryDependencies: ['scroll-fade'] },
	{ name: 'CountUp',         slug: 'count-up',         files: ['CountUp/CountUp.tsx'],                                                                       deps: [], registryDependencies: [] },
	{ name: 'DataTable',       slug: 'data-table',       files: ['DataTable/DataTable.tsx', 'DataTable/Paginator.tsx'],                                        deps: [], registryDependencies: [] },
	{ name: 'DatePicker',      slug: 'date-picker',      files: ['DatePicker/DatePicker.tsx'],                                                                 deps: [], registryDependencies: [] },
	{ name: 'Drawer',          slug: 'drawer',           files: ['Drawer/Drawer.tsx'],                                                                         deps: [], registryDependencies: [] },
	{ name: 'DropdownMenu',    slug: 'dropdown-menu',    files: ['DropdownMenu/DropdownMenu.tsx'],                                                             deps: [], registryDependencies: [] },
	{ name: 'Form',            slug: 'form',             files: ['Form/Form.tsx'],                                                                             deps: ['zod', 'react-hook-form', '@hookform/resolvers'], registryDependencies: ['input', 'button'] },
	{ name: 'FunctionPlotter', slug: 'function-plotter', files: ['FunctionPlotter/FunctionPlotter.tsx'],                                                       deps: [], registryDependencies: [] },
	{ name: 'Graph',           slug: 'graph',            files: ['Graph/Graph.tsx'],                                                                           deps: ['d3-force', '@types/d3-force'], registryDependencies: [] },
	{ name: 'Input',           slug: 'input',            files: ['Input/Input.tsx'],                                                                           deps: [], registryDependencies: [] },
	{ name: 'Kanban',          slug: 'kanban',           files: ['Kanban/Kanban.tsx'],                                                                         deps: ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'], registryDependencies: [] },
	{ name: 'Message',         slug: 'message',          files: ['Message/Message.tsx'],                                                                      deps: [], registryDependencies: [] },
	{ name: 'Modal',           slug: 'modal',            files: ['Modal/Modal.tsx'],                                                                           deps: [], registryDependencies: [] },
	{ name: 'Mosaic',          slug: 'mosaic',           files: ['Mosaic/Mosaic.tsx'],                                                                         deps: ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'], registryDependencies: [] },
	{ name: 'OTPInput',        slug: 'otp-input',        files: ['OTPInput/OTPInput.tsx'],                                                                     deps: [], registryDependencies: [] },
	{ name: 'Popover',         slug: 'popover',          files: ['Popover/Popover.tsx'],                                                                       deps: [], registryDependencies: [] },
	{ name: 'Progress',        slug: 'progress',         files: ['Progress/Progress.tsx'],                                                                     deps: [], registryDependencies: [] },
	{ name: 'Radio',           slug: 'radio',            files: ['Radio/Radio.tsx'],                                                                           deps: [], registryDependencies: [] },
	{ name: 'Reveal',          slug: 'reveal',           files: ['Reveal/Reveal.tsx'],                                                                         deps: [], registryDependencies: [] },
	{ name: 'ScrollFade',      slug: 'scroll-fade',      files: ['ScrollFade/ScrollFade.tsx'],                                                                 deps: [], registryDependencies: [] },
	{ name: 'Select',          slug: 'select',           files: ['Select/Select.tsx'],                                                                         deps: [], registryDependencies: [] },
	{ name: 'Separator',       slug: 'separator',        files: ['Separator/Separator.tsx'],                                                                   deps: [], registryDependencies: [] },
	{ name: 'Sidebar',         slug: 'sidebar',          files: ['Sidebar/Sidebar.tsx'],                                                                       deps: [], registryDependencies: ['tooltip', 'scroll-fade'] },
	{ name: 'SidePanel',       slug: 'side-panel',       files: ['SidePanel/SidePanel.tsx', 'SidePanel/sidePanelStack.ts'],                                    deps: [], registryDependencies: ['card'] },
	{ name: 'Skeleton',        slug: 'skeleton',         files: ['Skeleton/Skeleton.tsx'],                                                                     deps: [], registryDependencies: [] },
	{ name: 'Slider',          slug: 'slider',           files: ['Slider/Slider.tsx'],                                                                         deps: [], registryDependencies: [] },
	{ name: 'Spinner',         slug: 'spinner',          files: ['Spinner/Spinner.tsx'],                                                                       deps: [], registryDependencies: [] },
	{ name: 'Switch',          slug: 'switch',           files: ['Switch/Switch.tsx'],                                                                         deps: [], registryDependencies: [] },
	{ name: 'Table',           slug: 'table',            files: ['Table/Table.tsx'],                                                                           deps: [], registryDependencies: [] },
	{ name: 'Tabs',            slug: 'tabs',             files: ['Tabs/Tabs.tsx'],                                                                             deps: [], registryDependencies: [] },
	{ name: 'TextShimmer',     slug: 'text-shimmer',     files: ['TextShimmer/TextShimmer.tsx'],                                                               deps: [], registryDependencies: [] },
	{ name: 'Textarea',        slug: 'textarea',         files: ['Textarea/Textarea.tsx'],                                                                     deps: [], registryDependencies: [] },
	{ name: 'Tilt',            slug: 'tilt',             files: ['Tilt/Tilt.tsx'],                                                                             deps: [], registryDependencies: [] },
	{ name: 'Timeline',        slug: 'timeline',         files: ['Timeline/Timeline.tsx'],                                                                     deps: [], registryDependencies: [] },
	{ name: 'Toast',           slug: 'toast',            files: ['Toast/Toast.tsx'],                                                                           deps: [], registryDependencies: [] },
	{ name: 'ToggleGroup',     slug: 'toggle-group',     files: ['ToggleGroup/ToggleGroup.tsx'],                                                               deps: [], registryDependencies: [] },
	{ name: 'Tooltip',         slug: 'tooltip',          files: ['Tooltip/Tooltip.tsx'],                                                                       deps: [], registryDependencies: [] },
	{ name: 'TopNav',          slug: 'top-nav',          files: ['TopNav/TopNav.tsx'],                                                                         deps: [], registryDependencies: [] },
	{ name: 'Tree',            slug: 'tree',             files: ['Tree/Tree.tsx'],                                                                             deps: [], registryDependencies: [] },
	{ name: 'Typewriter',      slug: 'typewriter',       files: ['Typewriter/Typewriter.tsx'],                                                                 deps: [], registryDependencies: [] },
	{ name: 'WorkflowBuilder', slug: 'workflow-builder', files: ['WorkflowBuilder/WorkflowBuilder.tsx'],                                                       deps: ['@xyflow/react'], registryDependencies: [] },
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
