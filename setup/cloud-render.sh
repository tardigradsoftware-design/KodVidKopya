#!/usr/bin/env bash
# GitHub render sonucunu bekler ve indirir. Sadece git kullanir (github.com), baska siteye gerek yok.
# Once projects/<ad>/ ve render.json'u commit edip push edin (hangi dal oldugu farketmez).
# Kullanim: bash setup/cloud-render.sh <proje-adi> <request-degeri> [cikti-klasoru] [zaman-asimi-sn]
# Cikti klasorune su dosyalar gelir: result.json, lint.txt, check.json, snapshots/, <ad>.mp4 ve render.log (render modunda)
set -uo pipefail
P="${1:?proje adi gerekli}"; REQ="${2:?request degeri gerekli}"
OUT="${3:-/home/user/projects/$P-sonuc}"; LIMIT="${4:-1800}"
KV="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REMOTE="${KODVID_REMOTE:-origin}"
start=$(date +%s)
echo "Bekleniyor: $P (request=$REQ). Ilerleme: https://github.com/tardigradsoftware-design/KodVidKopya/actions"
while :; do
  if git -C "$KV" fetch -q --depth 1 "$REMOTE" renders 2>/dev/null; then
    json=$(git -C "$KV" show "FETCH_HEAD:$P/result.json" 2>/dev/null || true)
    got=$(printf '%s' "$json" | node -pe 'try{JSON.parse(require("fs").readFileSync(0)).request}catch(e){""}' 2>/dev/null)
    if [ -n "$json" ] && [ "$got" = "$REQ" ]; then
      rm -rf "$OUT" && mkdir -p "$OUT"
      git -C "$KV" archive FETCH_HEAD "$P" | tar -x -C "$OUT" --strip-components=1
      echo "$json"
      echo "Dosyalar: $OUT"; (cd "$OUT" && find . -type f | sort | sed 's|^\./|  |')
      status=$(printf '%s' "$json" | node -pe 'JSON.parse(require("fs").readFileSync(0)).status')
      case "$status" in
        ok|checked) exit 0 ;;
        *) echo "BASARISIZ. lint.txt, check.json ve render.log dosyalarina bakin."; [ -f "$OUT/render.log" ] && tail -30 "$OUT/render.log"; exit 1 ;;
      esac
    fi
  fi
  [ $(( $(date +%s) - start )) -ge "$LIMIT" ] && { echo "Zaman asimi: $LIMIT sn"; exit 2; }
  sleep 15
done
