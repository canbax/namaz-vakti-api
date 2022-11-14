const express = require("express");
const app = express();
const got = require("got");
const static_data = require("../static_data");
const puppeteer = require("puppeteer");
const fs = require("fs");
const chrome = require("chrome-aws-lambda");

const baseUrl = "http://namazvakitleri.diyanet.gov.tr/tr-TR/";
const isUseHeadlessChrome = true;

/** use this function like `app.use(allowOrigion4All);` for an express app
 * Make API accessiable for all clients. Not for only clients from a specific domain.
 */
function allowOrigin4All(_, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
}

/** get a list of countries
 * @param  {} _
 * @param  {} res
 */
const getCountryList = (_, res) => {
  res.send(static_data.COUNTRIES);
};

/** get a list of cities/states for given country.
 * @param  {} req
 * @param  {} res
 */
// const getCityList = (req, res) => {
//   const id = req.query.country;
//   if (id == 2) {
//     res.send(static_data.TR_CITIES);
//   } else {
//     const url = baseUrl + "/home/GetRegList?ChangeType=country&CountryId=" + id;
//     got(url)
//       .then((response) => {
//         res.send(JSON.parse(response.body).StateList);
//       })
//       .catch((error) => {
//         console.log(error);
//         res.send(error);
//       });
//   }
// };

function log2file(msg) {
  const fileName = "log-" + new Date() + ".txt";
  fs.writeFile(fileName, msg, function (err) {
    if (err) return console.log(err);
  });
}

let browser, page;
async function initBrowser() {
  browser = await puppeteer.launch({
    headless: isUseHeadlessChrome,
    executablePath: await chrome.executablePath,
    ignoreHTTPSErrors: true,
    args: [
      ...chrome.args,
      "--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36",
      // "--window-size=1200,800",
    ],
  });
  page = await browser.newPage();
}

initBrowser();

const getCityList = async (req, res) => {
  const id = req.query.country;

  if (id == 2) {
    res.send(static_data.TR_CITIES);
  } else {
    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
    console.log("id: ", id);
    await page.select("select.country-select", id);

    await page.waitForNetworkIdle();
    await page.waitForSelector("select.city-select");
    log2file(await page.content());

    let cities = await (
      await page.$("select.city-select")
    ).evaluate((node) => {
      const r = [];
      for (let i = 0; i < node.children.length; i++) {
        const c = node.children[i];
        if (c.value < 0) continue;
        r.push({ id: c.value, text: c.textContent });
      }
      return r;
    });
    // await browser.close();
    console.log("cities: ", cities[1]);
    res.send(cities);
  }
};

/** get a list of regions/districts for given city/state.
 * @param  {} req
 * @param  {} res
 */
const getRegionsList = (req, res) => {
  const country = req.query.country;
  const city = req.query.city;
  const url =
    baseUrl +
    `/home/GetRegList?ChangeType=state&CountryId=${country}&StateId=${city}`;
  got(url)
    .then((response) => {
      res.send(JSON.parse(response.body).StateRegionList);
    })
    .catch((error) => {
      console.log(error);
      res.send(error);
    });
};

/** get times data for a region/district, returns an string[][].
 * @param  {} req
 * @param  {} res
 */
const getTimeData4Region = (req, res) => {
  const url = baseUrl + req.query.region;
  got(url)
    .then((response) => {
      const t = findTableWithMonthInfo(response.body);
      const d = getDataFromTable(t);
      res.send(d);
    })
    .catch((error) => {
      console.log(error);
      res.send(error);
    });
};

/**  returns values inside <td> as string[][]
 * @param  {string} str HTML table as string
 */
function getDataFromTable(str) {
  const arr = [];
  str = str.replace(/<\/tr>/g, "");
  str = str.replace(/<\/td>/g, "");
  str = str.replace(/<tbody>/g, "");
  str = str.replace(/<\/tbody>/g, "");
  const emptyFilterFn = (x) => {
    x = x.trim();
    return x && x.length > 0;
  };
  const rows = str.split("<tr>").filter(emptyFilterFn);
  for (const row of rows) {
    if (!row || row.length < 1) {
      continue;
    }
    const cols = row.split("<td>");
    arr.push(cols.filter(emptyFilterFn).map((x) => x.trim()));
  }
  return arr;
}

/** find a table that contains 28-31 rows to find monthly data
 * @param  {} str webpage as HTML string
 */
function findTableWithMonthInfo(str) {
  let idx = 0;
  while (true) {
    const found = findTable(str.substr(idx));
    if (!found) {
      return null;
    }
    const cnt = countRowsInTable(found.str);
    // this means the table have rows for each day in a month
    if (cnt < 32 && cnt > 27) {
      return found.str;
    }
    idx = found.lastIdx;
  }
}

/** count number of rows in table
 * @param  {} table HTML table as string
 */
function countRowsInTable(table) {
  return (table.match(/<tr>/g) || []).length;
}

/** find the substring for table inside 'str'
 * @param  {} str webpage as HTML string
 */
function findTable(str) {
  const t1 = str.indexOf("<tbody");
  const t2 = str.indexOf("/tbody>");
  if (t1 < 0 || t2 < 0) {
    return null;
  }
  return { str: str.substring(t1, t2 - 1), lastIdx: t2 + 7 };
}

app.use(allowOrigin4All);
app.use(express.static("public"));

app.get("/api/countries", getCountryList);
app.get("/api/cities", getCityList);
app.get("/api/regions", getRegionsList);
app.get("/api/data", getTimeData4Region);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("namaz vakti API listening on 3000"));
