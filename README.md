# namaz-vakti-api

![Build](https://github.com/canbax/namaz-vakti-api/actions/workflows/build-and-test.yml/badge.svg) ![Statements](https://img.shields.io/badge/statements-93.48%25-brightgreen.svg?style=flat) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/canbax/namaz-vakti-api/blob/main/LICENSE)

Vakit verilerini hesaplar. Calculates the Islamic prayer times.

<p align="center">
    <img src="public/assets/logo.png" alt="Logo" width="300"/>
</p>

# API usage

http://localhost:3000/api/nearByPlaces?lat=39.9306&lng=32.7439&lang=tr
http://localhost:3000/api/timesForPlace?id=311046&timezoneOffset=180&lang=tr
http://localhost:3000/api/timesForGPS?lat=39.9306&lng=32.7439&timezoneOffset=180&lang=tr
http://localhost:3000/api/searchPlaces?q=Anka&lat=39.9306&lng=32.7439&lang=tr

[Postman definition](https://www.postman.com/canbax/workspace/namaz-vakti-api/api/bf039fea-6768-490b-b11d-11bb031bdd8a)

Built for [namaz-vakti](https://github.com/canbax/namaz-vakti)

Uses [geo-data-generator](https://github.com/canbax/geo-data-generator) for geographic data

Use `update-readme-test-cov` command to update test coverage occasionally

thanks a lot to [adhan-js](https://github.com/batoulapps/adhan-js) and [ip2location](https://lite.ip2location.com/)

Thanks a lot to supporters: Ali T., Burak H. K., ...
