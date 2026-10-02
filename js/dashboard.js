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

    let dateTracker = {};

    let uniqueStudents = new Set();

    data.students.forEach(function (student) {
      student.courses.forEach(function (studentCourse) {
        let isMyCourse = teacherCourseIds.includes(studentCourse.courseId);

        if (isMyCourse) {
          uniqueStudents.add(student.id);

          if (studentCourse.exam) {
            totalGradeExams += studentCourse.exam.grade;
            examCount++;
            examDeadLine = new Date(course.exam.deadline).toLocaleDateString();
          }

          totalPresent += course.attendance.daysPresent;
          totalAbsent += course.attendance.daysAbsent;

          studentCourse.attendance.presentDates.forEach(function (date) {
            if (!dateTracker[date]) {
              dateTracker[data] = { present: 0, absent: 0 };
            }
            dateTracker[data].present++;
          });

          studentCourse.attendance.absentDates.forEach(function (date) {
            if (!dateTracker[date]) {
              dateTracker[data] = { present: 0, absent: 0 };
            }
            dateTracker[data].absent++;
          });
        }
      });
    });

    let sortedDates = Object.keys(dateTracker).sort();

    let allPresentDays = sortedDates.map(function (date) {
      return dateTracker[date].present;
    });

    let allAbsentDays = sortedDates.map(function (date) {
      return dateTracker[date].absent;
    });

    // Row 1
    document.getElementById("total-student").innerHTML = data.students.length;

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
    const ctx = document.getElementById("c-attendance");

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
        datasets: [
          {
            label: "# of Votes",
            data: [12, 19, 3, 5, 2, 3],
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  });
