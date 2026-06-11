import { chromium } from "playwright-core";
const [url, out, waitMs = "4000"] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: "networkidle" }).catch(() => {});
await page.waitForTimeout(Number(waitMs));
await page.screenshot({ path: out });
await browser.close();
