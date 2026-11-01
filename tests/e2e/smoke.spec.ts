import { test, expect } from "@playwright/test";
test("dashboard and journal persist a trade", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "Дисциплина сегодня — результат завтра",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Следующий раздел" }).click();
  await page.goto("/trading");
  await page.getByRole("button", { name: "Новая сделка" }).click();
  await page.getByLabel("Инструмент", { exact: true }).fill("TEST/USD");
  await page.getByLabel("Цена входа · USD").fill("100");
  await page.getByLabel("Объём · базовый актив").fill("2");
  await page.getByRole("button", { name: "Сохранить сделку" }).click();
  await expect(page.getByText("TEST/USD", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText("TEST/USD", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Редактировать TEST/USD" }).click();
  await page.getByLabel("Инструмент", { exact: true }).fill("EDIT/USD");
  await page.getByRole("button", { name: "Сохранить сделку" }).click();
  await expect(page.getByText("EDIT/USD", { exact: true })).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Удалить EDIT/USD" }).click();
  await expect(page.getByText("EDIT/USD", { exact: true })).toHaveCount(0);
});
for (const width of [375, 768, 1024, 1440, 1920])
  test("no page overflow " + width, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });

test("carousel keyboard and section search", async ({ page }) => {
  await page.goto("/");
  const carousel = page.getByRole("region", { name: "Разделы Mansion" });
  await carousel.focus();
  await carousel.press("ArrowRight");
  await expect(
    page.getByRole("button", { name: "Показать Community" }),
  ).toHaveAttribute("aria-current", "true");
  await page.getByLabel("Поиск по разделам").fill("Журнал");
  await page
    .locator(".search-results")
    .getByRole("link", { name: "Журнал" })
    .click();
  await expect(page).toHaveURL(/\/trading$/);
});
