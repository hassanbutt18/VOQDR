// Preview Image on profile form

function previewImage(event) {
  let image = event.currentTarget.files;
  let imageTag = document.getElementById('profile-image');
  imageTag.src = window.URL.createObjectURL(image[0]);
}


// Accounts Form Handling

async function profileForm(event) {
  event.preventDefault();
  let form = event.currentTarget;
  let error = form.querySelector(".alert");
  let button = form.querySelector('button[type="submit"]');
  let button_text = button.innerText;
  showMsg(error, "", "bg-danger", "hide");
  let formData = new FormData(form);
  let data = formDataToObject(formData) 
  let headers = {
    // "Content-Type": "application/json",
    "X-CSRFToken": data.csrfmiddlewaretoken,
  };

  beforeLoad(button, "Processing");
  response = await requestAPI(location.pathname, formData, headers, 'POST' );
  afterLoad(button, button_text);
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
    let button = document.querySelector('.add-user-btn');
    let button_text = button.innerText;
    let toast = document.getElementById("toast");
    let toastBody = toast.querySelector(".toast-body");
    let formData = new FormData(form);
    let data = formDataToObject(formData);
    let headers = {
      "Content-Type": "application/json",
      "X-CSRFToken": data.csrfmiddlewaretoken,
    };
  
    beforeLoad(button, "Processing");
    response = await requestAPI('/invite_organization/', JSON.stringify(data), headers, 'POST' );
    afterLoad(button, button_text);
    response.json().then(function (res) {
      if(!res.success) {
        if(toast.classList.contains('bg-success')){
          toast.classList.remove('bg-success')
        }
        toast.classList.add('bg-danger');
        toastBody.innerText = res.msg;
      }
      else{
        if(toast.classList.contains('bg-danger')){
          toast.classList.remove('bg-danger')
        }
        toast.classList.add('bg-success');
        toastBody.innerText = res.msg;
      }
      let myToast = new bootstrap.Toast(toast);
      myToast.show();
    });
  }


// Dynamically changing organization and permissions

async function changeOrganization(event){
  let organization = event.currentTarget.value;
  let form = event.target.closest('form');
  let organization_name = form.querySelector('input[name="organization"]');
  let address = form.querySelector('input[name="address"]');
  let button = form.querySelector('button[type="submit"]');
  response = await requestAPI(`/get-organization-details/${organization}/`, null, {}, 'GET' );
  response.json().then(function (res) {
    organization_name.value = res.organization;
    address.value = res.address;
    if(res.role) {
      if(res.role != 'admin'){
        organization_name.readOnly = true;
        address.readOnly = true;
        button.classList.add('hide');
      }else{
        organization_name.readOnly = false;
        address.readOnly = false;
        button.classList.remove('hide');
      }
    }
  });
}


// Edit Organization Details Form Handling

async function editOrgForm(event) {
  event.preventDefault();
  let form = event.currentTarget;
  let button = form.querySelector('button[type="submit"]');
  let button_text = button.innerText;
  let toast = document.getElementById("toast");
  let toastBody = toast.querySelector(".toast-body");
  let formData = new FormData(form);
  let data = formDataToObject(formData);
  let headers = {
    "Content-Type": "application/json",
    "X-CSRFToken": data.csrfmiddlewaretoken,
  };

  beforeLoad(button, "Processing");
  response = await requestAPI(`/edit-organization-details/${data.organization_id}`, JSON.stringify(data), headers, 'POST' );
  afterLoad(button, button_text);
  response.json().then(function (res) {
    if (!res.success) {
      toast.classList.add('bg-danger');
      toastBody.innerText = res.msg;
    }
    else{
      location.pathname = `${location.pathname}`;
    }
    let myToast = new bootstrap.Toast(toast);
    myToast.show();
  });
}


// Opening Shared With Edit Role Modal

function editOrganizationRoleModal(event, id, modal_id) {
  let modal = document.querySelector(`#${modal_id}`);
  modal.querySelector('form').setAttribute('onsubmit', `editOrganizationRole(event, ${id})`);
  document.querySelector(`.${modal_id}`).click();
}

// Edit Shared With Organization Role Form Handling

async function editOrganizationRole(event, id){
  event.preventDefault()
  let form = event.currentTarget;
  let button = form.querySelector('button[type="submit"]');
  let button_text = button.innerText;
  let formData = new FormData(form);
  let data = formDataToObject(formData);
  let headers = {
    "Content-Type": "application/json",
    "X-CSRFToken": data.csrfmiddlewaretoken,
  }
  beforeLoad(button, "Saving");
  response = await requestAPI(`/edit-organization-role/${id}`, JSON.stringify(data), headers, 'POST' );
  afterLoad(button, button_text);
  response.json().then(function (res) {
    console.log(res);
    if (!res.success) {
      console.log(res.msg);
    }
    else{
      location.pathname = `${location.pathname}`;
    }
  });
}


// Opening Delete Organization Modal

function deleteOrganizationModal(event, id, modal_id){
  let modal = document.querySelector(`#${modal_id}`);
  modal.querySelector('form').setAttribute('onsubmit', `deleteOrganization(event, ${id})`);
  document.querySelector(`.${modal_id}`).click();
}


// Delete Organization Form Handling

async function deleteOrganization(event, id){
  event.preventDefault();
  let form = event.currentTarget;
  let button = form.querySelector('button[type="submit"]');
  let button_text = button.innerText;
  let formData = new FormData(form);
  let data = formDataToObject(formData);
  let headers = {
    "Content-Type": "application/json",
    "X-CSRFToken": data.csrfmiddlewaretoken,
  }
  beforeLoad(button, "Processing");
  response = await requestAPI(`/remove-shared-organization/${id}/`, null, headers, 'DELETE' );
  afterLoad(button, button_text);
  response.json().then(function (res) {
    if (res.success) {
      location.pathname = `${location.pathname}`
    }
  });
}
