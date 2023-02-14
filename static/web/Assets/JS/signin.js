// Toggling password input type to show and hide password

const passwordIcon = document.querySelector(".hide-password-icon");
const passwordField = document.querySelector("#password-field");

function togglePasswordField() {
  if (passwordIcon.classList.contains("fa-eye")) {
    passwordIcon.classList.remove("fa-eye");
    passwordField.type = "password";
  } else {
    passwordIcon.classList.add("fa-eye");
    passwordField.type = "text";
  }
}

passwordIcon.addEventListener("click", togglePasswordField);



// Signin Form Handling

async function signinForm(event) {
  event.preventDefault();
  let form = event.currentTarget;
  let error = form.querySelector(".alert");
  let button = form.querySelector('button[type="submit"]');
  let button_text = button.innerText;
  showMsg(error, "", "bg-danger", "hide");
  let formData = new FormData(form);
  let data = formDataToObject(formData);
  let headers = {
    "Content-Type": "application/json",
    "X-CSRFToken": data.csrfmiddlewaretoken,
  };

  beforeLoad(button, "Processing");
  response = await requestAPI('/signin/', JSON.stringify(data), headers, 'POST' );
  afterLoad(button, button_text)
  response.json().then(function (res) {
    if (!res.success) {
      showMsg(error, res.msg, "bg-danger", "show");
    } else {
      location.pathname = "/map/";
    }
  });
}
