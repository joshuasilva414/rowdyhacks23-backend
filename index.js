import express from "express";
import puppeteer from "puppeteer-extra";
import AdblockerPlugin from "puppeteer-extra-plugin-adblocker";
import * as adblocker from "puppeteer-extra-plugin-adblocker";

const scrape = async (browser, url) => {
  const page = await browser.newPage();
  // page.setDefaultNavigationTimeout(5000000);
  await page.goto(url, { timeout: 0 });
  const extractedText = await page.$eval("*", (el) => {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNode(el);
    selection.removeAllRanges();
    selection.addRange(range);
    return window.getSelection().toString();
  });
  console.dir(extractedText);
  return extractedText;
};

(async () => {
  const app = express();
  puppeteer.use(
    AdblockerPlugin({
      // Optionally enable Cooperative Mode for several request interceptors
      interceptResolutionPriority:
        adblocker.DEFAULT_INTERCEPT_RESOLUTION_PRIORITY,
    })
  );

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    waitForInitialPage: true,
  });

  app.get("/", (req, res) => {
    res.send("Nothin' here bro");
  });

  app.get("/:url", async (req, res) => {
    const url = req.params.url;
    console.log(url);

    try {
      const text = await scrape(browser, url);
      res.send(text);
    } catch (err) {
      console.log(err);
      res.status(404).json({
        message: err.message,
      });
    }
  });

  const port = process.env.PORT || 8000;

  app.listen(port, () => {
    console.log(`listening on port ${port}`);
  });
})();
