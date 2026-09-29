async function pageCustomers() {
  const { data } = await db.from("customers").select("*").order("code");
  $("content").innerHTML = `<div class="bar"><h2>Pelanggan</h2><button onclick="addCustomer()">+ Tambah</button></div>` +
    table(["Kode", "Nama", "Telepon", "Email", "Alamat"], data.map(c => [c.code, c.name, c.phone, c.email, c.address]));
}
function addCustomer() {
  openModal("Tambah Pelanggan", formHtml([
    { name: "code", label: "Kode Pelanggan" }, { name: "name", label: "Nama" }, { name: "phone", label: "No. Telepon" },
    { name: "email", label: "Email" }, { name: "address", label: "Alamat" }]) + `<button onclick="saveCustomer()">Simpan</button>`);
}
async function saveCustomer() {
  const { error } = await db.from("customers").insert({ code: val("code"), name: val("name"), phone: val("phone"), email: val("email"), address: val("address") });
  if (error) return alert(error.message);
  closeModal(); pageCustomers();
}
