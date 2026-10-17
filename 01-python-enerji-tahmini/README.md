# Üretim Tesisinde Kısa Vadeli Enerji Tüketimi Tahmini

**Rana Beyza Culus · Endüstri Mühendisi**

Bu proje, Yapay Zekâ İçin Basitleştirilmiş Python eğitimi kapsamında hazırlanmıştır. Geçmiş elektrik tüketimi ve takvim bilgileriyle bir sonraki 15 dakikalık tüketimin kWh cinsinden tahmini amaçlanır.

## Dosyalar ve kullanım

- [Python defteri](./Rana_Beyza_Enerji_Tahmini.ipynb)
- [Proje raporu](./Enerji_Tahmini_Rapor.pdf)
- [Sunum](./Enerji_Tahmini_Sunum.pptx)

[Google Colab'da aç](https://colab.research.google.com/github/Beyzarana7/software-persona-yapay-zeka-staji/blob/main/01-python-enerji-tahmini/Rana_Beyza_Enerji_Tahmini.ipynb)

Colab'da **Çalışma zamanı > Tümünü çalıştır** seçin. Veri UCI'den otomatik indirilir. Son bölümde örnek girdilerle kullanılabilen tahmin aracı bulunur.

## Yöntem ve sonuç

35.040 satır ve 11 sütundan oluşan UCI Steel Industry Energy Consumption verisi kullanılmıştır. Gün sonundaki 00:00 kayıtları ertesi güne taşınmış, 15 dakikalık süreklilik doğrulanmıştır. İlk dört kayıttan sonra 35.036 örnek kalır. Zaman sırası korunarak 28.028 eğitim ve 7.008 test kaydı ayrılır.

Önceki 15 ve 30 dakikalık tüketim, önceki dört dönemin ortalaması, saat ve hafta sonu bilgisi kullanılır. Hedef döneme ait tüketim, CO2 veya yük sınıfı girdi olarak verilmez.

Lineer regresyonun test MAE'si 6,4522 kWh, RMSE'si 12,0609 kWh, R² değeri 0,8522'dir. Önceki tüketimi tekrar eden son değer tahminiyle de karşılaştırılmıştır. Lineer modelin RMSE'si daha düşük, MAE'si daha yüksektir. R² doğruluk yüzdesi değildir.

Tek tesis ve tek yıl genellemeyi sınırlar. Zaman damgası yorumu veri sahibiyle doğrulanmalıdır. Model enerji tasarrufu veya emisyon azalması kanıtlamaz.

## Kaynak ve lisans

Sathishkumar V E, Shin, C. ve Cho, Y. (2021). Steel Industry Energy Consumption. UCI Machine Learning Repository. [DOI: 10.24432/C52G8C](https://doi.org/10.24432/C52G8C). **CC BY 4.0**.
