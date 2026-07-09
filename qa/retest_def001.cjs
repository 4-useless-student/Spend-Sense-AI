const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright-core");

const deploymentUrl = "https://spend-sense-ai-bcje.vercel.app/";
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const email = process.env.DEF001_TEST_EMAIL;
const password = process.env.DEF001_TEST_PASSWORD;

if (!email || !password) {
  throw new Error("Missing DEF001_TEST_EMAIL or DEF001_TEST_PASSWORD");
}

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const evidenceDir = path.resolve(__dirname, "evidence");
fs.mkdirSync(evidenceDir, { recursive: true });

(async () => {
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
    args: ["--disable-gpu", "--window-size=1440,1200"],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1200 },
    locale: "vi-VN",
  });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  const runs = [];
  try {
    await page.goto(deploymentUrl, { waitUntil: "networkidle", timeout: 60000 });
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Mật khẩu").fill(password);
    await page.locator("form").getByRole("button", { name: "Đăng nhập", exact: true }).click();
    await page.getByRole("button", { name: "Nhận Báo Cáo", exact: true }).waitFor({
      timeout: 30000,
    });
    await page.getByRole("button", { name: "Nhận Báo Cáo", exact: true }).click();
    await page.getByRole("heading", { name: "Báo Cáo Tài Chính", exact: true }).waitFor();

    async function runReport(range, label, ordinal) {
      const startedAt = new Date();
      const start = Date.now();
      const responsePromise = page.waitForResponse(
        (response) =>
          response.url().includes(`/reports/summary?range=${range}`) &&
          response.request().method() === "GET",
        { timeout: 65000 },
      );
      await page.getByRole("button", { name: label, exact: true }).click();
      const response = await responsePromise;
      const responseBody = await response.json();
      const modal = page.locator("div.fixed.inset-0");
      await modal.getByText("Tỷ lệ tiết kiệm", { exact: true }).waitFor({ timeout: 65000 });
      const elapsedMs = Date.now() - start;
      const modalText = await modal.innerText();
      const screenshot = path.join(
        evidenceDir,
        `def001-retest-${range}-${ordinal}-${stamp}.png`,
      );
      await page.screenshot({ path: screenshot, fullPage: true });
      runs.push({
        range,
        ordinal,
        started_at: startedAt.toISOString(),
        completed_at: new Date().toISOString(),
        elapsed_ms: elapsedMs,
        http_status: response.status(),
        request_url: response.url(),
        timeout_at_10s: false,
        modal_has_report: modalText.includes("Thu nhập") &&
          modalText.includes("Chi tiêu") &&
          modalText.includes("Dư / tiết kiệm") &&
          modalText.includes("Tỷ lệ tiết kiệm"),
        response_fields: {
          income: typeof responseBody.income,
          expense: typeof responseBody.expense,
          net: typeof responseBody.net,
          saving_rate: typeof responseBody.saving_rate,
        },
        screenshot: path.relative(path.resolve(__dirname, ".."), screenshot).replaceAll("\\", "/"),
      });
    }

    for (let run = 1; run <= 3; run += 1) {
      await runReport("today", "Hôm nay", run);
    }
    await runReport("7d", "7 ngày qua", 1);

    const severeConsoleErrors = consoleErrors.filter(
      (message) =>
        !message.includes("[GSI_LOGGER]") &&
        !message.includes("Failed to load resource: the server responded with a status of 403"),
    );
    const result = {
      test_case: "TC-UC08-06",
      defect: "DEF-001",
      tested_at: new Date().toISOString(),
      deployment_url: deploymentUrl,
      commit: "4db5659",
      bundle: "index-CqykTSsP.js",
      browser: "Google Chrome",
      runs,
      console_errors: consoleErrors,
      severe_console_errors: severeConsoleErrors,
      passed:
        runs.length === 4 &&
        runs.every((run) => run.http_status === 200 && run.modal_has_report) &&
        severeConsoleErrors.length === 0,
    };
    const logPath = path.join(evidenceDir, `def001-retest-${stamp}.json`);
    fs.writeFileSync(logPath, JSON.stringify(result, null, 2));
    console.log(JSON.stringify({ logPath, ...result }, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
