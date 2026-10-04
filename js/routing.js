const dynamic = document.querySelector(".Dynmic");
const name = document.getElementById("name");
const user = JSON.parse(localStorage.getItem("user"));

name.textContent = user.name;

function loadPage() {
  let page = location.hash;
  if (page === "#/students") {
    page = "student.html";
  } else if (page === "#/assignments") {
    page = "assignments.html";
  } else if (page === "#/quizzes") {
    page = "quizzes.html";
  } else if (page === "#/exams") {
    page = "exams.html";
  } else if (page === "#/grades") {
    page = "grades.html";
  } else if (page === "#/archive") {
    page = "archive.html";
  } else if (page === "#/login") {
    page = "login.html";
  } else if (page === "#/signUp") {
    page = "signUp.html";
  } else {
    page = "dashboard.html";
  }

  fetch("/pages/" + page)
    .then((response) => response.text())
    .then((data) => {
      dynamic.innerHTML = data;

      dynamic.querySelectorAll("script").forEach((oldScript) => {
        const newScript = document.createElement("script");

        if (oldScript.type) newScript.type = oldScript.type;

        if (oldScript.src) {
          newScript.src = oldScript.src + "?t=" + Date.now();
        } else {
          newScript.textContent = oldScript.textContent;
        }

        oldScript.replaceWith(newScript);
      });
    });
}

window.addEventListener("hashchange", loadPage);

loadPage();
