# Sungurlum - Yerel Şehir Portalı & Pazar Yeri

**Sungurlum**, yerel halk ile esnafı tek bir dijital platformda buluşturmayı amaçlayan hiper yerel (hyper-local) bir mobil pazar yeri ve şehir portalıdır. Kullanıcılar sanal market alışverişi yapabilir, yemek siparişi verebilir veya ilçedeki tüm hizmet verenlere tek bir tıkla ulaşabilir. Küçük ve orta ölçekli işletmelerin (KOBİ) dijitalleşmesine olanak tanıyarak yerel ekonomiyi canlandırmayı hedefler.

## 🛠 Kullanılan Teknolojiler

Bu proje güncel ve modern mobil geliştirme standartlarına uygun olarak inşa edilmiştir:
- **React Native (Expo):** Çapraz platform (iOS & Android) mobil uygulama geliştirme
- **TypeScript / JavaScript:** Statik tip güvenliği ve ölçeklenebilirlik
- **Firebase:** Backend servisleri (Authentication, Firestore Veritabanı)
- **React Native Reanimated:** 60fps yüksek performanslı animasyonlar ve mikro-etkileşimler
- **NativeWind (TailwindCSS):** Utility-first styling yapısı
- **Zustand:** Minimalist ve hızlı Global State yönetimi
- **Google Maps API:** Konum tabanlı hizmetler ve harita entegrasyonu

## ✨ Mevcut Özellikler (Çalışan Fonksiyonlar)

Sungurlum, kullanıcılara günlük yaşamı kolaylaştıran kapsamlı bir araç seti sunar:

- **Firebase Kimlik Doğrulama (Auth):** Güvenli kullanıcı girişi, kayıt sistemi ve yetkilendirme (Admin / Standart / İşletme Sahibi rol yapısı).
- **İkinci El Eşya & Seri İlan Platformu:** Kullanıcıların ücretsiz olarak ikinci el eşya ve iş ilanı verip alabildiği entegre sistem.
- **Şehir Portalı ve Esnaf Rehberi:** Kategori tabanlı (Tesisatçı, Elektrikçi, Öğretmen vb.) hızlı arama ve listeleme yeteneği. İşletme detayları, iletişim ve konum bilgileri.
- **Sanal Market & Restoran Siparişi:** Yerel esnaftan ve restoranlardan doğrudan sipariş verebilme altyapısı (Arayüz ve sepet mantığı dahil).
- **Gündelik Şehir Asistanı Özellikleri:**
  - **Nöbetçi Eczaneler:** Güncel eczane nöbet listesi.
  - **Vefat İlanları:** Şehre ait güncel duyurular.
  - **Acil Durum Numaraları & Otobüs Saatleri:** Pratik erişim sağlayan faydalı araçlar.
- **Dinamik Ana Sayfa:** Kullanıcı deneyimini maksimize eden premium UI, kayan kampanya (carousel) kartları ve içerik yokken çıkan şık "Empty State" (Boş Durum) tasarımları.
- **Yüksek Performanslı Animasyonlar:** Gereksiz render yükünü engelleyecek şekilde optimize edilmiş *stagger* animasyonlar ve parallax scroll efektleri.
- **Gelişmiş Arama & Filtreleme Motoru:** Kategori ve isim bazlı çalışan arama altyapısı.
- **Admin & İşletme Paneli:** Platforma yeni esnaf/hizmet veren ekleme, ilan onaylama ve sistemdeki işletmeleri yönetme arayüzü.
- **Favoriler ve Bildirim Sistemi:** İlgilenilen işletme/ilanların favoriye alınması ve güncellemeler için uygulama içi bildirim modülü.

🚀 *Gelecek Sürümlerde Eklenecek Özellikler:*
- Kapsamlı ödeme sistemi entegrasyonu (Iyzico / Stripe vs.)
- Esnafların ve restoranların tamamen kendi menü/ürün/fiyat güncellemelerini yapabileceği izole işletme panelleri.
- Gelişmiş kurye ve canlı sipariş takip sistemi.

## ⚙️ Kurulum Adımları

Projeyi lokal ortamınızda ayağa kaldırmak için aşağıdaki komutları terminalinizde sırasıyla çalıştırın:

```bash
# 1. Projeyi klonlayın ve klasöre girin
git clone https://github.com/MelihEmin19/sungurlum.git
cd sungurlum

# 2. Bağımlılıkları yükleyin
npm install

# 3. Ortam değişkenlerini yapılandırın (Gerekli API Keyleri girin)
cp .env.example .env

# 4. Projeyi başlatın
npx expo start
```

*Not: Uygulamayı geliştirme modunda (development) çalıştırdığınızda (Expo Go), hata ayıklama araçlarından dolayı hafif performans düşüşleri görülebilir. Tam optimize edilmiş hızı görmek için üretim (production) moduyla (`npx expo start --no-dev --minify`) test edebilirsiniz.*

---
**Geliştirici:** Melih Emin (MelihEmin19)
