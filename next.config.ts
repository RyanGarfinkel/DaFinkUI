import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	devIndicators: false,
	experimental: {
		viewTransition: true,
	},
	outputFileTracingIncludes: {
		'/api/mcp': [
			'./src/components/**/*.md',
			'./src/patterns/**',
		],
	},
};

export default nextConfig;
