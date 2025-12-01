import { test, expect } from '@playwright/test';

const FRONTEND_URL = process.env.FRONTEND_URL as string

test('Run quiz with default species', async ({ page }) => {
  await page.goto(FRONTEND_URL);
  await page.getByLabel('Sound type:').selectOption('song');
  await page.getByRole('combobox', { name: 'Start typing to choose a' }).click();
  await page.getByRole('combobox', { name: 'Start typing to choose a' }).fill('Blackcap');
  await page.getByRole('option', { name: 'Blackcap', exact: true }).click();
  await page.locator('input[type="text"]').fill('Garden Warbler');
  await page.getByRole('option', { name: 'Garden Warbler', exact: true }).click();
  await page.getByTestId('finish-selection').click();
  await page.getByRole('button', { name: 'Blackcap' }).click();
  await page.getByTestId('next-clip').click();
  await page.getByRole('button', { name: 'Garden Warbler' }).click();
  await page.getByTestId('next-clip').click();
  await page.getByTestId('reset').click();
});

test('Run quiz with Australian species', async ({ page }) => {
  await page.goto(FRONTEND_URL);
  await page.getByTestId("country").selectOption('AU');
  await page.getByRole('combobox', { name: 'Start typing to choose a' }).click();
  await page.getByRole('combobox', { name: 'Start typing to choose a' }).fill('White-throated Hon');
  await page.getByRole('option', { name: 'White-throated Honeyeater' }).click();
  await page.locator('input[type="text"]').fill('yellow-tuft');
  await page.getByRole('option', { name: 'Yellow-tufted Honeyeater', exact: true }).click();
  await page.getByTestId('finish-selection').click();
  await page.getByRole('button', { name: 'Yellow-tufted Honeyeater' }).click();
  await page.getByTestId('next-clip').click();
  await page.getByRole('button', { name: 'White-throated Honeyeater' }).click();
  await page.getByTestId('next-clip').click();
  await page.getByTestId('reset').click();
});

test('test with presets', async ({ page }) => {
  await page.goto(FRONTEND_URL);
  await page.getByTestId("country").selectOption('GB');
  await page.getByLabel('Sound type:').selectOption('call');
  await page.getByTestId('preset-species-list').selectOption('gb/common-uk-garden');
  await page.getByTestId('finish-selection').click();
  await page.getByRole('button', { name: 'Blue Tit' }).click();
  await page.getByTestId('next-clip').click();
  await page.getByRole('button', { name: 'Great Tit' }).click();
  await page.getByTestId('next-clip').click();
  await page.getByRole('button', { name: 'Long-tailed Tit' }).click();
  await page.getByTestId('next-clip').click();
});