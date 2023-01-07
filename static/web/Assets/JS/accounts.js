// Accounts Form Handling

async function profileForm(event) {
  event.preventDefault();
  let form = event.currentTarget;
  let error = form.querySelector(".alert");
  let button = form.querySelector('button[type="submit"]');
  let button_text = button.innerText;
  showMsg(error, "", "bg-danger", "hide");
  let formData = new FormData(form);
  console.log();
  let headers = {
    // "Content-Type": "application/json",
    "X-CSRFToken": data.csrfmiddlewaretoken,
  };

  beforeLoad(button, "Processing");
  response = await requestAPI(location.pathname, formData, headers, 'POST' );
  afterLoad(button, button_text);
  console.log(response);
  response.json().then(function (res) {
    if (!res.success) {
      showMsg(error, res.msg, "bg-danger", "show");
    } else {
      location.pathname = `${location.pathname}`;
    }
  });
}


// Add User Form Handling

async function addUserForm(event) {
    event.preventDefault();
    let form = event.currentTarget;
    let error = form.querySelector(".alert");
    let button = document.querySelector('.add-user-btn');
    let button_text = button.innerText;
    showMsg(error, "", "bg-danger", "hide");
    let formData = new FormData(form);
    let data = formDataToObject(formData);
    console.log(data);
    let headers = {
      "Content-Type": "application/json",
      "X-CSRFToken": data.csrfmiddlewaretoken,
    };
  
    beforeLoad(button, "Processing");
    response = await requestAPI('/invite_organization/', JSON.stringify(data), headers, 'POST' );
    afterLoad(button, button_text);
    // console.log(response);
    response.json().then(function (res) {
        console.log(res);
    //   if (!res.success) {
    //     showMsg(error, res.msg, "bg-danger", "show");
    //   } else {
    //     location.pathname = `${location.pathname}`;
    //   }
    });
  }