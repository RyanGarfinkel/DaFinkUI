import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
	test: {
		projects: [
			{
				plugins: [react()],
				resolve: {
					alias: {
						'@': path.resolve(__dirname, '.'),
					},
				},
				test: {
					name:        'unit',
					environment: 'jsdom',
					globals:     true,
					include:     ['src/**/*.test.tsx', 'src/**/*.test.ts', 'app/**/*.test.tsx', 'app/**/*.test.ts'],
					setupFiles:  ['./vitest.setup.ts'],
				},
			},
		],
	},
});
