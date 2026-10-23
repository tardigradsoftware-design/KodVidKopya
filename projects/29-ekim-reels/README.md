# 29 Ekim Cumhuriyet Bayramı — Instagram Reels

1080×1920, 30 fps, 30.53 s (916 kare). Türkçe anlatım, kelime kelime altyazı, kırmızı/beyaz ışık sızıntıları.

## Sahneler

| Kare | Sn | Sahne |
|---|---|---|
| 0–177 | 0.0–5.9 | Karanlıktan "1923" darbe ile gelir, Anıtkabir silueti belirir, ekran kırmızıya yanar |
| 177–324 | 5.9–10.8 | Kodla çizilen Türk bayrağı ekranı doldurur, dalgalanır; kesik bayrağın son hareketinde |
| 324–470 | 10.8–15.7 | Sayaç 1923'ten 2026'ya akar, havai fişekler üstünde |
| 470–719 | 15.7–24.0 | Beş değer tek tek (EGEMENLİK, BAĞIMSIZLIK, AKIL, ÖZGÜRLÜK, EŞİTLİK) |
| 719–916 | 24.0–30.5 | "CUMHURİYETİMİZİN 103. YILI KUTLU OLSUN!" + "NİCE YÜZYILLARA" |

## Zamanlama

Sahne sınırları uydurulmadı: `public/voice.mp3` üretildikten sonra `ffmpeg silencedetect` ile ölçüldü,
sınırlar ve altyazı kelime zamanları o ölçümden geliyor (`src/timeline.ts`).

## Ses

- Seslendirme: `public/voice.mp3` — tek üretim, 28.61 s, ölçüldü (-16.8 LUFS, tp -1.7 dBFS), `VOICE_AT = 0.7`
  saniyede başlıyor. Yalnızca baş boşluğu kırpıldı ve -16 LUFS'a normalize edildi.
- Müzik: `public/music.mp3` — *music-inspiring-orchestral* (CC0 1.0, agent-video-editor kütüphanesi),
  1:02'den itibaren (bu kısımda davul/nefesli yok), seslendirmenin ~20 dB altında, kelam bitince açılıyor.
- Efektler (hepsi CC0 1.0, agent-video-editor kütüphanesi): `riser-medium-4s` (0.00 s, darbeye tırmanış),
  `impact-soft-2` + `dry-thud` (0.60 s, 1923 darbesi), `whoosh-long-2s` (5.10 s, bayrak geçişi),
  `whoosh-medium-1s` (10.40 s), `whoosh-soft` (15.20 s), `whoosh-short` (23.67 s),
  `riser-short-2s` + `impact-soft-1` + `stinger-hit-short` (26.07 s, kapanış vuruşu),
  `pop-1` ×5 (değerler), `tick-soft` ×8 (sayaç).

Toplam çıkış: -13.9 LUFS integrated, true peak -1.3 dBTP.

## Notlar

- Türk bayrağı görsel değil: `src/components/Flag.tsx` içinde 2893 sayılı kanunun ekli cetvelindeki
  oranlarla (G, A=G/2, B=G/2, C=G/16, D=0.4G, F=G/4) SVG olarak çizilip 112 dikey şeritle 3B dalgaya sokuluyor.
- Fotoğraflar (`public/img/*.jpg`) üretken görsel aracıyla üretildi; kişiler yalnızca silüet.
