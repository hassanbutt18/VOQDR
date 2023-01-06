// Handling Verify Code Form

async function verifyCodeForm(event) {
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

    let url = String(window.location.pathname);
    let token = url.split('/verify_code/')[1];
    data.token = token;
    beforeLoad(button, "Processing");
    response = await requestAPI(`/verify_code/${token}`, JSON.stringify(data), headers, "POST");
    afterLoad(button, button_text);
    response.json().then(function (res) {
      console.log(res);
      if (!res.success) {
        showMsg(error, res.msg, "bg-danger", "show");
      } else {
        location.pathname = `/reset_password/${res.token}`;
      }
    });

  }

  
async function resendCode(event){
    event.preventDefault();
    let resend_btn = event.currentTarget;
    let button_text = resend_btn.innerText;
    let url = String(window.location.pathname);
    let token = url.split('/verify_code/')[1];
    beforeLoad(resend_btn, "Processing");
    response = await requestAPI(`/resend-code/${token}`, null, {}, "GET");
    afterLoad(resend_btn, button_text);
    response.json().then(function (res) {
        location.pathname = `/verify_code/${res.token}`;
    });
}