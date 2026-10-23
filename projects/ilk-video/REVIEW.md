# REVIEW — ilk-video

## Yaratıcı kararlar

- **Tek fikir, iki sahne.** S1 "koddan video" iddiasını gerçek kodla kanıtlar (index.html kök
  öğesinin gerçek nitelikleri), S2 kanıtı sonuca bağlar (GitHub Actions çıktısı → "10 SANİYE"
  → "VİDEON HAZIR."). Reklam dili yok; ekranda yalnız gerçek dosya adları ve gerçek komut var.
- **Taşıyıcı: zaman çizelgesi.** Alt şerit (çentikler, turuncu oynatma kafası, akan timecode)
  10 saniye boyunca durmadan akar; iki sahne arasındaki tek kesitte gözün momentumunu taşıyan
  öğe budur ve aynı zamanda videonun konusunu (10 saniye) ölçer.
- **Vektör disiplini.** Tek yön: sol. S1 sola çıkar (x −280, 0.48 sn, power2.in), S2 sağdan
  aynı hızla girer (x +185 → 0, 0.46 sn, power2.out). Kesit 5.2 sn'de iki taraf da hareket
  hâlindeyken alınır; kesitte boş ya da soluk kare yok (check 3'te bulundu, düzeltildi).
- **Sahne 2 içinde bir sert iç kesme** (2.6 sn): "on saniyede" → "videon hazır". Aynı sahne
  içinde dikey sıçrama; kesme nedeni görünür (sayı iner, sonuç gelir).
- **Görünüm.** Sıcak is zemin + kâğıt beyazı + tek sinyal turuncusu; Archivo Black /
  JetBrains Mono. Glow, gradyan, cam kart, üç kart sırası, köşe etiketi yok.
- **Ses.** Müzik yok: 10 saniyelik bir parçada anlatım zaten sesin tamamı; müzik eklemek
  seslendirmeyi yorardı. Seslendirme Türkçe, proje içinde iki WAV olarak duruyor
  (24 kHz mono, tepe −5.3 / −5.6 dBFS), böylece GitHub render'ı onları da alıyor.

## Ölçülen / yalnız bakılan

- **Ölçüldü:** süre 10.000 sn, 1920×1080, 30 fps, 300 kare; `hasAudio: true`; lint 0/0;
  check 0 hata; layout 0 bilgi; kontrast 54/54; craft 0 uyarı. Sesin varlığı ve yeri doğrulandı,
  **kulağımla dinlemedim** — yükseklik ve miks ölçümle, dinlemeyle değil.
- **Yalnız bakıldı:** snapshot kareleri, seam şeridi (−0.2…+0.2 sn) ve telefon şeridi.

## Zayıf nokta

En zayıf kare 5.3 sn: S2 henüz sağdan girerken panel soluk görünüyor (hareketin ortası).
Gerçek oynatmada 0.2 sn sürüyor; sabit karede en az dolu görünen an. Daha fazla zaman olsa
S2'nin panelini kesitten önce kadraja sokup kesmeyi içeri doğru kaydırırdım.

## Bilerek bırakılanlar

- Kapanış satırı "1920×1080 · 30 fps" ~1.96 sn görünüyor (check eşiği 2.00 sn). Video 10
  saniyede bitmek zorunda olduğu ve anlatım 9.14 sn'de sustuğu için satırı daha erken
  getirmek kapanışı sıkıştırırdı; bilerek 4 kare kısa bırakıldı.
