import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
	test: {
		projects: [
			{
				plugins: [react()],
				test: {
					name:        'unit',
					environment: 'jsdom',
					globals:     true,
					include:     ['src/**/*.test.tsx', 'src/**/*.test.ts'],
					setupFiles:  ['./vitest.setup.ts'],
				},
			},
		],
	},
});
