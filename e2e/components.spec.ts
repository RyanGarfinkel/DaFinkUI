import { expect, test } from '@playwright/test';

const SLUGS = ['button', 'input', 'checkbox', 'switch', 'badge', 'alert', 'card', 'tabs'];
const MODES = ['light', 'dark'] as const;

for(const mode of MODES)
{
	test.describe(mode, () =>
	{
		test.beforeEach(async ({ context }) =>
		{
			await context.addCookies([{ name: 'theme', value: mode, url: 'http://localhost:3100' }]);
			await context.addInitScript((value) => localStorage.setItem('theme', value), mode);
		});

		for(const slug of SLUGS)
		{
			test(`${slug} preview`, async ({ page }, testInfo) =>
			{
				await page.goto(`/components/${slug}`);
				await page.evaluate(() => document.fonts.ready);

				const preview = page.getByRole('tabpanel', { name: 'Preview' }).first();

				await expect(preview).toBeVisible();

				try
				{
					await expect(preview).toHaveScreenshot(`${slug}-${mode}.png`);
				}
				catch(error)
				{
					const isNew = (error as Error).message.includes('A snapshot doesn\'t exist');

					testInfo.annotations.push({ type: 'visual', description: isNew ? 'new' : 'changed' });
				}
			});
		}
	});
}
