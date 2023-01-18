// Buy Modal controls

const buyModal = document.querySelector(".buy-modal-container");
const overlay = document.querySelector(".overlay");
const openBuyModalBtn = document.querySelector(".buy-modal-open-button");
const openBuyModalNavBtn = document.querySelector(".buy-modal-open-nav-button");
const closeBuyModalBtn = document.querySelector(".close-buy-modal-button");

const openBuyModal = function () {
  buyModal.classList.remove("hidden");
  overlay.classList.remove("hidden");
};

openBuyModalNavBtn.addEventListener("click", openBuyModal);

const closeBuyModal = function () {
  buyModal.classList.add("hidden");
  overlay.classList.add("hidden");
};

closeBuyModalBtn.addEventListener("click", closeBuyModal);
// overlay.addEventListener("click", closeBuyModal);

// document.addEventListener("keydown", function (e) {
//   if (e.key === "Escape" && !buyModal.classList.contains("hidden")) {
//     closeBuyModal();
//   }
// });


// Only for additional button to open buy modal on index.html page

const homeModalOpenBtn = document.querySelector(".buy-modal-open-button");

if(homeModalOpenBtn) {
    homeModalOpenBtn.addEventListener("click", openBuyModal);
}


// Dynamically changing sub total price and monthly price
// as device quantity changes

const inputQuantity = buyModal.querySelector('#product-quantity');
const subTotal = buyModal.querySelector('#sub-total');
const monthlyPrice = buyModal.querySelector('#monthly-price');

function setTotalPrice() {
  subTotal.innerText = "$" + inputQuantity.value * 1190;
  monthlyPrice.innerText = "$" + inputQuantity.value * 1190;
}


// Product Checkout Handling

async function productCheckout(event) {
  event.preventDefault();
  let form = event.currentTarget;
  let formData = new FormData(form);
  let data = formDataToObject(formData);
  let toast = document.getElementById("buy-toast");
  let toastBody = toast.querySelector(".toast-body");
  let button = document.querySelector('.buy-modal-submit-btn');
  let button_text = button.innerText;
  let headers = {
    "Content-Type": "application/json",
    "X-CSRFToken": data.csrfmiddlewaretoken,
  };

  console.log(location.pathname)

  beforeLoad(button, "Processing");
  response = await requestAPI('/check-signin/', JSON.stringify(data), headers, 'POST' );
  afterLoad(button, button_text)
  response.json().then(function (res) {
    console.log(res);
    if (!res.success) {
      toast.classList.add('bg-danger');
      toastBody.innerText = res.msg;
      let myToast = new bootstrap.Toast(toast);
      myToast.show();
    } else {
        location.pathname = `product-checkout/${data.quantity}/`;
    }
  });
}