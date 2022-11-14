const puppeteer = require("puppeteer");

const baseUrl = "http://namazvakitleri.diyanet.gov.tr/tr-TR/";
const countrySelector = "select.country-select";
const citySelector = "select.city-select";
const regionSelector = "select.district-select";

async function addCountries(page, world) {
  let countries = await (
    await page.$(countrySelector)
  ).evaluate((node) => {
    const r = [];
    for (let i = 0; i < node.children.length; i++) {
      const c = node.children[i];
      if (c.value < 0) continue;
      r.push({ id: c.value, text: c.textContent });
    }
    return r;
  });
  for (let c of countries) {
    world[c.text] = { id: c.id, cities: {} };
  }
}

async function addCities(page, world, countryName) {
  await page.waitForSelector(citySelector);

  let cities = await (
    await page.$(citySelector)
  ).evaluate((node) => {
    const r = [];
    for (let i = 0; i < node.children.length; i++) {
      const c = node.children[i];
      if (c.value < 0) continue;
      r.push({ id: c.value, text: c.textContent });
    }
    return r;
  });
  for (let c of cities) {
    world[countryName].cities[c.text] = { id: c.id, regions: {} };
  }
}

async function addRegions(page, world, cityName) {
  await page.waitForSelector(regionSelector);

  let regions = await (
    await page.$(regionSelector)
  ).evaluate((node) => {
    const r = [];
    for (let i = 0; i < node.children.length; i++) {
      const c = node.children[i];
      if (c.value < 0) continue;
      r.push({ id: c.value, text: c.textContent });
    }
    return r;
  });
  for (let c of regions) {
    world[countryName].cities[cityName].regions[c.text] = {
      id: c.id,
      regions: {},
    };
  }
}

async function main() {
  let world = {};

  let browser = await puppeteer.launch({
    headless: false,
    ignoreHTTPSErrors: true,
    args: [
      "--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36",
    ],
  });
  let page = await browser.newPage();
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });

  let t1;
  try {
    t1 = new Date().getTime();
    await addCountries(page, world);
    for (let country in world) {
      await page.select(countrySelector, world[country].id);
      await page.waitForNetworkIdle();
      await addCities(page, world, country);
      for (let city in world[country].cities) {
        await page.select(citySelector, world[country].cities[city].id);
        await page.waitForNetworkIdle();
        await addRegions(page, world, city);
      }
    }
  } catch (e) {
    const t2 = new Date().getTime();
    console.log((t2 - t1) / 1000);
    console.log(world);
  }
}

main();

// await page.waitForNetworkIdle();
// await page.waitForSelector("select.city-select");
// log2file(await page.content());

// let cities = await (
//   await page.$("select.city-select")
// ).evaluate((node) => {
//   const r = [];
//   for (let i = 0; i < node.children.length; i++) {
//     const c = node.children[i];
//     if (c.value < 0) continue;
//     r.push({ id: c.value, text: c.textContent });
//   }
//   return r;
// });
// // await browser.close();
// console.log("cities: ", cities[1]);
