import { authGuard } from "./authGuard.js";

authGuard();

const user = JSON.parse(localStorage.getItem("user"));
const welcome = document.getElementById("welcome");

if (user && welcome) {
  welcome.textContent = "Welcome " + user.username;
}
const API = "http://localhost:3000/students";
const COURSES_API = "http://localhost:3000/courses";

let students = [];
let courses = [];
let selectedCourse = "all";
let searchText = "";

const tableBody = document.getElementById("tableBody");
const searchInput = document.getElementById("search");
const courseFilter = document.getElementById("courseFilter");
const enrolledCourse = document.getElementById("enrolledCourse");
const addBtn = document.getElementById("addBtn");
const modal = document.getElementById("modal");
const form = document.getElementById("form");
const modalTitle = document.getElementById("modalTitle");
const studentId = document.getElementById("studentId");
const studentName = document.getElementById("studentName");
const attendance = document.getElementById("attendance");
const cancelBtn = document.getElementById("cancelBtn");

function newStudent(name, courseId, attendancePercent) {
  return {
    name: name,
    isDeleted: false,
    courses: [
      {
        courseId: courseId,

        assignments: [
          { id: 0, name: "", grade: 0, maxGrade: 0 }
        ],

        quizzes: [
          { id: 0, name: "", grade: 0, maxGrade: 0 }
        ],

        exam: {
          name: "",
          grade: 0,
          maxGrade: 0,
          deadline: ""
        },

        attendance: {
          percentage: attendancePercent
        }
      }
    ]
  };
}
async function loadStudents() {
  const res = await fetch(API);
  students = await res.json();
  render();
}

async function loadCourses() {
  const res = await fetch(COURSES_API);
  courses = await res.json();

  courses.forEach((c) => {
    const option = document.createElement("option");

    option.value = c.id;
    option.textContent = c.name;

    courseFilter.appendChild(option);

    const courseOption = document.createElement("option");
    courseOption.value = c.id;
    courseOption.textContent = c.name;
    enrolledCourse.appendChild(courseOption);
  });
}

function formatId(id) {
  return /^\d+$/.test(id) ? "ST-" + id.padStart(3, "0") : id;
}

function getLetter(percent) {
  if (percent >= 90) return "A";
  if (percent >= 80) return "B";
  if (percent >= 70) return "C";
  if (percent >= 60) return "D";
  return "F";
}

function calculate(student) {
  let got = 0,
    max = 0,
    present = 0,
    total = 0;

  (student.courses || []).forEach((course) => {
    if (
      selectedCourse !== "all" &&
      String(course.courseId) !== selectedCourse
    ) {
      return;
    }

    const items = [...(course.assignments || []), ...(course.quizzes || [])];
    if (course.exam) items.push(course.exam);

    items.forEach((item) => {
      if (item.grade !== null && item.grade !== undefined) {
        got += item.grade;
        max += item.maxGrade;
      }
    });

    if (course.attendance) {
     present += course.attendance.percentage;
     total += 100;
}
  });

  return {
    grade: max ? Math.round((got / max) * 100) : null,
    attendance: total ? Math.round((present / total) * 100) : null,
  };
}

function render() {
  const list = students.filter((s) => {
    // hide archived students
    if (s.isDeleted) return false;

    if (selectedCourse !== "all") {
      const inCourse = (s.courses || []).some(
        (c) => String(c.courseId) === selectedCourse,
      );
      if (!inCourse) return false;
    }

    const text = searchText.toLowerCase();
    return (
      s.name.toLowerCase().includes(text) ||
      String(s.id).toLowerCase().includes(text) ||
      formatId(String(s.id)).toLowerCase().includes(text)
    );
  });

  if (list.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" class="empty">No students found</td></tr>`;
    return;
  }

  tableBody.innerHTML = list
    .map((s) => {
      const info = calculate(s);
      const gradeText =
        info.grade === null
          ? "-"
          : `<b>${getLetter(info.grade)}</b> · ${info.grade}%`;
      const attText = info.attendance === null ? "-" : info.attendance + "%";

      return `
      <tr>
        <td>
          <div class="student">
            <div class="avatar">${s.name.charAt(0).toUpperCase()}</div>
            <span>${s.name}</span>
          </div>
        </td>
        <td>${formatId(String(s.id))}</td>
        <td class="grade">${gradeText}</td>
        <td>${attText}</td>
        <td class="right actions">
          <button data-action="edit" data-id="${s.id}">Edit</button>
          <button data-action="archive" data-id="${s.id}">Archive</button>
          <button class="delete" data-action="delete" data-id="${s.id}">Delete</button>
        </td>
      </tr>
    `;
    })
    .join("");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = studentName.value.trim();
  if (!name) return;

if (studentId.value) {
  const student = students.find(
    (s) => String(s.id) === studentId.value
  );

  student.courses[0].courseId = enrolledCourse.value;

  student.courses[0].attendance.percentage =
    Number(attendance.value) || 0;

  await fetch(`${API}/${studentId.value}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name,
      courses: student.courses,
    }),
  });
} else {
  const attendancePercent = Number(attendance.value) || 0;

  const newStudentData = newStudent(
    name,
    enrolledCourse.value,
    attendancePercent
  );

  await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newStudentData),
  });
}

modal.close();
loadStudents();
});

tableBody.addEventListener("click", async (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const id = btn.dataset.id;
  const action = btn.dataset.action;

if (action === "edit") {
  const student = students.find((s) => String(s.id) === id);

  modalTitle.textContent = "Edit student";

  // Keep the ID hidden so we know which student we are editing
  studentId.value = id;

  // Show student's current name
  studentName.value = student.name;

  // Show student's current course and attendance
  if (student.courses && student.courses.length > 0) {
    enrolledCourse.value = student.courses[0].courseId;

    if (student.courses[0].attendance) {
      attendance.value =
        student.courses[0].attendance.percentage;
    } else {
      attendance.value = "";
    }
  }

  modal.showModal();
}

  if (action === "archive") {
    await fetch(`${API}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDeleted: true }),
    });
    loadStudents();
  }

  if (action === "delete") {
    if (confirm("Are you sure you want to delete this student?")) {
      await fetch(`${API}/${id}`, { method: "DELETE" });
      loadStudents();
    }
  }
});

addBtn.addEventListener("click", () => {
  modalTitle.textContent = "Add student";

  studentId.value = "";
  studentName.value = "";
  enrolledCourse.value = "";
  attendance.value = "";

  modal.showModal();
});

cancelBtn.addEventListener("click", () => modal.close());

searchInput.addEventListener("input", () => {
  searchText = searchInput.value;
  render();
});

courseFilter.addEventListener("change", () => {
  selectedCourse = courseFilter.value;
  render();
});

loadCourses();
loadStudents();
