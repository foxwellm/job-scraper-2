const puppeteer = require("puppeteer");
const { addJobs } = require("../storage");
const { findAllRemovedTitles } = require("../storage");

// @TODO: fromAge argument
const initialPages = [
  "https://www.glassdoor.com/Job/remote-software-engineer-jobs-SRCH_IL.0,6_IS11047_KO7,24.htm?fromAge=1&minRating=4.00",
  "https://www.glassdoor.com/Job/seattle-software-engineer-jobs-SRCH_IL.0,7_IC1150458_KO8,25.htm?fromAge=1&minRating=4.00&radius=100",
  // "https://www.glassdoor.com/Job/everett-software-developer-jobs-SRCH_IL.0,7_IC1150458_KO8,26.htm?fromAge=1&minRating=4.00&radius=100"
];

(async () => {
  // @TODO: headless argument
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: {
      width: 1920,
      height: 880,
      isMobile: false,
      isLandscape: true,
    },
    // args: ["--desktop-window-1080p"],
  });
  const page = await browser.newPage();
  // Avoid site detecting headless browser
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.66 Safari/537.36"
  );

  const scrapeRunTime = Date.now();

  for (let i = 0; i < initialPages.length; i++) {
    const scrapePage = initialPages[i];

    await page.goto(scrapePage, { waitUntil: "networkidle0" });
    console.log(`Successfully navigated to ${scrapePage}`);

    let paginationNumber = 1;

    while (paginationNumber !== 0) {
      try {
        await page.waitForSelector(".jobDescriptionContent", { visible: true });
        await page.waitForSelector(".paginationFooter");
        await page.$(".react-job-listing > div > a");
        console.log(`Scraping jobs from page ${paginationNumber}`);

        const newJobs = await scrapePageJobs(page, scrapeRunTime, scrapePage);
        addJobs(newJobs);
        console.log(`Successfully added new jobs`);
        paginationNumber++;

        const nextPage = await page.waitForSelector(
          `[data-test="pagination-link-${paginationNumber}"]`,
          {
            timeout: 3000,
          }
        );

        await nextPage.click();
        // Give time for the page to load
        await new Promise((r) => setTimeout(r, 3000));
      } catch (err) {
        console.error(err);
        paginationNumber = 0;
      }
    }
  }

  await browser.close();
})();

async function scrapePageJobs(page, scrapeRunTime, scrapePage) {
  const newJobs = {};
  const elements = await page.$$(".react-job-listing");

  for (let i = 0; i < elements.length; i++) {
    const { title, location, jobCode, gdId, href, isEasyApply, companyName } =
      await page.evaluate((el) => {
        const location = el["dataset"].jobLoc;
        const jobCode = el["dataset"].sgocId;
        const gdId = el["dataset"].id;
        const isEasyApply = el["dataset"].isEasyApply;

        let title = el.lastElementChild.childNodes[1]?.innerText;
        let href, companyName;

        // NOTE: Sometimes the page will render in "compact" styling
        if (title) {
          href = el.firstElementChild.firstElementChild?.href;
          companyName =
            el.lastElementChild.firstElementChild.firstElementChild?.innerText;
        } else {
          title =
            el.firstElementChild.firstElementChild.firstElementChild
              .firstElementChild.childNodes[1]?.innerText;
          href = el.firstElementChild.firstElementChild.firstElementChild?.href;
          companyName =
            el.firstElementChild.firstElementChild.firstElementChild
              .firstElementChild.firstElementChild.lastElementChild.innerText;
        }

        return {
          title,
          location,
          jobCode,
          gdId,
          href,
          companyName,
          isEasyApply,
        };
      }, elements[i]);

    if (!title || !href) {
      console.log("no title");
      continue;
    }

    // only 1007 are software developer roles
    if (jobCode !== "1007") {
      continue;
    }

    if (checkTitleContainsRemovedWord(title)) {
      console.log(`Not adding title: ${title}`);
      continue;
    }

    // DESCRIPTION
    await elements[i].click();
    await page.waitForNetworkIdle();

    const desc = await page.$(".jobDescriptionContent");
    const { jobDesc } = await page.evaluate((el) => {
      return {
        jobDesc: el.innerText,
      };
    }, desc);

    if (!checkDescriptionContains(jobDesc)) {
      console.log(`Not adding ${href}`);
      continue;
    }

    let scrapeLocation = "";
    if (scrapePage.includes("remote")) {
      scrapeLocation = "remote";
    } else if (scrapePage.includes("seattle")) {
      scrapeLocation = "seattle";
    }

    newJobs[`gd-${gdId}`] = {
      id: `gd-${gdId}`,
      href,
      location,
      title,
      companyName,
      isEasyApply,
      hasApplied: false,
      isDeleted: false,
      createdAt: scrapeRunTime,
      scrapeLocation,
    };
  }

  return newJobs;
}

function checkTitleContainsRemovedWord(title) {
  const { removeRegexTitle, removeIncludedTitle } = findAllRemovedTitles();

  return (
    removeIncludedTitle.some((includedTitle) => {
      return title.toLowerCase().includes(includedTitle);
    }) ||
    removeRegexTitle.some((regexTitle) => {
      const myRegex = new RegExp(`\\b${regexTitle}\\b`);
      return myRegex.test(title.toLowerCase());
    })
  );
}

function checkDescriptionContains(jobDesc) {
  const checkWords = ["node", "javascript", "react", "vue"];

  return checkWords.some((checkWord) => {
    return jobDesc.toLowerCase().includes(checkWord);
  });
}
