// Buku besar: saldo berjalan dihitung di sini.
// Akun 1101, 1102, 5101 bersaldo normal debit; 4101 bersaldo normal kredit.
async function pageLedger() {
  const acc = (await db.from("accounts").select("*").order("code")).data;
  $("content").innerHTML = `<h2>Buku Besar</h2><div class="filters">
    <div><label>Akun</label><select id="l_acc">${acc.map(a => `<option value="${a.code}">${a.code} - ${a.name}</option>`).join("")}</select></div>
    <div><label>Tanggal Awal</label><input id="l_from" type="date"></div>
    <div><label>Tanggal Akhir</label><input id="l_to" type="date" value="${today()}"></div>
    <button onclick="showLedger()">Tampilkan</button></div><div id="l_out"></div>`;
  showLedger();
}
async function showLedger() {
  const code = $("l_acc").value, from = $("l_from").value, to = $("l_to").value;
  let q = db.from("v_ledger").select("*").eq("account_code", code).order("entry_date").order("journal_no");
  if (to) q = q.lte("entry_date", to);
  const data = (await q).data;
  const creditNormal = code.startsWith("4");
  let saldo = 0, rows = [];
  data.forEach(l => {
    saldo += creditNormal ? l.credit - l.debit : l.debit - l.credit; // saldo berjalan
    if (!from || l.entry_date >= from) rows.push([l.entry_date, l.journal_no, l.description, rp(l.debit), rp(l.credit), rp(saldo)]);
  });
  $("l_out").innerHTML = table(["Tanggal", "No Jurnal", "Keterangan", "Debit", "Kredit", "Saldo"], rows, [3, 4, 5]);
}
