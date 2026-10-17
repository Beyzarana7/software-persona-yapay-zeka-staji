# Üretim Ekipmanlarında Arıza Durumu Sınıflandırması

**Rana Beyza Culus · Endüstri Mühendisi**

Bu proje, Makine ve Derin Öğrenme Uygulamaları eğitimi kapsamında hazırlanmıştır. UCI AI4I 2020 sentetik veri seti kullanılarak üretim ekipmanlarının proses ölçümlerinden arıza durumu sınıflandırılır. Gelecekteki arıza zamanı veya arızaya kalan süre tahmin edilmez.

## Çalıştırma

[Google Colab'da aç](https://colab.research.google.com/github/Beyzarana7/software-persona-yapay-zeka-staji/blob/main/02-uretim-ekipmani-ariza-siniflandirma/Rana_Beyza_Ariza_Siniflandirma.ipynb)

Colab'da **Çalışma zamanı > Tümünü çalıştır** seçin. GPU gerekmez. CSV, UCI'den otomatik indirilir ve SHA-256 ile sürümü doğrulanır.

Yerel ortamda:

```bash
python -m pip install -r requirements.txt
python train.py
```

Çıktılar `maintenance_output/` altında oluşur. Notebook kaynak sürümü temiz tutulmuştur. Rapor gerçek çalıştırmadan hesaplanmış sonuçları içerir. Paket sürümleri farklı olduğunda küçük sayısal farklılıklar oluşabilir.

## Deney tasarımı

- UDI sırası korunarak 6.000 eğitim, 2.000 doğrulama ve 2.000 test kaydı.
- UDI zaman damgası değildir. Bu ayrım gerçek saha zaman serisi doğrulaması değildir.
- Girdiler: ürün türü, beş proses ölçümü ve bu ölçümlerden hesaplanan sıcaklık farkı, mekanik güç, aşınma-tork çarpımı.
- Kimlikler ve TWF/HDF/PWF/OSF/RNF arıza alt etiketleri özellik değildir.
- Pipeline içinde eğitimde öğrenilen kodlama ve ölçekleme. Sınıf ağırlıkları kullanılır; SMOTE uygulanmaz.
- Lojistik regresyon ve Random Forest. Karar eşiği yalnızca doğrulama F1'iyle seçilir; testte ayarlanmaz.

## Sonuç

Doğrulamada Random Forest seçilmiştir (eşik 0,71). Testte accuracy=0,9920, precision=1,0000, recall=0,5897, F1=0,7419, AP=0,7463. 39 arızanın 23'ü bulunmuş, 16'sı kaçırılmıştır. Yanlış alarm sayısı bu testte sıfırdır. Çoğunluk tabanı accuracy=0,9805 alırken hiçbir arızayı bulamaz.

TWF etiketli 10 test arızasının 9'u kaçırılmıştır. HDF ve RNF pozitif test örneği yoktur. Alt etiketler örtüşebilir. 27 kayıtta ana hedef ile alt etiketlerin birleşimi uyuşmaz; ana hedef değiştirilmemiştir. Bu gözlemler defterde açıklanır.

Bu sentetik deney gerçek bir fabrikada başarı veya sıfır yanlış alarm garantisi değildir. Model bakım kararı yerine bir sınıflandırma araştırması olarak değerlendirilmelidir. Dış doğrulama ve maliyet temelli eşik için yeni veri gerekir.

## Veri kaynağı ve lisans

AI4I 2020 Predictive Maintenance Dataset (2020). UCI Machine Learning Repository. DOI: [10.24432/C5HS5C](https://doi.org/10.24432/C5HS5C). **CC BY 4.0**. Veri sentetiktir. CSV orijinal olarak UCI'den indirilir; bu projede yeniden etiketlenmez.

SHA-256: `dc6630cd9b1f0f853922fad78a1b6436570d3f1ec863f1dd5c4340ac56bc8a8e`

Yöntem referansları: [scikit-learn veri sızıntısı](https://scikit-learn.org/1.8/common_pitfalls.html), [karar eşiği seçimi](https://scikit-learn.org/1.8/modules/classification_threshold.html).
