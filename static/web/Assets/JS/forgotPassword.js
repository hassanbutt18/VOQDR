// Handling Forgot Pasword Form

async function forgotPasswordForm(event) {
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
  response = await requestAPI("/forgot_password/", JSON.stringify(data), headers, "POST");
  afterLoad(button, button_text);
  response.json().then(function (res) {
    if (!res.success) {
      showMsg(error, res.msg, "bg-danger", "show");
    } else {
      location.pathname = `/verify_code/${res.token}`;
    }
  });
}
