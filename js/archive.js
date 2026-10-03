import { authGuard } from "./authGuard.js";

authGuard();

const user = JSON.parse(localStorage.getItem("user"));
const welcome = document.getElementById("welcome");

if (user && welcome) {
  welcome.textContent = "Welcome " + user.username;
}

const API_URL = "http://localhost:3000/students";
const tbody = document.getElementById("archive-body");

console.log("archive.js loaded");

function getStudents() {
  fetch(API_URL)
    .then((res) => res.json())
    .then((data) => console.log(data));
}

async function loadArchived() {
  const res = await fetch(API_URL);
  const students = await res.json();

  const archived = students.filter((s) => s.isDeleted === true);
  renderStudents(archived);
}

function getAverage(student) {
  let total = 0;
  let max = 0;

  (student.courses || []).forEach((course) => {
    [...(course.assignments || []), ...(course.quizzes || [])].forEach(
      (item) => {
        if (item.grade !== null) {
          total += item.grade;
          max += item.maxGrade;
        }
      },
    );
  });

  return max ? Math.round((total / max) * 100) : 0;
}

function getLetter(p) {
  return p >= 90 ? "A" : p >= 80 ? "B" : p >= 70 ? "C" : p >= 60 ? "D" : "F";
}

function renderStudents(list) {
  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty">No archived students</td></tr>`;
    return;
  }

  tbody.innerHTML = list
    .map((student) => {
      const percent = getAverage(student);
      return `
      <tr>
        <td class="student-info">
          <span class="avatar">${student.name.charAt(0)}</span>
          <span class="name">${student.name}</span>
        </td>
        <td>ST-${String(student.id).padStart(3, "0")}</td>
        <td class="student-grade"><strong>${getLetter(percent)}</strong> · ${percent}%</td>
        <td>${student.attendance ?? "-"}%</td>
        <td>
          <button class="btn-unarchive" data-id="${student.id}">Unarchive</button>
        </td>
      </tr>
    `;
    })
    .join("");
}

async function unarchive(id) {
  await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isDeleted: false }),
  });

  loadArchived();
}
tbody.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-unarchive");
  if (btn) unarchive(btn.dataset.id);
});

loadArchived();
getStudents();
