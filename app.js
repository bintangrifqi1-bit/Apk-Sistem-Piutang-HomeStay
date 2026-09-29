// Navigasi halaman + dashboard + halaman akun. Dimuat paling akhir.
async function pageAccounts() {
  const data = (await db.from("accounts").select("*").order("code")).data;
  $("content").innerHTML = `<h2>Akun</h2>` + table(["Kode", "Nama Akun", "Tipe"], data.map(a => [a.code, a.name, a.type]));
}
async function pageDashboard() {
  const inv = (await db.from("v_invoice_status").select("*").order("invoice_date", { ascending: false })).data;
  const rc = (await db.from("v_receipts").select("*").order("receipt_date", { ascending: false })).data;
  const sum = list => list.reduce((s, i) => s + Number(i.outstanding), 0);
  const month = today().slice(0, 7);
  const cashMonth = rc.filter(r => r.receipt_date.startsWith(month)).reduce((s, r) => s + Number(r.amount), 0);
  $("content").innerHTML = `<h2>Dashboard</h2><br><div class="cards">
    <div class="card"><small>Total Piutang</small><b>${rp(sum(inv))}</b></div>
    <div class="card"><small>Piutang Jatuh Tempo</small><b>${rp(sum(inv.filter(i => i.days_overdue > 0)))}</b></div>
    <div class="card"><small>Piutang Lewat Jatuh Tempo (>30 hari)</small><b>${rp(sum(inv.filter(i => i.days_overdue > 30)))}</b></div>
    <div class="card"><small>Penerimaan Kas Bulan Ini</small><b>${rp(cashMonth)}</b></div></div>
    <h3>Piutang Terbaru</h3>` +
    table(["Invoice", "Pelanggan", "Outstanding", "Status"], inv.slice(0, 5).map(i => [i.invoice_no, i.customer_name, rp(i.outstanding), badge(i.status)]), [2]) +
    `<h3>Penerimaan Kas Terbaru</h3>` +
    table(["No Bukti", "Pelanggan", "Tanggal", "Jumlah"], rc.slice(0, 5).map(r => [r.receipt_no, r.customer_name, r.receipt_date, rp(r.amount)]), [3]);
}
const pages = { dashboard: pageDashboard, customers: pageCustomers, rooms: pageRooms, accounts: pageAccounts, invoices: pageInvoices,
  receipts: pageReceipts, journal: pageJournal, ledger: pageLedger, receivables: pageReceivables, aging: pageAging, cashreport: pageCashReport };
async function go(name) {
  document.querySelectorAll(".menu a").forEach(a => a.classList.toggle("active", a.dataset.p === name));
  $("content").innerHTML = "Memuat...";
  try { await pages[name](); } catch (e) { $("content").innerHTML = `<p class="err">Terjadi kesalahan: ${e.message}</p>`; }
}
showApp(); // saat halaman dibuka: cek sudah login atau belum
