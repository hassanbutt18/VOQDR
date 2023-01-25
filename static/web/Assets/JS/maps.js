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


async function refreshDevices(event){
  if(event) {
    let element = event.currentTarget;
    let textElement = element.querySelector('.refresh-text');
    let textElementText = textElement.innerText;
    let searchIcon = element.querySelector('.fa-rotate-right');
    beforeLoad(textElement, "Refreshing...");
    searchIcon.classList.add('hide');
  }
  response = await requestAPI('/refresh-devices/', null, {}, 'GET');
  if(event) {
    afterLoad(textElement, textElementText);
    searchIcon.classList.remove('hide');
  }
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
function getPosition (position) {
  myLocation.lat = position.coords.latitude;
  myLocation.lng = position.coords.longitude;
  myLocation.accuracy = position.coords.accuracy;
  localStorage.setItem("myLocation", JSON.stringify(myLocation));
}

async function initializeMap() {
  let loc = JSON.parse(localStorage.getItem("myLocation"));
  // loc = null;
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


var markerGroup = null;
var routes = null;

// Adding Routes 

function routing(deviceLocations) {
  if(map) {
    if(markerGroup !== null) {
      markerGroup.clearLayers();
    }
    if (routes) {
      map.removeControl(routes);
    }
  }

  var lastLocation = deviceLocations[0];
  var firstLocation = deviceLocations.at(-1);
  var marker = L.marker([firstLocation.lat, firstLocation.lon], {icon: markerIcon});

  // var radius = lastLocation.uncertainty;
  // var innerRadius = radius / 2;
  
  var circleOuterRadius = L.circleMarker([lastLocation.lat, lastLocation.lon], {
    fillColor: "rgba(217, 40, 99, 0.15)",
    fillOpacity: 1,
    color: "transparent",
    radius: 75,
  });


  var circleRadius = L.circleMarker([lastLocation.lat, lastLocation.lon], {
    fillColor: "rgba(217, 40, 99, 0.4)",
    fillOpacity: 1,
    color: "transparent",
    radius: 50,
  });

  var circle = L.circleMarker([lastLocation.lat, lastLocation.lon], {
    fillColor: "#d92863",
    fillOpacity: 1,
    color: "transparent",
    radius: 35,
    zIndex: 3,
  });

  circle.bindPopup(
      `<strong>Device:</strong> ${lastLocation.deviceId} <br/><br/> <strong>Last seen:</strong> ${lastLocation.insertedAt}`
    );

  markerGroup = L.featureGroup([marker, circleRadius, circleOuterRadius, circle]).addTo(map);
  map.fitBounds(markerGroup.getBounds(), {padding: L.point(100, 100)});

  var waypoints = [];
  for(var j = 0; j < deviceLocations.length; j = j + 1) {
    waypoints.push(L.latLng(deviceLocations[j].lat, deviceLocations[j].lon));
  }

  // Displaying route on the map from one location to another
  // using the plugin leaflet routing machine

  routes = L.Routing.control({
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
    if(markerGroup !== null) {
      markerGroup.clearLayers();
    }
    if (routes) {
      map.removeControl(routes);
    }
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

  markerGroup = L.featureGroup([circleRadius, circleOuterRadius, circle]).addTo(map);
  map.fitBounds(markerGroup.getBounds(), {padding: L.point(150, 150)});
}


// Searching From Available Devices 

async function searchDevices(event){
  event.preventDefault();
  let form = event.currentTarget;
  let formData = new FormData(form);
  let data = formDataToObject(formData);
  const devices_json = JSON.parse(JSON.parse(document.querySelector('#devices_json').textContent));
  const devices_list = devices_json.items;
  let filteredDevices = devices_list.filter(function(device) {
    return device.name.toLowerCase().includes(data.device.toLowerCase());
  })
  let container = document.getElementById("devices-container");
  container.innerHTML = '';
  let devices = null;
  if(filteredDevices.length > 0) {
    filteredDevices.forEach((device) => {
      devices = `
      <div class="device">
      <div class="device-header">
          <div class="device-heading">
              <div class="battery-indicator">
                  <svg width="5" height="34" viewBox="0 0 5 37" fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <rect y="0.5" width="5" height="33" rx="2.5" fill="#2A8908" />
                  </svg>
                  <img src="/static/web/Assets/Images/GoodBattery.svg" class="tooltip1"
                      alt="Battery Indicator" />
              </div>
              <h3>${device.name}</h3>
          </div>
          <i class="fa-solid fa-chevron-down single-device-chevron-down"></i>
          <i class="fa-solid fa-chevron-up single-device-chevron-up"></i>
      </div>
      <div class="device-content">
          <div class="device-text">
              <span>This is device description</span>
              <svg class="cursor-pointer" onclick="editDeviceDescriptionModal(event, 'editDeviceDescription');" width="20" height="21" viewBox="0 0 20 21" fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <title>Edit Device Description</title>
                  <path
                      d="M13.1305 13.787L12.0253 10.2836L5.64975 3.58921L3.41829 5.93224L9.79388 12.6266L13.1305 13.787ZM0.462451 0.485573C0.315845 0.639368 0.199543 0.821992 0.120192 1.02301C0.0408424 1.22402 0 1.43949 0 1.65709C0 1.87469 0.0408424 2.09015 0.120192 2.29117C0.199543 2.49218 0.315845 2.67481 0.462451 2.8286L2.10472 4.55299L4.33618 2.20996L2.69391 0.485573C2.54744 0.331637 2.37351 0.20952 2.18206 0.126202C1.99062 0.0428845 1.78542 0 1.57818 0C1.37094 0 1.16574 0.0428845 0.974293 0.126202C0.78285 0.20952 0.608922 0.331637 0.462451 0.485573ZM18.6056 3.90699H9.81249L11.0529 5.2094H18.6056V19.5359H4.96133V11.6055L3.72095 10.3031V19.5359C3.72095 19.8813 3.85163 20.2126 4.08425 20.4568C4.31687 20.7011 4.63236 20.8383 4.96133 20.8383H18.6056C18.9346 20.8383 19.2501 20.7011 19.4827 20.4568C19.7153 20.2126 19.846 19.8813 19.846 19.5359V5.2094C19.846 4.86398 19.7153 4.53271 19.4827 4.28846C19.2501 4.04421 18.9346 3.90699 18.6056 3.90699Z"
                      fill="#46879F" />
              </svg>
          </div>
          <div class="device-feature-container">
              <div class="device-features">
                  <svg class="cursor-pointer" onclick="editDeviceNameModal(event, '${device.id}', '${device.name}', 'editDeviceName')" width="35" height="35" viewBox="0 0 50 50" fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <title>Edit Device Name</title>
                      <rect width="50" height="50" rx="25" fill="#46879F" />
                      <path
                          d="M22.375 14.5C21.8918 14.5 21.5 14.8918 21.5 15.375C21.5 15.8582 21.8918 16.25 22.375 16.25H24.125V33.75H22.375C21.8918 33.75 21.5 34.1418 21.5 34.625C21.5 35.1082 21.8918 35.5 22.375 35.5H27.625C28.1082 35.5 28.5 35.1082 28.5 34.625C28.5 34.1418 28.1082 33.75 27.625 33.75H25.875V16.25H27.625C28.1082 16.25 28.5 15.8582 28.5 15.375C28.5 14.8918 28.1082 14.5 27.625 14.5H22.375Z"
                          fill="white" />
                      <path
                          d="M18 18H22.375V19.75H18C17.0335 19.75 16.25 20.5335 16.25 21.5V28.4952C16.25 29.4616 17.0335 30.2453 18 30.2453H22.375V31.9953H18C16.067 31.9953 14.5 30.4281 14.5 28.4952V21.5C14.5 19.567 16.067 18 18 18ZM32 30.2453H27.625V31.9953H32C33.9331 31.9953 35.5 30.4281 35.5 28.4952V21.5C35.5 19.567 33.9331 18 32 18H27.625V19.75H32C32.9665 19.75 33.75 20.5335 33.75 21.5V28.4952C33.75 29.4618 32.9665 30.2453 32 30.2453Z"
                          fill="white" />
                  </svg>
                  <svg class="cursor-pointer" onclick="getDeviceCurrentLocation();" width="35" height="35" viewBox="0 0 50 50" fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <title>Location</title>
                      <rect width="50" height="50" rx="25" fill="#46879F" />
                      <g clip-path="url(#clip0_298_631)">
                          <path
                              d="M20.2838 36.3135C20.0692 36.223 19.8993 36.051 19.8115 35.8352C19.7237 35.6194 19.7252 35.3776 19.8157 35.1629C19.9062 34.9483 20.0783 34.7783 20.2941 34.6905C20.5099 34.6028 20.7517 34.6043 20.9663 34.6948C22.4004 35.2912 23.9489 35.562 25.5003 35.4878C27.0516 35.4135 28.5672 34.9961 29.9377 34.2655C31.3083 33.5348 32.4997 32.5093 33.4261 31.2627C34.3524 30.0161 34.9907 28.5795 35.295 27.0564C35.5992 25.5334 35.5617 23.9618 35.1853 22.455C34.8089 20.9482 34.1029 19.5436 33.1182 18.3426C32.1334 17.1415 30.8945 16.1739 29.4908 15.5094C28.087 14.8449 26.5532 14.5001 25.0001 14.4998C15.5326 14.4998 11.0001 26.076 17.7288 32.5773C17.8765 32.7415 17.9566 32.9554 17.9531 33.1763C17.9496 33.3971 17.8628 33.6084 17.71 33.7678C17.5572 33.9272 17.3498 34.023 17.1293 34.0359C16.9089 34.0488 16.6917 33.9778 16.5213 33.8373C15.3239 32.6988 14.3717 31.3277 13.7232 29.808C13.0746 28.2883 12.7435 26.6521 12.7501 24.9998C12.7518 22.3708 13.5993 19.812 15.1673 17.7018C16.7353 15.5915 18.9405 14.0417 21.4572 13.2813C23.9739 12.521 26.6684 12.5904 29.1426 13.4795C31.6167 14.3685 33.7392 16.0299 35.1964 18.2182C36.6535 20.4065 37.368 23.0055 37.2342 25.6311C37.1005 28.2567 36.1256 30.7696 34.4536 32.7985C32.7816 34.8273 30.5012 36.2644 27.9495 36.8974C25.3979 37.5304 22.7102 37.3257 20.2838 36.3135Z"
                              fill="white" />
                          <path
                              d="M15.375 25.875H11.875C11.6429 25.875 11.4204 25.7828 11.2563 25.6187C11.0922 25.4546 11 25.2321 11 25C11 24.7679 11.0922 24.5454 11.2563 24.3813C11.4204 24.2172 11.6429 24.125 11.875 24.125H15.375C15.6071 24.125 15.8296 24.2172 15.9937 24.3813C16.1578 24.5454 16.25 24.7679 16.25 25C16.25 25.2321 16.1578 25.4546 15.9937 25.6187C15.8296 25.7828 15.6071 25.875 15.375 25.875Z"
                              fill="white" />
                          <path
                              d="M25 16.25C24.7679 16.25 24.5454 16.1578 24.3813 15.9937C24.2172 15.8296 24.125 15.6071 24.125 15.375V11.875C24.125 11.6429 24.2172 11.4204 24.3813 11.2563C24.5454 11.0922 24.7679 11 25 11C25.2321 11 25.4546 11.0922 25.6187 11.2563C25.7828 11.4204 25.875 11.6429 25.875 11.875V15.375C25.875 15.6071 25.7828 15.8296 25.6187 15.9937C25.4546 16.1578 25.2321 16.25 25 16.25Z"
                              fill="white" />
                          <path
                              d="M25 39C24.7679 39 24.5454 38.9078 24.3813 38.7437C24.2172 38.5796 24.125 38.3571 24.125 38.125V34.625C24.125 34.3929 24.2172 34.1704 24.3813 34.0063C24.5454 33.8422 24.7679 33.75 25 33.75C25.2321 33.75 25.4546 33.8422 25.6187 34.0063C25.7828 34.1704 25.875 34.3929 25.875 34.625V38.125C25.875 38.3571 25.7828 38.5796 25.6187 38.7437C25.4546 38.9078 25.2321 39 25 39Z"
                              fill="white" />
                          <path
                              d="M38.125 25.875H34.625C34.3929 25.875 34.1704 25.7828 34.0063 25.6187C33.8422 25.4546 33.75 25.2321 33.75 25C33.75 24.7679 33.8422 24.5454 34.0063 24.3813C34.1704 24.2172 34.3929 24.125 34.625 24.125H38.125C38.3571 24.125 38.5796 24.2172 38.7437 24.3813C38.9078 24.5454 39 24.7679 39 25C39 25.2321 38.9078 25.4546 38.7437 25.6187C38.5796 25.7828 38.3571 25.875 38.125 25.875Z"
                              fill="white" />
                          <path
                              d="M24.1955 31.458L19.8205 20.958C19.7568 20.799 19.7412 20.6248 19.7757 20.457C19.8101 20.2892 19.893 20.1352 20.0141 20.0141C20.1352 19.893 20.2892 19.8101 20.457 19.7757C20.6248 19.7412 20.799 19.7568 20.958 19.8205L31.458 24.1955C31.6374 24.266 31.7886 24.3939 31.8879 24.5591C31.9872 24.7244 32.0291 24.9179 32.0072 25.1094C31.9852 25.301 31.9006 25.48 31.7665 25.6185C31.6324 25.757 31.4562 25.8474 31.2655 25.8755L26.6367 26.6455L25.8755 31.2655C25.8474 31.4562 25.757 31.6324 25.6185 31.7665C25.48 31.9006 25.301 31.9852 25.1094 32.0072C24.9179 32.0291 24.7244 31.9872 24.5591 31.8879C24.3939 31.7886 24.266 31.6374 24.1955 31.458ZM22.253 22.253L24.6417 27.9755L25.0005 25.7355C25.0295 25.5533 25.1154 25.385 25.2458 25.2546C25.3763 25.1242 25.5446 25.0383 25.7267 25.0092L27.9755 24.6417L22.253 22.253Z"
                              fill="white" />
                      </g>
                      <defs>
                          <clipPath id="clip0_298_631">
                              <rect width="28" height="28" fill="white"
                                  transform="translate(11 11)" />
                          </clipPath>
                      </defs>
                  </svg>
                  <svg class="cursor-pointer" onclick="getRouting();" width="35" height="35" viewBox="0 0 50 50" fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <title>Movement</title>
                      <rect width="50" height="50" rx="25" fill="#46879F" />
                      <path fill-rule="evenodd" clip-rule="evenodd"
                          d="M35.5492 23.5964C35.6576 24.1991 36.2343 25.9456 36.2343 26.5983C36.2343 32.6229 30.9702 37.493 24.4584 37.493C17.9465 37.493 12.6825 32.6229 12.6825 26.5983C12.6825 20.5733 17.9466 15.7035 24.4584 15.7035H24.6212C24.6212 15.2014 24.7299 14.6994 24.8383 14.1973H24.4044C17.0239 14.1973 11 19.7704 11 26.5986C11 33.4269 17.0239 39 24.4044 39C31.7845 39 37.8087 33.4272 37.8087 26.5986C37.8087 25.3433 36.6142 23.0467 36.2343 21.8919C35.8544 22.4946 35.9288 23.0943 35.5492 23.5964Z"
                          fill="white" />
                      <path fill-rule="evenodd" clip-rule="evenodd"
                          d="M24.8383 23.8618V27.796L21.7651 29.7629C21.3179 30.0491 21.3179 30.4782 21.7651 30.7644C21.9887 30.9075 22.2679 30.9789 22.5475 30.9789C22.8267 30.9789 23.1063 30.9075 23.3295 30.7644L26.7384 28.5827C26.962 28.4398 27.0736 28.2608 27.0736 28.0821V23.8618C27.0736 23.4685 26.5708 23.1465 25.956 23.1465C25.3416 23.1465 24.8385 23.4685 24.8385 23.8618L24.8383 23.8618Z"
                          fill="white" />
                      <path fill-rule="evenodd" clip-rule="evenodd"
                          d="M31.6262 27.0624C32.1485 27.0624 32.6703 26.8544 33.0618 26.4908C33.6494 25.8668 39.0005 20.0969 39.0005 16.8737C39.0005 13.6509 35.6722 11 31.6262 11C27.5803 11 24.252 13.6509 24.252 16.8737C24.252 20.5645 29.6031 25.9184 30.1907 26.5427C30.5822 26.8545 31.1044 27.0624 31.6262 27.0624ZM31.6262 12.5597C34.6281 12.5597 37.0428 14.4828 37.0428 16.874C37.0428 19.1612 33.1926 23.7876 31.6262 25.4516C29.7338 23.5282 26.2097 19.4217 26.2097 16.874C26.2097 14.4828 28.6244 12.5597 31.6262 12.5597Z"
                          fill="white" />
                      <path fill-rule="evenodd" clip-rule="evenodd"
                          d="M35.0194 17.4866C35.0194 15.8953 33.5185 14.5312 31.6257 14.5312C29.7333 14.5312 28.2324 15.8386 28.2324 17.4866C28.2324 19.1346 29.7334 20.4416 31.6257 20.4416C33.5186 20.4416 35.0194 19.0776 35.0194 17.4866ZM30.1901 17.4866C30.1901 16.8044 30.8427 16.2361 31.6256 16.2361C32.409 16.2361 33.0616 16.8045 33.0616 17.4866C33.0616 18.1684 32.409 18.7367 31.6256 18.7367C30.8427 18.7367 30.1901 18.1684 30.1901 17.4866Z"
                          fill="white" />
                  </svg>
              </div>
              <div>
                  <i class="fa-solid fa-ellipsis additional-option-btn"></i>
              </div>
          </div>
          <div class="device-additional-features">
              <div>
                  <svg class="cursor-pointer" onclick="shareLocation();" width="35" height="35" viewBox="0 0 51 51" fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <title>Share Location</title>
                      <rect x="0.75" y="0.984375" width="50" height="50" rx="25" fill="#46879F" />
                      <g clip-path="url(#clip0_345_416)">
                          <path
                              d="M37.6527 30.0809C37.6313 31.0503 37.0773 31.974 36.1122 32.6496C35.1472 33.3252 33.8498 33.6975 32.5044 33.685L27.1344 33.6286C26.3611 33.6225 25.6 33.4887 24.9098 33.2374C24.2195 32.9861 23.6184 32.624 23.1528 32.1791C22.6871 31.7342 22.3693 31.2182 22.2238 30.6709C22.0783 30.1236 22.109 29.5595 22.3134 29.0221L24.3247 29.043C24.1119 29.3873 24.0209 29.7641 24.0596 30.1399C24.0984 30.5157 24.2658 30.8788 24.5468 31.1966C24.8279 31.5144 25.2138 31.777 25.6702 31.9611C26.1266 32.1451 26.6391 32.2448 27.162 32.2513L32.5327 32.3061C33.3711 32.3147 34.1799 32.0831 34.7812 31.662C35.3825 31.241 35.727 30.6651 35.739 30.061C35.751 29.4569 35.4295 28.8741 34.8452 28.4408C34.2609 28.0076 33.4616 27.7593 32.6233 27.7506L30.736 27.7294C30.4115 27.2537 29.9855 26.8176 29.4736 26.437C29.4266 26.4021 29.3751 26.3714 29.3267 26.3376L32.6531 26.3717C33.9979 26.3875 35.2793 26.7866 36.2165 27.4817C37.1537 28.1769 37.6705 29.1113 37.6535 30.0804L37.6527 30.0809ZM29.3696 29.87C29.362 30.1736 29.302 30.4754 29.1909 30.7684L27.1797 30.7475C27.3923 30.4031 27.4833 30.0262 27.4445 29.6504C27.4056 29.2745 27.2382 28.9115 26.9571 28.5936C26.676 28.2758 26.29 28.0131 25.8336 27.829C25.3772 27.6449 24.8646 27.5452 24.3416 27.5387L18.9709 27.4828C18.1398 27.4827 17.342 27.7184 16.7501 28.1388C16.1582 28.5592 15.8197 29.1306 15.8078 29.7294C15.7959 30.3282 16.1116 30.9063 16.6865 31.3388C17.2615 31.7712 18.0496 32.0233 18.8803 32.0404L20.7669 32.0589C21.0905 32.5357 21.5165 32.9726 22.0293 33.3535C22.0755 33.3878 22.1285 33.4185 22.177 33.4512L18.8513 33.4166C17.5059 33.4026 16.2233 33.0041 15.2857 32.3087C14.348 31.6133 13.8322 30.678 13.8516 29.7085C13.871 28.7391 14.4241 27.8149 15.3892 27.1393C16.3543 26.4636 17.6523 26.092 18.9978 26.106L24.3685 26.1618C25.7133 26.1776 26.9946 26.5767 27.9319 27.2719C28.8691 27.967 29.3858 28.9014 29.3689 29.8705L29.3696 29.87Z"
                              fill="white" />
                      </g>
                      <path fill-rule="evenodd" clip-rule="evenodd"
                          d="M25.7461 25.981C26.2026 25.981 26.6589 25.7998 27.0011 25.483C27.5149 24.9392 32.1933 19.9114 32.1933 17.1027C32.1933 14.2944 29.2833 11.9844 25.7461 11.9844C22.2088 11.9844 19.2988 14.2944 19.2988 17.1027C19.2988 20.3189 23.9773 24.9842 24.491 25.5282C24.8332 25.7999 25.2898 25.981 25.7461 25.981ZM25.7461 13.3435C28.3705 13.3435 30.4816 15.0193 30.4816 17.1029C30.4816 19.096 27.1155 23.1274 25.7461 24.5775C24.0915 22.9014 21.0105 19.323 21.0105 17.1029C21.0105 15.0193 23.1216 13.3435 25.7461 13.3435Z"
                          fill="white" />
                      <path fill-rule="evenodd" clip-rule="evenodd"
                          d="M28.7326 17.2315C28.7326 15.8448 27.4203 14.6562 25.7655 14.6562C24.111 14.6562 22.7988 15.7955 22.7988 17.2315C22.7988 18.6676 24.1111 19.8065 25.7655 19.8065C27.4204 19.8065 28.7326 18.6179 28.7326 17.2315ZM24.5104 17.2315C24.5104 16.6371 25.0809 16.1419 25.7655 16.1419C26.4503 16.1419 27.0209 16.6371 27.0209 17.2315C27.0209 17.8257 26.4503 18.3209 25.7655 18.3209C25.0809 18.3209 24.5104 17.8257 24.5104 17.2315Z"
                          fill="white" />
                      <defs>
                          <clipPath id="clip0_345_416">
                              <rect width="28" height="20.1794" fill="white"
                                  transform="translate(11.75 19.8047)" />
                          </clipPath>
                      </defs>
                  </svg>
                  <svg class="cursor-pointer" onclick="deleteDeviceModal(event, 'deleteDevice');" width="35" height="35" viewBox="0 0 51 51" fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <title>Delete Device</title>
                      <rect x="0.75" y="0.984375" width="50" height="50" rx="25" fill="#46879F" />
                      <path
                          d="M22.4688 22.0029H23.7812V32.5029H22.4688V22.0029ZM25.0938 22.0029H26.4062V32.5029H25.0938V22.0029ZM27.7188 22.0029H29.0312V32.5029H27.7188V22.0029ZM17.2188 18.0654H34.2812V19.3779H17.2188V18.0654Z"
                          fill="white" />
                      <path
                          d="M28.9867 18.7219H27.7617V17.4094C27.7617 17.0156 27.4555 16.7094 27.0617 16.7094H24.4367C24.043 16.7094 23.7367 17.0156 23.7367 17.4094V18.7219H22.5117V17.4094C22.5117 16.3594 23.3867 15.4844 24.4367 15.4844H27.0617C28.1117 15.4844 28.9867 16.3594 28.9867 17.4094V18.7219Z"
                          fill="white" />
                      <path
                          d="M29.6875 36.4402H21.8125C20.7625 36.4402 19.8438 35.5652 19.7563 34.5152L18.5312 18.7652L19.8438 18.6777L21.0688 34.4277C21.1125 34.8215 21.4625 35.1277 21.8125 35.1277H29.6875C30.0813 35.1277 30.4312 34.7777 30.4312 34.4277L31.6562 18.6777L32.9688 18.7652L31.7437 34.5152C31.6562 35.609 30.7375 36.4402 29.6875 36.4402Z"
                          fill="white" />
                  </svg>
              </div>
          </div>
      </div>
  </div>
      `;
      container.insertAdjacentHTML("beforeend", devices);
    });
    loadMapControls();
  }
  else {
    container.innerHTML = "<div>No such device available.</div>"
    loadMapControls();
  }
}


const alertPlaceholder = document.getElementById('liveAlertPlaceholder')

const alert = (message, type) => {
  const wrapper = document.createElement('div')
  wrapper.innerHTML = [
    `<div class="alert alert-${type} alert-dismissible location-alert" role="alert">`,
    `   <svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
          <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
        </svg>`,
    `   <div>${message}</div>`,
    '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
    '</div>'
  ].join('')
  alertPlaceholder.innerHTML = ''
  alertPlaceholder.append(wrapper)
  let timeOut = setTimeout(function() {
    alertPlaceholder.innerHTML = '';
  }, 5000);
}

async function shareLocation() {
  headers = {
    'Authorization': `Bearer ${token}`
  };
  response = await requestAPI('https://api.nrfcloud.com/v1/location/history?deviceId=nrf-351516172549545', null, headers, 'GET');
  response.json().then(async function (res) {
    if (res) {
      const url = `https://www.google.com/maps/place/${res.items[0].lat},${res.items[0].lon}/${res.items[0].lat},${res.items[0].lon},17z/data=!3m1!4b1`
      const shareData = {
        title: `Device Location: ${res.items[0].deviceId}`,
        text: 'Latest Location',
        url: url
      }

      if(navigator.share) {
        try {
          await navigator.share(shareData); 
        } catch (error) {
          console.log(error);
        }
      }
      else {
        var temp = document.createElement('input');
        document.body.appendChild(temp);
        temp.value = url;
        temp.select();
        document.execCommand('copy');
        alert('Device Location URL Copied!', 'success')
        document.body.removeChild(temp);
      }
    }
    else{
      console.log("No response");
    }
  });
}


async function getUserDevices(event, id) {
  response = await requestAPI(`/get-sharedwith-devices/${id}/`, null, {}, 'GET');
  response.json().then(function(res) {
    res = JSON.parse(res.devices)
    let devices = null;
    let container = document.getElementById("devices-container");
    container.innerHTML = '';
    if(res.length > 0) {
      res.forEach((device) => {
        devices = `
        <div class="device">
        <div class="device-header">
            <div class="device-heading">
                <div class="battery-indicator">
                    <svg width="5" height="34" viewBox="0 0 5 37" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <rect y="0.5" width="5" height="33" rx="2.5" fill="#2A8908" />
                    </svg>
                    <img src="/static/web/Assets/Images/GoodBattery.svg" class="tooltip1"
                        alt="Battery Indicator" />
                </div>
                <h3>${device.fields.name}</h3>
            </div>
            <i class="fa-solid fa-chevron-down single-device-chevron-down"></i>
            <i class="fa-solid fa-chevron-up single-device-chevron-up"></i>
        </div>
        <div class="device-content">
            <div class="device-text">
                <span>This is device description</span>
                <svg class="cursor-pointer" onclick="editDeviceDescriptionModal(event, 'editDeviceDescription');" width="20" height="21" viewBox="0 0 20 21" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <title>Edit Device Description</title>
                    <path
                        d="M13.1305 13.787L12.0253 10.2836L5.64975 3.58921L3.41829 5.93224L9.79388 12.6266L13.1305 13.787ZM0.462451 0.485573C0.315845 0.639368 0.199543 0.821992 0.120192 1.02301C0.0408424 1.22402 0 1.43949 0 1.65709C0 1.87469 0.0408424 2.09015 0.120192 2.29117C0.199543 2.49218 0.315845 2.67481 0.462451 2.8286L2.10472 4.55299L4.33618 2.20996L2.69391 0.485573C2.54744 0.331637 2.37351 0.20952 2.18206 0.126202C1.99062 0.0428845 1.78542 0 1.57818 0C1.37094 0 1.16574 0.0428845 0.974293 0.126202C0.78285 0.20952 0.608922 0.331637 0.462451 0.485573ZM18.6056 3.90699H9.81249L11.0529 5.2094H18.6056V19.5359H4.96133V11.6055L3.72095 10.3031V19.5359C3.72095 19.8813 3.85163 20.2126 4.08425 20.4568C4.31687 20.7011 4.63236 20.8383 4.96133 20.8383H18.6056C18.9346 20.8383 19.2501 20.7011 19.4827 20.4568C19.7153 20.2126 19.846 19.8813 19.846 19.5359V5.2094C19.846 4.86398 19.7153 4.53271 19.4827 4.28846C19.2501 4.04421 18.9346 3.90699 18.6056 3.90699Z"
                        fill="#46879F" />
                </svg>
            </div>
            <div class="device-feature-container">
                <div class="device-features">
                    <svg class="cursor-pointer" onclick="editDeviceNameModal(event, 'nrf-351358811331450', '${device.fields.name}', 'editDeviceName')" width="35" height="35" viewBox="0 0 50 50" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <title>Edit Device Name</title>
                        <rect width="50" height="50" rx="25" fill="#46879F" />
                        <path
                            d="M22.375 14.5C21.8918 14.5 21.5 14.8918 21.5 15.375C21.5 15.8582 21.8918 16.25 22.375 16.25H24.125V33.75H22.375C21.8918 33.75 21.5 34.1418 21.5 34.625C21.5 35.1082 21.8918 35.5 22.375 35.5H27.625C28.1082 35.5 28.5 35.1082 28.5 34.625C28.5 34.1418 28.1082 33.75 27.625 33.75H25.875V16.25H27.625C28.1082 16.25 28.5 15.8582 28.5 15.375C28.5 14.8918 28.1082 14.5 27.625 14.5H22.375Z"
                            fill="white" />
                        <path
                            d="M18 18H22.375V19.75H18C17.0335 19.75 16.25 20.5335 16.25 21.5V28.4952C16.25 29.4616 17.0335 30.2453 18 30.2453H22.375V31.9953H18C16.067 31.9953 14.5 30.4281 14.5 28.4952V21.5C14.5 19.567 16.067 18 18 18ZM32 30.2453H27.625V31.9953H32C33.9331 31.9953 35.5 30.4281 35.5 28.4952V21.5C35.5 19.567 33.9331 18 32 18H27.625V19.75H32C32.9665 19.75 33.75 20.5335 33.75 21.5V28.4952C33.75 29.4618 32.9665 30.2453 32 30.2453Z"
                            fill="white" />
                    </svg>
                    <svg class="cursor-pointer" onclick="getDeviceCurrentLocation();" width="35" height="35" viewBox="0 0 50 50" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <title>Location</title>
                        <rect width="50" height="50" rx="25" fill="#46879F" />
                        <g clip-path="url(#clip0_298_631)">
                            <path
                                d="M20.2838 36.3135C20.0692 36.223 19.8993 36.051 19.8115 35.8352C19.7237 35.6194 19.7252 35.3776 19.8157 35.1629C19.9062 34.9483 20.0783 34.7783 20.2941 34.6905C20.5099 34.6028 20.7517 34.6043 20.9663 34.6948C22.4004 35.2912 23.9489 35.562 25.5003 35.4878C27.0516 35.4135 28.5672 34.9961 29.9377 34.2655C31.3083 33.5348 32.4997 32.5093 33.4261 31.2627C34.3524 30.0161 34.9907 28.5795 35.295 27.0564C35.5992 25.5334 35.5617 23.9618 35.1853 22.455C34.8089 20.9482 34.1029 19.5436 33.1182 18.3426C32.1334 17.1415 30.8945 16.1739 29.4908 15.5094C28.087 14.8449 26.5532 14.5001 25.0001 14.4998C15.5326 14.4998 11.0001 26.076 17.7288 32.5773C17.8765 32.7415 17.9566 32.9554 17.9531 33.1763C17.9496 33.3971 17.8628 33.6084 17.71 33.7678C17.5572 33.9272 17.3498 34.023 17.1293 34.0359C16.9089 34.0488 16.6917 33.9778 16.5213 33.8373C15.3239 32.6988 14.3717 31.3277 13.7232 29.808C13.0746 28.2883 12.7435 26.6521 12.7501 24.9998C12.7518 22.3708 13.5993 19.812 15.1673 17.7018C16.7353 15.5915 18.9405 14.0417 21.4572 13.2813C23.9739 12.521 26.6684 12.5904 29.1426 13.4795C31.6167 14.3685 33.7392 16.0299 35.1964 18.2182C36.6535 20.4065 37.368 23.0055 37.2342 25.6311C37.1005 28.2567 36.1256 30.7696 34.4536 32.7985C32.7816 34.8273 30.5012 36.2644 27.9495 36.8974C25.3979 37.5304 22.7102 37.3257 20.2838 36.3135Z"
                                fill="white" />
                            <path
                                d="M15.375 25.875H11.875C11.6429 25.875 11.4204 25.7828 11.2563 25.6187C11.0922 25.4546 11 25.2321 11 25C11 24.7679 11.0922 24.5454 11.2563 24.3813C11.4204 24.2172 11.6429 24.125 11.875 24.125H15.375C15.6071 24.125 15.8296 24.2172 15.9937 24.3813C16.1578 24.5454 16.25 24.7679 16.25 25C16.25 25.2321 16.1578 25.4546 15.9937 25.6187C15.8296 25.7828 15.6071 25.875 15.375 25.875Z"
                                fill="white" />
                            <path
                                d="M25 16.25C24.7679 16.25 24.5454 16.1578 24.3813 15.9937C24.2172 15.8296 24.125 15.6071 24.125 15.375V11.875C24.125 11.6429 24.2172 11.4204 24.3813 11.2563C24.5454 11.0922 24.7679 11 25 11C25.2321 11 25.4546 11.0922 25.6187 11.2563C25.7828 11.4204 25.875 11.6429 25.875 11.875V15.375C25.875 15.6071 25.7828 15.8296 25.6187 15.9937C25.4546 16.1578 25.2321 16.25 25 16.25Z"
                                fill="white" />
                            <path
                                d="M25 39C24.7679 39 24.5454 38.9078 24.3813 38.7437C24.2172 38.5796 24.125 38.3571 24.125 38.125V34.625C24.125 34.3929 24.2172 34.1704 24.3813 34.0063C24.5454 33.8422 24.7679 33.75 25 33.75C25.2321 33.75 25.4546 33.8422 25.6187 34.0063C25.7828 34.1704 25.875 34.3929 25.875 34.625V38.125C25.875 38.3571 25.7828 38.5796 25.6187 38.7437C25.4546 38.9078 25.2321 39 25 39Z"
                                fill="white" />
                            <path
                                d="M38.125 25.875H34.625C34.3929 25.875 34.1704 25.7828 34.0063 25.6187C33.8422 25.4546 33.75 25.2321 33.75 25C33.75 24.7679 33.8422 24.5454 34.0063 24.3813C34.1704 24.2172 34.3929 24.125 34.625 24.125H38.125C38.3571 24.125 38.5796 24.2172 38.7437 24.3813C38.9078 24.5454 39 24.7679 39 25C39 25.2321 38.9078 25.4546 38.7437 25.6187C38.5796 25.7828 38.3571 25.875 38.125 25.875Z"
                                fill="white" />
                            <path
                                d="M24.1955 31.458L19.8205 20.958C19.7568 20.799 19.7412 20.6248 19.7757 20.457C19.8101 20.2892 19.893 20.1352 20.0141 20.0141C20.1352 19.893 20.2892 19.8101 20.457 19.7757C20.6248 19.7412 20.799 19.7568 20.958 19.8205L31.458 24.1955C31.6374 24.266 31.7886 24.3939 31.8879 24.5591C31.9872 24.7244 32.0291 24.9179 32.0072 25.1094C31.9852 25.301 31.9006 25.48 31.7665 25.6185C31.6324 25.757 31.4562 25.8474 31.2655 25.8755L26.6367 26.6455L25.8755 31.2655C25.8474 31.4562 25.757 31.6324 25.6185 31.7665C25.48 31.9006 25.301 31.9852 25.1094 32.0072C24.9179 32.0291 24.7244 31.9872 24.5591 31.8879C24.3939 31.7886 24.266 31.6374 24.1955 31.458ZM22.253 22.253L24.6417 27.9755L25.0005 25.7355C25.0295 25.5533 25.1154 25.385 25.2458 25.2546C25.3763 25.1242 25.5446 25.0383 25.7267 25.0092L27.9755 24.6417L22.253 22.253Z"
                                fill="white" />
                        </g>
                        <defs>
                            <clipPath id="clip0_298_631">
                                <rect width="28" height="28" fill="white"
                                    transform="translate(11 11)" />
                            </clipPath>
                        </defs>
                    </svg>
                    <svg class="cursor-pointer" onclick="getRouting();" width="35" height="35" viewBox="0 0 50 50" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <title>Movement</title>
                        <rect width="50" height="50" rx="25" fill="#46879F" />
                        <path fill-rule="evenodd" clip-rule="evenodd"
                            d="M35.5492 23.5964C35.6576 24.1991 36.2343 25.9456 36.2343 26.5983C36.2343 32.6229 30.9702 37.493 24.4584 37.493C17.9465 37.493 12.6825 32.6229 12.6825 26.5983C12.6825 20.5733 17.9466 15.7035 24.4584 15.7035H24.6212C24.6212 15.2014 24.7299 14.6994 24.8383 14.1973H24.4044C17.0239 14.1973 11 19.7704 11 26.5986C11 33.4269 17.0239 39 24.4044 39C31.7845 39 37.8087 33.4272 37.8087 26.5986C37.8087 25.3433 36.6142 23.0467 36.2343 21.8919C35.8544 22.4946 35.9288 23.0943 35.5492 23.5964Z"
                            fill="white" />
                        <path fill-rule="evenodd" clip-rule="evenodd"
                            d="M24.8383 23.8618V27.796L21.7651 29.7629C21.3179 30.0491 21.3179 30.4782 21.7651 30.7644C21.9887 30.9075 22.2679 30.9789 22.5475 30.9789C22.8267 30.9789 23.1063 30.9075 23.3295 30.7644L26.7384 28.5827C26.962 28.4398 27.0736 28.2608 27.0736 28.0821V23.8618C27.0736 23.4685 26.5708 23.1465 25.956 23.1465C25.3416 23.1465 24.8385 23.4685 24.8385 23.8618L24.8383 23.8618Z"
                            fill="white" />
                        <path fill-rule="evenodd" clip-rule="evenodd"
                            d="M31.6262 27.0624C32.1485 27.0624 32.6703 26.8544 33.0618 26.4908C33.6494 25.8668 39.0005 20.0969 39.0005 16.8737C39.0005 13.6509 35.6722 11 31.6262 11C27.5803 11 24.252 13.6509 24.252 16.8737C24.252 20.5645 29.6031 25.9184 30.1907 26.5427C30.5822 26.8545 31.1044 27.0624 31.6262 27.0624ZM31.6262 12.5597C34.6281 12.5597 37.0428 14.4828 37.0428 16.874C37.0428 19.1612 33.1926 23.7876 31.6262 25.4516C29.7338 23.5282 26.2097 19.4217 26.2097 16.874C26.2097 14.4828 28.6244 12.5597 31.6262 12.5597Z"
                            fill="white" />
                        <path fill-rule="evenodd" clip-rule="evenodd"
                            d="M35.0194 17.4866C35.0194 15.8953 33.5185 14.5312 31.6257 14.5312C29.7333 14.5312 28.2324 15.8386 28.2324 17.4866C28.2324 19.1346 29.7334 20.4416 31.6257 20.4416C33.5186 20.4416 35.0194 19.0776 35.0194 17.4866ZM30.1901 17.4866C30.1901 16.8044 30.8427 16.2361 31.6256 16.2361C32.409 16.2361 33.0616 16.8045 33.0616 17.4866C33.0616 18.1684 32.409 18.7367 31.6256 18.7367C30.8427 18.7367 30.1901 18.1684 30.1901 17.4866Z"
                            fill="white" />
                    </svg>
                </div>
                <div>
                    <i class="fa-solid fa-ellipsis additional-option-btn"></i>
                </div>
            </div>
            <div class="device-additional-features">
                <div>
                    <svg class="cursor-pointer" onclick="shareLocation();" width="35" height="35" viewBox="0 0 51 51" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <title>Share Location</title>
                        <rect x="0.75" y="0.984375" width="50" height="50" rx="25" fill="#46879F" />
                        <g clip-path="url(#clip0_345_416)">
                            <path
                                d="M37.6527 30.0809C37.6313 31.0503 37.0773 31.974 36.1122 32.6496C35.1472 33.3252 33.8498 33.6975 32.5044 33.685L27.1344 33.6286C26.3611 33.6225 25.6 33.4887 24.9098 33.2374C24.2195 32.9861 23.6184 32.624 23.1528 32.1791C22.6871 31.7342 22.3693 31.2182 22.2238 30.6709C22.0783 30.1236 22.109 29.5595 22.3134 29.0221L24.3247 29.043C24.1119 29.3873 24.0209 29.7641 24.0596 30.1399C24.0984 30.5157 24.2658 30.8788 24.5468 31.1966C24.8279 31.5144 25.2138 31.777 25.6702 31.9611C26.1266 32.1451 26.6391 32.2448 27.162 32.2513L32.5327 32.3061C33.3711 32.3147 34.1799 32.0831 34.7812 31.662C35.3825 31.241 35.727 30.6651 35.739 30.061C35.751 29.4569 35.4295 28.8741 34.8452 28.4408C34.2609 28.0076 33.4616 27.7593 32.6233 27.7506L30.736 27.7294C30.4115 27.2537 29.9855 26.8176 29.4736 26.437C29.4266 26.4021 29.3751 26.3714 29.3267 26.3376L32.6531 26.3717C33.9979 26.3875 35.2793 26.7866 36.2165 27.4817C37.1537 28.1769 37.6705 29.1113 37.6535 30.0804L37.6527 30.0809ZM29.3696 29.87C29.362 30.1736 29.302 30.4754 29.1909 30.7684L27.1797 30.7475C27.3923 30.4031 27.4833 30.0262 27.4445 29.6504C27.4056 29.2745 27.2382 28.9115 26.9571 28.5936C26.676 28.2758 26.29 28.0131 25.8336 27.829C25.3772 27.6449 24.8646 27.5452 24.3416 27.5387L18.9709 27.4828C18.1398 27.4827 17.342 27.7184 16.7501 28.1388C16.1582 28.5592 15.8197 29.1306 15.8078 29.7294C15.7959 30.3282 16.1116 30.9063 16.6865 31.3388C17.2615 31.7712 18.0496 32.0233 18.8803 32.0404L20.7669 32.0589C21.0905 32.5357 21.5165 32.9726 22.0293 33.3535C22.0755 33.3878 22.1285 33.4185 22.177 33.4512L18.8513 33.4166C17.5059 33.4026 16.2233 33.0041 15.2857 32.3087C14.348 31.6133 13.8322 30.678 13.8516 29.7085C13.871 28.7391 14.4241 27.8149 15.3892 27.1393C16.3543 26.4636 17.6523 26.092 18.9978 26.106L24.3685 26.1618C25.7133 26.1776 26.9946 26.5767 27.9319 27.2719C28.8691 27.967 29.3858 28.9014 29.3689 29.8705L29.3696 29.87Z"
                                fill="white" />
                        </g>
                        <path fill-rule="evenodd" clip-rule="evenodd"
                            d="M25.7461 25.981C26.2026 25.981 26.6589 25.7998 27.0011 25.483C27.5149 24.9392 32.1933 19.9114 32.1933 17.1027C32.1933 14.2944 29.2833 11.9844 25.7461 11.9844C22.2088 11.9844 19.2988 14.2944 19.2988 17.1027C19.2988 20.3189 23.9773 24.9842 24.491 25.5282C24.8332 25.7999 25.2898 25.981 25.7461 25.981ZM25.7461 13.3435C28.3705 13.3435 30.4816 15.0193 30.4816 17.1029C30.4816 19.096 27.1155 23.1274 25.7461 24.5775C24.0915 22.9014 21.0105 19.323 21.0105 17.1029C21.0105 15.0193 23.1216 13.3435 25.7461 13.3435Z"
                            fill="white" />
                        <path fill-rule="evenodd" clip-rule="evenodd"
                            d="M28.7326 17.2315C28.7326 15.8448 27.4203 14.6562 25.7655 14.6562C24.111 14.6562 22.7988 15.7955 22.7988 17.2315C22.7988 18.6676 24.1111 19.8065 25.7655 19.8065C27.4204 19.8065 28.7326 18.6179 28.7326 17.2315ZM24.5104 17.2315C24.5104 16.6371 25.0809 16.1419 25.7655 16.1419C26.4503 16.1419 27.0209 16.6371 27.0209 17.2315C27.0209 17.8257 26.4503 18.3209 25.7655 18.3209C25.0809 18.3209 24.5104 17.8257 24.5104 17.2315Z"
                            fill="white" />
                        <defs>
                            <clipPath id="clip0_345_416">
                                <rect width="28" height="20.1794" fill="white"
                                    transform="translate(11.75 19.8047)" />
                            </clipPath>
                        </defs>
                    </svg>
                    <svg class="cursor-pointer" onclick="deleteDeviceModal(event, 'deleteDevice');" width="35" height="35" viewBox="0 0 51 51" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <title>Delete Device</title>
                        <rect x="0.75" y="0.984375" width="50" height="50" rx="25" fill="#46879F" />
                        <path
                            d="M22.4688 22.0029H23.7812V32.5029H22.4688V22.0029ZM25.0938 22.0029H26.4062V32.5029H25.0938V22.0029ZM27.7188 22.0029H29.0312V32.5029H27.7188V22.0029ZM17.2188 18.0654H34.2812V19.3779H17.2188V18.0654Z"
                            fill="white" />
                        <path
                            d="M28.9867 18.7219H27.7617V17.4094C27.7617 17.0156 27.4555 16.7094 27.0617 16.7094H24.4367C24.043 16.7094 23.7367 17.0156 23.7367 17.4094V18.7219H22.5117V17.4094C22.5117 16.3594 23.3867 15.4844 24.4367 15.4844H27.0617C28.1117 15.4844 28.9867 16.3594 28.9867 17.4094V18.7219Z"
                            fill="white" />
                        <path
                            d="M29.6875 36.4402H21.8125C20.7625 36.4402 19.8438 35.5652 19.7563 34.5152L18.5312 18.7652L19.8438 18.6777L21.0688 34.4277C21.1125 34.8215 21.4625 35.1277 21.8125 35.1277H29.6875C30.0813 35.1277 30.4312 34.7777 30.4312 34.4277L31.6562 18.6777L32.9688 18.7652L31.7437 34.5152C31.6562 35.609 30.7375 36.4402 29.6875 36.4402Z"
                            fill="white" />
                    </svg>
                </div>
            </div>
        </div>
    </div>
        `;
        container.insertAdjacentHTML("beforeend", devices);
      });
      loadMapControls(); 
    }
    else {
      container.innerHTML = "<div>This organization has no device available.</div>"
      loadMapControls();
    }
  })
}