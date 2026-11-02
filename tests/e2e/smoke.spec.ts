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
    page.getByRole("button", { name: "Показать Сообщество" }),
  ).toHaveAttribute("aria-current", "true");
  await page.getByLabel("Поиск по разделам").fill("Журнал");
  await page
    .locator(".search-results")
    .getByRole("link", { name: "Журнал" })
    .click();
  await expect(page).toHaveURL(/\/trading$/);
});

test("search is keyboard operable", async ({ page }) => {
  await page.goto("/");
  const search = page.getByLabel("Поиск по разделам");
  await search.fill("Журнал");
  await search.press("ArrowDown");
  await expect(page.locator(".search-results a").first()).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/trading$/);
});
test("mobile navigation closes with escape and restores focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Открыть навигацию" });
  await toggle.click();
  await expect(
    page.getByRole("dialog", { name: "Навигация Mansion" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(toggle).toBeFocused();
});

test("home contains only hero and carousel", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("region", { name: "Разделы Mansion" }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Торговые результаты" }),
  ).toHaveCount(0);
  await expect(page.getByText("В сильном окружении")).toHaveCount(0);
  await expect(page.getByText("MANSION / TRADING INTELLIGENCE")).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Открыть журнал", exact: true }),
  ).toHaveCount(0);
  await expect(page.locator(".hero-principles")).toHaveCount(0);
});

test("desktop sidebar collapses to labelled icons and persists", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const sidebar = page.locator("#primary-navigation");
  const expanded = (await sidebar.boundingBox())!.width;
  await page.getByRole("button", { name: "Свернуть боковую панель" }).click();
  await expect(
    page.getByRole("button", { name: "Развернуть боковую панель" }),
  ).toHaveAttribute("aria-expanded", "false");
  await expect(sidebar.locator(".nav-label").first()).toBeHidden();
  await expect(
    sidebar.getByRole("link", { name: "Главная", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Развернуть боковую панель" }),
  ).toBeVisible();
  await expect
    .poll(async () => (await sidebar.boundingBox())!.width)
    .toBeLessThan(expanded);
  await page.getByRole("button", { name: "Развернуть боковую панель" }).click();
  await expect(sidebar.locator(".nav-label").first()).toBeVisible();
});

for (const [width, height] of [
  [1080, 1080],
  [1920, 1080],
  [2560, 1080],
  [3440, 1440],
]) {
  test(`home scales to ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const main = await page.locator("main").boundingBox();
    expect(main!.width).toBeLessThanOrEqual(1800);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
}
