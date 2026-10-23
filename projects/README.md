# projects

Ajanın GitHub üzerinde render aldırdığı video projeleri.

Her klasör bir HyperFrames projesidir. Klasöre `render.json` eklenip main dalına gönderilince GitHub Actions videoyu 4 çekirdekli sunucuda render eder. Sonuç `render-<klasör-adı>` adlı release'e yüklenir.

```json
{ "request": "2026-10-23T12-00-00", "quality": "delivery", "fps": 30, "composition": "index.html" }
```

| Alan | Değerler | Varsayılan |
|---|---|---|
| `request` | Her istekte değişen bir değer, örneğin zaman damgası | boş |
| `quality` | draft, looks, delivery | looks |
| `fps` | 24, 30, 60 | 30 |
| `composition` | Projedeki giriş HTML dosyası | index.html |
