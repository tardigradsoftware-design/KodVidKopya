# KodVid

> Bu repo, [KodVid](https://github.com/tardigradsoftware-design/KodVid) reposunun ajan testleri için kopyasıdır. Ajan doğrudan bu repoda çalışır. Kurulum ve iş akışı için [AGENT.md](AGENT.md) dosyasına bakın.

Koddan video üretimi için yapay zeka ajanlarına yönelik yetenek (skill) veritabanı.

Açık kaynaktaki koddan video projelerini tek yerde toplar. HyperFrames, Remotion, Manim, GSAP, Lottie ve FFmpeg gibi motorları kapsar. Bir ajan bu repoyu okuyarak hangi motoru seçeceğini, nasıl kod yazacağını ve videoyu nasıl render edeceğini öğrenir.

## İçerik

| Klasör / dosya | Ne işe yarar |
|---|---|
| [AGENT.md](AGENT.md) | Ajanın giriş noktası. Görev için doğru skill'i nasıl seçeceğini anlatır. |
| [setup/](setup/) | Ajanın ortamını kuran ve render eden betikler. |
| [catalog/index/](catalog/index/) | Motor başına küçük skill dizinleri. Ajan bunları okur. |
| [catalog/skills.json](catalog/skills.json) | Tüm skill'lerin makine okunur dizini. |
| [catalog/repos.json](catalog/repos.json) | Bulunan tüm repolar: lisans, yıldız, kategori, durum. |
| [catalog/CATALOG.md](catalog/CATALOG.md) | Aynı katalog, insan için tablo halinde. |
| [skills/](skills/) | Lisansı izin veren repoların skill dosyaları. Her klasör kendi lisansını taşır. |
| [scripts/](scripts/) | Kataloğu güncelleme, yerel indirme ve dışa aktarma betikleri. |

## Repo durumları

- **İçerik repoda:** Lisans MIT, Apache-2.0 veya benzeri. Skill dosyaları sabit bir commit'ten kopyalandı.
- **Yerel indirme:** Lisans yok veya yeniden dağıtıma izin vermiyor. Remotion ve OpenMontage bu gruptadır. Dosyalar sadece senin bilgisayarına, `local/` klasörüne iner ve GitHub'a gönderilmez.
- **Sadece katalog:** Skill dosyası yok, güvenlik notu "CAUTION" veya video dışı. Sadece link tutulur.

## Kullanım

Gerekenler: Node 18 veya üstü ve giriş yapılmış [GitHub CLI](https://cli.github.com).

```bash
# Kataloğu ve skill dosyalarını güncelle
node scripts/build.mjs

# Lisansı kısıtlı repoları yerel klasöre indir (Remotion dahil)
node scripts/sync-local.mjs

# Tüm skill'leri tek JSONL dosyasına aktar (eğitim veya RAG için)
node scripts/export-jsonl.mjs --local
```

Yeni bir repo eklemek için [scripts/extras.json](scripts/extras.json) dosyasına ekleyip `build.mjs` betiğini yeniden çalıştır.

## Güvenlik

Skill dosyaları üçüncü kişilerden gelir. Hiçbir betik bu dosyaları çalıştırmaz, sadece metin olarak indirir. Bazı skill'ler ajana internetten kurulum betiği çalıştırmasını söyler. AGENT.md ajana bunu kullanıcı onayı olmadan yapmamasını söyler.

## Kaynaklar

Repo listesi büyük ölçüde [zhuyansen/awesome-claude-video-skills](https://github.com/zhuyansen/awesome-claude-video-skills) listesinden derlendi. Ek motorlar, MCP sunucuları ve ses araçları elle eklendi. Lisanslar için [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) dosyasına bakın.
