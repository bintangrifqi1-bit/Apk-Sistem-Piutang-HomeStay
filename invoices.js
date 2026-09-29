// Transaksi piutang: menyimpan invoice memanggil fungsi SQL create_invoice()
// yang sekaligus membuat jurnal (Debit Piutang, Kredit Pendapatan).
let roomList = [];
async function pageInvoices() {
  const { data } = await db.from("v_invoice_status").select("*").order("invoice_date", { ascending: false });
  $("content").innerHTML = `<div class="bar"><h2>Invoice (Piutang)</h2><button onclick="addInvoice()">+ Invoice Baru</button></div>` +
    table(["No Invoice", "Tanggal", "Pelanggan", "Jatuh Tempo", "Total", "Dibayar", "Outstanding", "Status"],
      data.map(i => [i.invoice_no, i.invoice_date, i.customer_name, i.due_date, rp(i.total), rp(i.paid), rp(i.outstanding), badge(i.status)]), [4, 5, 6]);
}
async function addInvoice() {
  const customers = (await db.from("customers").select("id,code,name").order("code")).data;
  roomList = (await db.from("rooms").select("*").order("code")).data;
  const d = today();
  openModal("Invoice Baru", formHtml([
    { name: "no", label: "Nomor Invoice", value: genNo("INV") },
    { name: "date", label: "Tanggal", type: "date", value: d },
    { name: "customer", label: "Pelanggan", options: customers.map(c => [c.id, c.code + " - " + c.name]) },
    { name: "room", label: "Kamar", options: roomList.map(r => [r.id, r.code + " - " + r.name]), onchange: "calcInvoice()" },
    { name: "in", label: "Check In", type: "date", value: d, oninput: "calcInvoice()" },
    { name: "out", label: "Check Out", type: "date", value: d, oninput: "calcInvoice()" },
    { name: "due", label: "Jatuh Tempo", type: "date", value: d },
    { name: "desc", label: "Keterangan" }]) +
    `<div class="hint" id="calc"></div><button onclick="saveInvoice()">Simpan</button>`);
  calcInvoice();
}
// Jumlah malam dan total dihitung otomatis di layar.
function calcInvoice() {
  const room = roomList.find(r => r.id === val("room"));
  const nights = Math.round((new Date(val("out")) - new Date(val("in"))) / 86400000);
  $("calc").textContent = room ? `${nights} malam x ${rp(room.price_per_night)} = ${rp(nights * room.price_per_night)}` : "";
}
async function saveInvoice() {
  const { error } = await db.rpc("create_invoice", { p_no: val("no"), p_date: val("date"), p_customer: val("customer"), p_room: val("room"),
    p_in: val("in"), p_out: val("out"), p_due: val("due"), p_desc: val("desc") });
  if (error) return alert(error.message);
  closeModal(); pageInvoices();
}
