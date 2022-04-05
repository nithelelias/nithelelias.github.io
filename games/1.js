import WebComponent from "../Nithel.WebComponent.js";



class Main extends WebComponent {
    constructor(e) {
        super(e);

    }
    goTo(link) {
        window.open(link)
    }
    
    card(title, link) {
        return `<div class="card" click="goTo('${link}')">  
            <p>${title}</p>
        </div>`
    }
    view() {
        return `<div>
            ${
                this.card("Candy Like","./candygame/")
            }        
            ${
                this.card("Memoria","./memorycard/")
            }    
            ${
                this.card("2048","./2048/")
            }      
            ${
                this.card("babykey","./babykey/")
            }    
        </div>`;
    }
}

var main = new Main(document.querySelector("main"));
main.render();