# Sistem Akuntansi Piutang dan Penerimaan Kas pada Usaha Homestay

Proyek tugas kuliah: website statis (HTML, CSS, JavaScript) + Supabase (PostgreSQL, Auth, RLS), dipublikasikan lewat GitHub Pages. Tanpa server sendiri. Langkah instalasi ada di [SETUP.md](SETUP.md).

Alur: Transaksi Homestay > Piutang > Penerimaan Kas > Jurnal > Buku Besar > Laporan.

## Input - Process - Output
| Input | Process | Output |
|---|---|---|
| Data pelanggan, data kamar | Jumlah malam = check out - check in; Total = malam x harga | Laporan piutang |
| Transaksi homestay (invoice) | Jurnal otomatis: D Piutang Usaha / K Pendapatan | Aging piutang |
| Penerimaan kas | Jurnal otomatis: D Kas / K Piutang Usaha | Laporan penerimaan kas |
| | Outstanding = Total Invoice - Total Pembayaran; status Belum Bayar / Sebagian / Lunas / Jatuh Tempo | Jurnal umum |
| | Saldo buku besar = saldo sebelumnya +/- mutasi | Buku besar, dashboard |

## Catatan konsep
- Jurnal dibuat oleh fungsi SQL `create_invoice` dan `create_receipt`, sehingga selalu seimbang (Debit = Kredit).
- Dashboard: *Piutang Jatuh Tempo* = outstanding yang lewat tanggal jatuh tempo; *Lewat Jatuh Tempo* = lebih dari 30 hari.
- Aging: Belum Jatuh Tempo, 1-30, 31-60, 61-90, >90 hari.

## Struktur
`index.html`, `css/style.css`, `js/` (satu file per fitur), `config/supabase-config.js` (satu-satunya file yang diedit), `supabase/` (SQL), `.github/workflows/deploy-pages.yml`.
