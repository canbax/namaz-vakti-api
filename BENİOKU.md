# namaz-vakti-api

[English](README.md) | [Türkçe](BENİOKU.md)

![Build](https://github.com/canbax/namaz-vakti-api/actions/workflows/build-and-test.yml/badge.svg) ![Statements](https://img.shields.io/badge/statements-93.26%25-brightgreen.svg?style=flat) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/canbax/namaz-vakti-api/blob/main/LICENSE)

İslami namaz vakitlerini hesaplar. [irem](https://github.com/canbax/irem) kullanır.

<p align="center">
    <img src="logo.png" alt="Logo" width="300"/>
</p>

## Proje Hakkında

**namaz-vakti-api**'ye hoş geldiniz! Bu proje, [Vakti App](https://vaktiapp.com) uygulamasının temel arka uç (backend) hizmetidir ve son derece isabetli İslami namaz vakitleri ile konum tabanlı veriler sunmak için tasarlanmıştır.

## Uygulamayı İndirin

Hizmetin tamamını doğrudan mobil cihazınızda deneyimleyin:

<p>
    <a href="https://apps.apple.com/tr/app/vakti-app/id6743095525" target="_blank">
        <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" height="50" alt="App Store'dan İndirin">
    </a>
    &nbsp;
    <a href="https://play.google.com/store/apps/details?id=com.vakti.app" target="_blank">
        <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" height="50" alt="Google Play'den Alın">
    </a>
</p>

## API Dokümantasyonu

Uç noktalarımızı (endpoints) entegre etmek veya keşfetmek isteyen geliştiriciler için kapsamlı dokümantasyon sunuyoruz:

- 📖 [API Dokümanları](https://vaktiapp.com/api-docs)
- 🚀 [Postman Çalışma Alanı](https://www.postman.com/canbax/workspace/namaz-vakti-api/api/bf039fea-6768-490b-b11d-11bb031bdd8a)

## İstek Sınırı (Rate Limiting)

Kararlılığı ve adil kullanımı sağlamak amacıyla, bu API'de istek sınırlandırması (15 dakikada 100 istek) uygulanmaktadır. Eğer uygulamanızın yüksek hacimde istek yapması gerekiyorsa ve sürekli olarak bu sınırlara takılıyorsanız, lütfen aşağıdaki seçenekleri değerlendirin:

- **Kendiniz barındırın**: API'yi kendi sunucunuzda barındırmak için kaynak kodumuzu kullanabilirsiniz.
- **Sınır artışı talep edin**: Özel kullanım durumunuz için istek sınırının artırılmasını görüşmek isterseniz, lütfen bu depoda (repository) bir konu (issue) açın.

## Teşekkürler

Bunu mümkün kılan cömert destekçilerimize (**Ali T., Burak H. K., Eren A.** ve diğerlerine) çok teşekkür ederiz!

Ayrıca bu API'nin çalışmasına yön veren harika açık kaynak projelere de minnettarız:

- Namaz vakti hesaplamaları için [adhan-js](https://github.com/batoulapps/adhan-js).
- Güvenilir coğrafi veri işleme için [ip2location](https://lite.ip2location.com/) ve [GPS-miner](https://github.com/canbax/GPS-miner).

---

_Geliştiriciler: Test kapsamı (test coverage) istatistiklerini otomatik olarak güncellemek için `update-readme-test-cov` komutunu çalıştırabilirsiniz._
