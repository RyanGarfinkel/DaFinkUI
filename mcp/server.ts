import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { listComponents, getComponentSpec } from './resources/components';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { listPatterns, getPattern } from './resources/patterns';
import { getTokens } from './resources/tokens';
import { z } from 'zod';

const server = new McpServer({
	name: 'obi-ui',
	version: '1.0.0',
});

server.resource('components', 'obi://components', async () =>
({
	contents: [{
		uri: 'obi://components',
		text: JSON.stringify(listComponents()),
	}],
}));

server.resource('tokens', 'obi://tokens', async () =>
({
	contents: [{
		uri: 'obi://tokens',
		text: JSON.stringify(getTokens(), null, 2),
	}],
}));

server.resource('patterns', 'obi://patterns', async () =>
({
	contents: [{
		uri: 'obi://patterns',
		text: JSON.stringify(listPatterns()),
	}],
}));

server.tool(
	'get_component_spec',
	'Get the spec for a specific component',
	{ name: z.string().describe('Component name, e.g. "Button"') },
	async ({ name }) =>
	({
		content: [{ type: 'text', text: getComponentSpec(name) }],
	})
);

server.tool(
	'get_pattern',
	'Get a design pattern document',
	{ name: z.string().describe('Pattern name, e.g. "forms"') },
	async ({ name }) =>
	({
		content: [{ type: 'text', text: getPattern(name) }],
	})
);

const transport = new StdioServerTransport();
await server.connect(transport);
