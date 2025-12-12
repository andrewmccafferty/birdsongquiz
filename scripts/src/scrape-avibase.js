const puppeteer = require("puppeteer");

(async () => {
  const region = process.env.AVIBASE_REGION;
  if (!region) {
    throw Error("Need AVIBASE_REGION environment variable to be set");
  }
  const url = `https://avibase.bsc-eoc.org/checklist.jsp?lang=EN&p2=1&list=ebird&synlang=&region=${region}&version=text&lifelist=&highlight=0`;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "networkidle2" });

  const speciesList = await page.evaluate(() => {
    const data = [];
    const rows = document.querySelectorAll("tr.highlight1");

    for (const row of rows) {
      const commonName = row.querySelectorAll("td")[0].innerText;
      const scientificName = row.querySelectorAll("td")[1].innerText;

      if (
        scientificName &&
        commonName &&
        // There are some sp. or  entries in the list which we don't want
        commonName.indexOf(".") < 0 &&
        commonName.indexOf("/") < 0 &&
        commonName.indexOf("(") < 0
      ) {
        data.push({
          Species: commonName.trim(),
          ScientificName: scientificName.trim(),
        });
      }
    }

    return data;
  });

  console.log(JSON.stringify(speciesList, null, 2));

  await browser.close();
})();
