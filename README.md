# Sungurlum - Yerel Şehir Portalı & Pazar Yeri

**Sungurlum**, yerel halk ile esnafı tek bir dijital platformda buluşturmayı amaçlayan hiper yerel (hyper-local) bir mobil pazar yeri ve şehir portalıdır. Kullanıcılar sanal market alışverişi yapabilir, yemek siparişi verebilir veya ilçedeki tüm hizmet verenlere tek bir tıkla ulaşabilir. Küçük ve orta ölçekli işletmelerin (KOBİ) dijitalleşmesine olanak tanıyarak yerel ekonomiyi canlandırmayı hedefler.

## 📸 Uygulama Görselleri

*(Buraya uygulamanın çalıştığını gösteren 10-15 saniyelik bir ekran kaydı GIF olarak eklenebilir veya aşağıdaki yer tutuculara ekran görüntüleri konulabilir)*

<div align="center" style="display: flex; gap: 10px; justify-content: center;">
  <img src="https://via.placeholder.com/250x500.png?text=Ana+Ekran" alt="Ana Ekran" width="250" />
  <img src="https://via.placeholder.com/250x500.png?text=Esnaf+Rehberi" alt="Esnaf Rehberi" width="250" />
  <img src="https://via.placeholder.com/250x500.png?text=Admin+Paneli" alt="Admin Paneli" width="250" />
</div>

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

- **Firebase Kimlik Doğrulama (Auth):** Güvenli kullanıcı girişi ve yetkilendirme (Admin / Standart Kullanıcı rol yapısı).
- **Esnaf ve Hizmet Verenler Portalı:** Kategori tabanlı (Tesisatçı, Elektrikçi, Öğretmen vb.) arama ve listeleme yeteneği.
- **Dinamik Ana Sayfa:** Kullanıcı deneyimini maksimize eden premium UI, kayan kampanya kartları ve "Empty State" (Boş Durum) tasarımları.
- **Yüksek Performanslı Animasyonlar:** Gereksiz render yükünü engelleyecek şekilde optimize edilmiş *stagger* animasyonlar ve parallax scroll efektleri.
- **Arama Motoru:** Kategori ve isim bazlı çalışan, sonuç bulunamadığında temizlenebilir filtre mantığı sunan arama altyapısı.
- **Admin Paneli:** Platforma yeni esnaf/hizmet veren ekleme ve sistemdeki işletmeleri yönetme arayüzü.

🚀 *Gelecek Sürümlerde Eklenecek Özellikler:*
- İkinci el eşya alım-satım / ilan panosu entegrasyonu
- Kapsamlı sepet ve ödeme sistemi (Ödeme Entegrasyonu)
- Esnafların kendi panellerinden menü ve ürün yönetimi
- Google Maps üzerinden yakındaki esnafları harita üzerinde görüntüleme

## ⚙️ Kurulum Adımları

Projeyi lokal ortamınızda ayağa kaldırmak için aşağıdaki komutları terminalinizde sırasıyla çalıştırın:

```bash
# 1. Projeyi klonlayın ve klasöre girin (Repo URL'sini güncelleyin)
git clone https://github.com/MelihEmin19/sungurlum.git
cd sungurlum

# 2. Bağımlılıkları yükleyin
npm install

# 3. Ortam değişkenlerini yapılandırın (Gerekli API Keyleri girin)
cp .env.example .env

# 4. Projeyi başlatın
npx expo start
```

*Not: Uygulamayı geliştirme modunda (development) çalıştırdığınızda (Expo Go), hata ayıklama araçlarından dolayı hafif performans düşüşleri görülebilir. Tam optimize edilmiş hızı görmek için üretim (production) moduyla (`npx expo start --no-dev --minify`) veya APK/IPA derleyerek test edebilirsiniz.*

---
**Geliştirici:** Melih Emin (MelihEmin19)
