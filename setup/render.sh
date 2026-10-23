#!/usr/bin/env bash
# HyperFrames render sarmalayicisi. Proje klasorunun icinden calistirin.
# - Gecici dosyalari kucuk /tmp ve kotali /home/user yerine /opt/kodvid altina yazar
# - Bellek yetersizse KODVID_WORKERS=1 ile tekrar deneyin
# Kullanim: bash /home/user/KodVid/setup/render.sh --quality draft --output out.mp4
set -uo pipefail
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/env.sh"
WORKERS="${KODVID_WORKERS:-auto}"
npx -y hyperframes render --workers "$WORKERS" "$@"
STATUS=$?
OUT=""; prev=""; for a in "$@"; do [ "$prev" = "--output" ] && OUT="$a"; prev="$a"; done
if [ "$STATUS" -eq 0 ] && [ -n "$OUT" ] && [ -s "$OUT" ]; then
  echo "Dogrulama: $(ffprobe -v error -show_entries format=duration:stream=width,height -of csv=p=0 "$OUT" | tr '\n' ' ')"
fi
exit "$STATUS"
