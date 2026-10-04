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
    course.assignments.forEach(function (assignment) {
      let div = document.createElement("div");

      div.className = "exam-cards";

      div.innerHTML = `
        <div class="card">

          <i class="fa-regular fa-file"></i>

          <div class="info">

            <span class="title">
              ${assignment.name}
            </span>

            <span class="detail">

              <span>
                Course: ${courseName}
              </span>

              <span>
                Grade: ${assignment.maxGrade}
              </span>



            </span>

          </div>


          <div class="exam-actions">

         <button
            class="edit-tag"
             onclick="uploadAssignment()">

                Uplode File

                </button>

          <button
            class="edit-tag"
             onclick="editAssignment(${assignment.id})">

                Edit

                </button>

            <button
              class="delete-tag"
              onclick="deleteAssignment(${assignment.id})">

              Delete

            </button>


          </div>

        </div>
      `;

      list.appendChild(div);
    });
  });
}

function addAssignment(courseId, assignmentName, maxGrade) {
  let assignmentId = Date.now();

  fetch("http://localhost:3000/students")
    .then(function (response) {
      return response.json();
    })

    .then(function (students) {
      students.forEach(function (student) {
        student.courses.forEach(function (course) {
          if (String(course.courseId) === String(courseId)) {
            course.assignments.push({
              id: assignmentId,
              name: assignmentName,
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

function deleteAssignment(assignmentId) {
  fetch("http://localhost:3000/students")
    .then(function (response) {
      return response.json();
    })

    .then(function (students) {
      students.forEach(function (student) {
        student.courses.forEach(function (course) {
          let newAssignments = [];

          course.assignments.forEach(function (assignment) {
            if (assignment.id !== assignmentId) {
              newAssignments.push(assignment);
            }
          });

          course.assignments = newAssignments;

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
function uploadAssignment() {
  assignmentPopup.classList.add("active");

  assignmentPopup.innerHTML = `
    <div class="quiz-popup-card">

      <h2>Upload File</h2>

      <form id="uploadForm">

        <div class="form-group">
          <label>Choose File</label>
          <input type="file" id="uploadFile" required>
        </div>

        <div class="form-actions">

          <button
            type="button"
            id="cancelUpload"
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
    .getElementById("cancelUpload")
    .addEventListener("click", function () {
      assignmentPopup.classList.remove("active");
    });

  document
    .getElementById("uploadForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      assignmentPopup.classList.remove("active");
    });
}

function editAssignment(assignmentId) {
  fetch("http://localhost:3000/students")
    .then(function (response) {
      return response.json();
    })
    .then(function (students) {
      let selectedAssignment = null;

      students.forEach(function (student) {
        student.courses.forEach(function (course) {
          course.assignments.forEach(function (assignment) {
            if (assignment.id === assignmentId) {
              selectedAssignment = assignment;
            }
          });
        });
      });

      if (!selectedAssignment) {
        return;
      }

      assignmentPopup.classList.add("active");

      assignmentPopup.innerHTML = `
        <div class="quiz-popup-card">

          <h2>Edit Assignment</h2>

          <form id="editAssignmentForm">

            <div class="form-group">
              <label>Assignment Name</label>

              <input
                type="text"
                id="editAssignmentName"
                value="${selectedAssignment.name}"
                required>
            </div>

            <div class="form-group">
              <label>Grade</label>

              <input
                type="number"
                id="editGrade"
                value="${selectedAssignment.grade ?? ""}"
                required>
            </div>
          

            <div class="form-actions">

              <button
                type="button"
                id="cancelEditAssignment"
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
        .getElementById("cancelEditAssignment")
        .addEventListener("click", function () {
          assignmentPopup.classList.remove("active");
        });

      document
        .getElementById("editAssignmentForm")
        .addEventListener("submit", function (event) {
          event.preventDefault();

          let newName = document.getElementById("editAssignmentName").value;

          let newGrade = Number(document.getElementById("editGrade").value);

          students.forEach(function (student) {
            student.courses.forEach(function (course) {
              course.assignments.forEach(function (assignment) {
                if (assignment.id === assignmentId) {
                  assignment.name = newName;
                  assignment.grade = newGrade;
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

          assignmentPopup.classList.remove("active");
          loadFromDB();
        });
    });
}

const addAssignmentBtn = document.getElementById("addAssignmentBtn");
const assignmentPopup = document.getElementById("assignmentPopup");

addAssignmentBtn.addEventListener("click", function () {
  assignmentPopup.classList.add("active");

  assignmentPopup.innerHTML = `

    <div class="quiz-popup-card">

      <h2>Add Assignment</h2>


      <form id="assignmentForm">


        <div class="form-group">

          <label>
            Assignment Name
          </label>

          <input
            type="text"
            id="assignmentName"
            required>

        </div>


        <div class="form-group">

          <label>
            Course
          </label>

          <select
            id="assignmentCourse"
            required>

            <option value="">
              Select Course
            </option>

          </select>

        </div>


        <div class="form-group">

          <label>
            Max Grade
          </label>

          <input
            type="number"
            id="maxGrade"
            required>

        </div>


        <div class="form-actions">

          <button
            type="button"
            id="cancelAssignment"
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

  // Courses list
  let assignmentCourse = document.getElementById("assignmentCourse");

  coursesList.forEach(function (course) {
    let option = document.createElement("option");

    option.value = course.id;
    option.textContent = course.name;

    assignmentCourse.appendChild(option);
  });

  // Cancel
  document
    .getElementById("cancelAssignment")
    .addEventListener("click", function () {
      assignmentPopup.classList.remove("active");
    });

  // Save
  document
    .getElementById("assignmentForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      let assignmentName = document.getElementById("assignmentName").value;

      let courseId = Number(document.getElementById("assignmentCourse").value);

      let maxGrade = Number(document.getElementById("maxGrade").value);

      addAssignment(courseId, assignmentName, maxGrade);

      assignmentPopup.classList.remove("active");
    });
});
const assignmentCourseFilter = document.getElementById("assignmentCourseFilter");

assignmentCourseFilter.addEventListener("change", function () {
  selectedCourse = assignmentCourseFilter.value;
  loadFromDB();
});

window.uploadAssignment = uploadAssignment;
window.editAssignment = editAssignment;
window.deleteAssignment = deleteAssignment;

loadCourses().then(function () {
  coursesList.forEach(function (course) {
    let option = document.createElement("option");
    option.value = course.id;
    option.textContent = course.name;
    assignmentCourseFilter.appendChild(option);
  });

  loadFromDB();
});
