// Login / logout memakai Supabase Authentication.
async function login() {
  const { error } = await db.auth.signInWithPassword({ email: $("email").value, password: $("password").value });
  if (error) { $("login-error").textContent = "Login gagal: " + error.message; return; }
  showApp();
}
async function logout() { await db.auth.signOut(); location.reload(); }
async function showApp() {
  const { data } = await db.auth.getSession();
  if (!data.session) { $("login-view").style.display = "flex"; $("app-view").style.display = "none"; return; }
  $("login-view").style.display = "none"; $("app-view").style.display = "flex";
  $("user-email").textContent = data.session.user.email;
  go("dashboard");
}
