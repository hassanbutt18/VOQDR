// Slider for testimonial section

var swiper = new Swiper(".mySwiper", {
  slidesPerView: 1,
  spaceBetween: 30,
  loop: true,
  autoplay: {
    delay:5000,
  },
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
});


// Contact-Us Form Handling

async function contactUsForm(event) {
  event.preventDefault();
  let form = event.currentTarget;
  let error = form.querySelector(".alert");
  let button = form.querySelector('button[type="submit"]');
  let button_text = button.innerText;
  showMsg(error, "", "bg-danger", "hide");
  let formData = new FormData(form);
  let data = formDataToObject(formData) 
  let headers = {
    "Content-Type": "application/json",
    "X-CSRFToken": data.csrfmiddlewaretoken,
  };

  beforeLoad(button, "Processing");
  response = await requestAPI('/contact-us/', JSON.stringify(data), headers, 'POST' );
  afterLoad(button, button_text);
  response.json().then(function (res) {
    if (!res.success) {
      showMsg(error, 'Email was not sent, please try again.', "bg-danger", "show");
    } else {
      showMsg(error, res.msg, "bg-success", "show");
    }
  });
}