import { authGuard } from "./authGuard.js";

authGuard();
const user = JSON.parse(localStorage.getItem("user"));

const list = document.getElementById("addCards");

let coursesList = [];
let selectedCourse = "all";

function loadCourses() {
  return fetch("http://localhost:3000/courses")
    .then(function (response) {
      return response.json();
    })
    .then(function (courses) {
      coursesList = courses.filter(function (course) {
        return String(course.teacherId) === String(user.id);
      });
    });
}
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
      return String(item.id) === String(course.courseId);
    });

    if (!courseInfo) {
      return;
    }

    let courseName = courseInfo.name;

    if (
      selectedCourse !== "all" &&
      String(course.courseId) !== selectedCourse
    ) {
      return;
    }

    course.quizzes.forEach(function (quiz) {
      let div = document.createElement("div");

      div.className = "exam-cards";

      div.innerHTML = `
        <div class="card">
          <i class="fa-regular fa-file"></i>
          <div class="info">
            <span class="title">
              ${quiz.name}
            </span>
          <span class="detail">
           <span>Course: ${courseName}</span>            <span>Grade: ${quiz.maxGrade}</span>
          </span>
          </div>


          <div class="exam-actions">

          <button
            class="edit-tag"
            onclick="editQuiz(${quiz.id})">
            Edit
            </button>
            <button class="delete-tag" onclick="deleteQuiz(${quiz.id})">
              Delete
            </button>
          </div>

        </div>
      `;

      list.appendChild(div);
    });
  });
}

function addQuiz(courseId, quizName, maxGrade) {
  let quizId = Date.now();

  fetch("http://localhost:3000/students")
    .then(function (response) {
      return response.json();
    })

    .then(function (students) {
      students.forEach(function (student) {
        student.courses.forEach(function (course) {
          if (String(course.courseId) === String(courseId)) {
            course.quizzes.push({
              id: quizId,
              name: quizName,
              grade: null,
              maxGrade: maxGrade,
            });

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

function deleteQuiz(quizId) {
  fetch("http://localhost:3000/students")
    .then(function (response) {
      return response.json();
    })

    .then(function (students) {
      students.forEach(function (student) {
        student.courses.forEach(function (course) {
          let newQuizzes = [];

          course.quizzes.forEach(function (quiz) {
            if (quiz.id !== quizId) {
              newQuizzes.push(quiz);
            }
          });
          course.quizzes = newQuizzes;

          fetch(`http://localhost:3000/students/${student.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              courses: student.courses,
            }),
          });
        });
      });

      loadFromDB();
    });
}

function editQuiz(quizId) {
  fetch("http://localhost:3000/students")
    .then(function (response) {
      return response.json();
    })
    .then(function (students) {
      let selectedQuiz = null;

      students.forEach(function (student) {
        student.courses.forEach(function (course) {
          course.quizzes.forEach(function (quiz) {
            if (quiz.id === quizId) {
              selectedQuiz = quiz;
            }
          });
        });
      });

      if (!selectedQuiz) {
        return;
      }

      quizPopup.classList.add("active");

      quizPopup.innerHTML = `
        <div class="quiz-popup-card">

          <h2>Edit Quiz</h2>

          <form id="editQuizForm">

            <div class="form-group">
              <label>Quiz Name</label>

              <input
                type="text"
                id="editQuizName"
                value="${selectedQuiz.name}"
                required>
            </div>

            <div class="form-group">
              <label>Grade</label>

              <input
                type="number"
                id="editQuizGrade"
                value="${selectedQuiz.grade ?? ""}"
                required>
            </div>

            <div class="form-actions">

              <button
                type="button"
                id="cancelEditQuiz"
                class="btn btn-cancel">
                Cancel
              </button>

              <button
                type="submit"
                class="btn btn-save">
                Save
              </button>

            </div>

          </form>

        </div>
      `;

      document
        .getElementById("cancelEditQuiz")
        .addEventListener("click", function () {
          quizPopup.classList.remove("active");
        });

      document
        .getElementById("editQuizForm")
        .addEventListener("submit", function (event) {
          event.preventDefault();

          let newName = document.getElementById("editQuizName").value;

          let newGrade = Number(document.getElementById("editQuizGrade").value);

          students.forEach(function (student) {
            student.courses.forEach(function (course) {
              course.quizzes.forEach(function (quiz) {
                if (quiz.id === quizId) {
                  quiz.name = newName;
                  quiz.grade = newGrade;
                }
              });
            });

            fetch(`http://localhost:3000/students/${student.id}`, {
              method: "PATCH",

              headers: {
                "Content-Type": "application/json",
              },

              body: JSON.stringify({
                courses: student.courses,
              }),
            });
          });

          quizPopup.classList.remove("active");
          loadFromDB();
        });
    });
}
//popup card
const addQuizBtn = document.getElementById("addQuizBtn");
const quizPopup = document.getElementById("quizPopup");

addQuizBtn.addEventListener("click", function () {
  quizPopup.classList.add("active");

  quizPopup.innerHTML = `
    <div class="quiz-popup-card">
      <h2>Add Quiz</h2>

      <form id="quizForm">
        <div class="form-group">
          <label>
            Quiz Name
          </label>
          <input type="text" id="quizName" required>
        </div>


        <div class="form-group">
          <label>
            Course
          </label>
          <select id="quizCourse" required>
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

        <div class="form-actions">
          <button type="button" id="cancelQuiz" class="btn btn-cancel">
            Cancel
          </button>
          <button type="submit" class="btn btn-save">
            Save
          </button>
        </div>
      </form>

    </div>

  `;

  // courses list
  let quizCourse = document.getElementById("quizCourse");

  coursesList.forEach(function (course) {
    let option = document.createElement("option");

    option.value = course.id;
    option.textContent = course.name;
    quizCourse.appendChild(option);
  });

  document.getElementById("cancelQuiz").addEventListener("click", function () {
    quizPopup.classList.remove("active");
  });

  document
    .getElementById("quizForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      let quizName = document.getElementById("quizName").value;
      let courseId = Number(document.getElementById("quizCourse").value);
      let maxGrade = Number(document.getElementById("maxGrade").value);

      addQuiz(courseId, quizName, maxGrade);
      quizPopup.classList.remove("active");
    });
});
const quizCourseFilter = document.getElementById("quizCourseFilter");

quizCourseFilter.addEventListener("change", function () {
  selectedCourse = quizCourseFilter.value;
  loadFromDB();
});

window.editQuiz = editQuiz;
window.deleteQuiz = deleteQuiz;

loadCourses().then(function () {
  coursesList.forEach(function (course) {
    let option = document.createElement("option");
    option.value = course.id;
    option.textContent = course.name;
    quizCourseFilter.appendChild(option);
  });

  loadFromDB();
});
