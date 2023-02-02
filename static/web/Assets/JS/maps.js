window.onload = () => {
  initializeMap();
  loadMapControls();
  getAuthToken();
  // loadDraggableElements();
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
let orgHeaderText = document.querySelector(".organisation-header-text");
let defaultOrg = document.querySelector(".organization");
orgHeaderText.textContent = defaultOrg.innerText;

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


// Refreshing Devices of Currently Selected Organization

async function refreshDevices(event){
  let element = event.currentTarget;
  let textElement = element.querySelector('.refresh-text');
  let textElementText = textElement.innerText;
  let searchIcon = element.querySelector('.fa-rotate-right');
  beforeLoad(textElement, "Refreshing...");
  searchIcon.classList.add('hide');
  response = await requestAPI(`/refresh-devices/${active_user_devices}`, null, {}, 'GET');
  afterLoad(textElement, textElementText);
  searchIcon.classList.remove('hide');
  response.json().then(function(res) {
    if(res) {
      let deviceContainer = document.querySelector('#devices-container');
      deviceContainer.innerHTML = res.html;
      loadMapControls();
    }
  })
}


// Obtaining Devices of Shared Organizations

async function getUserDevices(event, id) {
  document.querySelectorAll('.organization').forEach(ele=>{
    ele.classList.remove('active')
  })
  event.currentTarget.classList.add('active');
  orgHeaderText.textContent = event.currentTarget.innerText;
  active_user_devices = id;
  response = await requestAPI(`/get-sharedwith-devices/${id}/`, null, {}, 'GET');
  response.json().then(function(res) {
    if(res) {
      let deviceContainer = document.querySelector('#devices-container');
      deviceContainer.innerHTML = res.html;
      loadMapControls();
    }
  })
}


// Searching Devices From Selected Organization 

async function searchDevices(event){
  event.preventDefault();
  let form = event.currentTarget;
  let formData = new FormData(form);
  let data = formDataToObject(formData);
  let container = document.getElementById("devices-container");
  headers ={
    "Content-Type": "application/json",
    "X-CSRFToken": data.csrfmiddlewaretoken,
  }
  response = await requestAPI(`/search-devices/${active_user_devices}/`, JSON.stringify(data), headers, 'POST');
  response.json().then(function(res) {
    if(res.success) {
      container.innerHTML = res.html;
      loadMapControls();
    }
    else {
      container.innerHTML = `<p>${res.msg}</p>`;
      loadMapControls();
    }
  })
}


// Opening Edit Device Description Modal

function editDeviceDescriptionModal(event, id, device_description, modal_id) {
  let modal = document.querySelector(`#${modal_id}`);
  let form = modal.querySelector('form');
  let error = form.querySelector('.alert');
  showMsg(error, '', 'bg-danger', 'hide');
  let deviceDescription = form.querySelector('input[name="description"]');
  deviceDescription.value = device_description;
  form.setAttribute('onsubmit', `editDeviceDescriptionForm(event, '${id}')`)
  document.querySelector(`.${modal_id}`).click();
}


// Edit Device Description Form Handling

async function editDeviceDescriptionForm(event, id) {
  event.preventDefault();
  let form = event.currentTarget;
  let error = form.querySelector('.alert');
  showMsg(error, '', 'bg-danger', 'hide');
  let button = form.querySelector('button[type="submit"]');
  let button_text = button.innerText;
  let formData = new FormData(form);
  let data = formDataToObject(formData);
  headers ={
    "Content-Type": "application/json",
    "X-CSRFToken": data.csrfmiddlewaretoken,
  }
  beforeLoad(button, "Saving");
  response = await requestAPI(`/edit-device-description/${id}/`, JSON.stringify(data), headers, 'PUT');
  response.json().then(function(res) {
    if(!res.success) {
      showMsg(error, res.msg, 'bg-danger', 'show');
      afterLoad(button, button_text);
    }
    else{
      showMsg(error, res.msg, 'bg-success', 'show');
      afterLoad(button, button_text);
      setTimeout(()=>{
        document.querySelector(".refresh-icon").click();
        form.querySelector('#closeEditDescriptionModal').click();
      },1500)
    }
  })
}


// Opening Edit Device Name Modal

function editDeviceNameModal(event, id, device_name, modal_id) {
  let modal = document.querySelector(`#${modal_id}`);
  let form = modal.querySelector('form');
  let error = form.querySelector('.alert');
  showMsg(error, '', 'bg-danger', 'hide');
  let deviceName =  form.querySelector('input[name="name"]');
  deviceName.value = device_name;
  form.setAttribute('onsubmit', `editDeviceNameForm(event, '${id}')`);
  document.querySelector(`.${modal_id}`).click();
}


// Edit Device Name Form Handling

async function editDeviceNameForm(event, id) {
  event.preventDefault();
  let form = event.currentTarget;
  let error = form.querySelector('.alert');
  showMsg(error, '', 'bg-danger', 'hide');
  let button = form.querySelector('button[type="submit"]');
  let button_text = button.innerText;
  let formData = new FormData(form);
  let data = formDataToObject(formData);
  headers ={
    "Content-Type": "application/json",
    "X-CSRFToken": data.csrfmiddlewaretoken,
  }
  beforeLoad(button, "Saving");
  response = await requestAPI(`/edit-device-name/${id}/`, JSON.stringify(data), headers, 'PUT');
  response.json().then(function(res) {
    if(!res.success) {
      showMsg(error, res.msg, 'bg-danger', 'show');
      afterLoad(button, button_text);
    }
    else{
      showMsg(error, res.msg, 'bg-success', 'show');
      afterLoad(button, button_text);
      setTimeout(()=>{
        document.querySelector(".refresh-icon").click();
        form.querySelector('#closeEditNameModal').click();
      },1500)
    }
  })
}


// Opening Delete Device Modal

function deleteDeviceModal(event, id, modal_id) {
  let modal = document.querySelector(`#${modal_id}`);
  document.querySelector(`.${modal_id}`).click();
  let form = modal.querySelector('form');
  let error = form.querySelector('.alert');
  showMsg(error, '', 'bg-danger', 'hide');
  form.setAttribute('onsubmit', `deleteDeviceForm(event, '${id}')`);
  document.querySelector(`.${modal_id}`).click();
}


// Delete Device Form Handling

async function deleteDeviceForm(event, id) {
  event.preventDefault();
  let form = event.currentTarget;
  let error = form.querySelector('.alert');
  showMsg(error, '', 'bg-danger', 'hide');
  let button = form.querySelector('button[type="submit"]');
  let button_text = button.innerText;
  let formData = new FormData(form);
  let data = formDataToObject(formData);
  headers ={
    "Content-Type": "application/json",
    "X-CSRFToken": data.csrfmiddlewaretoken,
  }
  beforeLoad(button, "Deleting");
  response = await requestAPI(`/delete-device/${id}/`, null, headers, 'DELETE');
  response.json().then(function(res) {
    if(!res.success) {
      showMsg(error, res.msg, 'bg-danger', 'show');
      afterLoad(button, button_text);
    }
    else{
      showMsg(error, res.msg, 'bg-success', 'show');
      afterLoad(button, button_text);
      setTimeout(()=>{
        document.querySelector(".refresh-icon").click();
        form.querySelector("#closeDeleteDeviceModal").click();
      },1500)
    }
  })
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


function getMap() {
  let loc = JSON.parse(localStorage.getItem("myLocation")) || {};
  map = L.map("maps", {center: [loc.lat, loc.lng], zoom: 14});

  // Adding Tiles(roads, buildings, locations, etc.)

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
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

async function getRouting(deviceId) {
  headers = {
    'Authorization': `Bearer ${token}`
  };
  response = await requestAPI(`https://api.nrfcloud.com/v1/location/history?deviceId=${deviceId}`, null, headers, 'GET');
  response.json().then(function (res) {
    if (res.items.length > 0) {
      routing(res.items);
    }
    else{
      alert('Device routes not available', 'danger');
      if(map) {
        if(markerGroup !== null) {
          markerGroup.clearLayers();
        }
        if (routes) {
          map.removeControl(routes);
        }
      }
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

  var radius = lastLocation.uncertainty;
  var innerRadius = radius / 1.25;
  
  var circleOuterRadius = L.circle([lastLocation.lat, lastLocation.lon], {
    fillColor: "rgba(217, 40, 99, 0.15)",
    fillOpacity: 1,
    color: "transparent",
    radius: radius,
  });


  var circleRadius = L.circle([lastLocation.lat, lastLocation.lon], {
    fillColor: "rgba(217, 40, 99, 0.4)",
    fillOpacity: 1,
    color: "transparent",
    radius: innerRadius,
  });

  var circle = L.circle([lastLocation.lat, lastLocation.lon], {
    fillColor: "#d92863",
    fillOpacity: 1,
    color: "transparent",
    radius: innerRadius / 1.25,
    zIndex: 3,
  });

  circle.bindPopup(
      `<strong>Device:</strong> ${lastLocation.deviceId} <br/><br/> <strong>Last seen:</strong> ${lastLocation.insertedAt}`
    );

  markerGroup = L.featureGroup([marker, circleRadius, circleOuterRadius, circle]).addTo(map);
  map.fitBounds(markerGroup.getBounds(), {padding: L.point(80, 80)});

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

async function getDeviceCurrentLocation(deviceId) {
  headers = {
    'Authorization': `Bearer ${token}`
  };
  response = await requestAPI(`https://api.nrfcloud.com/v1/location/history?deviceId=${deviceId}`, null, headers, 'GET');
  response.json().then(function (res) {
    if (res.items.length > 0) {
      deviceLocation(res.items[0]);
    }
    else{
      alert('Device location not available', 'danger');
      if(map) {
        if(markerGroup !== null) {
          markerGroup.clearLayers();
        }
        if (routes) {
          map.removeControl(routes);
        }
      }
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
  var lastLocation = deviceLocation;
  var radius = lastLocation.uncertainty;
  var innerRadius = radius / 1.25;

  var circleOuterRadius = L.circle([deviceLocation.lat, deviceLocation.lon], {
    fillColor: "rgba(217, 40, 99, 0.15)",
    fillOpacity: 1,
    color: "transparent",
    radius: radius,
  });

  var circleRadius = L.circle([deviceLocation.lat, deviceLocation.lon], {
    fillColor: "rgba(217, 40, 99, 0.4)",
    fillOpacity: 1,
    color: "transparent",
    radius: innerRadius,
  });

  var circle = L.circle([deviceLocation.lat, deviceLocation.lon], {
    fillColor: "#d92863",
    fillOpacity: 1,
    color: "transparent",
    radius: innerRadius / 1.25,
    zIndex: 3,
  });

  circle.bindPopup(
    `<strong>Device:</strong> ${deviceLocation.deviceId} <br/><br/> <strong>Last seen:</strong> ${deviceLocation.insertedAt}`
  );

  markerGroup = L.featureGroup([circleRadius, circleOuterRadius, circle]).addTo(map);
  map.fitBounds(markerGroup.getBounds(), {padding: L.point(150, 150)});
}


async function shareLocation(device_Id) {
  headers = {
    'Authorization': `Bearer ${token}`
  };
  response = await requestAPI(`https://api.nrfcloud.com/v1/location/history?deviceId=${device_Id}`, null, headers, 'GET');
  response.json().then(async function (res) {
    if (res.items.length > 0) {
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
      alert('Device location not available', 'danger')
    }
  });
}


// function handleDragStart(e) {
//   this.style.opacity = '0.4';
//   dragSrcEl = this;
//   e.dataTransfer.effectAllowed = 'move';
//   e.dataTransfer.setData('text/html', this.innerHTML);
//   console.log("in drag start");
// }

// function handleDragEnd(e) {
//   this.style.opacity = '1';
//   console.log("in drag end");
//   loadMapControls();
// }

// function handleDragOver(e) {
//   e.preventDefault();
//   return false;
// }

// async function handleDrop(e) {
//   e.stopPropagation();
//   if (dragSrcEl !== this) {
//     dragSrcEl.innerHTML = this.innerHTML;
//     this.innerHTML = e.dataTransfer.getData('text/html');
//   }
//   console.log(this.id, dragSrcEl.id);
//   response = await requestAPI(`/save-device-order/${this.id}/${dragSrcEl.id}`, null, {}, 'PUT');
//   response.json().then(function(res) {
//     console.log(res);
//   })
//   return false;
// }

// function loadDraggableElements() {
//   let items = document.querySelectorAll('.device');
//   items.forEach(function (item) {
//     item.addEventListener('dragstart', handleDragStart);
//     item.addEventListener('dragover', handleDragOver);
//     item.addEventListener('dragend', handleDragEnd);
//     item.addEventListener('drop', handleDrop);
//   });
// }