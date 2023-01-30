// Buy Modal controls

const buyModal = document.querySelector("#buy_modal");
const openBuyModalBtn = document.querySelector(".buy-modal-open-button");
const openBuyModalNavBtn = document.querySelector(".buy-modal-open-nav-button");
const minusBtn = buyModal.querySelector("#minus-btn");
const plusBtn = buyModal.querySelector("#plus-btn");
const productQuantity = buyModal.querySelector("#product-quantity");
const subTotal = buyModal.querySelector('#sub-total');
const monthlyPrice = buyModal.querySelector('#monthly-price');

function openBuyModal() {
  document.querySelector('.buy_modal').click();
  document.querySelector('body').classList.add('negate-padding');
}

if(openBuyModalBtn) {
  openBuyModalBtn.addEventListener("click", openBuyModal);
}
openBuyModalNavBtn.addEventListener("click", openBuyModal);

minusBtn.addEventListener("click", function(e){
  if(productQuantity.value  == 1){
    this.setAttribute("disabled", '');
    this.classList.add("cursor-not-allowed");
  }
  else{
    productQuantity.value = parseInt(productQuantity.value) - 1;
    subTotal.innerText = "$" + productQuantity.value * 1190;
    monthlyPrice.innerText = "$" + productQuantity.value * 1190;
    if(productQuantity.value  == 1){
      this.setAttribute("disabled", '');
      this.classList.add("cursor-not-allowed");
    }
  }
})

plusBtn.addEventListener("click", function(e) {
  productQuantity.value = parseInt(productQuantity.value) + 1;
  subTotal.innerText = "$" + productQuantity.value * 1190;
  monthlyPrice.innerText = "$" + productQuantity.value * 1190;
  if(minusBtn.hasAttribute("disabled")) {
    minusBtn.removeAttribute("disabled");
    this.classList.remove("cursor-not-allowed");
  }
})


// Product Checkout Handling

async function productCheckout(event) {
  event.preventDefault();
  let form = event.currentTarget;
  let formData = new FormData(form);
  let data = formDataToObject(formData);
  let error = buyModal.querySelector('.alert');
  showMsg(error, '', 'bg-danger', 'hide');
  let button = document.querySelector('.buy-modal-submit-btn');
  let button_text = button.innerText;
  let headers = {
    "Content-Type": "application/json",
    "X-CSRFToken": data.csrfmiddlewaretoken,
  };

  beforeLoad(button, "Processing");
  response = await requestAPI('/check-signin/', JSON.stringify(data), headers, 'POST' );
  response.json().then(async function (res) {
    if (!res.success) {
      showMsg(error, res.msg, 'bg-danger', 'show');
      afterLoad(button, button_text)
    } else {
        afterLoad(button, button_text)
        getPublicKey = await requestAPI('/config/', null, {}, 'GET');
        getPublicKey.json().then(async function (res) {
          if(res){
            const stripe = Stripe(res.publicKey);
            let checkout = await requestAPI(`/product-checkout/${data.quantity}/`, null, {}, 'GET');
            checkout.json().then(function (res) {
              if(res) {
                return stripe.redirectToCheckout({sessionId: res.checkout_session_id})
              }
            })
          }
        })
        // location.pathname = `product-checkout/${data.quantity}/`;
    }
  });
}