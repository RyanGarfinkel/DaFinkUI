import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { getFullBlockRegistry, getBlockRegistryEntry, listBlocksByCategory, searchBlocks } from './resources/blocks';
import { getFullRegistry, getRegistryEntry, listByCategory, searchComponents } from './resources/registry';
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getFullStyleRegistry, listStyles, getStyle } from './resources/styles';
import { getFullThemeRegistry, listThemes, getTheme } from './resources/themes';
import { listPatterns, getPattern } from './resources/patterns';
import { getComponentSpec } from './resources/components';
import { listRules, getRule } from './resources/rules';
import { registerPrompts } from './resources/prompts';
import { registry } from '@/app/_docs/registry/index';
import { blocks } from '@/app/_docs/registry/blocks';
import { getTokens } from './resources/tokens';
import pkg from '@/package.json';
import { z } from 'zod';

// Always dynamic: every response depends on request-scoped MCP protocol state
// (the transport reads the request body/headers itself, which Next's static
// analysis can't see into) and on disk reads at request time. Never let this
// route be statically optimized or cached.
export const dynamic = 'force-dynamic';

const buildServer = (): McpServer => {
	const server = new McpServer({ name: 'dafink-ui', version: pkg.version });

	server.resource(
		'components', 'dafink://components',
		{ description: 'Full component registry: every component with usage code, props, and dependencies', mimeType: 'application/json' },
		async () => ({ contents: [{ uri: 'dafink://components', text: JSON.stringify(getFullRegistry(true)) }] })
	);

	server.resource(
		'blocks', 'dafink://blocks',
		{ description: 'Full block registry: every block with usage code and dependencies', mimeType: 'application/json' },
		async () => ({ contents: [{ uri: 'dafink://blocks', text: JSON.stringify(getFullBlockRegistry(true)) }] })
	);

	server.resource(
		'themes', 'dafink://themes',
		{ description: 'Every color palette (theme): light/dark CSS custom property maps', mimeType: 'application/json' },
		async () => ({ contents: [{ uri: 'dafink://themes', text: JSON.stringify(getFullThemeRegistry()) }] })
	);

	server.resource(
		'styles', 'dafink://styles',
		{ description: 'Every surface style: light/dark CSS custom property maps for radius, shadow, blur, and depth tokens', mimeType: 'application/json' },
		async () => ({ contents: [{ uri: 'dafink://styles', text: JSON.stringify(getFullStyleRegistry()) }] })
	);

	server.resource(
		'tokens', 'dafink://tokens',
		{ description: 'Default (Zinc) color tokens, spacing, typography, and motion (duration/easing) tokens', mimeType: 'application/json' },
		async () => ({ contents: [{ uri: 'dafink://tokens', text: JSON.stringify(getTokens(), null, 2) }] })
	);

	server.resource(
		'patterns', 'dafink://patterns',
		{ description: 'Names of every design/accessibility pattern doc available via get_pattern', mimeType: 'application/json' },
		async () => ({ contents: [{ uri: 'dafink://patterns', text: JSON.stringify(listPatterns()) }] })
	);

	server.resource(
		'rules', 'dafink://rules',
		{ description: 'Names of every project rule doc available via get_rule', mimeType: 'application/json' },
		async () => ({ contents: [{ uri: 'dafink://rules', text: JSON.stringify(listRules()) }] })
	);

	// Per-item resource templates. These address the same data the tools below
	// return (they call the identical functions) so there is exactly one
	// implementation per data source — the template is just a second, URI-based
	// way to reach it for resource-aware clients.
	server.resource(
		'component', new ResourceTemplate('dafink://components/{slug}', {
			list: async () => ({ resources: registry.map((e) => ({ uri: `dafink://components/${e.slug}`, name: e.name, description: e.description })) }),
		}),
		{ description: 'A single component\'s registry entry by slug' },
		async (uri, { slug }) => ({ contents: [{ uri: uri.href, text: getRegistryEntry(String(slug)) }] })
	);

	server.resource(
		'block', new ResourceTemplate('dafink://blocks/{slug}', {
			list: async () => ({ resources: blocks.map((e) => ({ uri: `dafink://blocks/${e.slug}`, name: e.name, description: e.description })) }),
		}),
		{ description: 'A single block\'s registry entry by slug' },
		async (uri, { slug }) => ({ contents: [{ uri: uri.href, text: getBlockRegistryEntry(String(slug)) }] })
	);

	server.resource(
		'pattern', new ResourceTemplate('dafink://patterns/{name}', {
			list: async () => ({ resources: listPatterns().map((name) => ({ uri: `dafink://patterns/${name}`, name })) }),
		}),
		{ description: 'A single pattern doc by name' },
		async (uri, { name }) => ({ contents: [{ uri: uri.href, text: getPattern(String(name)) }] })
	);

	server.resource(
		'rule', new ResourceTemplate('dafink://rules/{name}', {
			list: async () => ({ resources: listRules().map((name) => ({ uri: `dafink://rules/${name}`, name })) }),
		}),
		{ description: 'A single project rule doc by name' },
		async (uri, { name }) => ({ contents: [{ uri: uri.href, text: getRule(String(name)) }] })
	);

	server.resource(
		'theme', new ResourceTemplate('dafink://themes/{name}', {
			list: async () => ({ resources: getFullThemeRegistry().map((t) => ({ uri: `dafink://themes/${t.name}`, name: t.label })) }),
		}),
		{ description: 'A single color palette (theme) by name' },
		async (uri, { name }) => ({ contents: [{ uri: uri.href, text: getTheme(String(name)) }] })
	);

	server.resource(
		'style', new ResourceTemplate('dafink://styles/{name}', {
			list: async () => ({ resources: getFullStyleRegistry().map((s) => ({ uri: `dafink://styles/${s.name}`, name: s.label })) }),
		}),
		{ description: 'A single surface style by name' },
		async (uri, { name }) => ({ contents: [{ uri: uri.href, text: getStyle(String(name)) }] })
	);

	server.tool(
		'get_component_spec',
		'Get the full spec.md for a component: variants, interactive states, accessibility notes, and design guidance',
		{ name: z.string().describe('Component name, e.g. "Button"') },
		async ({ name }) => ({ content: [{ type: 'text', text: getComponentSpec(name) }] })
	);

	server.tool(
		'get_component_registry_entry',
		'Get the registry entry for a component: usage code, structured props table, npm dependencies, and category',
		{ name: z.string().describe('Component name or slug, e.g. "Button" or "button"') },
		async ({ name }) => ({ content: [{ type: 'text', text: getRegistryEntry(name) }] })
	);

	server.tool(
		'search_components',
		'Search components by name, slug, category, or description; use when you know what you need but not the exact component name',
		{ query: z.string().describe('Search query, e.g. "loading indicator" or "date"') },
		async ({ query }) => ({ content: [{ type: 'text', text: searchComponents(query) }] })
	);

	server.tool(
		'list_by_category',
		'List components grouped by category. Pass a category name to filter, or omit to get all categories.',
		{ category: z.string().optional().describe('Category name, e.g. "Overlay", "Inputs", "Actions". Omit for all.') },
		async ({ category }) => ({ content: [{ type: 'text', text: listByCategory(category) }] })
	);

	server.tool(
		'get_full_registry',
		`Get every component (${registry.length} total). By default returns slug/name/category/description only — pass full: true for complete entries (usage code, props, deps), which is a very large payload. Prefer search_components or get_component_registry_entry for a specific need.`,
		{ full: z.boolean().optional().describe('Return complete entries (usage, props, deps) instead of summaries. Defaults to false.') },
		async ({ full }) => ({ content: [{ type: 'text', text: JSON.stringify(getFullRegistry(full)) }] })
	);

	server.tool(
		'get_block_registry_entry',
		'Get the registry entry for a block: usage code, npm dependencies, component dependencies, and category',
		{ name: z.string().describe('Block name or slug, e.g. "Dashboard" or "dashboard"') },
		async ({ name }) => ({ content: [{ type: 'text', text: getBlockRegistryEntry(name) }] })
	);

	server.tool(
		'search_blocks',
		'Search blocks by name, slug, category, or description; use when you need a prebuilt composition (dashboard, login flow, form) rather than a single component',
		{ query: z.string().describe('Search query, e.g. "login" or "settings"') },
		async ({ query }) => ({ content: [{ type: 'text', text: searchBlocks(query) }] })
	);

	server.tool(
		'list_blocks_by_category',
		'List blocks grouped by category. Pass a category name to filter, or omit to get all categories.',
		{ category: z.string().optional().describe('Category name, e.g. "Dashboards", "Authentication", "Forms". Omit for all.') },
		async ({ category }) => ({ content: [{ type: 'text', text: listBlocksByCategory(category) }] })
	);

	server.tool(
		'get_full_block_registry',
		`Get every block (${blocks.length} total). By default returns slug/name/category/description only — pass full: true for complete entries (usage code, deps), which is a very large payload. Prefer search_blocks or get_block_registry_entry for a specific need.`,
		{ full: z.boolean().optional().describe('Return complete entries (usage, deps) instead of summaries. Defaults to false.') },
		async ({ full }) => ({ content: [{ type: 'text', text: JSON.stringify(getFullBlockRegistry(full)) }] })
	);

	server.tool(
		'get_pattern',
		'Get a design pattern document: accessibility guidelines, interactive state rules, or visual design philosophy',
		{ name: z.string().describe('Pattern name, e.g. "design", "accessibility", "interactive-states"') },
		async ({ name }) => ({ content: [{ type: 'text', text: getPattern(name) }] })
	);

	server.tool(
		'list_patterns',
		'List every available design/accessibility pattern doc by name',
		{},
		async () => ({ content: [{ type: 'text', text: JSON.stringify(listPatterns()) }] })
	);

	server.tool(
		'get_rule',
		'Get a project rule document: coding standards, component creation rules, commit conventions, token usage, etc.',
		{ name: z.string().describe('Rule name, e.g. "code", "new-component", "tokens", "commits"') },
		async ({ name }) => ({ content: [{ type: 'text', text: getRule(name) }] })
	);

	server.tool(
		'list_rules',
		'List every available project rule doc by name',
		{},
		async () => ({ content: [{ type: 'text', text: JSON.stringify(listRules()) }] })
	);

	server.tool(
		'get_theme',
		'Get a single color palette (theme): its light/dark CSS custom property values for brand, danger, success, warning, surface, and text tokens',
		{ name: z.string().describe('Theme name, e.g. "ocean", "ember", "forest", "noir", "plum", "default"') },
		async ({ name }) => ({ content: [{ type: 'text', text: getTheme(name) }] })
	);

	server.tool(
		'list_themes',
		'List every available color palette (theme) by name, label, and accent color',
		{},
		async () => ({ content: [{ type: 'text', text: listThemes() }] })
	);

	server.tool(
		'get_style',
		'Get a single surface style: its light/dark CSS custom property values for radius, border width, shadow, backdrop blur, and inner shadow',
		{ name: z.string().describe('Style name, e.g. "minimal", "neumorph", "brutalist"') },
		async ({ name }) => ({ content: [{ type: 'text', text: getStyle(name) }] })
	);

	server.tool(
		'list_styles',
		'List every available surface style by name, label, and description',
		{},
		async () => ({ content: [{ type: 'text', text: listStyles() }] })
	);

	registerPrompts(server);

	return server;
}

const handle = async (req: Request): Promise<Response> => {
	const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined });
	await buildServer().connect(transport);
	return transport.handleRequest(req);
}

export const GET    = handle;
export const POST   = handle;
export const DELETE = handle;
