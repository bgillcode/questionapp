// Will clear the localstorage which includes the API key and then redirect the
// user back to the index page so they can log in again if they want to
function logout() {
  localStorage.clear();
  window.location = "index.html";
}
