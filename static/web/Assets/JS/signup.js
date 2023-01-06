// Toggling password input type to show and hide password

const passwordIcon = document.querySelectorAll(".hide-password-icon");
var i;

for(i = 0; i < passwordIcon.length; i++) {
    passwordIcon[i].addEventListener("click", function() {
        const passwordField = this.previousElementSibling; 
        if(this.classList.contains("fa-eye")) {
            this.classList.remove("fa-eye");
            passwordField.type = "password";
        }
        else {
            this.classList.add("fa-eye");
            passwordField.type = "text";
        }
    })
}


// Signin Form Handling

async function signupForm(event){
    event.preventDefault()
    let form = event.currentTarget;
    let error = form.querySelector('.alert');
    let button = form.querySelector('button[type="submit"]');
    let button_text = button.innerText;
    showMsg(error, '', 'bg-danger', 'hide');
    let formData = new FormData(form)
    let data = formDataToObject(formData);
    let headers = {
        'Content-Type': 'application/json',
        'X-CSRFToken': data.csrfmiddlewaretoken,
    }
    
    if(data.organization.trim().length === 0) {
        showMsg(error, 'Organization name cannot be blank.', 'bg-danger', 'show');
    }
    else if(data.password.length < 8 || data.confirmpassword.length < 8){
        showMsg(error, 'Password must be atleast 8 characters.', 'bg-danger', 'show');
    }
    else if(data.confirmpassword != data.password){
        showMsg(error, 'Passwords does not match.', 'bg-danger', 'show');
    }else{
        beforeLoad(button, 'Processing');
        response = await requestAPI('/signup/', JSON.stringify(data), headers, 'POST')
        afterLoad(button, button_text);
        response.json().then(function(res){
            if(!res.success){
                showMsg(error, res.msg, 'bg-danger', 'show');
            }else{
                showMsg(error, res.msg, 'bg-success', 'show');
                setTimeout(()=>{
                    location.pathname = '/signin/';
                },1500)
            }
        })
    }
}