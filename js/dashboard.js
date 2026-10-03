fetch("/json/db.json")
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    let teacherId = 1; // cookie
    let teacherCourseIds = [];

    data.courses.forEach(function (course) {
      if (course.teacherId == teacherId) {
        teacherCourseIds.push(Number(course.id));
      }
    });

    let totalPresent = 0;
    let totalAbsent = 0;
    let totalGradeExams = 0;
    let examCount = 0;
    let examDeadLine = 0;

    let dateTracker = {};

    let uniqueStudents = new Set();

    data.students.forEach(function (student) {
      if (student.courses) {
        student.courses.forEach(function (studentCourse) {
          let isMyCourse = teacherCourseIds.includes(studentCourse.courseId);

          if (isMyCourse) {
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
          }
        });
      }
    });

    let sortedDates = Object.keys(dateTracker).sort();

    let allPresentDays = sortedDates.map(function (date) {
      return dateTracker[date].present;
    });

    let allAbsentDays = sortedDates.map(function (date) {
      return dateTracker[date].absent;
    });

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

    // document.getElementById("absences-today").innerHTML = totalAbsent;

    // Row 2

    new Chart(document.getElementById("c-average-grades"), {
      type: "bar",
      data: {
        labels: ["My Courses Avg"],
        datasets: [
          {
            label: "Avg Grade (Deadline: " + examDeadLine + ")",
            data: [examCount > 0 ? totalGradeExams / examCount : 0],
            backgroundColor: "#4caf50",
          },
        ],
      },
      options: { scales: { y: { max: 50, beginAtZero: true } } },
    });
  });
