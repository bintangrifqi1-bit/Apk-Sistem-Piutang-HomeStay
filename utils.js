// Fungsi bantu yang dipakai semua halaman.
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY); // koneksi ke Supabase
const $ = id => document.getElementById(id);
const rp = n => "Rp" + Number(n || 0).toLocaleString("id-ID");
const today = () => new Date().toISOString().slice(0, 10);

// Membuat tabel HTML. Kolom bertipe angka diberi kelas "num" (rata kanan).
function table(headers, rows, numCols = []) {
  const th = headers.map((h, i) => `<th class="${numCols.includes(i) ? "num" : ""}">${h}</th>`).join("");
  const body = rows.map(r => "<tr>" + r.map((c, i) => `<td class="${numCols.includes(i) ? "num" : ""}">${c ?? ""}</td>`).join("") + "</tr>").join("");
  return `<div class="wrap"><table><tr>${th}</tr>${body || `<tr><td colspan="${headers.length}">Belum ada data.</td></tr>`}</table></div>`;
}
const badge = s => `<span class="badge b-${s.split(" ")[0]}">${s}</span>`;

// Modal + form sederhana
function openModal(title, html) { $("modal-title").textContent = title; $("modal-body").innerHTML = html; $("modal").classList.add("show"); }
function closeModal() { $("modal").classList.remove("show"); }
function formHtml(fields) {
  return fields.map(f => `<label>${f.label}</label>` + (f.options
    ? `<select id="f_${f.name}" onchange="${f.onchange || ""}">${f.options.map(o => `<option value="${o[0]}">${o[1]}</option>`).join("")}</select>`
    : `<input id="f_${f.name}" type="${f.type || "text"}" value="${f.value || ""}" ${f.readonly ? "readonly" : ""} oninput="${f.oninput || ""}">`)).join("");
}
const val = name => $("f_" + name).value;
function genNo(prefix) { return prefix + "-" + today().replace(/-/g, "").slice(2) + "-" + Math.floor(100 + Math.random() * 900); }
