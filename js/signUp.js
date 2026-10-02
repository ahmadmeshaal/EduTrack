import { signupValidation } from "./signupValidation.js";

const db = "http://localhost:3000/teachers";

const submitBtn = document.querySelector(".signbtn");

submitBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  const users = await getTeachers();

  const name = document.getElementById("name");
  const username = document.getElementById("username");
  const password = document.getElementById("password");

  signupValidation(name, username, password, users);
});

async function getTeachers() {
  const res = await fetch(db);
  return await res.json();
}
