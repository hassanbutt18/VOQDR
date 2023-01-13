// Organisation Container controls

const orgContainer = document.querySelector(".hide-organisations");
const orgHeader = document.querySelector(".organisation-container-header");
const orgHeaderChevronUp = document.querySelector(".organisation-chevron-up");
const orgHeaderChevronDown = document.querySelector(
  ".organisation-chevron-down"
);

function toggleOrganisations() {
  if (orgContainer.classList.contains("show-organisations")) {
    orgContainer.classList.remove("show-organisations");
    orgHeaderChevronDown.classList.remove("hide-chevron");
    orgHeaderChevronUp.classList.remove("show-chevron");
  } else {
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
  devices[i].addEventListener("click", function () {
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

const deviceAdditionalOptions = document.getElementsByClassName(
  "additional-option-btn"
);
var j;

for (j = 0; j < deviceAdditionalOptions.length; j++) {
  deviceAdditionalOptions[j].addEventListener("click", function () {
    if (
      this.parentElement.parentElement.nextElementSibling.classList.contains(
        "show-additional-options"
      )
    ) {
      this.parentElement.parentElement.nextElementSibling.classList.remove(
        "show-additional-options"
      );
    } else {
      this.parentElement.parentElement.nextElementSibling.classList.add(
        "show-additional-options"
      );
      const ShowModal =
        this.parentElement.parentElement.nextElementSibling.childNodes[1]
          .children[1];
      ShowModal.addEventListener("click", openModal);
    }
  });
}



// Edit Device Description Modal

const EditModal = document.querySelector(".edit-device-modal");
const CancelEditModal = document.querySelector(".edit-cancel-btn");
const EditModalDeviceText = document.querySelector(".edit-modal-device-text");
const EditModalText = document.querySelector(".edit-modal-text");

const OpenEditModal = function () {
  EditModal.classList.remove("hidden");
  overlay.classList.remove("hidden");
};

const CloseEditModal = function () {
  EditModal.classList.add("hidden");
  overlay.classList.add("hidden");
};

CancelEditModal.addEventListener("click", CloseEditModal);

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && !EditModal.classList.contains("hidden")) {
    CloseEditModal();
  }
});


const EditBtn = document.getElementsByClassName("edit-btn");
var k;

for (k = 0; k < EditBtn.length; k++) {
  EditBtn[k].addEventListener("click", function () {
    let currentDeviceName = this.parentElement.parentElement.previousElementSibling.childNodes[0].nextElementSibling.children[1].innerText;
    let currentDeviceDescription = this.previousElementSibling.innerText;

    EditModalDeviceText.value = currentDeviceName;
    EditModalText.value = currentDeviceDescription;
    OpenEditModal();
  });
}



// Maps Script

// Initializing Maps
var map = L.map("maps", {center: [31.46, 74.2549209], zoom: 11});



// Adding Tiles(roads, buildings, locations, etc.)

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);



// Making custom marker icon

var markerIcon = L.icon({
  iconUrl: "/static/web/Assets/Images/MapMarker.png",
  iconAnchor: [10, 30],
});



// Adding markers to the map

var marker = L.marker([31.46, 74.28], { icon: markerIcon });

var popup = L.popup().setContent(
  "<strong>Device:</strong> nrf-352656101124371 <br/><br/> <strong>Last seen:</strong> Dec 23, 11:05 AM"
);


var circleRadius = L.circleMarker([31.4503609, 74.2549209], {
  fillColor: "rgba(217, 40, 99, 0.4)",
  fillOpacity: 1,
  color: "transparent",
  radius: 75,
});

var circleOuterRadius = L.circleMarker([31.4503609, 74.2549209], {
  fillColor: "rgba(217, 40, 99, 0.15)",
  fillOpacity: 1,
  color: "transparent",
  radius: 100,
});

var circle = L.circleMarker([31.4503609, 74.2549209], {
  fillColor: "#d92863",
  fillOpacity: 1,
  color: "transparent",
  radius: 50,
  zIndex: 3,
});


circle.bindPopup(
    "<strong>Device:</strong> nrf-352656101124371 <br/><br/> <strong>Last seen:</strong> Dec 23, 11:05 AM"
  );

var markerGroup = L.featureGroup([marker, circleRadius, circleOuterRadius, circle]).addTo(map);



// Method to get your current position

// navigator.geolocation.getCurrentPosition(getPosition);

// function getPosition (position) {
//   console.log(position);
// }




// Displaying route on the map from one location to another
// using the plugin leaflet routing machine

L.Routing.control({
  waypoints: [
    L.latLng(marker._latlng.lat, marker._latlng.lng),
    L.latLng(circle._latlng.lat, circle._latlng.lng),
  ],
  lineOptions: {
    styles: [{ color: "#d92863", weight: 3 }],
  },
  createMarker: function () {
    return null;
  },
}).addTo(map);