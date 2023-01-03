// Toggling password input type to show and hide password

const passwordIcon = document.querySelector(".hide-password-icon");
const passwordField = document.querySelector("#password-field");

function togglePasswordField() {
    if(passwordIcon.classList.contains("fa-eye")) {
        passwordIcon.classList.remove("fa-eye");
        passwordField.type = "password";
    }
    else {
        passwordIcon.classList.add("fa-eye");
        passwordField.type = "text";
    }
}


passwordIcon.addEventListener("click", togglePasswordField);