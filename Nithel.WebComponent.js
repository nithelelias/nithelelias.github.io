function overrideEvent(eventname) {
    this._element.querySelectorAll("[" + eventname + "]").forEach((target, index) => {
        var method = target.attributes[eventname].value;
        let attrbind = "_eb" + index;
        target.setAttribute(attrbind, "")
        target["on" + eventname.toLowerCase()] = (event) => {
            // EVENT IS USED ON INNER EVALUATION ACTION

            let selections = {
                start: event.target.selectionStart,
                end: event.target.selectionEnd,
            }
            try {

                eval("this." + method);
                this.render()
            } catch (e) {
                console.warn("Event error at component ", this.constructor.name)
                console.warn(e)
                console.warn("---------------------------")
            }


            try {
                // RECOVER NODE ELEMENT MUST BE UNCONNECTED

                let node = this._element.querySelector(`[${attrbind}]`);
                node.selectionStart = selections.start;
                node.selectionEnd = selections.end;
                node.focus();
            } catch (e) {
                console.warn("selection error ", e)
            }



        }
        target.removeAttribute(eventname)
    });
}

export default class WebComponent {
    constructor(e) {
        this._element = e || document.createElement("div"); 
    }

    /**
     * to be overwritten
     */
    view() {
        return ""
    }
    /**
     *  get element innerHtml rendered
     */
    getView() {
        return this._element.innerHTML;
    }
    /**
     * render to update view
     */
    render() {
        this._renderView()
    }
    /**
     * code to render the view
     */
    _renderView() {
        this._element.innerHTML = this.view()
        this.eventListenOverrider();
    }
    /**
     *  listen event like clicks or input 
     */
    eventListenOverrider() {
        overrideEvent.call(this, "click");
        overrideEvent.call(this, "input");

    }

    /**
     *  VALIDATE IF THE CURRENT ELMENT IS VISIBLE. by scroll..
     */
    isVisibleScrolled() {
        var docViewTop = window.scrollY;
        var docViewBottom = docViewTop + document.body.offsetHeight;

        var elemTop = this._element.offsetTop;
        var elemBottom = elemTop + this._element.offsetHeight;

        return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
    }
}
