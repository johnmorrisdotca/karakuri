import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
const site = join(dirname(fileURLToPath(import.meta.url)), "..", "site");
async function serve(page) {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.route("http://karakuri.test/**", route => {
    const {pathname} = new URL(route.request().url());
    const file = join(site, pathname.endsWith("/") ? `${pathname}index.html` : pathname);
    if (!existsSync(file)) return route.fulfill({status:404,body:""});
    return route.fulfill({body:readFileSync(file),contentType:file.endsWith(".js")?"text/javascript":file.endsWith(".css")?"text/css":"text/html"});
  });
  return errors;
}
for (const path of ["/", "/builder.html"]) {
  test(`Docs follows the selected language on ${path}`, async ({page}) => {
    const errors = await serve(page);
    await page.goto(`http://karakuri.test${path}?lang=ja&seed=42`);
    const docs = page.locator('[data-say="pageDocs"]');
    await expect(docs).toHaveText("ドキュメント");
    await expect(docs).toHaveAttribute("href","docs/ja/index.html");
    await page.locator('button[data-lang="en"]').click();
    await expect(docs).toHaveAttribute("href","docs/index.html");
    await page.locator('button[data-lang="ja"]').click();
    await docs.click();
    await expect(page).toHaveURL("http://karakuri.test/docs/ja/index.html");
    await expect(page.locator("html")).toHaveAttribute("lang","ja");
    expect(errors).toEqual([]);
  });
}
test("API anchors lead through a reference and back to the native table", async ({page}) => {
  const errors = await serve(page);
  await page.goto("http://karakuri.test/api.html");
  await expect(page.locator("h1")).toHaveText("Karakuri API: every export");
  expect(await page.locator("article[id]").count()).toBeGreaterThan(40);
  await page.locator('#physics-createWorld h3 a').click();
  await expect(page.locator("h1")).toContainText("createWorld");
  await expect(page.locator("main")).toContainText("options");
  await page.locator('header .lang a[data-lang="ja"]').click();
  await expect(page.locator("html")).toHaveAttribute("lang","ja");
  await page.getByRole("link",{name:"デモ",exact:true}).click();
  await expect(page.locator('#board canvas')).toBeVisible();
  expect(errors).toEqual([]);
});
