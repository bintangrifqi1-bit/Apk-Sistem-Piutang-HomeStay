// Jurnal umum: dibentuk otomatis oleh database, di sini hanya ditampilkan.
async function pageJournal() {
  const { data } = await db.from("journal_entries").select("journal_no,entry_date,description,journal_lines(account_code,debit,credit,accounts(name))").order("entry_date").order("journal_no");
  let rows = [], td = 0, tk = 0;
  data.forEach(e => {
    e.journal_lines.sort((a, b) => b.debit - a.debit).forEach(l => {
      const kredit = l.credit > 0;
      rows.push([e.entry_date, e.journal_no, (kredit ? "&emsp;&emsp;" : "") + l.accounts.name, l.debit > 0 ? rp(l.debit) : "", kredit ? rp(l.credit) : ""]);
      td += Number(l.debit); tk += Number(l.credit);
    });
  });
  rows.push(["", "", "<b>TOTAL</b>", `<b>${rp(td)}</b>`, `<b>${rp(tk)}</b>`]);
  $("content").innerHTML = `<h2>Jurnal Umum</h2><p>Total Debit ${td === tk ? "=" : "≠"} Total Kredit</p>` + table(["Tanggal", "No Jurnal", "Akun", "Debit", "Kredit"], rows, [3, 4]);
}
