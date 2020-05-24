const express = require('express');
const app = express();
const http = require('http');

const baseUrl = 'http://ap.kuleonu.com.tr';

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

function byPasser(res, url) {
  http.get(baseUrl + url, (resp) => {
    let data = '';

    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
      data += chunk;
    });

    // The whole response has been received. Print out the result.
    resp.on('end', () => {
      const parsedData = JSON.parse(data);
      res.send(parsedData);
    });
  });
}

const paths = ['/ulkeler', '/sehirler', '/ilceler', '/vakitler'];
for (let i = 0; i < paths.length; i++) {
  console.log('path: ', paths[i]);
  app.get(paths[i], (req, res) => {
    byPasser(res, req.originalUrl);
  });
}


app.listen(3000, () => console.log('namaz vakti listening on 3000'));