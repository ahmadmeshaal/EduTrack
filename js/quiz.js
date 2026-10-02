const list = document.getElementById("addCards");
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

  students.forEach((student) => {
    student.courses.forEach((course) => {
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
                <span>Max Grade: ${quiz.maxGrade}</span>
                <span>Grade: ${quiz.grade ?? "Not graded"}</span>
              </span>

            </div>

            <div class="exam-actions">

              <button class="upcoming-tag">
                Upcoming
              </button>

              <button class="edit-tag">
                Edit
              </button>

              <button class="delete-tag">
                Delete
              </button>

            </div>

          </div>
        `;

        list.appendChild(div);
      });
    });
  });
}

document.getElementById("addQuizBtn").addEventListener("click", function () {
  addQuiz(101, "Quiz 4", 10);
});
