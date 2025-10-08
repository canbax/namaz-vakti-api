# namaz-vakti-api

![Build](https://github.com/canbax/namaz-vakti-api/actions/workflows/build-and-test.yml/badge.svg) ![Statements](https://img.shields.io/badge/statements-93.54%25-brightgreen.svg?style=flat) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/canbax/namaz-vakti-api/blob/main/LICENSE)

Vakit ve konum verileri sunar. Calculates the Islamic prayer times. Uses [irem](https://github.com/canbax/irem)

<p align="center">
    <img src="public/assets/logo.png" alt="Logo" width="300"/>
</p>

# API usage

https://vakit.vercel.app/api/nearByPlaces?lat=39.9306&lng=32.7439&lang=tr
https://vakit.vercel.app/api/timesForPlace?id=311046&timezoneOffset=180&lang=tr
https://vakit.vercel.app/api/timesForGPS?lat=39.9306&lng=32.7439&timezoneOffset=180&lang=tr
https://vakit.vercel.app/api/searchPlaces?q=Anka&lat=39.9306&lng=32.7439&lang=tr

[Postman definition](https://www.postman.com/canbax/workspace/namaz-vakti-api/api/bf039fea-6768-490b-b11d-11bb031bdd8a)

Built for [Vakti App](https://vaktiapp.com)

<a href="https://apps.apple.com/tr/app/vakti-app/id6743095525" target="_blank">
    <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" height="50">
</a>
<a href="https://play.google.com/store/apps/details?id=com.vakti.app" target="_blank">
    <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" height="50">
</a>

Uses [GPS-miner](https://github.com/canbax/GPS-miner) for geographic data

Use `update-readme-test-cov` command to update test coverage occasionally

thanks a lot to [adhan-js](https://github.com/batoulapps/adhan-js) and [ip2location](https://lite.ip2location.com/)

Thanks a lot to supporters: Ali T., Burak H. K.,Eren A., ...
