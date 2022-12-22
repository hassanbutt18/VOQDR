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