var userLang = navigator.language || navigator.userLanguage;
var callbackReady = function () { };
var values = {
    userLang, text: {}, update, ready
}

function ready(_callbackReady) {
    callbackReady = _callbackReady
}
function update() {
    if (userLang.indexOf("-")) {
        userLang = userLang.split("-")[0].toLowerCase()
    }

    fetch("./values/" + userLang + ".json").then((r) => {
        return r.json()
    }).then((_r) => {
        values.text = _r;
        callbackReady()
    })
}


update();
 
export default values;