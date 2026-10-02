import { validation } from "./validation.js";

const db = "http://localhost:3001/teachers";

const submit = document.getElementById("submit");

submit.addEventListener("click", async (e) => {
  e.preventDefault();

  const userName = document.getElementById("userName").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!validation(userName, password)) return;

  const teacherArr = await getTeachers();

  const user = teacherArr.find(
    (t) => t.username === userName && t.password === password,
  );

  if (!user) {
    alert("Invalid username or password");
    return;
  }

  const token = generateToken();

  setCookie("token", token, 7);
  setCookie("user", JSON.stringify(user), 7);

  window.location.href = "../index.html";
});

async function getTeachers() {
  const res = await fetch(db);
  return await res.json();
}

function generateToken() {
  return Math.random().toString(36).substring(2) + Date.now();
}

function setCookie(name, value, days) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`;
}
