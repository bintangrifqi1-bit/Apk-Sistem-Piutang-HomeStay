# Panduan Setup

Project ini sengaja dibuat sederhana untuk tugas kuliah dan demonstrasi kepada dosen.
Tidak menggunakan React, Vite, Tailwind, Node backend, atau `server.ts`.

## A. Setup Supabase

1. Extract ZIP dan **buka folder `homestay-accounting-system` sebagai root folder di VS Code**.
2. Buat project baru di https://supabase.com.
3. Buka **SQL Editor > New query**.
4. Buka file `supabase/supabase_setup.sql`, copy seluruh isinya, paste ke SQL Editor, lalu **Run**.
5. Buka `supabase/seed.sql`, copy seluruh isinya, paste ke query baru, lalu **Run sekali** untuk data contoh.
6. Buka **Authentication > Users > Add user**, masukkan email + password, lalu aktifkan **Auto Confirm User** untuk user demo.
7. Buka **Project Settings > API**.
8. Salin **Project URL** dan **Publishable key**. Jika project Anda masih memakai key lama, **anon key** dapat digunakan selama masih aktif.
9. Buka `config/supabase-config.js` dan ganti hanya dua nilai placeholder:

```javascript
const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_KEY = "YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY";
```

Jangan pernah memakai `service_role` atau secret key di frontend.

## B. Test Lokal

1. Pastikan ekstensi **Live Server** tersedia di VS Code.
2. Klik kanan `index.html` > **Open with Live Server**.
3. Login memakai user Supabase yang dibuat pada langkah A.
4. Coba transaksi invoice: 3 malam Standard Room = Rp1.500.000.
5. Periksa Jurnal Umum: Debit Piutang Usaha, Kredit Pendapatan Jasa Homestay.
6. Coba pembayaran Rp1.000.000: outstanding menjadi Rp500.000 dan status Sebagian.
7. Bayar sisa Rp500.000: outstanding menjadi Rp0 dan status Lunas.
8. Periksa Dashboard, Buku Besar, dan seluruh laporan.

## C. Push ke GitHub

**Penting:** repository GitHub harus berisi **isi project ini**, bukan folder `homestay-accounting-system` sebagai subfolder.

Setelah folder project dibuka di VS Code, buka **Terminal > New Terminal**. Terminal harus berada di folder yang sama dengan `index.html` dan `.github`.

Jika folder ini belum menjadi repository Git:

```bash
git init
git branch -M main
git add .
git commit -m "Initial commit - Homestay Accounting System"
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git push -u origin main
```

Jika repository lokal sudah terhubung ke GitHub dan hanya ingin mengirim perubahan:

```bash
git add .
git commit -m "Update Homestay Accounting System"
git push
```

**Jangan upload folder `homestay-accounting-system` sebagai satu folder di dalam repository melalui tombol Upload files.** Yang harus berada di root repository adalah `index.html`, `.github`, `css`, `js`, `config`, dan `supabase`.

## D. GitHub Pages

Setelah push berhasil:

1. Buka repository di GitHub.
2. **Settings > Pages**.
3. Pada **Build and deployment > Source**, pilih **GitHub Actions**.
4. Buka tab **Actions** dan tunggu workflow `Deploy to GitHub Pages` selesai dengan tanda hijau.
5. URL project akan berbentuk:

```text
https://USERNAME.github.io/REPOSITORY/
```

