#!/usr/bin/env bash
# KodVid ortam kurulumu. Her oturum basinda calistirin; tekrar calistirmak guvenlidir.
# Kurar: Node 22+, FFmpeg, Chrome kutuphaneleri, HyperFrames icin Chrome Headless Shell.
# Agir dosyalari /opt/kodvid altina koyar; /home/user altinda sadece kucuk bir kisayol kalir.
# Kullanim: bash setup/bootstrap.sh
set -uo pipefail

ok()   { printf '  [OK]    %s\n' "$*"; }
warn() { printf '  [UYARI] %s\n' "$*"; }
fail() { printf '  [HATA]  %s\n' "$*"; FAILED=1; }
FAILED=0
SUDO=""; if [ "$(id -u)" -ne 0 ]; then sudo -n true 2>/dev/null && SUDO="sudo -n" || warn "sudo yok: apt paketleri kurulamaz"; fi

# Agir dosyalar icin kota disi klasor
if [ ! -w /opt/kodvid ]; then $SUDO mkdir -p /opt/kodvid 2>/dev/null && $SUDO chown "$(id -u):$(id -g)" /opt/kodvid 2>/dev/null; fi
unset KV_HOME
SELF_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "$SELF_DIR/env.sh"
NODE_DIR="$KV_HOME/node"

echo "== 0. Depolama: $KV_HOME"
if [ "$KV_HOME" != "$HOME/.kodvid" ]; then
  # Eski surumun /home/user altina koydugu agir dosyalari temizle
  [ -d "$HOME/.kodvid" ] && rm -rf "$HOME/.kodvid" && ok "Eski $HOME/.kodvid silindi"
  [ -d "$HOME/.tmp" ] && rm -rf "$HOME/.tmp" && ok "Eski $HOME/.tmp silindi"
  [ -d "$HOME/.npm/_npx" ] && rm -rf "$HOME/.npm/_npx" && ok "npx onbellegi silindi"
  # HyperFrames Chrome'u ~/.cache/hyperframes altina indirir: oraya kota disi klasore kisayol koy
  mkdir -p "$HOME/.cache" "$KV_HOME/hf-cache"
  if [ -d "$HOME/.cache/hyperframes" ] && [ ! -L "$HOME/.cache/hyperframes" ]; then rm -rf "$HOME/.cache/hyperframes"; fi
  ln -sfn "$KV_HOME/hf-cache" "$HOME/.cache/hyperframes"
  ok "Node, Chrome ve gecici dosyalar $KV_HOME altinda"
else
  warn "/opt yazilamiyor: agir dosyalar $HOME/.kodvid altina gidecek ve kotayi doldurabilir"
fi

echo "== 1. Node 22+"
node_major() { command -v node >/dev/null 2>&1 && node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0; }
if [ "$(node_major)" -lt 22 ]; then
  case "$(uname -m)" in x86_64) ARCH=x64;; aarch64|arm64) ARCH=arm64;; *) ARCH=x64;; esac
  BASE="https://nodejs.org/dist/latest-v22.x"
  FILE=$(curl -fsSL "$BASE/SHASUMS256.txt" | grep -oE "node-v22\.[0-9]+\.[0-9]+-linux-$ARCH\.tar\.xz" | head -1)
  if [ -n "$FILE" ] && curl -fsSL "$BASE/$FILE" -o "$TMPDIR/node.tar.xz"; then
    rm -rf "$NODE_DIR" && mkdir -p "$NODE_DIR" && tar -xJf "$TMPDIR/node.tar.xz" -C "$NODE_DIR" --strip-components=1 && rm -f "$TMPDIR/node.tar.xz"
  fi
fi
[ "$(node_major)" -ge 22 ] && ok "Node $(node -v) ($(command -v node))" || fail "Node 22 kurulamadi"

echo "== 2. Sistem paketleri (FFmpeg, Chrome icin NSS)"
PKGS=""
command -v ffmpeg >/dev/null 2>&1 || PKGS="$PKGS ffmpeg"
for p in libnss3 libnspr4 libnss3-tools; do dpkg -s "$p" >/dev/null 2>&1 || PKGS="$PKGS $p"; done
if [ -n "$PKGS" ]; then
  if [ -n "$SUDO" ] || [ "$(id -u)" -eq 0 ]; then
    $SUDO apt-get update -qq >/dev/null 2>&1; DEBIAN_FRONTEND=noninteractive $SUDO apt-get install -y -qq $PKGS >/dev/null 2>&1 || fail "apt kurulumu basarisiz:$PKGS"
  else fail "Eksik paketler kurulamadi:$PKGS"; fi
fi
command -v ffmpeg >/dev/null 2>&1 && ok "$(ffmpeg -version | head -1 | cut -d' ' -f1-3)" || fail "FFmpeg yok"

echo "== 3. Chrome Headless Shell"
npx -y hyperframes browser ensure >/dev/null 2>&1 || warn "browser ensure hata verdi"
CHROME=$(find -L "$HOME/.cache/hyperframes" -type f -name chrome-headless-shell 2>/dev/null | head -1)
if [ -n "$CHROME" ]; then
  MISSING=$(ldd "$CHROME" 2>/dev/null | awk '/not found/ {print $1}' | tr '\n' ' ')
  [ -n "$MISSING" ] && fail "Chrome icin eksik kutuphaneler: $MISSING" || ok "$("$CHROME" --version 2>/dev/null)"
else fail "Chrome Headless Shell bulunamadi"; fi

echo "== 4. HyperFrames"
HF=$(npx -y hyperframes --version 2>/dev/null | tail -1)
[ -n "$HF" ] && ok "HyperFrames $HF" || warn "HyperFrames surumu okunamadi; 'npx hyperframes doctor --json' ile kontrol edin"

echo "== 5. KodVid reposu"
REPO_SRC="$(cd "$SELF_DIR/.." && pwd -P)"
# Sadece /opt/kodvid/repo'dan calisan klasik kurulumda: /home/user/KodVid kisayolunu kur.
# Ajan baska bir yerde (or. bagli GitHub reposunda) calisiyorsa bu adim hicbir seye dokunmaz.
if [ "$REPO_SRC" = "$KV_HOME/repo" ]; then
  if [ -d "$HOME/KodVid/.git" ] && [ ! -L "$HOME/KodVid" ] \
     && git -C "$HOME/KodVid" remote get-url origin 2>/dev/null | grep -qE 'github\.com/tardigradsoftware-design/KodVid(\.git)?$'; then
    rm -rf "$HOME/KodVid" && ok "Eski $HOME/KodVid kopyasi silindi"
  fi
  [ -L "$HOME/KodVid" ] && [ ! -e "$HOME/KodVid" ] && rm -f "$HOME/KodVid"
  [ ! -e "$HOME/KodVid" ] && ln -s "$KV_HOME/repo" "$HOME/KodVid"
fi
[ -L "$HOME/KodVid" ] && [ "$REPO_SRC" = "$KV_HOME/repo" ] && ok "$HOME/KodVid -> $(readlink "$HOME/KodVid")" || ok "Repo: $REPO_SRC"

echo "== 6. Kaynaklar"
ok "CPU: $(nproc) cekirdek, RAM: $(free -h | awk '/Mem:/ {print $2" toplam, "$7" bos"}')"
ok "Disk bos: $(df -h "$KV_HOME" | awk 'NR==2 {print $4}'), TMPDIR: $TMPDIR"
ok "/home/user kullanimi: $(du -sh "$HOME" 2>/dev/null | cut -f1), $(find "$HOME" -xdev -type f 2>/dev/null | wc -l) dosya (sinir 10000)"
[ "$(nproc)" -le 2 ] && warn "GPU yok ve cekirdek az: render yaklasik gercek zamanin 2 kati surer"

echo
if [ "$FAILED" -eq 0 ]; then echo "HAZIR. Her komuttan once: source $REPO_SRC/setup/env.sh"
else echo "EKSIK VAR. Yukaridaki [HATA] satirlarini duzeltmeden render etmeyin."; fi
exit "$FAILED"
