#!/usr/bin/env bash
# GitHub uzerindeki render'in bitmesini bekler ve videoyu indirir.
# Once projects/<ad>/ klasorunu ve render.json'u main dalina push edin.
# Kullanim: bash setup/cloud-render.sh <proje-adi> <request-degeri> [cikti.mp4] [zaman-asimi-sn]
# <request-degeri>, render.json icindeki "request" alaniyla ayni olmali; eski sonuclari ayirt etmek icin.
set -uo pipefail
P="${1:?proje adi gerekli}"; REQ="${2:?request degeri gerekli}"
OUT="${3:-/home/user/projects/$P/$P.mp4}"; LIMIT="${4:-1800}"
REPO="${KODVID_RENDER_REPO:-tardigradsoftware-design/KodVidKopya}"
BASE="https://github.com/$REPO/releases/download/render-$P"
mkdir -p "$(dirname "$OUT")"
start=$(date +%s)
echo "Bekleniyor: $REPO render-$P (request=$REQ)"
while :; do
  json=$(curl -fsSL "$BASE/result.json?t=$(date +%s)" 2>/dev/null || true)
  if [ -n "$json" ] && [ "$(printf '%s' "$json" | node -pe 'JSON.parse(require("fs").readFileSync(0)).request' 2>/dev/null)" = "$REQ" ]; then
    echo "$json"
    status=$(printf '%s' "$json" | node -pe 'JSON.parse(require("fs").readFileSync(0)).status')
    if [ "$status" = ok ]; then
      curl -fsSL "$BASE/$P.mp4?t=$(date +%s)" -o "$OUT" && echo "Indirildi: $OUT" && exit 0
      echo "Video indirilemedi"; exit 1
    fi
    echo "Render basarisiz. Log:"; curl -fsSL "$BASE/render.log" | tail -40; exit 1
  fi
  [ $(( $(date +%s) - start )) -ge "$LIMIT" ] && { echo "Zaman asimi: $LIMIT sn. Actions sekmesine bakin: https://github.com/$REPO/actions"; exit 2; }
  sleep 15
done
