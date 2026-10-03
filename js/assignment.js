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
                Course: ${courseInfo.name}
              </span>

              <span>
                Max Grade: ${assignment.maxGrade}
              </span>

              <span>
                Grade: ${assignment.grade ?? "Not graded"}
              </span>

            </span>

          </div>


          <div class="exam-actions">



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
          if (course.courseId === courseId) {
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

          let newName =
            document.getElementById("editAssignmentName").value;

          let newGrade =
            Number(document.getElementById("editGrade").value);

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
                "Content-Type": "application/json"
              },

              body: JSON.stringify({
                courses: student.courses
              })
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

loadFromDB();
