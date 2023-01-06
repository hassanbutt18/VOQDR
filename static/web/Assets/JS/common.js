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
        // mode: 'cors',
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        headers: headers,
        body: data
    });
    return response; // parses JSON response into native JavaScript objects
}

function beforeLoad(button, text){
    button.innerHTML = text;
    button.disabled = true;
    button.classList.replace("cursor-pointer", "cursor-not-allowed");
}

function afterLoad(button, text){
    button.innerHTML = text;
    button.disabled = false;
    button.classList.replace("cursor-not-allowed","cursor-pointer");
}

function showMsg(element, msg, color, type){
    let msg_element = element.querySelector(".error-text");
    element.className = "alert";
    msg_element.innerText = msg;
    element.classList.add(color);
    element.classList.add(type);
}