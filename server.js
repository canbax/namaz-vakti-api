const express = require('express');
const app = express();
const got = require('got');
const static_data = require('./static_data');

const baseUrl = 'http://namazvakitleri.diyanet.gov.tr/tr-TR/';

/** use this function like `app.use(allowOrigion4All);` for an express app
 * Make API accessiable for all clients. Not for only clients from a specific domain.
 */
function allowOrigin4All(_, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
};

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
const getCityList = (req, res) => {
  const id = req.query.country;
  if (id == 2) {
    res.send(static_data.TR_CITIES);
  } else {
    const url = baseUrl + '/home/GetRegList?ChangeType=country&CountryId=' + id;
    got(url).then(response => {
      res.send(JSON.parse(response.body).StateList);
    }).catch(error => {
      console.log(error);
      res.send(error);
    });
  }
};

/** get a list of regions/districts for given city/state.
 * @param  {} req
 * @param  {} res
 */
const getRegionsList = (req, res) => {
  const country = req.query.country;
  const city = req.query.city;
  const url = baseUrl + `/home/GetRegList?ChangeType=state&CountryId=${country}&StateId=${city}`;
  got(url).then(response => {
    res.send(JSON.parse(response.body).StateRegionList);
  }).catch(error => {
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
  got(url).then(response => {
    const t = findTableWithMonthInfo(response.body);
    const d = getDataFromTable(t);
    res.send(d);
  }).catch(error => {
    console.log(error);
    res.send(error);
  });
};

/**  returns values inside <td> as string[][]
 * @param  {string} str HTML table as string
 */
function getDataFromTable(str) {
  const arr = [];
  str = str.replace(/<\/tr>/g, '');
  str = str.replace(/<\/td>/g, '');
  str = str.replace(/<tbody>/g, '');
  str = str.replace(/<\/tbody>/g, '');
  const emptyFilterFn = (x) => { x = x.trim(); return x && x.length > 0; };
  const rows = str.split('<tr>').filter(emptyFilterFn);
  for (const row of rows) {
    if (!row || row.length < 1) {
      continue;
    }
    const cols = row.split('<td>');
    arr.push(cols.filter(emptyFilterFn).map(x => x.trim()));
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
  const t1 = str.indexOf('<tbody');
  const t2 = str.indexOf('/tbody>');
  if (t1 < 0 || t2 < 0) {
    return null;
  }
  return { str: str.substring(t1, t2 - 1), lastIdx: t2 + 7 };
}

app.use(allowOrigin4All);
app.use(express.static('public'));
console.log('__dirname: ', __dirname);
app.get('/countries', getCountryList);
app.get('/cities', getCityList);
app.get('/regions', getRegionsList);
app.get('/data', getTimeData4Region);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('namaz vakti listening on 3000'));