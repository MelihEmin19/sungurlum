# 🚀 Canlıya Çıkış Öncesi Güvenlik ve Altyapı Kontrol Listesi

Uygulamamızın kod tarafındaki tüm altyapısını ve güvenlik açıklarını (`app.json` kimlik tanımlamaları, rol bazlı kilitler) tamamladık. Şu an uygulama **Test Modunda** çalışıyor. 

Ancak uygulamayı Google Play Store veya App Store'a yüklemeden (Canlıya çıkmadan) hemen önce, dışarıdan gelebilecek maddi saldırıları (API hırsızlığı, SMS sömürüsü, Veri sızıntısı) önlemek için **Google Cloud** ve **Firebase** panellerinden aşağıdaki kilitleri aktif etmeniz gerekmektedir.

Sisteminizde aynı isimde ancak farklı amaçlara hizmet eden iki ayrı proje bulunmaktadır. Hangi işlemi neden o projede yaptığınızı aşağıda detaylıca anlattım:

---

## 🏗️ Proje Ayrımı: Neden İki Farklı Projemiz Var?

*   **1. `sungurlum` Projesi:** Sizin manuel olarak açtığınız ve içinden sadece **Google Maps (Harita)** kodunu aldığınız proje. Harita faturalandırması ve kotaları buradan yönetilir.
*   **2. `sungurlum-8a266` Projesi:** Firebase'i kurarken sistemin otomatik oluşturduğu asıl altyapı projesi. Veritabanı (Firestore), SMS doğrulama (Auth) ve Resim Yükleme (Storage) işlemleri burada barınır.

---

## 🔒 1. AŞAMA: Firebase Veritabanı ve Depolama Kilitleri
**Nerede Yapılacak?** [Firebase Console](https://console.firebase.google.com/) > `sungurlum-8a266` projesi
**Neden Yapıyoruz?** Şu an herkes test edebilsin diye kurallar "Her şeye izin ver (Test Modu)" şeklinde açık. Canlıya çıkarken bunu kapatıp sadece yetkililerin (Admin) ve hesabı olanların işlem yapabileceği "Zero-Trust" moduna geçmeliyiz.

1. **Firestore (Veritabanı) Kilitlenmesi:**
   - Firebase Console'dan sol menüdeki **Firestore Database** bölümüne girin.
   - Üstteki **Rules (Kurallar)** sekmesine tıklayın.
   - Oradaki test kodlarını silip, şu an bilgisayarınızdaki kilitli **`guvenlik.md`** belgesinde tasarladığımız veya en güvenli haline getirdiğimiz `firestore.rules` kodlarını yapıştırın ve **Publish (Yayınla)** deyin.
2. **Storage (Depolama) Kilitlenmesi:**
   - Yine sol menüden **Storage** bölümüne girin.
   - Üstteki **Rules** sekmesine tıklayın.
   - İnsanların uygulamanıza virüs veya yasadışı dosya yüklemesini engellemek için, eski `storage.rules` (kilitli) kodlarını buraya yapıştırıp **Publish** deyin.

---

## 🗺️ 2. AŞAMA: Google Maps (Harita) Kotası Hırsızlığını Önleme
**Nerede Yapılacak?** [Google Cloud Console](https://console.cloud.google.com/apis/credentials) > Üst menüden **`sungurlum`** projesi seçilecek.
**Neden Yapıyoruz?** Harita API anahtarınız uygulamanın kodları içinde açıktadır. Kötü niyetli bir web sitesi sizin anahtarınızı çalıp kendi sitesinde harita göstermek için kullanabilir. Faturası size gelir.

1. Üst menüden **Sungurlum** (ID: `sungurlum`) projesini seçtiğinizden emin olun.
2. Listeden mor renkli **Maps Platform API Key**'e tıklayın.
3. Biraz aşağı inip **Application restrictions (Uygulama kısıtlamaları)** kısmından **Android apps**'i seçin.
4. **ADD AN ITEM** (Öğe Ekle) butonuna basın.
5. **Package name** (Paket Adı) kısmına `com.sungurlum.app` yazın.
6. **SHA-1 certificate fingerprint** kısmına ise Google Play Console'un size vereceği veya APK'yı imzaladığınız şifreyi yazın *(Bu şifreyi uygulamayı paketlediğimiz gün alacağız)*.
7. Kaydedin. Artık bu harita anahtarı sadece ve sadece uygulamanızın içinden çalışır.

---

## 📱 3. AŞAMA: SMS Fatura Saldırısını (Toll Fraud) Önleme
**Nerede Yapılacak?** [Google Cloud Console](https://console.cloud.google.com/apis/credentials) > Üst menüden **`sungurlum-8a266`** projesi seçilecek.
**Neden Yapıyoruz?** Firebase'de SMS göndermek ücretlidir. Bir hacker (veya bot) Firebase Web API şifrenizi alıp saniyede binlerce sahte numara üzerinden sitenize SMS attırıp binlerce dolar fatura kesilmesine sebep olabilir.

1. Üst menüden **Sungurlum** (ID: `sungurlum-8a266`) projesini seçin.
2. Listede **"Browser key (auto created by Firebase)"** veya **"Web API Key"** isimli anahtara tıklayın.
3. SMS Doğrulamamız "reCAPTCHA" altyapısını kullandığı için bu anahtarı izole etmeliyiz.
4. **Application restrictions** kısmından **HTTP referrers (Web siteleri)** seçeneğini işaretleyin.
5. **ADD AN ITEM** diyerek sadece uygulamanızın resmi web sitesini (Örn: `*sungurlum.com/*`) ve kendi bağlantılarınızı ekleyin. 
6. Ayrıca Firebase Console üzerinden **App Check** sekmesine gidip Play Integrity veya reCAPTCHA Enterprise seçeneklerini aktif edin (Bu kısım hacker botları tamamen engelleyecektir).
7. Kaydedin.

---

> [!SUCCESS]
> **Özet:** 
> Bu işlemleri **şimdi yaparsanız** uygulamanızın test sürümü kilitlenir ve telefonunuzda çalışmaz. Bu belge, **Uygulamayı Google Play'e göndereceğimiz sabah** elimizde bulunması ve adım adım uygulanması gereken son kilit vurma belgesidir. 
