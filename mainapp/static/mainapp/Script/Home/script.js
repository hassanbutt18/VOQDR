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


// Navbar controls

  const menu = document.querySelector(".nav-links");
  const menuItems = document.querySelectorAll(".nav-items");
  const hamburger = document.querySelector(".hamburger");
  const closeIcon = document.querySelector(".closeIcon");
  closeIcon.style.display = "none";
  const menuIcon = document.querySelector(".menuIcon");

  // menuItems.forEach((item, i) => {
  //   item.setAttribute('id','active-link');
  //   console.log(item);
  // });

  function toggleMenu() {
    if (menu.classList.contains("showMenu")) {
      menu.classList.remove("showMenu");
      hamburger.classList.remove("hamburger-enabled");
      closeIcon.style.display = "none";
      menuIcon.style.display = "block";
    } else {
      menu.classList.add("showMenu");
      closeIcon.style.display = "block";
      hamburger.classList.add("hamburger-enabled");
      menuIcon.style.display = "none";
    }
  }

  hamburger.addEventListener("click", toggleMenu);

  menuItems.forEach(function (menuItem) {
    menuItem.addEventListener("click", toggleMenu);
  });


// Modal controls

const modal = document.querySelector(".modal-container");
const overlay = document.querySelector(".overlay");
const openModalBtn = document.querySelector(".modal-open-button");
const closeModalBtn = document.querySelector(".close-button");

const openModal = function () {
  modal.classList.remove("hidden");
  overlay.classList.remove("hidden");
};

openModalBtn.addEventListener("click", openModal);

const closeModal = function () {
  modal.classList.add("hidden");
  overlay.classList.add("hidden");
};

closeModalBtn.addEventListener("click", closeModal);
overlay.addEventListener("click", closeModal);

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && !modal.classList.contains("hidden")) {
    modalClose();
  }
});