export function signupValidation(
  nameInput,
  usernameInput,
  passwordInput,
  users,
) {
  const name = nameInput.value.trim();
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!name || !username || !password) {
    alert("Please fill all fields");
    return;
  }

  const userExists = users.find((u) => u.username === username);

  if (userExists) {
    alert("Username already exists");
    return;
  }

  const newUser = {
    id: Date.now().toString(),
    name,
    username,
    password,
  };

  fetch("http://localhost:3001/teachers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newUser),
  })
    .then(() => {
      alert("Account created successfully");
      window.location.href = "../pages/login.html";
    })
    .catch(() => {
      alert("Error while creating account");
    });
}
