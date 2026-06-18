import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { getFullRegistry, getRegistryEntry, listByCategory, searchComponents } from './resources/registry';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { listPatterns, getPattern } from './resources/patterns';
import { getComponentSpec } from './resources/components';
import { listRules, getRule } from './resources/rules';
import { registerPrompts } from './resources/prompts';
import { getTokens } from './resources/tokens';
import { z } from 'zod';

const buildServer = (): McpServer =>
{
	const server = new McpServer({ name: 'dafink-ui', version: '1.0.0' });

	server.resource('components', 'dafink://components', async () => ({
		contents: [{ uri: 'dafink://components', text: JSON.stringify(getFullRegistry()) }],
	}));

	server.resource('tokens', 'dafink://tokens', async () => ({
		contents: [{ uri: 'dafink://tokens', text: JSON.stringify(getTokens(), null, 2) }],
	}));

	server.resource('patterns', 'dafink://patterns', async () => ({
		contents: [{ uri: 'dafink://patterns', text: JSON.stringify(listPatterns()) }],
	}));

	server.resource('rules', 'dafink://rules', async () => ({
		contents: [{ uri: 'dafink://rules', text: JSON.stringify(listRules()) }],
	}));

	server.tool(
		'get_component_spec',
		'Get the full spec.md for a component — variants, interactive states, accessibility notes, and design guidance',
		{ name: z.string().describe('Component name, e.g. "Button"') },
		async ({ name }) => ({ content: [{ type: 'text', text: getComponentSpec(name) }] })
	);

	server.tool(
		'get_component_registry_entry',
		'Get the registry entry for a component — usage code, structured props table, npm dependencies, and category',
		{ name: z.string().describe('Component name or slug, e.g. "Button" or "button"') },
		async ({ name }) => ({ content: [{ type: 'text', text: getRegistryEntry(name) }] })
	);

	server.tool(
		'search_components',
		'Search components by name, slug, category, or description — use when you know what you need but not the exact component name',
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
		'Get every component with its full registry entry — usage code, props, and dependencies for all 48 components',
		{},
		async () => ({ content: [{ type: 'text', text: JSON.stringify(getFullRegistry()) }] })
	);

	server.tool(
		'get_pattern',
		'Get a design pattern document — accessibility guidelines, interactive state rules, or visual design philosophy',
		{ name: z.string().describe('Pattern name, e.g. "design", "accessibility", "interactive-states"') },
		async ({ name }) => ({ content: [{ type: 'text', text: getPattern(name) }] })
	);

	server.tool(
		'get_rule',
		'Get a project rule document — coding standards, component creation rules, commit conventions, token usage, etc.',
		{ name: z.string().describe('Rule name, e.g. "code", "new-component", "tokens", "commits"') },
		async ({ name }) => ({ content: [{ type: 'text', text: getRule(name) }] })
	);

	registerPrompts(server);

	return server;
}

const handle = async (req: Request): Promise<Response> =>
{
	const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined });
	await buildServer().connect(transport);
	return transport.handleRequest(req);
}

export const GET    = handle;
export const POST   = handle;
export const DELETE = handle;
