import { test, expect } from '@playwright/test';

const FRONTEND_URL = process.env.FRONTEND_URL as string

test('Run quiz', async ({ page }) => {
  await page.goto(FRONTEND_URL);
  await page.getByLabel('Sound type:').selectOption('song');
  await page.getByRole('combobox', { name: 'Start typing to choose a' }).click();
  await page.getByRole('combobox', { name: 'Start typing to choose a' }).fill('Blackcap');
  await page.getByRole('option', { name: 'Blackcap' }).click();
  await page.locator('input[type="text"]').fill('Garden Warbler');
  await page.getByRole('option', { name: 'Garden Warbler' }).click();
  await page.getByRole('button').filter({ hasText: /^$/ }).click();
  await page.getByRole('button', { name: 'Blackcap' }).click();
  await page.getByRole('button', { name: 'Next ->' }).click();
  await page.getByRole('button', { name: 'Garden Warbler' }).click();
  await page.getByRole('button', { name: 'Next ->' }).click();
  await page.getByRole('button', { name: 'Reset Quiz' }).click();
});