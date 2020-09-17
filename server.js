const express = require('express');
const app = express();
const got = require('got');
const static_data = require('./static_data.js');

const baseUrl = 'http://namazvakitleri.diyanet.gov.tr/tr-TR/home/';

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/sehirler', (req, res) => {
  const url = baseUrl + 'GetRegList?ChangeType=country&CountryId=' + req.query.ulke;
  got(url).then(response => {
    res.send(JSON.parse(response.body).StateList);
  }).catch(error => {
    console.log(error);
    res.send(error);
  });
});

app.get('/ilceler', (req, res) => {
  const url = baseUrl + `GetRegList?ChangeType=state&CountryId=${req.query.ulke}&StateId=${req.query.sehir}`;
  got(url).then(response => {
    res.send(JSON.parse(response.body).StateRegionList);
  }).catch(error => {
    console.log(error);
    res.send(error);
  });
});

app.get('/vakitler', (req, res) => {

});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('namaz vakti listening on 3000'));