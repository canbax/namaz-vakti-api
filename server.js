const express = require('express');
const app = express();
const got = require('got');
const static_data = require('./static_data.js');

const baseUrl = 'http://namazvakitleri.diyanet.gov.tr/tr-TR/';

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/sehirler', (req, res) => {
  const url = baseUrl + '/home/GetRegList?ChangeType=country&CountryId=' + req.query.ulke;
  got(url).then(response => {
    res.send(JSON.parse(response.body).StateList);
  }).catch(error => {
    console.log(error);
    res.send(error);
  });
});

app.get('/ilceler', (req, res) => {
  const url = baseUrl + `/home/GetRegList?ChangeType=state&CountryId=${req.query.ulke}&StateId=${req.query.sehir}`;
  got(url).then(response => {
    res.send(JSON.parse(response.body).StateRegionList);
  }).catch(error => {
    console.log(error);
    res.send(error);
  });
});

app.get('/vakitler', (req, res) => {
  const url = baseUrl + req.query.ilce;
  got(url).then(response => {

    const t = findTableWithMonthInfo(response.body);
    const d = getDataFromTable(t);

    res.send(d);
  }).catch(error => {
    console.log(error);
    res.send(error);
  });
});

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


function countRowsInTable(table) {
  return (table.match(/<tr>/g) || []).length;
}

function findTable(str) {
  const t1 = str.indexOf('<tbody');
  const t2 = str.indexOf('/tbody>');
  if (t1 < 0 || t2 < 0) {
    return null;
  }
  return { str: str.substring(t1, t2), lastIdx: t2 + 7 };
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('namaz vakti listening on 3000'));