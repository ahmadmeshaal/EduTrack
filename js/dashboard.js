import { authGuard } from "./authGuard.js";
authGuard();

const user = JSON.parse(localStorage.getItem("user"));

var chartGrades = null;
var chartAttendance = null;
var chartAbsences = null;
var chartScatter = null;

fetch("/json/db.json")
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    let logInTeacherId = user.id; // from cookie
    let teacherCoursesIds = [];

    data.courses.forEach(function (course) {
      if (course.teacherId == logInTeacherId) {
        teacherCoursesIds.push(course);
      }
    });

    let selectTheCourse = document.getElementById("course-select");

    teacherCoursesIds.forEach(function (course) {
      let option = document.createElement("option");
      option.value = course.id;
      option.innerText = course.name;
      selectTheCourse.appendChild(option);
    });

    selectTheCourse.addEventListener("change", function () {
      var selectedCourseId = Number(this.value);
      updateDashboard(selectedCourseId, data);
    });

    if (teacherCoursesIds.length > 0) {
      updateDashboard(Number(teacherCoursesIds[0].id), data);
    }
  })
  .catch(function (error) {
    console.log("Errro", error);
  });

function updateDashboard(selectedCourse, data) {
  var CopyselectedCourse = selectedCourse;
  var copyData = data;
  let totalPresent = 0;
  let totalAbsent = 0;
  let examCount = 0;

  let totalGradeExams = 0;
  let nExams = 0;

  let totalGradeQuiz = 0;
  let nQuizes = 0;

  let totalGradeAssignment = 0;
  let nAssignments = 0;

  let examDeadLine = "";
  let dateTracker = {};
  let scatterData = [];
  let uniqueStudents = new Set();

  data.students.forEach(function (student) {
    if (student.courses) {
      student.courses.forEach(function (studentCourse) {
        if (studentCourse.courseId == selectedCourse) {
          uniqueStudents.add(student.id);

          if (studentCourse.exam) {
            nExams += studentCourse.exam.grade;
            totalGradeExams += studentCourse.exam.maxGrade;

            examCount++;
            examDeadLine = new Date(
              studentCourse.exam.deadline,
            ).toLocaleDateString();

            scatterData.push({
              x: studentCourse.attendance.daysAbsent,
              y: studentCourse.exam.grade,
            });
          }

          if (studentCourse.quizzes) {
            studentCourse.quizzes.forEach(function (quiz) {
              if (quiz.grade !== null) {
                nQuizes += quiz.grade;
                totalGradeQuiz += quiz.maxGrade;
              }
            });
          }

          if (studentCourse.assignments) {
            studentCourse.assignments.forEach(function (assignment) {
              if (assignment.grade !== null) {
                nAssignments += assignment.grade;
                totalGradeAssignment += assignment.maxGrade;
              }
            });
          }

          if (studentCourse.attendance) {
            totalPresent += studentCourse.attendance.daysPresent || 0;
            totalAbsent += studentCourse.attendance.daysAbsent || 0;

            if (studentCourse.attendance.presentDates) {
              studentCourse.attendance.presentDates.forEach(function (date) {
                if (!dateTracker[date]) {
                  dateTracker[date] = { present: 0, absent: 0 };
                }
                dateTracker[date].present++;
              });
            }

            if (studentCourse.attendance.absentDates) {
              studentCourse.attendance.absentDates.forEach(function (date) {
                if (!dateTracker[date]) {
                  dateTracker[date] = { present: 0, absent: 0 };
                }
                dateTracker[date].absent++;
              });
            }
          }
        }
      });
    }
  });
  // =======================================================
  // configure dates for draw a charts

  let assignmentPercent =
    totalGradeAssignment > 0 ? (nAssignments / totalGradeAssignment) * 100 : 0;
  let quizPercent = totalGradeQuiz > 0 ? (nQuizes / totalGradeQuiz) * 100 : 0;
  let examPercent = totalGradeExams > 0 ? (nExams / totalGradeExams) * 100 : 0;

  let sortedDates = Object.keys(dateTracker).sort();
  let weeklyTracker = {};

  if (sortedDates.length > 0) {
    let firstDate = new Date(sortedDates[0]);

    sortedDates.forEach(function (date) {
      let currentDate = new Date(date);
      let differentDays = Math.floor(
        Math.abs(currentDate - firstDate) / (1000 * 60 * 60 * 24),
      );

      let weekLabel = "Week " + (Math.floor(differentDays / 3) + 1);

      if (!weeklyTracker[weekLabel]) {
        weeklyTracker[weekLabel] = { present: 0, absent: 0 };
      }

      weeklyTracker[weekLabel].present += dateTracker[date].present;
      weeklyTracker[weekLabel].absent += dateTracker[date].absent;
    });
  }

  let weeklyLabels = Object.keys(weeklyTracker);
  let weeklyPresentDate = weeklyLabels.map(function (weekLabel) {
    return weeklyTracker[weekLabel].present;
  });

  let weeklyAbsentDate = weeklyLabels.map(function (weekLabel) {
    return weeklyTracker[weekLabel].absent;
  });

  let latestDay =
    sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : "N/A";
  let absencesToday = dateTracker[latestDay]
    ? dateTracker[latestDay].absent
    : 0;

  // Row 1
  document.getElementById("total-student").innerHTML = uniqueStudents.size;

  if (examCount > 0) {
    document.getElementById("average-grade").innerHTML = (
      totalGradeExams / examCount
    ).toFixed(1);
  } else {
    document.getElementById("average-grade").innerHTML = "N/A";
  }

  if (totalPresent + totalAbsent > 0) {
    document.getElementById("attendance-rate").innerHTML =
      (totalPresent / (totalPresent + totalAbsent)).toFixed(2) * 100 + "%";
  } else {
    document.getElementById("attendance-rate").innerHTML = "0%";
  }

  document.getElementById("absences-today").innerHTML = absencesToday;

  // Row 2
  if (chartGrades !== null) {
    chartGrades.destroy();
  }
  if (chartAttendance !== null) {
    chartAttendance.destroy();
  }
  if (chartAbsences !== null) {
    chartAbsences.destroy();
  }

  if (chartScatter !== null) {
    chartScatter.destroy();
  }

  chartScatter = new Chart(document.getElementById("c-scatter"), {
    type: "scatter",
    data: {
      datasets: [
        {
          label: "Student",
          data: scatterData,
          backgroundColor: "#087f78",
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      scales: {
        x: { title: { display: true, text: "Days Absent" } },
        y: {
          title: { display: true, text: "Exam Grade" },
          max: 50,
          beginAtZero: true,
        },
      },
    },
  });

  chartGrades = new Chart(document.getElementById("c-average-grades"), {
    type: "bar",
    data: {
      labels: ["Assignments", "Quizzes", "Final Exam"],
      datasets: [
        {
          label: "Performance (%)",
          data: [assignmentPercent, quizPercent, examPercent],
          backgroundColor: ["#087f77d3", "#087f7757", "#087f777e"],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          max: 100,
          beginAtZero: true,
          title: { display: true, text: "Percentage (%)" },
        },
      },
      plugins: {
        legend: { display: false },
      },
    },
  });

  chartAttendance = new Chart(document.getElementById("c-attendance"), {
    type: "bar",
    data: {
      labels: weeklyLabels,
      datasets: [
        {
          label: "Total Present",
          data: weeklyPresentDate,
          backgroundColor: "#087f78",
        },
      ],
    },
    options: { responsive: true, maintainAspectRatio: false },
  });

  chartAbsences = new Chart(document.getElementById("c-absences"), {
    type: "bar",
    data: {
      labels: weeklyLabels,
      datasets: [
        {
          label: "Total Absent",
          data: weeklyAbsentDate,
          backgroundColor: "#087f78",
        },
      ],
    },
    options: { responsive: true, maintainAspectRatio: false },
  });
}

updateDashboard(CopyselectedCourse, copyData);
