import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	devIndicators: false,
	outputFileTracingIncludes: {
		'/api/mcp': [
			'./src/components/**/*.md',
			'./src/patterns/**',
		],
	},
};

export default nextConfig;
