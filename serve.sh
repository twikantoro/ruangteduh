#!/usr/bin/env bash
# Script sederhana untuk menjalankan server lokal Ruang Teduh
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
PORT=8080

echo "🌿 Menjalankan Ruang Teduh di http://localhost:$PORT ..."
echo "Tekan Ctrl+C untuk menghentikan server."
cd "$DIR" && python3 -m http.server "$PORT"
