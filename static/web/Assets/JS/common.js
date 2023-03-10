function dateTimeTominutes(datetime){
    var date = new Date(datetime);
    var seconds = date.getTime() / 1000;
    var minutes = seconds / 60;
    return minutes
}

function filterObjects(objects) {
    for (let i = 0; i < objects.length - 1; i++) {
      for (let j = i + 1; j < objects.length; j++) {
        if (objects[i]["insertedAt"].split('T')[1].substr(0, 4) == objects[j]["insertedAt"].split('T')[1].substr(0, 4)) {
          let time1 = parseFloat(objects[i]["insertedAt"].split('T')[1].substr(3, 5).replace(':', '.'));
          let time2 = parseFloat(objects[j]["insertedAt"].split('T')[1].substr(3, 5).replace(':', '.'));
          if (time1 > time2) {
            objects.splice(j, 1);
          } else {
            objects.splice(i, 1);
          }
        }
      }
    }
    return objects.slice(0, 10);
}


function sortServiceType(array){
    let sortedArray = filterObjects(array);
    return sortedArray.sort((a,b)=>{
        // let serviceType = obj.serviceType;
        // return serviceType === "GPS" || serviceType === "MCELL" || serviceType === "SCELL";
        let order = ["GPS", "MCELL", "SCELL"];
        let aIndex = order.indexOf(a);
        let bIndex = order.indexOf(b);
        return aIndex - bIndex;
    })
}
function filterTimeDifference(timeDifference, myArray){
    return myArray.filter((event, index, arr) => {
        let prevEvent = arr[index - 1];
        if (index === 0 || !prevEvent) return true;
        
        let eventTime = new Date(event.timestamp).getTime();
        let prevEventTime = new Date(prevEvent.timestamp).getTime();
        
        return eventTime - prevEventTime >= timeDifference * 60 * 1000;
    });
}
function formDataToObject(formData) {
    let getData = {}
    formData.forEach(function(value, key) {
        getData[key] = value;
    });
    return getData
}

async function requestAPI(url, data, headers, method) {
    // Default options are marked with *
    const response = await fetch(url, {
        method: method,
        // mode: 'no-cors',
        // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        headers: headers,
        body: data,
    });
    return response; // parses JSON response into native JavaScript objects
}

function beforeLoad(button, text){
    button.innerHTML = text;
    button.disabled = true;
    button.style.cursor ='not-allowed';
}

function afterLoad(button, text){
    button.innerHTML = text;
    button.disabled = false;
    button.style.cursor ='pointer';
}

function showMsg(element, msg, color, type){
    let msg_element = element.querySelector(".error-text");
    element.className = "alert";
    msg_element.innerText = msg;
    element.classList.add(color);
    element.classList.add(type);
}
