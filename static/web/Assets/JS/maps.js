window.onload = () => {
  initializeMap();
  loadMapControls();
  getAuthToken();
}

let token = null;

async function getAuthToken() {
  response = await requestAPI('/get-auth-token/', null, {}, 'GET');
  response.json().then(function(res) {
    token = res.token;
  })
}


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



function loadMapControls() {

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


  const deviceAdditionalOptions = document.getElementsByClassName(
    "additional-option-btn"
  );
  var j;

  for (j = 0; j < deviceAdditionalOptions.length; j++) {
    deviceAdditionalOptions[j].addEventListener("click", function () {
      let currentAdditionalOptions = this.parentElement.parentElement.nextElementSibling;
      if (currentAdditionalOptions.classList.contains("show-additional-options")) {
        currentAdditionalOptions.classList.remove("show-additional-options");
      } else {
        currentAdditionalOptions.classList.add("show-additional-options");
      }
    });
  }
}


async function refreshDevices(){
  response = await requestAPI('/refresh-devices/', null, {}, 'GET');
  response.json().then(function(res) {
    if(res) {
      let deviceContainer = document.querySelector('#devices-container');
      deviceContainer.innerHTML = res.html;
      loadMapControls();
    }
  })
}


// Opening Edit Device Description Modal

function editDeviceDescriptionModal(event, modal_id) {
  let modal = document.querySelector(`#${modal_id}`);
  document.querySelector(`.${modal_id}`).click();
}


// Opening Edit Device Name Modal

function editDeviceNameModal(event, id, device_name, modal_id) {
  let modal = document.querySelector(`#${modal_id}`);
  let form = modal.querySelector('form');
  let deviceName =  form.querySelector('input[name="name"]');
  deviceName.value = device_name;
  form.setAttribute('onsubmit', `editDeviceNameForm(event, '${id}')`);
  document.querySelector(`.${modal_id}`).click();
}


// Edit Device Name Form Handling

async function editDeviceNameForm(event, id) {
  event.preventDefault();
  let form = event.currentTarget;
  let button = form.querySelector('button[type="submit"]');
  let button_text = button.innerText;
  let formData = new FormData(form);
  let data = formDataToObject(formData);
  headers = {
    'Authorization': `Bearer ${token}`
  };
  beforeLoad(button, "Saving");
  apiResponse = await requestAPI(`https://api.nrfcloud.com/v1/devices/${id}/${data.name}`, null, headers, 'PUT');
  if(apiResponse.status == 200) {
    refreshDevices();
    afterLoad(button, button_text);
    form.querySelector('#closeEditNameModal').click();
  }
}


// Opening Delete Device Modal

function deleteDeviceModal(event, modal_id) {
  let modal = document.querySelector(`#${modal_id}`);
  document.querySelector(`.${modal_id}`).click();
}


// Initializing Maps

// Method to get your current position

navigator.geolocation.getCurrentPosition(getPosition);

var myLocation = {}
console.log(localStorage.getItem("myLocation"));
function getPosition (position) {
  myLocation.lat = position.coords.latitude;
  myLocation.lng = position.coords.longitude;
  myLocation.accuracy = position.coords.accuracy;
  localStorage.setItem("myLocation", JSON.stringify(myLocation));
  console.log(localStorage.getItem("myLocation"));
}

async function initializeMap() {
  let loc = JSON.parse(localStorage.getItem("myLocation"));
  if(loc == null || typeof(loc) == undefined || loc == undefined || loc.lat == null || loc.lng == null || typeof(loc.lat) == undefined || typeof(loc.lng) == undefined || loc.lat == undefined || loc.lng == undefined) {
    response = await requestAPI('https://ipinfo.io/json', null, {}, 'GET');
    response.json().then(function(res) {
      [myLocation.lat, myLocation.lng]= res.loc.split(',');
      localStorage.setItem("myLocation", JSON.stringify(myLocation));
      getMap();
    })
  }
  else{
    getMap();
  }
}

function getMap() {
  let loc = JSON.parse(localStorage.getItem("myLocation")) || {};
  map = L.map("maps", {center: [loc.lat, loc.lng], zoom: 14});

  // Adding Tiles(roads, buildings, locations, etc.)

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
}


// Making custom marker icon

var markerIcon = L.icon({
  // iconUrl: "/static/web/Assets/Images/MapMarker.png",
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  iconAnchor: [10, 30],
});


// Get Locations for routing

async function getRouting() {
  headers = {
    'Authorization': `Bearer ${token}`
  };
  response = await requestAPI('https://api.nrfcloud.com/v1/location/history?deviceId=nrf-351516172549545', null, headers, 'GET');
  response.json().then(function (res) {
    if (res) {
      routing(res.items);
    }
    else{
      console.log("No response");
    }
  });
}


// Adding Routes 

function routing(deviceLocations) {
  if(map) {
    map.invalidateSize();
  }

  var lastLocation = deviceLocations[0];
  var firstLocation = deviceLocations.at(-1);
  var marker = L.marker([firstLocation.lat, firstLocation.lon], {icon: markerIcon});

  // var radius = lastLocation.uncertainty;
  // var innerRadius = radius / 2;
  
  var circleOuterRadius = L.circle([lastLocation.lat, lastLocation.lon], {
    fillColor: "rgba(217, 40, 99, 0.15)",
    fillOpacity: 1,
    color: "transparent",
    radius: 75,
  });


  var circleRadius = L.circle([lastLocation.lat, lastLocation.lon], {
    fillColor: "rgba(217, 40, 99, 0.4)",
    fillOpacity: 1,
    color: "transparent",
    radius: 50,
  });

  var circle = L.circle([lastLocation.lat, lastLocation.lon], {
    fillColor: "#d92863",
    fillOpacity: 1,
    color: "transparent",
    radius: 35,
    zIndex: 3,
  });

  circle.bindPopup(
      `<strong>Device:</strong> ${lastLocation.deviceId} <br/><br/> <strong>Last seen:</strong> ${lastLocation.insertedAt}`
    );

  var markerGroup = L.featureGroup([marker, circleRadius, circleOuterRadius, circle]).addTo(map);
  map.fitBounds(markerGroup.getBounds(), {padding: L.point(50, 50)});

  var waypoints = [];
  for(var j = 0; j < deviceLocations.length; j = j + 1) {
    waypoints.push(L.latLng(deviceLocations[j].lat, deviceLocations[j].lon));
  }

  // Displaying route on the map from one location to another
  // using the plugin leaflet routing machine

  L.Routing.control({
    waypoints: waypoints,
    routeWhileDragging: false,
    draggableWaypoints: false,
    fitSelectedRoutes: true,
    lineOptions: {
      styles: [{ color: "#d92863", weight: 3 }],
      addWaypoints: false,
    },
    fitSelectedRoutes: false,
    createMarker: function () {
      return null;
    },
  }).addTo(map);
}


// Get Last Known Location Of Device

async function getDeviceCurrentLocation() {
  headers = {
    'Authorization': `Bearer ${token}`
  };
  response = await requestAPI('https://api.nrfcloud.com/v1/location/history?deviceId=nrf-351516172549545', null, headers, 'GET');
  response.json().then(function (res) {
    if (res) {
      deviceLocation(res.items[0]);
    }
    else{
      console.log("No response");
    }
  });
}

// Adding Circular Marker to Current Device location

function deviceLocation(deviceLocation) {
  if(map) {
    map.invalidateSize();
  }

  var circleOuterRadius = L.circle([deviceLocation.lat, deviceLocation.lon], {
    fillColor: "rgba(217, 40, 99, 0.15)",
    fillOpacity: 1,
    color: "transparent",
    radius: 75,
  });

  var circleRadius = L.circle([deviceLocation.lat, deviceLocation.lon], {
    fillColor: "rgba(217, 40, 99, 0.4)",
    fillOpacity: 1,
    color: "transparent",
    radius: 50,
  });

  var circle = L.circle([deviceLocation.lat, deviceLocation.lon], {
    fillColor: "#d92863",
    fillOpacity: 1,
    color: "transparent",
    radius: 35,
    zIndex: 3,
  });

  circle.bindPopup(
    `<strong>Device:</strong> ${deviceLocation.deviceId} <br/><br/> <strong>Last seen:</strong> ${deviceLocation.insertedAt}`
  );

  var markerGroup = L.featureGroup([circleRadius, circleOuterRadius, circle]).addTo(map);
  map.fitBounds(markerGroup.getBounds(), {padding: L.point(150, 150)});
}