import { expect, test } from "@playwright/test";

for (const { screen, name, xName, yName, x, y } of [
  { screen: 2, name: "Gate center", xName: "Gate center x", yName: "Gate center y", x: 0.05, y: 0.01 },
  { screen: 3, name: "Field probe", xName: "Probe x", yName: "Probe y", x: 0.45, y: 0.31 },
]) {
  test(`${name} moves on both axes from the plot's tab stop`, async ({ page }) => {
    await page.goto(`/?ea&screens=${screen}`);
    const target = page.getByRole("application", { name, exact: true });
    await target.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(target).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Shift+ArrowUp");
    await expect(page.getByRole("slider", { name: xName, exact: true })).toHaveAttribute("aria-valuenow", String(x));
    await expect(page.getByRole("slider", { name: yName, exact: true })).toHaveAttribute("aria-valuenow", String(y));
    await expect(target).toBeFocused();
  });
}
