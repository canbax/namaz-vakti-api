# namaz-vakti-api

[English](README.md) | [Türkçe](BENİOKU.md)

![Build](https://github.com/canbax/namaz-vakti-api/actions/workflows/build-and-test.yml/badge.svg) ![Statements](https://img.shields.io/badge/statements-93.26%25-brightgreen.svg?style=flat) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/canbax/namaz-vakti-api/blob/main/LICENSE)

Calculates the Islamic prayer times. Uses [irem](https://github.com/canbax/irem)

<p align="center">
    <img src="logo.png" alt="Logo" width="300"/>
</p>

## About the Project

Welcome to the **namaz-vakti-api**! This project is the core backend service powering the [Vakti App](https://vaktiapp.com), designed to deliver highly accurate Islamic prayer times and location-based data.

## API Documentation

We provide comprehensive documentation for developers looking to integrate or explore our endpoints:

- 📖 [API Docs](https://vaktiapp.com/api-docs)
- 🚀 [Postman Workspace](https://www.postman.com/canbax/workspace/namaz-vakti-api/api/bf039fea-6768-490b-b11d-11bb031bdd8a)

## Rate Limiting

To ensure stability and fair usage, this API implements rate limiting. If your application needs to make a high volume of requests and you are consistently hitting these limits, please consider the following options:

- **Host it yourself**: You are welcome to use the source code to host the API on your own server.
- **Request an increase**: If you'd like to discuss a rate limit increase for your specific use case, please open an issue in this repository.

## Get the App

Experience the full service directly on your mobile device:

<p>
    <a href="https://apps.apple.com/tr/app/vakti-app/id6743095525" target="_blank">
        <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" height="50" alt="Download on the App Store">
    </a>
    &nbsp;
    <a href="https://play.google.com/store/apps/details?id=com.vakti.app" target="_blank">
        <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" height="50" alt="Get it on Google Play">
    </a>
</p>

## Acknowledgements

A huge thank you to our generous supporters (**Ali T., Burak H. K., Eren A.**, and others) for making this possible!

We also extend our gratitude to the amazing open-source projects that help drive this API:

- [adhan-js](https://github.com/batoulapps/adhan-js) for prayer time calculations.
- [ip2location](https://lite.ip2location.com/) and [GPS-miner](https://github.com/canbax/GPS-miner) for reliable geographic data processing.

---

_Developers: You can run the `update-readme-test-cov` command to automatically update test coverage statistics._
