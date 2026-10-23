# SPEC — ilk-video

GOAL:     İzleyici "koddan 10 saniyede video" fikrini tek bakışta anlar ve KodVid'i dener.
OUTPUT:   HyperFrames (HTML + GSAP), 1920 × 1080, 30 fps, 10.0 sn = 300 kare, 16:9.
TIME:     10 sn @ 30 fps; konuşma temelli, müzik yok. Sahne kesiti 5.2 sn.
SES:      Türkçe seslendirme, proje içinde WAV (24 kHz mono).
          S1 4.80 sn (0.12 sn'de başlar), S2 3.94 sn (5.32 sn'de başlar).
          Konuşma S1 0.18–4.80, S2 5.38–9.14. Son 0.86 sn sessiz kapanış.

LOOK:     Zemin #17140F (sıcak is, düz dolgu, gradyan yok). Yazı #F2EBDF (sıcak kâğıt).
          Tek vurgu #FF4A1C (sinyal turuncu): nokta, şerit, ✓ satırı, zaman çizelgesi.
          Panel #211C16, kenar #33291F. Soluk #8A8073.
          Başlık: Archivo Black 196/150/460 px, -0.045em; kod: JetBrains Mono 30–34 px.
          Doku/efekt yok: gölge, glow, gren, vinyet, cam kart yok. Düz baskı hissi.
OBJECTS:  (1) zaman çizelgesi şeridi — 48 px'te bir küçük, 240 px'te bir büyük çentik,
          turuncu oynatma kafası ve akan timecode (00:00.0 → 00:10.0).
          (2) gerçek kod kartı: index.html kök öğesinin gerçek nitelikleri.
          (3) GitHub Actions paneli: gerçek komut ve gerçek çıktı satırları.
          (4) "10" sayısı ve "SANİYE" birimi.
MOTION:   Giriş power3/power4.out (0.24–0.55 sn), çıkış power2.in (~%75 süre).
          Başlık blur-in 16 → 0 px, 0.36 sn, satır arası 140 ms.
          Sahne 1: kamera 1.035 → 1.0, 5.2 sn, ease none (tek sürekli hareket).
          Seam 5.2 sn: sol vektör — S1 sola çıkar (x −300, 0.58 sn), S2 sağdan girer
          (x +260 → 0, 0.5 sn); hızlar eşleşir, kesit harekette yakalanır.
          Taşıyıcı: zaman çizelgesi şeridi kesitte durmaz.
SHOTS:    0.0–5.2   S1: marka → "KODDAN / VİDEO." → kod kartı satır satır → vurgu satırı.
          5.2–10.0  S2: panel girer → lint/check/render satırları → "10 SANİYE" iner →
                    2.9 sn sert iç kesme → "VİDEON HAZIR." + dosya satırı, 1.5 sn hareketsiz.
BANNED:   koyu lacivert boşluk, glow/bloom/halka, mor-mavi gradyan, cam kart,
          üç kart yan yana, köşe etiketi/HUD, sürekli nefes alan öğe, her öğenin
          fade+slide-up girişi, okunurken hareket eden yazı, köşeye park edilmiş logo.
QA:       0.4 · ilk kare boş değil, şerit görünür · 1.6 · başlık iki satır, kod kartı sağda
          3.2 · kodun son satırı turuncu · 4.5 · çıkış başlamış
          5.4 · S2 paneli sağdan gelmiş · 7.0 · dört log satırı + "10" yerinde
          8.4 · kapanış kartı · 9.6 · dosya satırı, kadraj sakin
