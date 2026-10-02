// const BASE_URL = "http://localhost:3000";

// let students = [];
// let courses = [];

// const endpoints = {
//   teachers: `${BASE_URL}/teachers`,
//   courses: `${BASE_URL}/courses`,
//   students: `${BASE_URL}/students`,
//   studentCourses: `${BASE_URL}/studentCourses`,
//   assignments: `${BASE_URL}/assignments`,
//   quizzes: `${BASE_URL}/quizzes`,
//   exams: `${BASE_URL}/exams`,
//   attendance: `${BASE_URL}/attendance`,
// };//هاي الاندبوينتس يا شباب 



// async function load() {
//   [students, courses] = await Promise.all([api("students"), api("courses")]);
//   fillCourseFilter();
//   render();
// }

// //students crud

// //get
// function getStudents() {
//   fetch(endpoints.students)
//     .then(res => res.json())
//     .then(data => console.log(data));
// }

// //post
// function addStudent() {
//   fetch(endpoints.students, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       name: "Omar Altoom"
//     })
//   });
// }

// //patch
// function updateStudent(id) {
//   fetch(`${endpoints.students}/${id}`, {
//     method: "PATCH",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ name: "Omar A." })
//   });
// }


// //delete
// function deleteStudent(id) {
//   fetch(`${endpoints.students}/${id}`, {
//     method: "DELETE"
//   });
// }




// //student courses


// //post
// function enrollStudent() {
//   fetch(endpoints.studentCourses, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       studentId: 1,
//       courseId: 101
//     })
//   });
// }


// //get
// function getEnrollments() {
//   fetch(`${endpoints.studentCourses}?studentId=1`)
//     .then(res => res.json())
//     .then(data => console.log(data));
// }



// //delete
// function deleteEnrollment(id) {
//   fetch(`${endpoints.studentCourses}/${id}`, {
//     method: "DELETE"
//   });
// }





// function render() {
//   const q = document.getElementById("search").value.trim().toLowerCase();
//   const courseId = document.getElementById("courseFilter").value;
//   const showDeleted = document.getElementById("showDeleted").checked;

//   const rows = students
//     .filter((s) => showDeleted || !s.isDeleted)
//     .filter((s) => `${s.name} ST-${String(s.id).padStart(3, "0")}`.toLowerCase().includes(q))
//     .map((s) => ({ s, st: stats(s, courseId) }))
//     .filter(({ st }) => !courseId || st.enrolled);

//   document.getElementById("studentsBody").innerHTML = rows
//     .map(({ s, st }) => {
//       const actions = s.isDeleted
//         ? `<button class="btn-edit" data-act="restore" data-id="${s.id}">Restore</button>
//            <button class="btn-delete" data-act="delete" data-id="${s.id}">Delete forever</button>`
//         : `<button class="btn-edit" data-act="edit" data-id="${s.id}">Edit</button>
//            <button class="btn-archive" data-act="soft" data-id="${s.id}">Archive</button>
//            <button class="btn-delete" data-act="delete" data-id="${s.id}">Delete</button>`;

//       return `
//       <tr style="${s.isDeleted ? "opacity:.5" : ""}">
//         <td class="student-info">
//           <span class="avatar">${s.name[0]}</span>
//           <span class="name">${s.name}</span>
//         </td>
//         <td class="student-id">ST-${String(s.id).padStart(3, "0")}</td>
//         <td class="student-grade">${st.grade === null ? "—" : `<strong>${letter(st.grade)}</strong> · ${st.grade}%`}</td>
//         <td class="student-attendance">${st.attendance === null ? "—" : st.attendance + "%"}</td>
//         <td><div class="actions">${actions}</div></td>
//       </tr>`;
//     })
//     .join("");
// }



// document.getElementById("search").addEventListener("input", render);
// document.getElementById("courseFilter").addEventListener("change", render);
// document.getElementById("showDeleted").addEventListener("change", render);
// document.getElementById("addBtn").addEventListener("click", addStudent);




const BASE_URL = "http://localhost:3000";
let students = [];
let courses = [];

const api = (path, method = "GET", body) =>
  fetch(`${BASE_URL}/${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  }).then((r) => r.json());

async function load() {
  [students, courses] = await Promise.all([api("students"), api("courses")]);
  fillCourseFilter();
  render();
}

function fillCourseFilter() {
  const sel = document.getElementById("courseFilter");
  sel.innerHTML =
    '<option value="">All courses</option>' +
    courses.map((c) => `<option value="${c.id}">${c.name}</option>`).join("");
}

/* ---------- calculations ---------- */

function letter(p) {
  return p >= 90 ? "A" : p >= 80 ? "B" : p >= 70 ? "C" : p >= 60 ? "D" : "F";
}

function stats(student, courseId) {
  const list = student.courses.filter((c) => !courseId || c.courseId == courseId);

  let got = 0, max = 0, present = 0, total = 0;
  list.forEach((c) => {
    const items = [...(c.assignments || []), ...(c.quizzes || []), ...(c.exam ? [c.exam] : [])];
    items.forEach((i) => {
      if (i.grade === null || i.grade === undefined) return; // ungraded quiz
      got += i.grade;
      max += i.maxGrade;
    });
    if (c.attendance) {
      present += c.attendance.daysPresent;
      total += c.attendance.totalDays;
    }
  });

  return {
    enrolled: list.length > 0,
    grade: max ? Math.round((got / max) * 100) : null,
    attendance: total ? Math.round((present / total) * 100) : null,
  };
}

/* ---------- render ---------- */

function render() {
  const q = document.getElementById("search").value.trim().toLowerCase();
  const courseId = document.getElementById("courseFilter").value;
  const showDeleted = document.getElementById("showDeleted").checked;

  const rows = students
    .filter((s) => showDeleted || !s.isDeleted)
    .filter((s) => `${s.name} ST-${String(s.id).padStart(3, "0")}`.toLowerCase().includes(q))
    .map((s) => ({ s, st: stats(s, courseId) }))
    .filter(({ st }) => !courseId || st.enrolled);

  document.getElementById("studentsBody").innerHTML = rows
    .map(({ s, st }) => {
      const actions = s.isDeleted
        ? `<button class="btn-edit" data-act="restore" data-id="${s.id}">Restore</button>
           <button class="btn-delete" data-act="delete" data-id="${s.id}">Delete forever</button>`
        : `<button class="btn-edit" data-act="edit" data-id="${s.id}">Edit</button>
           <button class="btn-archive" data-act="soft" data-id="${s.id}">Archive</button>
           <button class="btn-delete" data-act="delete" data-id="${s.id}">Delete</button>`;

      return `
      <tr style="${s.isDeleted ? "opacity:.5" : ""}">
        <td class="student-info">
          <span class="avatar">${s.name[0]}</span>
          <span class="name">${s.name}</span>
        </td>
        <td class="student-id">ST-${String(s.id).padStart(3, "0")}</td>
        <td class="student-grade">${st.grade === null ? "—" : `<strong>${letter(st.grade)}</strong> · ${st.grade}%`}</td>
        <td class="student-attendance">${st.attendance === null ? "—" : st.attendance + "%"}</td>
        <td><div class="actions">${actions}</div></td>
      </tr>`;
    })
    .join("");
}

/* ---------- actions ---------- */

function emptyCourse(courseId) {
  return {
    courseId,
    assignments: [],
    quizzes: [],
    exam: { name: "Final Exam", grade: null, maxGrade: 50, deadline: null },
    attendance: { daysPresent: 0, daysAbsent: 0, totalDays: 0, presentDates: [], absentDates: [] },
  };
}

async function addStudent() {
  const name = prompt("Student name:");
  if (!name) return;
  const ids = prompt(
    "Course IDs (comma separated)\n" + courses.map((c) => `${c.id} = ${c.name}`).join("\n"),
    ""
  );
  const enrolled = (ids || "")
    .split(",")
    .map((x) => x.trim())
    .filter((x) => courses.some((c) => c.id == x))
    .map((x) => emptyCourse(Number(x)));

  await api("students", "POST", { name, isDeleted: false, courses: enrolled });
  load();
}

async function editStudent(id) {
  const s = students.find((x) => x.id == id);
  const name = prompt("New name:", s.name);
  if (!name) return;
  await api(`students/${id}`, "PATCH", { name });
  load();
}

async function softDelete(id) {
  await api(`students/${id}`, "PATCH", { isDeleted: true });
  load();
}

async function restore(id) {
  await api(`students/${id}`, "PATCH", { isDeleted: false });
  load();
}

async function hardDelete(id) {
  if (!confirm("Delete permanently? This can't be undone.")) return;
  await api(`students/${id}`, "DELETE");
  load();
}

/* ---------- events ---------- */

document.getElementById("studentsBody").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-act]");
  if (!btn) return;
  const { act, id } = btn.dataset;
  ({ edit: editStudent, soft: softDelete, restore, delete: hardDelete })[act](id);
});

document.getElementById("search").addEventListener("input", render);
document.getElementById("courseFilter").addEventListener("change", render);
document.getElementById("showDeleted").addEventListener("change", render);
document.getElementById("addBtn").addEventListener("click", addStudent);

load();

