export function validation(passwordInput, teacherArr, userNameInput) {
  const username = userNameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) {
    alert("Please fill all fields");
    return;
  }

  const user = teacherArr.find((p) => p.username === username);

  if (!user) {
    alert("User not found");
    return;
  }

  if (user.password === password) {
    localStorage.setItem("user", JSON.stringify(user));
    window.location.href = "../index.html"; // عدلت المسار
  } else {
    alert("Wrong password");
  }
}
