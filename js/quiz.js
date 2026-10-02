const list = document.getElementById("addCards");


const coursesList = [
  { id: "101", name: "Java" },
  { id: "102", name: "Database" },
  { id: "103", name: "Web Development" },
  { id: "104", name: "JavaScript" },
  { id: "105", name: "Software Testing" },
  { id: "106", name: "Computer Networks" },
  { id: "107", name: "Python" },
  { id: "108", name: "Algorithms" }
];

function addQuiz(courseId, quizName, maxGrade) {
  fetch("http://localhost:3000/students")
    .then((response) => response.json())

    .then((students) => {
      students.forEach((student) => {
        //find the course by id ****
        const course = student.courses.find(
          (course) => course.courseId === courseId,
        );

        if (!course) {
          console.log("Student does not have course:", student.id);
          return;
        }

        console.log("Adding quiz to student:", student.id);
        //add the new quiz
        course.quizzes.push({
          id: Date.now(),
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
      });
    });
}

function loadFromDB() {
  fetch("http://localhost:3000/students")
    .then((response) => response.json())

    .then((students) => {
      render(students);
    });

    
}

function render(students) {
  list.innerHTML = "";

  const uniqueCourses = new Map();

  students.forEach((student) => {

    student.courses.forEach((course) => {

      if (!uniqueCourses.has(course.courseId)) {
        uniqueCourses.set(course.courseId, course);
      }

    });

  });

  uniqueCourses.forEach((course) => {

    const courseInfo = coursesList.find(
      (item) => item.id === String(course.courseId)
    );

    course.quizzes.forEach((quiz) => {

      const div = document.createElement("div");

      div.className = "exam-cards";

      div.innerHTML = `
        <div class="card">

          <i class="fa-regular fa-file"></i>

          <div class="info">

            <span class="title">
              ${quiz.name}
            </span>

            <span class="detail">
              <span>Course: ${courseInfo.name}</span>
              <span>Max Grade: ${quiz.maxGrade}</span>
              <span>Grade: ${quiz.grade ?? "Not graded"}</span>
            </span>

          </div>

          <div class="exam-actions">
            <button class="upcoming-tag">Upcoming</button>
            <button class="edit-tag">Edit</button>
            <button class="delete-tag">Delete</button>
          </div>

        </div>
      `;

      list.appendChild(div);
    });
  });
}

// document.getElementById("addQuizBtn").addEventListener("click", function () {
//   addQuiz(101, "Quiz 3", 10);
// });



//for popup card
const addQuizBtn = document.getElementById("addQuizBtn");
const quizPopup = document.getElementById("quizPopup");

addQuizBtn.addEventListener("click", function () {

  quizPopup.classList.add("active");
  quizPopup.innerHTML = "";

  const card = document.createElement("div");

  card.className = "quiz-popup-card";

  card.innerHTML = `
    <h2>Add Quiz</h2>

    <div class="form-group">
      <label>Quiz Name</label>
      <input type="text" id="quizName">
    </div>

    <div class="form-group">
      <label>Course</label>
      <select id="quizCourse">
        <option value="">Select Course</option>
      </select>
    </div>

    <div class="form-group">
      <label>Max Grade</label>
      <input type="number" id="maxGrade">
    </div>

    <div class="form-actions">
      <button type="button" id="cancelQuiz" class="btn btn-cancel">
        Cancel
      </button>

      <button type="button" id="saveQuiz" class="btn btn-save">
        Save
      </button>
    </div>
  `;

  quizPopup.appendChild(card);


  
  const quizCourse = document.getElementById("quizCourse");

  coursesList.forEach(function (course) {

    const option = document.createElement("option");

    option.value = course.id;
    option.textContent = course.name;

    quizCourse.appendChild(option);

  });

});

loadFromDB();