import Sound from "../Sound.js";
var _game = null;
const WIDTH = document.body.offsetWidth - 10 > 400 ? 400 : document.body.offsetWidth - 10;
const HEIGHT = 400;
const COLORS = ["black", '#fff4b8', '#ffca77', '#ff9b4c', '#ff603b', '#ff714b', '#e38e7c', '#bca6ad', '#77bbdf', '#77bbdf', '#76a4e4', '#748ee6', '#7077e6', '#6d5fe2', '#6c46d8', '#7029c3', '#800080'];
var GRIDSIZE = [4, 4]
const Sounds = {
    "pop": new Sound("sounds/pop.mp3"),
    "fall": new Sound("sounds/fall.mp3")
}
function random(min, max) {
    if (!max) {
        max = min;
        min = 0;
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var eventInspector = function (event) {
    this._element.querySelectorAll("[" + event + "]").forEach((target) => {
        var method = target.attributes[event].value;
        target.onclick = (event) => {
            eval("this." + method)
        }
    })
}
var enterframe_listeners = {};
var onEnterFrame = function (_callback) {
    if (Object.keys(enterframe_listeners) == 0) {
        currentAnimationFrame();
    }
    var _id = Date.now().toString().substr(6, 29) + "t" + Math.random().toString().substr(2, 9);
    enterframe_listeners[_id] = _callback
    var remove = function () {
        enterframe_listeners[_id] = null;
        delete enterframe_listeners[_id];
    }

    return remove
}

function currentAnimationFrame() {

    for (let _id in enterframe_listeners) {
        if (enterframe_listeners[_id] != null) {
            enterframe_listeners[_id]();
        }
    }
    if (Object.keys(enterframe_listeners) > 0) {
        window.requestAnimationFrame(currentAnimationFrame);
    }
}

class Card {
    constructor(number) {
        this._element = document.createElement("div");
        this._element.classList.add("card", "C" + number, "animated", "bounceIn", "valign");

        this._element.style.background = number < COLORS.length ? COLORS[number] : (`rgb(${random(100, 200)},${random(100, 200)},${random(100, 200)})`);
        if (number > 4) {
            this._element.style.color = "white";
        }
        this._element.card = this;
        this.number = number;

        this.outputnumber = Math.pow(2, number);
        this._element.innerHTML = `<h1>${this.outputnumber}</h1>`;

    }
    remove() {
        this._element.remove();
        delete this;
    }

}

class Cell {
    constructor(x, y, w, h) {
        this._element = null;
        this.id = "id_" + x + "_" + y;
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.card = null;
        setTimeout(() => {
            this.initCell()
        }, 1)
    }


    initCell() {
        this._element = document.getElementById("cell_" + this.x + "_" + this.y);
        this._element.classList.add("cell", "valign", "center")

        this._element.style.width = this.width + "px";
        this._element.style.height = this.height + "px";

        this._element.style.position = "absolute";
        this._element.style.left = (this.x * this.width) + "px";
        this._element.style.top = (this.y * this.height) + "px";
        this._element.cell = this;

    }
    clear() {
        let cardToRemove = this.card != null ? this.card : null;
        this.unbindCard();
        if (cardToRemove != null) {
            cardToRemove.remove();
        }
    }
    unbindCard() {
        if (this.card != null) {
            this._element.removeChild(this.card._element)
            this.card.cell = null;
            this.card = null;
        }
    }
    bindCard(_card) {
        if (_card.cell != null) {
            _card.cell.unbindCard();
        }
        this.card = _card;
        this.card.cell = this;
        this._element.appendChild(this.card._element)
    }
    addCard(number) {

        this.card = new Card(number);
        this.card.cell = this;
        this._element.appendChild(this.card._element)
        return this.card;
    }
}
class Board {
    constructor(e) {
        this._element = e;
        this.cellMap = {};
        this.randomIteration = 0;

        this.memoryStore = [];
        this.initListeners();
        window.$board = this;
    }
    getCurrentState() {
        let store = {};
        // ITERATRE ALL BOARD CELLS AND STORE THE NUMBER ON IT.
        for (let key in this.cellMap) {
            if (this.cellMap[key].card != null) {
                store[key] = this.cellMap[key].card.number;
            }
        }
        return store;
    }
    storeState(store) {

        this.memoryStore.push(store);
        // MAX STORE LIMIT
        if(this.memoryStore.length>4){
            this.memoryStore.shift();
        }
    }
    undo() {
        if (this.memoryStore.length > 0) {
            let store = this.memoryStore.pop();
            // CLEAN ALL CELLS AND ADD NEW CARD WITH STORE VALUE
            for (let key in this.cellMap) {
                this.cellMap[key].clear();
                if (store.hasOwnProperty(key)) {
                    this.cellMap[key].addCard(store[key])
                }

            }
        }
    }
    addRandomCard() {
        if (this.randomIteration < 100) {
            var x = random(0, GRIDSIZE[0] - 1);
            var y = random(0, GRIDSIZE[1] - 1);

            if (this.cellMap[x + "_" + y].card == null) {
                this.cellMap[x + "_" + y].addCard(1);
                this.randomIteration = 0
            } else {
                this.randomIteration += 1;
                this.addRandomCard();
            }
        } else {
            console.error("MUCHAS ITERACIONES MEJORA ESTO.")
        }

    }
    /**
     * ESCUCHAREMOS LOS MOVIMIENTOS DE DRAG AND RELEASE
     */
    initListeners() {
        var initEvent = null;
        var lasttouchmove = null;
        var eventStart = function (event) {
            initEvent = event;
        }
        var eventEnd = (event) => {
            if (event == null) {
                return null;
            }
            // console.log("DRAG END", initEvent, event)
            // CALC THE DISTANCE
            let dx = initEvent.clientX - event.clientX;
            let dy = initEvent.clientY - event.clientY;
            let distance = Math.sqrt((dx * dx) + (dy * dy));
            let direction_str = null;
            let direction = null;
            if (Math.abs(dx) > Math.abs(dy)) {
                direction_str = dx < 0 ? "right" : "left";
                direction = [dx < 0 ? 1 : -1, 0]
            } else if (Math.abs(dy) > Math.abs(dx)) {
                direction_str = dy < 0 ? "down" : "up";
                direction = [0, dy < 0 ? 1 : -1];
            }

            if (distance > 30) {
                this.pullCardsTo(direction_str);

                //console.log(distance, direction, direction_str);
            }
            initEvent = null;
        }
        document.addEventListener("mousedown", eventStart, false);
        document.addEventListener("mouseup", eventEnd, false);

        document.addEventListener('touchstart', function (event) {
            eventStart(event.touches[0])
        }, false);
        document.addEventListener('touchmove', function (event) {
            lasttouchmove = (event.touches[0])
        }, false);
        document.addEventListener('touchend', function (event) {
            eventEnd(lasttouchmove);
            lasttouchmove = null;
        }, false);


    }
    pullCardsTo(direction) {
        // ITERATE CELLS AND MOVE THE CARDS TO DIRECTION FROM THE  DIRECTION UNTIL OPPOSITE.
        let current_state=this.getCurrentState();
        let range = {
            x: [0, GRIDSIZE[0]],
            y: [0, GRIDSIZE[1]]
        }
        if (direction == "down") {
            range = {
                x: [0, GRIDSIZE[0]],
                y: [GRIDSIZE[1] - 1, -1]
            }
        }
        if (direction == "right") {
            range = {
                x: [GRIDSIZE[0] - 1, -1],
                y: [0, GRIDSIZE[1]]
            }
        }
        let xdir = range.x[0] < range.x[1] ? 1 : -1;
        let ydir = range.y[0] < range.y[1] ? 1 : -1;
        // console.log(xdir, ydir, range)
        let x = range.x[0];
        let iterationsmax = GRIDSIZE[0] * GRIDSIZE[1];
        let couldmove = false;
        while (x != range.x[1] && iterationsmax > 0) {

            let y = range.y[0];
            while (y != range.y[1] && iterationsmax > 0) {

                let cell = this.cellMap[x + "_" + y];
                if (cell.card != null) {
                    if (this.moveCardTo(cell.card, direction)) {
                        couldmove = true;
                    }
                }
                y += ydir;
                iterationsmax -= 1;
            }
            x += xdir;
        }

        if (couldmove) {

            this.storeState(current_state);
            Sounds.fall.play();
            this.addRandomCard();
        }


    }
    moveCardTo(_card, direction) {
        let couldmove = false;
        let nx, ny;
        if (direction == "up") {
            ny = _card.cell.y - 1;
            nx = _card.cell.x;

        }
        if (direction == "down") {
            ny = _card.cell.y + 1;
            nx = _card.cell.x;

        }

        if (direction == "right") {
            ny = _card.cell.y;
            nx = _card.cell.x + 1;

        }

        if (direction == "left") {
            ny = _card.cell.y;
            nx = _card.cell.x - 1;

        }

        if (nx > -1 && ny > -1 && nx < GRIDSIZE[0] && ny < GRIDSIZE[1]) {

            let cell = this.cellMap[nx + "_" + ny];

            let _continue = false;
            // VALIDATE THAT CELL IS EMPTY
            if (cell.card == null) {
                cell.bindCard(_card);
                _continue = true;
                couldmove = true;
            } else {
                // SI NO ESTA VACIO VALIDA QUE LA CARD TENGA EL MISMO NUMERO 
                if (cell.card.number == _card.number) {
                    // CONBINE
                    _card.cell.unbindCard();
                    _card.remove();
                    let othercard = cell.card;
                    cell.unbindCard();
                    othercard.remove();
                    _card = cell.addCard(_card.number + 1);
                    Sounds.pop.play();
                    couldmove = true;
                    _game.addScore(_card.outputnumber)

                }
            }

            if (_continue) {
                this.moveCardTo(_card, direction);
            }

        } else {
            // console.log("CANT MOVE CARD");
        }

        return couldmove;

    }
    render() {
        //console.log("RENDER BOARD")
        this.cellMap = {};
        var cells = [];

        let cellwidth = Math.round(WIDTH / GRIDSIZE[0])
        let cellheight = Math.round(HEIGHT / GRIDSIZE[1]);
        let width = "100%";
        let height = (cellheight * GRIDSIZE[1]) + "px";
        let top = "calc(50% - " + ((cellheight * GRIDSIZE[1]) / 2) + "px)";
        let left = "calc(50% - " + ((cellwidth * GRIDSIZE[0]) / 2) + "px)";
        for (let i = 0; i < GRIDSIZE[0]; i++) {

            for (let j = 0; j < GRIDSIZE[1]; j++) {
                this.cellMap[i + "_" + j] = new Cell(i, j, cellwidth, cellheight);
                cells.push(`<div id="cell_${i}_${j}" ></div>`)
            }
        }
        this._element.innerHTML = ` <div style="position:relative;top:${top};left:${left};width:${width};height:${height}"> ${cells.join("")} </div> `;
    }
}


class Scoretext {
    constructor(e) {
        this._element = e;
    }
    render() {
        this._element.innerHTML = this.view();
    }
    view() {
        return `<div class="full-width center center-text">
            ${_game.score} 
        </div>`
    }
}
export default class Game2048 {
    constructor(e) {
        this._element = e;
        _game = this;
        this.board = null;
        this.score = 0;
        this.scoretext = null;
    }
    render() {
        this._element.innerHTML = this.view();
        eventInspector.call(this, "click")
    }
    initGame() {
        this.score = 0;
        this.board.addRandomCard();
    }

    addScore(num) {
        this.score += num;
        this.scoretext.render()
    }
    replay() {

        this.score = 0;
        this.render();
    }
    undo() {
        this.board.undo();
    }
    view() {
        setTimeout(() => {

            this.board = new Board(document.getElementById("board"));
            this.scoretext = new Scoretext(document.getElementById("scoretext"));
            this.board.render();
            this.scoretext.render();
            setTimeout(() => {
                this.initGame();
            }, 2)
        }, 100);

        return `<div id="game-wrapper" >
     
            <div id="game-board" class=" full-view">
                <div style="width:${WIDTH}px;height:100%;margin:0 auto;position:relative;">  
                    <div id="scoretext" class="top left full-width" ></div>  
                    <button click="replay()" id="buttonReplay">Replay</button>
                    <button click="undo()" id="buttonUndo">Undo</button>
                    <div class="board-wrapper valign" style=" position:relative;width:100%;height:100%;">        
                        <div id="board"   style=" position:relative;width:${WIDTH}px;height:${HEIGHT}px;" ></div>
                    </div>
                </div>
            </div> 
        
    </div>`;
    }
}