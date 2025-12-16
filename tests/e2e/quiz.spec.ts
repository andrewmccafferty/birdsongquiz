import { test, expect } from "@playwright/test"
import { RUN_IN_PROD_TAG } from "./constants"

const FRONTEND_URL = process.env.FRONTEND_URL as string

test("test with presets", { tag: RUN_IN_PROD_TAG }, async ({ page }) => {
  await page.goto(FRONTEND_URL)
  await page.getByTestId("country").selectOption("GB")
  await page.getByLabel("Choose preset").click()
  await page
    .getByTestId("preset-species-list")
    .selectOption("gb/common-uk-garden")
  await page.getByTestId("finish-selection").click()
  await page.getByRole("button", { name: "Blue Tit" }).click()
  await page.getByTestId("next-clip").click()
  await page.getByRole("button", { name: "Great Tit" }).click()
  await page.getByTestId("next-clip").click()
  await page.getByRole("button", { name: "Long-tailed Tit" }).click()
  await page.getByTestId("next-clip").click()
})
