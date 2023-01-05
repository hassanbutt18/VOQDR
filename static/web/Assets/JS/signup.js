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