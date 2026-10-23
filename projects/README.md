# projects

Ajanın GitHub üzerinde kontrol ve render aldırdığı video projeleri.

Her klasör bir HyperFrames projesidir. Klasördeki `render.json` değiştirilip herhangi bir dala gönderilince GitHub Actions çalışır. Sonuçlar `renders` dalına `<klasör-adı>/` olarak yazılır. Videolar ayrıca `render-<klasör-adı>` adlı release'e yüklenir.

```json
{ "request": "ilk-video-20261023-1405", "mode": "check", "quality": "draft", "fps": 30, "composition": "index.html" }
```

| Alan | Değerler | Varsayılan |
|---|---|---|
| `request` | Her istekte değişen bir değer | boş |
| `mode` | check: lint, check, kare önizleme. render: bunlar artı video | render |
| `quality` | draft, looks, delivery | looks |
| `fps` | 24, 30, 60 | 30 |
| `composition` | Projedeki giriş HTML dosyası | index.html |
| `snapshot_at` | Kare alınacak saniyeler, örneğin "1,4.5,9" | 6 eşit aralıklı kare |
