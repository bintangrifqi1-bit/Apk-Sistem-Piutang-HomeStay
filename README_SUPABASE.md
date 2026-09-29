# Catatan Database

Urutan: jalankan `supabase_setup.sql`, lalu `seed.sql` (opsional, data contoh).

- **Tabel**: profiles, customers, rooms, accounts, invoices, invoice_items, cash_receipts, journal_entries, journal_lines.
- **Fungsi**: `create_invoice()` menyimpan invoice + jurnal (D Piutang / K Pendapatan); `create_receipt()` menyimpan pembayaran + jurnal (D Kas / K Piutang) dan menolak pembayaran melebihi saldo. Keduanya berjalan dalam satu transaksi, jadi invoice/kas dan jurnal selalu konsisten.
- **View**: `v_invoice_status` (paid, outstanding, status, hari lewat jatuh tempo), `v_receipts`, `v_ledger`.
- **RLS**: aktif di semua tabel; hanya user yang login (role `authenticated`) yang boleh akses.
- Membuat user login: Supabase > Authentication > Users > Add user (centang Auto Confirm User).
- Mengulang seed: jalankan `seed.sql` hanya sekali (nomor invoice bersifat unik).
