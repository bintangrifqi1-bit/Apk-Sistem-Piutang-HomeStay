// Penerimaan kas: memanggil fungsi SQL create_receipt() yang membuat jurnal (Debit Kas, Kredit Piutang).
let openInvoices = [];
async function pageReceipts() {
  const { data } = await db.from("v_receipts").select("*").order("receipt_date", { ascending: false });
  $("content").innerHTML = `<div class="bar"><h2>Penerimaan Kas</h2><button onclick="addReceipt()">+ Terima Pembayaran</button></div>` +
    table(["No Bukti", "Tanggal", "Pelanggan", "Invoice", "Metode", "Jumlah"],
      data.map(r => [r.receipt_no, r.receipt_date, r.customer_name, r.invoice_no, r.method, rp(r.amount)]), [5]);
}
async function addReceipt() {
  openInvoices = (await db.from("v_invoice_status").select("*").gt("outstanding", 0).order("invoice_date")).data;
  if (!openInvoices.length) return alert("Tidak ada invoice yang belum lunas.");
  openModal("Terima Pembayaran", formHtml([
    { name: "no", label: "Nomor Bukti", value: genNo("KAS") },
    { name: "date", label: "Tanggal", type: "date", value: today() },
    { name: "invoice", label: "Pelanggan / Invoice", options: openInvoices.map(i => [i.id, i.customer_name + " - " + i.invoice_no]), onchange: "showBalance()" },
    { name: "amount", label: "Jumlah Pembayaran", type: "number" },
    { name: "method", label: "Metode Pembayaran", options: [["Tunai", "Tunai"], ["Transfer", "Transfer"]] },
    { name: "desc", label: "Keterangan" }]) + `<div class="hint" id="balance"></div><button onclick="saveReceipt()">Simpan</button>`);
  showBalance();
}
function showBalance() {
  const inv = openInvoices.find(i => i.id === val("invoice"));
  $("balance").textContent = "Saldo piutang: " + rp(inv.outstanding);
}
async function saveReceipt() {
  const { error } = await db.rpc("create_receipt", { p_no: val("no"), p_date: val("date"), p_invoice: val("invoice"),
    p_amount: Number(val("amount")), p_method: val("method"), p_desc: val("desc") });
  if (error) return alert(error.message);
  closeModal(); pageReceipts();
}
