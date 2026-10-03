const list = document.getElementById("addCards");

const coursesList = [
  { id: "101", name: "Java" },
  { id: "102", name: "Database" },
  { id: "103", name: "Web Development" },
  { id: "104", name: "JavaScript" },
  { id: "105", name: "Software Testing" },
  { id: "106", name: "Computer Networks" },
  { id: "107", name: "Python" },
  { id: "108", name: "Algorithms" },
];

//load
function loadFromDB() {
  fetch("http://localhost:3000/students")
    .then(function (response) {
      return response.json();
    })
    .then(function (students) {
      render(students);
    });
}

function render(students) {
  list.innerHTML = "";

  let courses = [];

  students.forEach(function (student) {
    student.courses.forEach(function (course) {
      let alreadyExists = false;

      courses.forEach(function (item) {
        if (item.courseId === course.courseId) {
          alreadyExists = true;
        }
      });

      if (!alreadyExists) {
        courses.push(course);
      }
    });
  });

  courses.forEach(function (course) {
    let courseInfo = coursesList.find(function (item) {
      return item.id === String(course.courseId);
    });

    if (course.exam && courseInfo) {
      let exam = course.exam;
      let div = document.createElement("div");

      div.className = "exam-cards";

      div.innerHTML = `
        <div class="card">
          <i class="fa-regular fa-file"></i>
          <div class="info">
            <span class="title">
              ${exam.name}
            </span>

            <span class="detail">
             <span>${courseInfo.name}</span>
             <span>${exam.maxGrade}</span>
            <span>${new Date(exam.deadline).toLocaleDateString()}</span>
            </span>
          </div>
          <div class="exam-actions">

  <button
    class="calendar-tag"
    onclick="addExamToCalendar(
      '${exam.name}',
      '${courseInfo.name}',
      '${exam.deadline}'
    )"
  >
    Add to Calendar
  </button>



  <button
  class="edit-tag"
  onclick="editExam('${course.courseId}')">
  Edit
</button>

  <button
    class="delete-tag"
    onclick="deleteExam('${course.courseId}')">
    Delete
        </button>

        </div>
        </div>
      `;

      list.appendChild(div);
    }
  });
}

function addExam(courseId, examName, maxGrade, deadline) {
  fetch("http://localhost:3000/students")
    .then(function (response) {
      return response.json();
    })
    .then(function (students) {
      students.forEach(function (student) {
        student.courses.forEach(function (course) {
          if (course.courseId === courseId) {
            course.exam = {
              name: examName,
              grade: null,
              maxGrade: maxGrade,
              deadline: deadline,
            };

            fetch(`http://localhost:3000/students/${student.id}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                courses: student.courses,
              }),
            });
          }
        });
      });

      loadFromDB();
    });
}

function deleteExam(courseId) {
  fetch("http://localhost:3000/students")
    .then(function (response) {
      return response.json();
    })
    .then(function (students) {
      students.forEach(function (student) {
        student.courses.forEach(function (course) {
          if (course.courseId === Number(courseId)) {
            delete course.exam;

            fetch(`http://localhost:3000/students/${student.id}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                courses: student.courses,
              }),
            });
          }
        });
      });

      loadFromDB();
    });
}

const addExamBtn = document.getElementById("addExamBtn");
const examPopup = document.getElementById("examPopup");

addExamBtn.addEventListener("click", function () {
  examPopup.classList.add("active");

  examPopup.innerHTML = `
    <div class="quiz-popup-card">
      <h2>Add Exam</h2>
      <form id="examForm">
        <div class="form-group">
          <label>
            Exam Name
          </label>
          <input type="text" id="examName" required>
        </div>
        <div class="form-group">
          <label>
            Course
          </label>
          <select id="examCourse" required>
            <option value="">
              Select Course
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>
            Max Grade
          </label>
          <input type="number" id="maxGrade" required>
        </div>
        <div class="form-group">
          <label>
            Exam Date
          </label>
          <input type="datetime-local" id="examDeadline" required>
        </div>
        <div class="form-actions">
          <button type="button" id="cancelExam" class="btn btn-cancel">
            Cancel
          </button>
          <button type="submit" class="btn btn-save">
            Save
          </button>
        </div>
      </form>
    </div>
  `;

  let examCourse = document.getElementById("examCourse");

  coursesList.forEach(function (course) {
    let option = document.createElement("option");

    option.value = course.id;
    option.textContent = course.name;

    examCourse.appendChild(option);
  });

  document.getElementById("cancelExam").addEventListener("click", function () {
    examPopup.classList.remove("active");
  });

  document
    .getElementById("examForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      let examName = document.getElementById("examName").value;
      let courseId = Number(document.getElementById("examCourse").value);
      let maxGrade = Number(document.getElementById("maxGrade").value);
      let deadline = document.getElementById("examDeadline").value;

      deadline = new Date(deadline).toISOString();

      addExam(courseId, examName, maxGrade, deadline);

      examPopup.classList.remove("active");
    });
});

loadFromDB();
