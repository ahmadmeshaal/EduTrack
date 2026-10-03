var chartGrades = null;
var chartAttendance = null;
var chartAbsences = null;

fetch("/json/db.json")
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    let logInTeacherId = 2; // cookie
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
  let totalPresent = 0,
    totalAbsent = 0;
  let totalGradeExams = 0,
    examCount = 0;

  let examDeadLine = 0;
  let dateTracker = {};

  let uniqueStudents = new Set();

  data.students.forEach(function (student) {
    if (student.courses) {
      student.courses.forEach(function (studentCourse) {
        if (studentCourse.courseId == selectedCourse) {
          uniqueStudents.add(student.id);

          if (studentCourse.exam) {
            totalGradeExams += studentCourse.exam.grade;
            examCount++;
            examDeadLine = new Date(
              studentCourse.exam.deadline,
            ).toLocaleDateString();
          }

          totalPresent += studentCourse.attendance.daysPresent;
          totalAbsent += studentCourse.attendance.daysAbsent;
        }

        studentCourse.attendance.presentDates.forEach(function (date) {
          if (!dateTracker[date]) {
            dateTracker[date] = { present: 0, absent: 0 };
          }
          dateTracker[date].present++;
        });

        studentCourse.attendance.absentDates.forEach(function (date) {
          if (!dateTracker[date]) {
            dateTracker[date] = { present: 0, absent: 0 };
          }
          dateTracker[date].absent++;
        });
      });
    }
  });
  // =======================================================
  // configure dates for draw a charts

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

  chartGrades = new Chart(document.getElementById("c-average-grades"), {
    type: "pie",
    data: {
      labels: ["Average Grade"],
      datasets: [
        {
          label: "Avg Grade",
          data: [examCount > 0 ? totalGradeExams / examCount : 0],
          backgroundColor: "#087f78",
        },
      ],
    },
    options: { scales: { y: { max: 50, beginAtZero: true } } },
    responsive: true,
    maintainAspectRatio: false,
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

    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
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

    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}
