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
 
  // Device3 controls

  const device3 = document.querySelector(".hide-device3");
  const devicesHeader = document.querySelector(".devicesHeader");
  const devic3HeaderText = document.querySelector(".device3-header-text");
  const device3HeaderChevronUp = document.querySelector(".device3-chevron-up");
  const device3HeaderChevronDown = document.querySelector(".device3-chevron-down");
  const device3BatteryIndicator = document.querySelector(".device3-battery-indicator");

  function toggleDevice3() {
    if(device3.classList.contains("show-device3")){
      device3.classList.remove("show-device3");
      devic3HeaderText.textContent = 'Show Device';
      device3HeaderChevronDown.classList.remove("hide-chevron");
      device3HeaderChevronUp.classList.remove("show-chevron");
    }
    else {
      device3.classList.add("show-device3");
      devic3HeaderText.textContent = 'Hide Device';
      device3HeaderChevronDown.classList.add("hide-chevron");
      device3HeaderChevronUp.classList.add("show-chevron");
    }
  }

  devicesHeader.addEventListener("click", toggleDevice3);


  // Modal controls

const modal = document.querySelector(".modal-container");
const overlay = document.querySelector(".overlay");
const openModalBtn = document.querySelector(".del-btn");
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