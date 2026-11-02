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
    page.getByRole("button", { name: "Показать База знаний" }),
  ).toHaveAttribute("aria-current", "true");
  await page.goto("/knowledge");
  await page.getByLabel("Поиск по разделам").fill("Журнал");
  await page
    .locator(".search-results")
    .getByRole("link", { name: "Журнал" })
    .click();
  await expect(page).toHaveURL(/\/trading$/);
});

test("other-page search is keyboard operable", async ({ page }) => {
  await page.goto("/knowledge");
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
    page.getByRole("dialog", { name: "Навигация VANTAGE" }),
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
  await expect(sidebar.locator(".nav-label").first()).toHaveCSS("opacity", "0");
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
    const rail = await page.locator(".sidebar").boundingBox();
    expect(main!.width).toBeGreaterThan((width - rail!.width) * 0.95);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
}

for (const [width, height] of [
  [1920, 1080],
  [1920, 900],
  [1366, 768],
  [1280, 720],
  [375, 812],
  [375, 667],
  [390, 844],
  [800, 600],
]) {
  test(`hero and full carousel fit ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    const carousel = await page.locator(".explore").boundingBox();
    expect(carousel!.y + carousel!.height).toBeLessThanOrEqual(height - 8);
    if (width > 600)
      await page
        .getByRole("button", { name: "Свернуть боковую панель" })
        .click();
    await expect
      .poll(async () => {
        const box = await page.locator(".explore").boundingBox();
        return box!.y + box!.height;
      })
      .toBeLessThanOrEqual(height - 8);
    if (width > 600)
      await expect(page.locator(".sidebar .home-sidebar-toggle")).toBeVisible();
  });
}

test("market strip displays source percentages and charts, without current prices", async ({
  page,
}) => {
  await page.route("**/api/markets", (route) =>
    route.fulfill({
      json: {
        assets: [
          {
            id: "bitcoin",
            name: "Bitcoin",
            symbol: "BTC",
            change: -1.25,
            points: [100, 99, 101, 98],
            updatedAt: "2026-11-02T10:00:00.000Z",
          },
        ],
      },
    }),
  );
  await page.goto("/");
  await expect(
    page.getByRole("region", { name: "Рынок: Forex и основные активы" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Bitcoin: -1.25% к предыдущему закрытию" }),
  ).toBeVisible();
  await expect(
    page.getByRole("img", { name: "Динамика последней торговой сессии" }),
  ).toBeVisible();
});

test("market provider failure has an honest retry state", async ({ page }) => {
  await page.route("**/api/markets", (route) =>
    route.fulfill({ status: 503, json: { error: "unavailable" } }),
  );
  await page.goto("/");
  await expect(
    page.getByText("Мини-графики недоступны", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Повторить", exact: true }),
  ).toBeVisible();
});

test("reduced motion keeps a static ambient fallback", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".home-ambient canvas")).toBeHidden();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("ultrawide increases actual element sizes and uses available width", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/");
  const font = await page
    .locator(".welcome h1")
    .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  const card = (await page.locator(".feature-card.selected").boundingBox())!
    .width;
  await page.setViewportSize({ width: 3440, height: 1440 });
  await expect
    .poll(() =>
      page
        .locator(".welcome h1")
        .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
    )
    .toBeGreaterThan(font * 1.2);
  expect(
    (await page.locator(".feature-card.selected").boundingBox())!.width,
  ).toBeGreaterThan(card * 1.5);
});
test("rail arrow stays level and card icons are optically centered", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/");
  const button = page.locator(".home-sidebar-toggle");
  const top = (await button.boundingBox())!.y;
  await button.click();
  for (let i = 0; i < 8; i++) {
    await page.waitForTimeout(45);
    expect(Math.abs((await button.boundingBox())!.y - top)).toBeLessThan(1);
  }
  const badges = page.locator(".feature-icon");
  for (let i = 0; i < 3; i++) {
    const badge = await badges.nth(i).boundingBox(),
      icon = await badges.nth(i).locator("svg").boundingBox();
    expect(
      Math.abs(badge!.y + badge!.height / 2 - icon!.y - icon!.height / 2),
    ).toBeLessThan(1.5);
    expect(
      Math.abs(badge!.x + badge!.width / 2 - icon!.x - icon!.width / 2),
    ).toBeLessThan(1.5);
    expect(
      Math.abs(icon!.width / badge!.width - icon!.height / badge!.height),
    ).toBeLessThan(0.1);
    expect(icon!.width / badge!.width).toBeGreaterThan(0.35);
  }
});
test("market fallback config includes all requested instruments", async ({
  page,
}) => {
  await page.route("**/api/markets", (route) =>
    route.fulfill({ status: 503, json: { error: "unavailable" } }),
  );
  await page.route("https://s3.tradingview.com/**", (route) =>
    route.fulfill({ contentType: "application/javascript", body: "" }),
  );
  await page.goto("/");
  await expect(page.locator(".tv-tape")).toBeVisible();
  const config = JSON.parse(
    (await page.locator(".tv-tape script").textContent()) ?? "{}",
  );
  expect(config.symbols.map((s: { proName: string }) => s.proName)).toEqual([
    "FX:EURUSD",
    "FX:GBPUSD",
    "OANDA:XAUUSD",
    "NASDAQ:NDX",
    "SP:SPX",
    "BITSTAMP:BTCUSD",
    "BITSTAMP:ETHUSD",
  ]);
});

test("home carousel has five ordered sections with trading centered", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/");
  await expect(page.locator(".feature-card h3")).toHaveText([
    "Сообщество",
    "Экономика",
    "Журнал сделок",
    "База знаний",
    "Копи-трейдинг",
  ]);
  await expect(page.locator(".feature-card.selected h3")).toHaveText(
    "Журнал сделок",
  );
  await expect(page.locator(".dots button")).toHaveCount(5);
  await expect(
    page.getByRole("button", { name: "Показать Журнал сделок" }),
  ).toHaveAttribute("aria-current", "true");
  const viewport = await page.locator(".carousel-viewport").boundingBox();
  for (const slug of ["economy", "trading", "knowledge"]) {
    const r = await page
      .locator(`.feature-card a[href="/${slug}"]`)
      .boundingBox();
    expect(r!.x).toBeGreaterThanOrEqual(viewport!.x - 2);
    expect(r!.x + r!.width).toBeLessThanOrEqual(
      viewport!.x + viewport!.width + 2,
    );
  }
  await expect(page.locator(".carousel-announcement")).toContainText("/ 05");
});
test("hover gently zooms a card and illuminates its edge", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const card = page.locator(".feature-card.selected");
  const box = await card.boundingBox();
  await card.hover();
  await expect
    .poll(async () => (await card.boundingBox())!.width)
    .toBeGreaterThan(box!.width * 1.01);
  await expect
    .poll(() =>
      card.evaluate((el) => Number(el.style.getPropertyValue("--spot-power"))),
    )
    .toBeGreaterThan(0.9);
  await page.mouse.move(5, 5);
  await expect
    .poll(() =>
      card.evaluate((el) => Number(el.style.getPropertyValue("--spot-power"))),
    )
    .toBe(0);
});

test("home user menu lives under membership and VANTAGE replaces the home brand", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator(".sidebar .brand-name")).toHaveText("VANTAGE");
  await expect(page.locator(".topbar")).toHaveCount(0);
  await expect(page.getByLabel("Поиск по разделам")).toHaveCount(0);
  await expect(page.locator(".demo-pill")).toHaveCount(0);
  await expect(page.getByText("Открыть больше возможностей")).toHaveCount(0);
  await expect(
    page.getByText("Осознанность. Дисциплина. Рост.", { exact: true }),
  ).toHaveCount(0);
  const member = await page.locator(".member-mark").boundingBox(),
    user = await page.locator(".home-user-trigger").boundingBox();
  expect(user!.y).toBeGreaterThan(member!.y + member!.height);
  const trigger = page.getByRole("button", {
    name: "Открыть меню пользователя",
  });
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByRole("link", { name: "Мой профиль", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Войти в аккаунт", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await page.getByRole("button", { name: "Свернуть боковую панель" }).click();
  await trigger.click();
  await expect(
    page.getByRole("link", { name: "Мой профиль", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Мой профиль", exact: true }).click();
  await expect(page).toHaveURL(/\/settings$/);
});

test("resizing preserves the WebGL buffer instead of clearing the gradient", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/");
  const canvas = page.locator(".home-ambient canvas");
  await expect(canvas).toHaveCSS("opacity", "1");
  const initial = await canvas.evaluate((el) => ({
    width: (el as HTMLCanvasElement).width,
    height: (el as HTMLCanvasElement).height,
  }));
  await canvas.evaluate((el) => {
    el.dataset.bufferChanges = "0";
    new MutationObserver((entries) => {
      el.dataset.bufferChanges = String(
        Number(el.dataset.bufferChanges) + entries.length,
      );
    }).observe(el, { attributes: true, attributeFilter: ["width", "height"] });
  });
  for (const [width, height] of [
    [1800, 1000],
    [1366, 768],
    [2500, 1200],
    [3440, 1440],
    [1280, 720],
  ]) {
    await page.setViewportSize({ width, height });
    await expect(canvas).toHaveCSS("opacity", "1");
    expect(
      await canvas.evaluate((el) => ({
        width: (el as HTMLCanvasElement).width,
        height: (el as HTMLCanvasElement).height,
      })),
    ).toEqual(initial);
    await expect(page.locator(".workspace")).toHaveCSS(
      "transition-duration",
      "0s",
    );
  }
  expect(await canvas.getAttribute("data-buffer-changes")).toBe("0");
});

test("home rail keeps icon positions throughout collapse and excludes secondary sections", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/");
  const nav = page.locator(".sidebar nav");
  for (const name of ["Сообщество", "Копи-трейдинг", "Рейтинг"]) {
    await expect(nav.getByRole("link", { name, exact: true })).toHaveCount(0);
  }
  const icons = nav.locator("a > svg");
  const positions = await icons.evaluateAll((els) =>
    els.map((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y };
    }),
  );
  for (const name of ["Свернуть боковую панель", "Развернуть боковую панель"]) {
    await page.getByRole("button", { name, exact: true }).click();
    for (let frame = 0; frame < 8; frame++) {
      await page.waitForTimeout(45);
      const current = await icons.evaluateAll((els) =>
        els.map((el) => {
          const r = el.getBoundingClientRect();
          return { x: r.x, y: r.y };
        }),
      );
      current.forEach((r, i) => {
        expect(Math.abs(r.x - positions[i].x)).toBeLessThan(1);
        expect(Math.abs(r.y - positions[i].y)).toBeLessThan(1);
      });
    }
  }
});

for (const width of [1440, 1920, 3440]) {
  test(`home hover stays inside carousel and rail controls align at ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: width === 3440 ? 1440 : 1080 });
    await page.goto("/");
    const settings = page.locator(".sidebar .settings-link");
    const icon = (await settings.locator("svg").boundingBox())!;
    const label = (await settings.locator(".nav-label").boundingBox())!;
    expect(
      Math.abs(icon.y + icon.height / 2 - label.y - label.height / 2),
    ).toBeLessThan(1.5);
    const trigger = (await page.locator(".home-user-trigger").boundingBox())!;
    const chevron = (await page.locator(".home-user-chevron").boundingBox())!;
    expect(chevron.x).toBeGreaterThan(trigger.x);
    expect(chevron.x + chevron.width).toBeLessThanOrEqual(
      trigger.x + trigger.width,
    );
    for (const i of [1, 3]) {
      const card = page.locator(".feature-card").nth(i);
      await card.hover();
      await page.waitForTimeout(350);
      const r = (await card.boundingBox())!;
      const viewport = (await page.locator(".carousel-viewport").boundingBox())!;
      expect(r.x).toBeGreaterThanOrEqual(viewport.x);
      expect(r.x + r.width).toBeLessThanOrEqual(viewport.x + viewport.width);
      expect(r.y).toBeGreaterThanOrEqual(viewport.y);
      expect(r.y + r.height).toBeLessThanOrEqual(viewport.y + viewport.height);
    }
  });
}
