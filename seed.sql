-- DATA CONTOH. Jalankan SETELAH supabase_setup.sql (cukup sekali).
insert into customers(code, name, phone, email, address) values
 ('C001','Budi Santoso','081234567801','budi@example.com','Semarang'),
 ('C002','Siti Aminah','081234567802','siti@example.com','Yogyakarta'),
 ('C003','Andi Pratama','081234567803','andi@example.com','Jakarta');
insert into rooms(code, name, room_type, price_per_night) values
 ('K001','Standard Room','Standard',500000), ('K002','Deluxe Room','Deluxe',750000), ('K003','Family Room','Family',1000000);

-- INV-001: 3 malam x 500.000 = 1.500.000, sudah lewat jatuh tempo, dibayar sebagian 1.000.000 (sisa 500.000)
select create_invoice('INV-001', current_date-60, (select id from customers where code='C001'), (select id from rooms where code='K001'), current_date-58, current_date-55, current_date-45, 'Menginap 3 malam');
select create_receipt('KAS-001', current_date-40, (select id from invoices where invoice_no='INV-001'), 1000000, 'Transfer', 'Pembayaran sebagian');
-- INV-002: 2 malam x 750.000 = 1.500.000, belum jatuh tempo, belum dibayar
select create_invoice('INV-002', current_date-3, (select id from customers where code='C002'), (select id from rooms where code='K002'), current_date-2, current_date, current_date+14, 'Menginap 2 malam');
-- INV-003: 2 malam x 1.000.000 = 2.000.000, lunas
select create_invoice('INV-003', current_date-10, (select id from customers where code='C003'), (select id from rooms where code='K003'), current_date-9, current_date-7, current_date+5, 'Family trip');
select create_receipt('KAS-002', current_date-5, (select id from invoices where invoice_no='INV-003'), 2000000, 'Tunai', 'Pelunasan');
-- INV-004: 1 malam x 500.000, lewat jatuh tempo 20 hari, belum dibayar
select create_invoice('INV-004', current_date-40, (select id from customers where code='C002'), (select id from rooms where code='K001'), current_date-39, current_date-38, current_date-20, 'Menginap 1 malam');
