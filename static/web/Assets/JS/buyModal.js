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
overlay.addEventListener("click", closeBuyModal);

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && !buyModal.classList.contains("hidden")) {
    closeBuyModal();
  }
});


// Only for additional button on index.html page

const homeModalOpenBtn = document.querySelector(".buy-modal-open-button");

if(homeModalOpenBtn) {
    homeModalOpenBtn.addEventListener("click", openBuyModal);
}