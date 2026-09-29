-- ============================================================
-- SETUP DATABASE: Sistem Akuntansi Piutang & Penerimaan Kas Homestay
-- Copy semua isi file ini > Supabase SQL Editor > Run (jalankan sekali).
-- ============================================================

create table profiles (id uuid primary key references auth.users(id) on delete cascade, full_name text);

create table customers (
  id uuid primary key default gen_random_uuid(),
  code text unique not null, name text not null, phone text, email text, address text);

create table rooms (
  id uuid primary key default gen_random_uuid(),
  code text unique not null, name text not null, room_type text,
  price_per_night numeric not null check (price_per_night >= 0),
  status text not null default 'Tersedia');

create table accounts (code text primary key, name text not null, type text not null);
insert into accounts values
 ('1101','Kas','Aset'), ('1102','Piutang Usaha','Aset'),
 ('4101','Pendapatan Jasa Homestay','Pendapatan'), ('5101','Beban Operasional','Beban');

create table invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_no text unique not null, invoice_date date not null,
  customer_id uuid not null references customers(id),
  room_id uuid not null references rooms(id),
  check_in date not null, check_out date not null,
  nights int not null check (nights > 0),
  price_per_night numeric not null, total numeric not null check (total > 0),
  due_date date not null, description text);

create table invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  room_id uuid not null references rooms(id),
  nights int not null, price_per_night numeric not null, subtotal numeric not null);

create table cash_receipts (
  id uuid primary key default gen_random_uuid(),
  receipt_no text unique not null, receipt_date date not null,
  invoice_id uuid not null references invoices(id),
  amount numeric not null check (amount > 0),
  method text not null default 'Tunai', description text);

create table journal_entries (
  id uuid primary key default gen_random_uuid(),
  journal_no text unique not null, entry_date date not null, description text,
  ref_type text, ref_id uuid);

create table journal_lines (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references journal_entries(id) on delete cascade,
  account_code text not null references accounts(code),
  debit numeric not null default 0 check (debit >= 0),
  credit numeric not null default 0 check (credit >= 0));

create index on invoices(customer_id);
create index on cash_receipts(invoice_id);
create index on journal_lines(entry_id);
create index on journal_lines(account_code);

-- Otomatis buat profile saat user baru dibuat di Supabase Auth
create function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into profiles(id, full_name) values (new.id, new.email); return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

-- FUNGSI 1: simpan invoice + jurnal (Debit Piutang, Kredit Pendapatan)
create function create_invoice(p_no text, p_date date, p_customer uuid, p_room uuid,
  p_in date, p_out date, p_due date, p_desc text) returns uuid language plpgsql as $$
declare v_price numeric; v_n int; v_total numeric; v_id uuid; v_j uuid;
begin
  v_n := p_out - p_in;                                   -- jumlah malam
  if v_n <= 0 then raise exception 'Check out harus setelah check in'; end if;
  select price_per_night into v_price from rooms where id = p_room;
  v_total := v_price * v_n;                              -- total
  insert into invoices(invoice_no, invoice_date, customer_id, room_id, check_in, check_out, nights, price_per_night, total, due_date, description)
    values (p_no, p_date, p_customer, p_room, p_in, p_out, v_n, v_price, v_total, p_due, p_desc) returning id into v_id;
  insert into invoice_items(invoice_id, room_id, nights, price_per_night, subtotal) values (v_id, p_room, v_n, v_price, v_total);
  insert into journal_entries(journal_no, entry_date, description, ref_type, ref_id)
    values ('JU-' || p_no, p_date, 'Invoice ' || p_no, 'invoice', v_id) returning id into v_j;
  insert into journal_lines(entry_id, account_code, debit, credit) values (v_j, '1102', v_total, 0), (v_j, '4101', 0, v_total);
  return v_id;
end $$;

-- FUNGSI 2: simpan penerimaan kas + jurnal (Debit Kas, Kredit Piutang)
create function create_receipt(p_no text, p_date date, p_invoice uuid, p_amount numeric,
  p_method text, p_desc text) returns uuid language plpgsql as $$
declare v_out numeric; v_id uuid; v_j uuid;
begin
  select total - coalesce((select sum(amount) from cash_receipts where invoice_id = p_invoice), 0) into v_out from invoices where id = p_invoice;
  if p_amount is null or p_amount <= 0 then raise exception 'Jumlah pembayaran harus lebih dari 0'; end if;
  if p_amount > v_out then raise exception 'Pembayaran melebihi saldo piutang (%)', v_out; end if;
  insert into cash_receipts(receipt_no, receipt_date, invoice_id, amount, method, description)
    values (p_no, p_date, p_invoice, p_amount, p_method, p_desc) returning id into v_id;
  insert into journal_entries(journal_no, entry_date, description, ref_type, ref_id)
    values ('JU-' || p_no, p_date, 'Penerimaan kas ' || p_no, 'receipt', v_id) returning id into v_j;
  insert into journal_lines(entry_id, account_code, debit, credit) values (v_j, '1101', p_amount, 0), (v_j, '1102', 0, p_amount);
  return v_id;
end $$;

-- VIEW: status piutang (Outstanding = Total Invoice - Total Pembayaran)
create view v_invoice_status with (security_invoker = true) as
select i.id, i.invoice_no, i.invoice_date, i.due_date, i.total, c.name as customer_name,
  coalesce(p.paid, 0) as paid, i.total - coalesce(p.paid, 0) as outstanding,
  case when i.total - coalesce(p.paid, 0) = 0 then 'Lunas'
       when i.due_date < current_date then 'Jatuh Tempo'
       when coalesce(p.paid, 0) > 0 then 'Sebagian'
       else 'Belum Bayar' end as status,
  greatest(current_date - i.due_date, 0) as days_overdue
from invoices i join customers c on c.id = i.customer_id
left join (select invoice_id, sum(amount) as paid from cash_receipts group by invoice_id) p on p.invoice_id = i.id;

create view v_receipts with (security_invoker = true) as
select r.receipt_no, r.receipt_date, r.amount, r.method, i.invoice_no, c.name as customer_name
from cash_receipts r join invoices i on i.id = r.invoice_id join customers c on c.id = i.customer_id;

create view v_ledger with (security_invoker = true) as
select l.account_code, a.name as account_name, e.entry_date, e.journal_no, e.description, l.debit, l.credit
from journal_lines l join journal_entries e on e.id = l.entry_id join accounts a on a.code = l.account_code;

-- RLS: hanya user yang sudah login yang boleh membaca/menulis
do $$ declare t text; begin
  foreach t in array array['profiles','customers','rooms','accounts','invoices','invoice_items','cash_receipts','journal_entries','journal_lines'] loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy "login_only" on %I for all to authenticated using (true) with check (true)', t);
  end loop; end $$;

grant execute on function create_invoice, create_receipt to authenticated;
