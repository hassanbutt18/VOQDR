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



// Organisation Container controls

const orgContainer = document.querySelector(".hide-organisations")
const orgHeader = document.querySelector(".organisation-container-header");
const orgHeaderChevronUp = document.querySelector(".organisation-chevron-up");
const orgHeaderChevronDown = document.querySelector(
  ".organisation-chevron-down"
);


function toggleOrganisations () {
  if(orgContainer.classList.contains("show-organisations")) {
    orgContainer.classList.remove("show-organisations");
    orgHeaderChevronDown.classList.remove("hide-chevron");
    orgHeaderChevronUp.classList.remove("show-chevron");
  }
  else {
    orgContainer.classList.add("show-organisations");
    orgHeaderChevronDown.classList.add("hide-chevron");
    orgHeaderChevronUp.classList.add("show-chevron");
  }
}

orgHeader.addEventListener("click", toggleOrganisations);


// Device Container controls

const deviceContainer = document.querySelector(".hide-devices");
const devicesHeader = document.querySelector(".device-container-header");
const devicesHeaderText = document.querySelector(".devices-header-text");
const devicesHeaderChevronUp = document.querySelector(".devices-chevron-up");
const devicesHeaderChevronDown = document.querySelector(
  ".devices-chevron-down"
);


function toggleDevices() {
  if (deviceContainer.classList.contains("show-devices")) {
    deviceContainer.classList.remove("show-devices");
    devicesHeaderText.textContent = "Show Device";
    devicesHeaderChevronDown.classList.remove("hide-chevron");
    devicesHeaderChevronUp.classList.remove("show-chevron");
  } else {
    deviceContainer.classList.add("show-devices");
    devicesHeaderText.textContent = "Hide Device";
    devicesHeaderChevronDown.classList.add("hide-chevron");
    devicesHeaderChevronUp.classList.add("show-chevron");
  }
}

devicesHeader.addEventListener("click", toggleDevices);



// Device List Controls

const devices = document.getElementsByClassName("device-header");
var i;

for (i = 0; i < devices.length; i++) {
  devices[i].addEventListener("click", function() {
    const chevronDown = this.children[1];
    const chevronUp = this.children[2];
    var panel = this.nextElementSibling;
    if (panel.style.display === "block") {
      panel.style.display = "none";
      chevronDown.classList.remove("hide-single-device-chevron");
      chevronUp.classList.remove("show-single-device-chevron");
    } else {
      panel.style.display = "block";
      chevronDown.classList.add("hide-single-device-chevron");
      chevronUp.classList.add("show-single-device-chevron");
    } 
  });
}



// Delete Device Modal controls

const modal = document.querySelector(".modal-container");
const overlay = document.querySelector(".overlay");
const closeModalBtn = document.querySelector(".close-button");

const openModal = function () {
  modal.classList.remove("hidden");
  overlay.classList.remove("hidden");
};


const closeModal = function () {
  modal.classList.add("hidden");
  overlay.classList.add("hidden");
};

closeModalBtn.addEventListener("click", closeModal);
overlay.addEventListener("click", () => {
  closeModal();
  CloseEditModal();
  closeBuyModal();
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && !modal.classList.contains("hidden")) {
    modalClose();
  }
});


const deviceAdditionalOptions = document.getElementsByClassName("additional-option-btn");
var j;

for(j = 0; j < deviceAdditionalOptions.length; j++) {
  deviceAdditionalOptions[j].addEventListener("click", function() {
    if(this.parentElement.parentElement.nextElementSibling.classList.contains("show-additional-options")) {
      this.parentElement.parentElement.nextElementSibling.classList.remove("show-additional-options");
    }
    else{
      this.parentElement.parentElement.nextElementSibling.classList.add("show-additional-options");
      const ShowModal = this.parentElement.parentElement.nextElementSibling.childNodes[1].children[1];
      ShowModal.addEventListener("click", openModal);
    }
  })
}




// Edit Device Description Modal

const EditModal = document.querySelector(".edit-device-modal");
const CancelEditModal = document.querySelector(".edit-cancel-btn");

const OpenEditModal = function () {
  EditModal.classList.remove("hidden");
  overlay.classList.remove("hidden");
}

const CloseEditModal = function () {
  EditModal.classList.add("hidden");
  overlay.classList.add("hidden");
}

CancelEditModal.addEventListener("click", CloseEditModal);

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && !EditModal.classList.contains("hidden")) {
    CloseEditModal();
  }
});


const EditBtn = document.getElementsByClassName("edit-btn");
var k;

for(k = 0; k < EditBtn.length; k++) {
  EditBtn[k].addEventListener("click", OpenEditModal);
}



// Buy Modal controls

const buyModal = document.querySelector(".buy-modal-container");
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