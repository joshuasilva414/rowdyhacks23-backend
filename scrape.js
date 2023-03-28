import puppeteer from "puppeteer";

export default scrape = async (url) => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();

  await page.goto(url);
  const body = await page.$("html");
  console.dir(body);
};
