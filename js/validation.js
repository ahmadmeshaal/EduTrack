export function validation(username, password) {
  if (!username || !password) {
    alert("Please fill all fields");
    return false;
  }
  return true;
}
