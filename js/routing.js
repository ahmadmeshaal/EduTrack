 const dynamic = document.querySelector(".Dynmic");

      function loadPage() {
        let page = location.hash;
        if (page === "#/students") {
          page = "../pages/student.html";
        } else if (page === "#/assignments") {
          page = "assignments.html";
        } else if (page === "#/quizzes") {
          page = "quizzes.html";
        } else if (page === "#/exams") {
          page = "exams.html";
        } else if (page === "#/grades") {
          page = "grades.html";
        } else {
          page = "dashboard.html";
        }

        fetch("/pages/" + page)
          .then((response) => response.text())
          .then((data) => {
            dynamic.innerHTML = data;
          });
      }

      window.addEventListener("hashchange", loadPage);

      loadPage();