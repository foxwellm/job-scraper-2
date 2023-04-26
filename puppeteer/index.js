const puppeteer = require("puppeteer");
const { addJobs } = require("../storage");

const initialPages = [
  "https://www.glassdoor.com/Job/everett-software-engineer-jobs-SRCH_IL.0,7_IC1150458_KO8,25.htm?fromAge=3&radius=100",
];

(async () => {
  const browser = await puppeteer.launch();
  // const browser = await puppeteer.launch({ headless: false });

  const page = await browser.newPage();
  // Avoid site detecting headless browser
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.66 Safari/537.36"
  );

  await page.goto(initialPages[0]); // TODO: while loop
  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 });

  let paginationNumber = 1;

  while (paginationNumber) {
    await page.waitForNetworkIdle();
    await page.waitForSelector(".react-job-listing");

    try {
      // skip first page
      if (paginationNumber !== 1) {
        const sel = await page.waitForSelector(
          `[data-test="pagination-link-${paginationNumber}"]`,
          {
            timeout: 3000,
          }
        );

        await sel.click();
        await page.waitForNetworkIdle();
      }
      const newJobs = await scrapePageJobs(page);
      addJobs(newJobs);
      paginationNumber++;
    } catch (_) {
      paginationNumber = 0;
    }
  }

  await browser.close();
})();

async function scrapePageJobs(page) {
  const newJobs = {};
  const elements = await page.$$(".react-job-listing");

  // TODO: elements.length
  for (let i = 0; i < 2; i++) {
    const element = elements[i];

    const { jobTitle, jobLocation, jobCode, gdId, href } = await page.evaluate(
      (el) => {
        return {
          jobTitle: el.lastElementChild.childNodes[1].innerText,
          jobLocation: el["dataset"].jobLoc,
          jobCode: el["dataset"].sgocId,
          gdId: el["dataset"].id,
          href: el.firstElementChild.firstElementChild.href,
        };
      },
      element
    );

    // only 1007 are software developer roles
    if (jobCode !== "1007") {
      continue;
    }

    await element.click();
    await page.waitForNetworkIdle();

    const desc = await page.$(".jobDescriptionContent");
    const { jobDesc } = await page.evaluate((el) => {
      return {
        jobDesc: el.innerText,
      };
    }, desc);

    newJobs[gdId] = {
      href,
      jobLocation,
      jobTitle,
    };
    // console.log("🚀 ~ file: test.ts:67 ~ jobDesc:", jobDesc);
  }

  return newJobs;
}
