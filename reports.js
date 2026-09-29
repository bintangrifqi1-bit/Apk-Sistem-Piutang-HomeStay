async function pageReceivables() {
  const data = (await db.from("v_invoice_status").select("*").order("invoice_date")).data;
  $("content").innerHTML = `<h2>Laporan Piutang</h2>` + table(["Invoice", "Tanggal", "Pelanggan", "Total", "Dibayar", "Outstanding", "Status"],
    data.map(i => [i.invoice_no, i.invoice_date, i.customer_name, rp(i.total), rp(i.paid), rp(i.outstanding), badge(i.status)]), [3, 4, 5]);
}
// Kategori aging berdasarkan jumlah hari lewat jatuh tempo.
function agingCategory(days) {
  if (days <= 0) return "Belum Jatuh Tempo";
  if (days <= 30) return "1-30 Hari";
  if (days <= 60) return "31-60 Hari";
  if (days <= 90) return "61-90 Hari";
  return ">90 Hari";
}
async function pageAging() {
  const data = (await db.from("v_invoice_status").select("*").gt("outstanding", 0).order("due_date")).data;
  $("content").innerHTML = `<h2>Aging Piutang</h2>` + table(["Pelanggan", "Invoice", "Jatuh Tempo", "Outstanding", "Kategori"],
    data.map(i => [i.customer_name, i.invoice_no, i.due_date, rp(i.outstanding), agingCategory(i.days_overdue)]), [3]);
}
async function pageCashReport() {
  const data = (await db.from("v_receipts").select("*").order("receipt_date")).data;
  const total = data.reduce((s, r) => s + Number(r.amount), 0);
  const rows = data.map(r => [r.receipt_date, r.receipt_no, r.customer_name, r.invoice_no, r.method, rp(r.amount)]);
  rows.push(["", "", "", "", "<b>TOTAL</b>", `<b>${rp(total)}</b>`]);
  $("content").innerHTML = `<h2>Laporan Penerimaan Kas</h2>` + table(["Tanggal", "No Bukti", "Pelanggan", "Invoice", "Metode", "Jumlah"], rows, [5]);
}
