import { expect, test } from '@playwright/test';

const SURFACE = 'rgb(17, 17, 19)';
const OFFSET_PX = '2px';

test.describe('focus ring in dark mode', () =>
{
	test.beforeEach(async ({ context }) =>
	{
		await context.addInitScript(() => localStorage.setItem('theme', 'dark'));
	});

	test('every button variant shows a ring separated by a surface-colored gap', async ({ page }) =>
	{
		await page.goto('/components/button');
		await page.evaluate(() => document.fonts.ready);

		const buttons = page.getByRole('tabpanel', { name: 'Preview' }).first().getByRole('button');
		const count = await buttons.count();

		expect(count).toBeGreaterThan(0);

		for(let i = 0; i < count; i++)
		{
			const button = buttons.nth(i);

			await button.focus();
			await page.keyboard.press('Shift+Tab');
			await page.keyboard.press('Tab');
			await expect(button).toBeFocused();

			const label = await button.textContent() || `button ${i}`;

			await expect.poll(() => button.evaluate((element) => getComputedStyle(element).boxShadow), { message: `${label}: surface-colored ${OFFSET_PX} gap before the ring` }).toContain(`${SURFACE} 0px 0px 0px ${OFFSET_PX}`);
			await expect.poll(() => button.evaluate((element) => getComputedStyle(element).getPropertyValue('--tw-ring-offset-color').trim()), { message: `${label}: ring offset color` }).not.toBe('#fff');
		}
	});
});
