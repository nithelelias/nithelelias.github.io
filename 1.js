import Components from "./components.js"
import values from "./values.js"

function inspectComponents(fromNode) {

    var components = fromNode.querySelectorAll("[component]");
    components.forEach(function (element) {
        var componentName = element.attributes["component"].value;
        let a = new Components[componentName](element);
        a.render()
        element.removeAttribute("component")
    });

    if (components.length > 0) {
        setTimeout(inspectComponents, 10, fromNode);
    }
}

function init() {
    inspectComponents(document.body)
}



var main = new Components.Main()

document.body.appendChild(main._element)

main.render()

values.ready(() => {

    init()
})