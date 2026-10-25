import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export const registerPrompts = (server: McpServer): void => {
	server.prompt(
		'use-component',
		'Get full guidance for using a specific DaFink UI component: spec, props, usage example, and accessibility notes',
		{ component: z.string().describe('Component name, e.g. "Button" or "Modal"') },
		({ component }) => ({
			messages: [
				{
					role: 'user',
					content: {
						type: 'text',
						text: `I need to use the DaFink UI ${component} component. Please:\n1. Call get_component_spec("${component}") to get the full spec\n2. Call get_component_registry_entry("${component}") to get the usage example and props\n3. Use that information to show me the correct import, a working code example, and the key props I should know about`,
					},
				},
			],
		})
	);

	server.prompt(
		'create-component',
		'Step-by-step guidance for creating a new DaFink UI component following all project rules',
		{
			name: z.string().describe('PascalCase component name, e.g. "Stepper"'),
			description: z.string().describe('One-line description of what the component does'),
		},
		({ name, description }) => ({
			messages: [
				{
					role: 'user',
					content: {
						type: 'text',
						text: `I need to create a new DaFink UI component called ${name}: ${description}\n\nBefore writing any code:\n1. Call get_rule("new-component") to read the full component creation rules\n2. Call get_rule("code") to read the coding style rules\n3. Call get_pattern("accessibility") to read the accessibility requirements\n4. Call get_pattern("design") to read the visual design philosophy\n\nThen create the component following all rules: ComponentName.tsx, spec.md, ComponentName.test.tsx, and a registry entry.`,
					},
				},
			],
		})
	);

	server.prompt(
		'find-component',
		'Find the right DaFink UI component for a given UI need',
		{ need: z.string().describe('What you need to build, e.g. "a date picker" or "show tabular data"') },
		({ need }) => ({
			messages: [
				{
					role: 'user',
					content: {
						type: 'text',
						text: `I need to build: ${need}\n\nPlease:\n1. Call search_components("${need}") to find relevant DaFink UI components\n2. If no results, call get_full_registry() to browse all components by category\n3. Recommend the best component(s) for my need, explain why, and show a usage example`,
					},
				},
			],
		})
	);

	server.prompt(
		'setup-project',
		'Set up DaFink UI in a project without interactive prompts, using the init command flags',
		{
			style: z.string().optional().describe('minimal, neumorph, or brutalist (default: minimal)'),
			palette: z.string().optional().describe('zinc, ocean, ember, forest, noir, or plum (default: zinc)'),
		},
		({ style, palette }) => ({
			messages: [
				{
					role: 'user',
					content: {
						type: 'text',
						text: `Set up DaFink UI in this project without interactive prompts.\n\nRun (drop --hook if the user does not want the lint hook): npx dafink-ui init --style ${style ?? 'minimal'} --palette ${palette ?? 'zinc'} --hook --yes\n\nOptional flags: --framework <next|react> (default: detected), --components-dir <path> (default: src/components/ui), --css-file <path> (required if no globals.css or index.css is detected), --eslint (install the DaFink ESLint rules), --hook (also add a Claude Code PostToolUse hook that lints every file you edit and feeds problems back to you; implies --eslint), --hook-fix (same, but the hook autofixes first). Recommend --hook for projects an agent will keep editing.\n\nIf the user has not said which style or palette they want, ask before running. Restart the Claude Code session afterward so the hook is picked up. Then add components with: npx dafink-ui add <slug>. Use search_components to find slugs.`,
					},
				},
			],
		})
	);
}
