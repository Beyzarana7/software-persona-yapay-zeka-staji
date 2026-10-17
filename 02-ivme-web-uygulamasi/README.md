# İvme — Üretim İyileştirme ve Aksiyon Takip Paneli

**Rana Beyza Culus · Endüstri Mühendisi**

Web Geliştirme; Yapay Zekâ eğitimi kapsamında hazırlanmış React uygulaması. Üretim iyileştirme aksiyonlarının departman, sorumlu, durum, öncelik ve hedef tarih üzerinden takibini sağlar.

## Problem

İyileştirme fikirleri ayrı listelerde kaldığında sorumluluk ve hedef tarihlerinin takibi zorlaşır. İvme, bu kayıtları tek bir panelde görünür hale getirir. Gösterilen sayılar uygulamadaki aksiyonlardan hesaplanır. Uygulama tasarruf, verimlilik artışı veya tesis performansı ölçmez.

## Özellikler

- Aksiyon oluşturma, listeleme, güncelleme ve onayla silme (CRUD)
- Tek tıklamayla tamamlandı olarak işaretleme
- Türkçe arama, durum/öncelik/departman filtreleri, tarih/öncelik/yeni kayıt sıralaması
- Liste ve durum bazlı pano görünümü
- Toplam, devam eden, tamamlanan ve geciken aksiyon sayıları
- Tamamlanma oranı: tamamlanan aksiyon / tüm aksiyonlar
- Tarihi geçmiş açık kayıtların otomatik belirlenmesi
- Filtrelenen kayıtları Excel uyumlu UTF-8 CSV dosyasına aktarma
- LocalStorage ile yenileme sonrası kayıtların korunması
- Başlangıçta sekiz kurgusal örnek aksiyon
- Duyarlı tasarım, etiketli form alanları ve klavye ile kullanılabilen native dialog pencereleri

## Kurulum

Node.js 22.12 veya üzeri önerilir.

```bash
npm ci
npm run dev
```

```bash
npm test
npm run build
npm run preview
```

## Dosya yapısı

```text
src/
  Components/ActionForm.jsx    Aksiyon ekleme ve düzenleme formu
  Components/ActionList.jsx    Liste ve pano görünümü
  Components/Modal.jsx         Erişilebilir diyalog penceresi
  Interfaces/action.js        Veri sözleşmesi, filtreleme ve hesaplamalar
  Pages/App.jsx              Sayfa ve durum yönetimi
  main.jsx                   React başlangıcı
  style.css                  Duyarlı arayüz
tests/actions.test.js         Veri ve iş kuralları kontrolleri
netlify.toml                 Netlify yayın ayarları
```

## Test edilen iş kuralları

CRUD değişiklikleri ve kimlik korunumu, gecikme ve tamamlanma hesapları, Türkçe arama ile birleşik filtreler, depolama verisi doğrulama, geçersiz tarih reddi ve CSV formül ön eklerinin korunması Node testleriyle kontrol edilir. Bunlar tarayıcı etkileşim testinin yerine geçmez.

## Kullanım

**Yeni aksiyon** ile başlık ve sorumlu girin, departmanı ve hedef tarihi belirleyip kaydedin. Satır başlığına veya kaleme tıklayarak kaydı düzenleyin. Tik simgesi kaydı tamamlar. Çöp kutusu önce onay ister. Filtreler indirilecek CSV kapsamını da belirler. **Proje hakkında** bölümünden örnek kayıtları yeniden yüklemek, mevcut kayıtları değiştirmeden önce onay ister.

## Veri saklama sınırları

Kayıtlar yalnızca kullanılan tarayıcıda ve site adresinde saklanır. Başka cihaz, tarayıcı veya Netlify adresi aynı kayıtlara erişmez. Tarayıcı verileri silinirse kayıtlar kaybolabilir. Sunucu, kimlik doğrulama ve çok kullanıcılı veri eşitleme yoktur. Demo kişi adları kurgusaldır. Gerçek kişisel veya gizli üretim verileri için tasarlanmamıştır.

## Canlı Demo

https://ivme-uretim-aksiyon-rana.netlify.app/

## Teknolojiler ve lisans notları

React / React DOM (MIT), Vite (MIT), Lucide ikonları (ISC). DM Sans ve Manrope yazı tipleri Google Fonts üzerinden isteğe bağlı yüklenir, yüklenemediğinde sistem yazı tipi kullanılır. Başlangıç veri seti bu proje için oluşturulmuştur.
