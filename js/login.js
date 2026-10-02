import { validation } from "./validation.js";

const db = "http://localhost:3001/teachers";

const submit = document.getElementById("submit");

submit.addEventListener("click", async (e) => {
  e.preventDefault();

  const teacherArr = await getTeachers();

  const userName = document.getElementById("userName");
  const password = document.getElementById("password");
  console.log(userName, password);
  validation(password, teacherArr, userName);
});

async function getTeachers() {
  const res = await fetch(db);
  return await res.json();
}
