const puppeteer = require("puppeteer");
const { addJobs } = require("../storage");
const { findAllRemovedTitles } = require("../storage");

// remote https://www.glassdoor.com/Job/remote-software-engineer-jobs-SRCH_IL.0,6_IS11047_KO7,24.htm?fromAge=3&minRating=4.00

// https://www.glassdoor.com/Job/everett-software-engineer-jobs-SRCH_IL.0,7_IC1150458_KO8,25.htm?fromAge=3&minRating=4.00&radius=100
// https://www.glassdoor.com/Job/everett-software-developer-jobs-SRCH_IL.0,7_IC1150458_KO8,26.htm?fromAge=3&minRating=4.00&radius=100

const initialPages = [
  "https://www.glassdoor.com/Job/remote-software-engineer-jobs-SRCH_IL.0,6_IS11047_KO7,24.htm?fromAge=1&minRating=4.00",
  "https://www.glassdoor.com/Job/seattle-software-engineer-jobs-SRCH_IL.0,7_IC1150458_KO8,25.htm?fromAge=1&minRating=4.00&radius=100",
];

(async () => {
  const browser = await puppeteer.launch();
  // const browser = await puppeteer.launch({ headless: false });

  const page = await browser.newPage();
  // Avoid site detecting headless browser
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.66 Safari/537.36"
  );

  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 });

  const scrapeRunTime = Date.now();

  for (let i = 0; i < initialPages.length; i++) {
    const scrapePage = initialPages[i];

    await page.goto(scrapePage, { waitUntil: "networkidle0" }); // TODO: while loop
    console.log(`Successfully navigated to ${scrapePage}`);
    await page.waitForSelector(".jobDescriptionContent", { visible: true });
    await page.waitForSelector(".paginationFooter");

    let paginationNumber = 1;

    while (paginationNumber !== 0) {
      console.log(`Scraping jobs from page ${paginationNumber}`);

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
          console.log("clicked");
          await new Promise((r) => setTimeout(r, 5000));
          console.log(`Successfully navigated to page ${paginationNumber}`);

          try {
            const desc = await page.$(".paginationFooter");
            const { pF } = await page.evaluate((el) => {
              return {
                pF: el.innerText,
              };
            }, desc);
            console.log(
              "🚀 ~ file: index.js:69 ~ const{pF}=awaitpage.evaluate ~ pF:",
              pF
            );
          } catch (err) {
            console.log("🚀 ~ file: index.js:77 ~ err:", err);
          }
        }
        const newJobs = await scrapePageJobs(page, scrapeRunTime, scrapePage);
        addJobs(newJobs);
        console.log(`Successfully added new jobs`);
        paginationNumber++;
      } catch (err) {
        console.log("Next page not found, setting pagination to 0");
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
        return {
          title: el.lastElementChild.childNodes[1]?.innerText,
          location: el["dataset"].jobLoc,
          jobCode: el["dataset"].sgocId,
          gdId: el["dataset"].id,
          href: el.firstElementChild.firstElementChild?.href,
          companyName:
            el.lastElementChild.firstElementChild.firstElementChild?.innerText,
          isEasyApply: el["dataset"].isEasyApply,
        };
      }, elements[i]);
    console.log("🚀 ~ file: index.js:80 ~ scrapePageJobs ~ title:", title);

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
    // await element.click();
    // await page.waitForNetworkIdle();

    // const desc = await page.$(".jobDescriptionContent");
    // const { jobDesc } = await page.evaluate((el) => {
    //   return {
    //     jobDesc: el.innerText,
    //   };
    // }, desc);
    // console.log("🚀 ~ file: index.js:107 ~ const{jobDesc}=awaitpage.evaluate ~ jobDesc:", jobDesc.length)
    // console.log("🚀 ~ file: index.js:107 ~ scrapePageJobs ~ title:", title)

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
