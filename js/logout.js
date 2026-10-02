function logout() {
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

  window.location.href = "/pages/login.html";
}

const logoutbtn = document.getElementById("logout");

logoutbtn.addEventListener("click", () => {
  logout();
});
