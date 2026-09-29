async function pageRooms() {
  const { data } = await db.from("rooms").select("*").order("code");
  $("content").innerHTML = `<div class="bar"><h2>Kamar</h2><button onclick="addRoom()">+ Tambah</button></div>` +
    table(["Kode", "Nama", "Tipe", "Harga/Malam", "Status"], data.map(r => [r.code, r.name, r.room_type, rp(r.price_per_night), r.status]), [3]);
}
function addRoom() {
  openModal("Tambah Kamar", formHtml([
    { name: "code", label: "Kode Kamar" }, { name: "name", label: "Nama Kamar" }, { name: "type", label: "Tipe Kamar" },
    { name: "price", label: "Harga per Malam", type: "number" }]) + `<button onclick="saveRoom()">Simpan</button>`);
}
async function saveRoom() {
  const { error } = await db.from("rooms").insert({ code: val("code"), name: val("name"), room_type: val("type"), price_per_night: Number(val("price")) });
  if (error) return alert(error.message);
  closeModal(); pageRooms();
}
