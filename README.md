# 🌿 Ruang Teduh — Soothing Idle Haven

Website idle relaksasi visual dan audio alami yang dirancang khusus untuk dibuka dan didiamkan di layar kedua atau layar utama saat kamu sedang beristirahat sejenak dari penatnya pekerjaan.

---

## ✨ Fitur Utama

1. **4 Suasana Visual Menenangkan (60 FPS Procedural Canvas)**:
   - **🌸 Kolam Koi (Zen Koi Pond)**: Ikan koi berenang alami dengan kinematika tulang belakang bersegmen, riak air halus, dan kelopak bunga sakura yang hanyut terbawa arus.
   - **🌌 Aurora Langit (Cosmic Stardust)**: Gelombang tirai cahaya aurora borealis berwarna zamrud dan violet, bintang berkelip, kunang-kunang bercahaya, dan bintang jatuh berkala.
   - **🌧️ Hujan Kaca (Cozy Rainy Window)**: Tetesan air hujan realistis yang meluncur menuruni kaca jendela, lampu bokeh kota yang lembut, dan kabut kaca yang bisa diseka dengan sentuhan kursor.
   - **🫁 Napas Damai (Breathing Sanctuary)**: Panduan visual pernapasan berirama (Metode *Box Breathing* 4-4-4-4: Tarik - Tahan - Hembuskan - Rileks) dengan mandala geometri fraktal yang membesar dan mengecil secara harmonis.

2. **Sintesis Audio Alami (Web Audio API - 100% Offline Tanpa File MP3 Eksternal)**:
   - **432Hz Calm Drone**: Pad akord hangat bernada lembut penenang gelombang otak.
   - **Gemercik Hujan**: Derau *pink noise* dengan tetesan air acak yang lembut.
   - **Desau Ombak & Angin**: Irama gelombang laut yang mengalir teratur.
   - **Lonceng Zen (Singing Bowl)**: Resonansi genta perunggu meditatif setiap 15-25 detik.
   - **Mixer Audio Mandiri**: Kamu bisa mengatur volume masing-masing elemen suara atau mematikan yang tidak diinginkan.

3. **Mode Idle Otomatis (Distraction-Free)**:
   - Jika mouse/layar didiamkan selama 3.5 detik, seluruh tombol dan kursor akan memudar perlahan (*fade-out*), meninggalkan visual dan audio murni tanpa gangguan.
   - Cukup gerakkan mouse sedikit untuk memunculkan kontrol kembali.

4. **Kutipan & Pengingat Sadar (Mindful Affirmations)**:
   - Pesan-pesan ketenangan singkat berbahasa Indonesia yang muncul dan berganti lembut setiap 35 detik untuk mengingatkanmu agar melemaskan otot bahu dan dahi.

5. **Pelacak Waktu Istirahat (Break Timer)**:
   - Menghitung durasi rehatmu ("Istirahat 05:20"). Bisa diklik untuk beralih ke tampilan jam digital.

---

## ⌨️ Pintasan Tombol (Keyboard Shortcuts)

| Tombol | Fungsi |
| :---: | :--- |
| `1` | Suasana Kolam Koi |
| `2` | Suasana Aurora Langit |
| `3` | Suasana Hujan Kaca |
| `4` | Suasana Napas Damai |
| `M` | Nyalakan / Matikan Suara (*Mute Toggle*) |
| `F` | Layar Penuh (*Fullscreen*) |
| `Space` | Dentingkan Lonceng Zen (*Singing Bowl*) |
| `H` | Sembunyikan / Tampilkan Menu Manual |
| `Esc` | Tutup Jendela Pengaturan |

---

## 🚀 Cara Menjalankan

Kamu bisa membuka proyek ini dengan 2 cara mudah:

### Cara 1: Langsung Buka File HTML di Browser
Cukup buka file `index.html` dengan browser pilihanmu (Chrome, Edge, Firefox, Safari):
```bash
# Di Linux:
xdg-open index.html

# Di macOS:
open index.html
```
Atau cukup klik dua kali berkas `index.html`.

### Cara 2: Menjalankan Server Lokal Ringan
Jalankan script bawaan:
```bash
cd ruangteduh
./serve.sh
```
Lalu buka browser di: `http://localhost:8080`

---

## 📁 Struktur Berkas

```
ruangteduh/
├── index.html          # Halaman utama aplikasi
├── css/
│   └── style.css       # Desain antarmuka Glassmorphism & animasi
├── js/
│   ├── audio.js        # Synthesizer audio prosedural Web Audio API
│   ├── quotes.js       # Mesin pesan ketenangan & afirmasi
│   ├── app.js          # Pengontrol aplikasi, timer, dan event listener
│   └── scenes/
│       ├── koi.js      # Scene Kolam Ikan Koi & Kelopak Sakura
│       ├── aurora.js   # Scene Aurora Borealis & Kunang-kunang
│       ├── rain.js     # Scene Hujan di Kaca & Lampu Bokeh
│       └── breath.js   # Scene Panduan Napas & Mandala
├── serve.sh            # Script jalankan server lokal Python
└── README.md           # Dokumentasi proyek
```
