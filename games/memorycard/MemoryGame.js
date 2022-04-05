import Sound from "../Sound.js";
window.nothing=()=>{}
const WIDTH = document.body.offsetWidth - 10 > 400 ? 400 : document.body.offsetWidth - 10;
const HEIGHT = 400;
const COLORS = ["black", "red", "green", "blue", "purple", "orange", "yellow", "pink"];
const Sounds = {
    cardflip: new Sound("cardflip.mp3"),
    cardflip2: new Sound("cardflip2.mp3"),
    wallClockTick: new Sound("wall-clock-tick.mp3")
};
const LEVEL = [{},
{
    moves: 2,
    grid: [4, 1],
    waittime: 2,
    beattime: 12
},
{
    moves: Infinity,
    grid: [2, 1],
    waittime: 1,
    beattime: 10
},
{
    moves: Infinity,
    grid: [3, 2],
    waittime: 2,
    beattime: 10
},

{
    moves: 1,
    grid: [2, 2],
    waittime: 1,
    beattime: 3
},
{
    moves: 2,
    grid: [3, 2],
    waittime: 3,
    beattime: 20
},
{
    moves: 3,
    grid: [3, 4],
    waittime: 3,
    beattime: 20
},
{
    moves: 4,
    grid: [4, 4],
    waittime: 4,
    beattime: 20
},
{
    moves: 10,
    grid: [4, 4],
    messy: true,
    waittime: 4,
    beattime: 60
},
{
    moves: 5,
    grid: [3, 4],
    messy: true,
    waittime: 2,
    beattime: 30
},
{
    moves: 3,
    grid: [4, 3],
    messy: true,
    waittime: 2,
    beattime: 20
},
{
    moves: 3,
    grid: [4, 3],
    messy: true,
    waittime: 2,
    beattime: 15
},
{
    moves: 10,
    grid: [4, 4],
    messy: true,
    waittime: 4,
    beattime: 65
}
];
var _game = null;
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
    var _id = Date.now().toString().substr(6, 29) + "t" + Math.random().toString().substr(2, 9)
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

    window.requestAnimationFrame(currentAnimationFrame);
}
currentAnimationFrame();

class MovesText {
    constructor(e) {
        this._element = e;
        this.render();
        this.lastmoves = 0;
    }
    render() {
        this._element.innerHTML = this.view();
    }
    view() {
        let color = "";
        if (_game.moves > this.lastmoves) {
            color = "green";
        } else if (_game.moves < this.lastmoves) {
            color = "red";
        }
        this.lastmoves = _game.moves;
        setTimeout(() => {
            this._element.querySelector(".move-text").style.color = "#111";
        }, 1000)
        return `<div class=" center ${color != "" ? " animated jello" : ""} move-text " style="color:${color};transition:color 1s" >  ${_game.moves == Infinity ? "&#8734;" : _game.moves}  </div>`
    }
}
class ScoreText {
    constructor(e) {
        this._element = e;
        this.render();
        this.lastscore = 0;
    }
    render() {


        this._element.innerHTML = this.view();
    }
    view() {
        let color = "";
        if (_game.score > this.lastscore) {
            color = "green";
        } else if (_game.score < this.lastscore) {
            color = "red";
        }
        setTimeout(() => {
            this._element.querySelector(".score-text").style.color = "#111";
        }, 1000)
        this.lastscore = _game.score;
        return `<div class="center ${color != "" ? " animated pulse" : ""}  score-text" style="color:${color};transition:color 1s" >  ${_game.score}  </div>`
    }
}
class ProgressTimer {
    constructor(e, time = 0) {
        this._element = e;
        this.maxtime = time;
        this.id = Math.random().toString().substr(3, 10);
        this.active = false;
        this.currenttime = 0;
        this.promise_resolve = null;
        this._element.innerHTML = `   <div class="progress-read-card valign">
         <div class="progress valign center" style="width:0px;"></div>
        </div>`;
        setTimeout(() => {
            this.progress = document.querySelector(".progress", this._element)
        }, 1);
        this.remove_enterframelistener = null;
        this.audio = Sounds.wallClockTick.get();
        this.audio.loop = true;
        this.audio.pause();
        this.audio.currentTime = 0;
    }
    add(n) {
        this.currenttime -= n;
    }
    pause(){
        this.audio.pause();
        this.active=false;
    }
    resume(){
        this.active=true;
        this.audio.play();
    }
    stop() {
        this.stopAudio();
        this.active = false;
        this.remove_enterframelistener();
    }
    initAudio() {
        this.audio.pause();
        this.audio.volume = 0.1;
        this.audio.currentTime = 0;
        this.audio.play();
    }
    stopAudio() {
        this.audio.pause();
        this.audio.currentTime = 0;
    }
    start(waittostart = 0, maxtime) {
        return new Promise((resolve) => {

            this.promise_resolve = resolve;
            this.currenttime = 0;
            this.maxtime = maxtime * 60;
            setTimeout(() => {
                this.initAudio();
                this.active = true;
                this.remove_enterframelistener = onEnterFrame(() => { this._run() });
            }, waittostart * 600);
        })
    }
    _run() {
        if (this.active) {
            this.currenttime += 1;

            let volume = parseFloat(this.currenttime / (this.maxtime * 0.7)).toFixed(1);
            this.audio.volume = volume > 1 ? 1 : volume;
            //-- console.log(this.audio.volume)
            this.render();

            if (this.currenttime >= this.maxtime) {
                this.stopAudio();
                this.active = false;
                this.promise_resolve();
                this.remove_enterframelistener();
            }
        }
    }
    render() {
        this.progress.style.width = ((this.currenttime / this.maxtime) * 100) + "%";
        this.progress.innerHTML = Math.round((this.maxtime - this.currenttime) / 60) + "S"
    }

}

class Card {
    constructor(type) {
        this._element = document.createElement("div");
        this._element.classList.add("card", "C" + type, "animated", "flipInX");
        this.type = type;
        this._element.innerHTML = `<div class='card-inner'>
                                        <div class="card-front valign" style="background:${COLORS[type]}">
                                            <h1 >${(type)} </h1>
                                        </div>
                                        <div class="card-back valign" >
                                            <h1>X</h1>
                                        </div>
                                    </div>`;
        this._element.card = this;
        if (LEVEL[_game.level].hasOwnProperty("messy") && LEVEL[_game.level].messy) {
            this._element.style.setProperty("transform", "rotate(" + random(-30, 30) + "deg) translate(" + random(-10, 10) + "px," + random(-10, 10) + "px)", "important");
        }
        //  this._element.addEventListener('touchend', this.selectme, false);
        this._element.addEventListener('click', this.selectme, false);
        this.visible = true;
        this.disabled = true;
    }
    selectme(evt) {
        let card = this.card;
        if (!card.disabled) {
            if (_game.canflip() && !card.visible) {
                card.show();
                _game.validatePair(card);
            }
        }
    }
    hide(nosound = false) {
        if (this.visible) {
            if (!nosound) {
                Sounds.cardflip2.play();
            }
            this.visible = false;
            this._element.classList.add("hidden");
        }
    }
    show() {
        if (!this.visible) {
            Sounds.cardflip.play();
            this.visible = true;
            this._element.classList.remove("hidden");
        }
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
        setTimeout(() => {
            this.initCell()
        }, 1)
    }


    initCell() {
        this._element = document.getElementById("cell_" + this.x + "_" + this.y);
        this._element.classList.add("cell", "valign", "center")
        if (LEVEL[_game.level].hasOwnProperty("messy") && LEVEL[_game.level].messy) {
            this._element.classList.add("no-border")
        }
        this._element.style.width = this.width + "px";
        this._element.style.height = this.height + "px";

        this._element.style.position = "absolute";
        this._element.style.left = (this.x * this.width) + "px";
        this._element.style.top = (this.y * this.height) + "px";
        this._element.cell = this;

    }

    addCard(_type) {

        this.card = new Card(_type);
        this._element.appendChild(this.card._element);
    }
}
class Board {
    constructor(e) {
        this._element = e;
        this.cellMap = {};

    }

    fill() {
        var maxtypes = _game.totalmatchs;
        var types_selected = {}
        Object.values(this.cellMap).forEach((cell) => {
            // GET RANDOM TYPE OF CARD.
            let type = random(1, maxtypes);
            let iterations = 100;
            while (types_selected.hasOwnProperty(type) && types_selected[type] == 2 && iterations > 0) {
                type = random(1, maxtypes);
                iterations -= 1;
            }

            if (!types_selected.hasOwnProperty(type)) {
                types_selected[type] = 0;
            }
            types_selected[type] += 1;

            cell.addCard(type);
        });


    }
    render() {
        this.cellMap = {};
        var cells = [];
        let gridsize = LEVEL[_game.level].grid;
        let cellwidth = Math.round(WIDTH / 4)
        let cellheight = Math.round(HEIGHT / 5);
        let width = "100%";
        let height = (cellheight * gridsize[1]) + "px";
        let top = "calc(50% - " + ((cellheight * gridsize[1]) / 2) + "px)";
        let left = "calc(50% - " + ((cellwidth * gridsize[0]) / 2) + "px)";
        for (let i = 0; i < gridsize[0]; i++) {

            for (let j = 0; j < gridsize[1]; j++) {
                this.cellMap[i + "_" + j] = new Cell(i, j, cellwidth, cellheight);
                cells.push(`<div id="cell_${i}_${j}" ></div>`)
            }
        }
        this._element.innerHTML = ` <div style="position:relative;top:${top};left:${left};width:${width};height:${height}"> ${cells.join("")} </div> `;
    }
}


class Startscreen {
    constructor(e) {
        this._element = e;
        this.render();
    }
    render() {
        this._element.innerHTML = this.view();
        eventInspector.call(this, "click");
    }
    onclick() {
        _game.scrollview.setpage(1);
    }
    view() {
        return `<div class="full-view center valign pointer" click="onclick()">
            <div class="full-width no-select">
                <h1>Memory </h1>
                <p>Toca la pantalla </p>
            </div> 
        </div>`
    }
}

class GameMenu {
    constructor(e) {
        this._element = e;
        this.render();
    }
    render() {
        this._element.innerHTML = this.view();
        eventInspector.call(this, "click")
    }
    start() {
        _game.scrollview.setpage(2); 
        _game.startLevel();
    }
    view() {
        return `<div class="full-view center " click="start(1)"  style="overflow:auto;width:80%;margin-top:50px;font-size:18px">
                    <h2>¿Como Jugar?</h2>
                   <div class="full-width" style="text-align:left;">
                        <h3 class="center">🎴🎴</h3>
                        <p>

                           Encuentra las tarjetas iguales en pantalla, tendras un tiempo para ver las tarjetas antes que se volteen.

                        </p>
                        <p>
                            Acumularas punto por cada par de tarjetas que encuentres.
                        </p>
                        <p>
                            Perderas puntos por cada equivocacion.
                        </p>
                        <p>
                            Tendras un maximo de movimientos por Nivel, cada nivel sera mas dificil.
                        </p>
                        <p>
                            Tendras un maximo de tiempo para encontrar los pares, cada nivel sera mas dificil.
                        </p>

                        <p>
                            Perderas el juego cuando tu puntaje llegue a 0
                        </p>
                </div>
                <h3>
                    Buena suerte!
                </h3>
                <br />
                <p class="center-text">Toca la pantalla Para continuar </p>
            </div>
        </div>`;
    }
}

class ResultView {
    constructor(e) {
        this._element = e;
        this.result = "";
        this.win = false;
        this.ready = false;
        this.render();
    }
    render() {
        this.ready = false;
        setTimeout(() => {
            this.ready = true;
        }, 1000)
        this._element.innerHTML = this.view();
        eventInspector.call(this, "click");
    }
    close() {
        if (this.ready) {
            this.ready = false;
            _game.scrollview.setpage(2);
            setTimeout(() => { _game.startLevel(); }, 100)
        }
    }
    showwin() {
        this.win = true;

        this.result = `<h1>Nivel ${_game.level}</h1>  <h2> Superado! </h2>`;
        setTimeout(() => { _game.scrollview.setpage(3); this.render(); }, 1100);
    }
    showlose() {
        this.win = false;

        if (_game.score > 0) {
            this.result = `<h1>Perdiste intentalo de nuevo </h1>`
        } else {
            _game.level = 1;
            this.result = `<h1>Perdiste todos tus puntos </h1>`;
        }
        setTimeout(() => { _game.scrollview.setpage(3); this.render(); }, 2100);
    }
    view() {
        return `<div class="full-view valign" style="background:${this.win ? "lightgreen" : "white"}" click="close()" > 
                <div style=" width:100%;text-align:center;font-size:20px;">
                    ${this.result}         
                    <div class="animated fadeIn"><p class="center-text" >Toca la pantalla Para continuar </p></div>
                </div>
          
        </div>`
    }
}

export default class MemoryGame {
    constructor(e) {
        this._element = e;
        this.progressTimer = null;
        _game = this;
        this.level = 1;
        this.pairs = [];
        this.moves = 0;
        this.score = 0;
        this.matchs = 0;
        this.totalmatchs = 0;
        this.resultview = null;
        this.started = false;
    }
    render() {
        this._element.innerHTML = this.view();
    }
    canflip() {
        return this.pairs.length < 2 && this.moves > 0;
    }
    lost(text = "") {
        this.progressTimer.stop();
        this.resultview.showlose()
        this.started = false;
        //  this.startLevel();
    }
    win() {
        this.resultview.showwin()
        this.progressTimer.stop();
        this.level += 1;
        if (this.level >= LEVEL.length) {
            this.level = LEVEL.length - 1;
        }
        this.started = false;
        // this.startLevel();
    }
    spentMove() {
        this.moves -= 1;
        this.movesText.render();

        if (this.moves <= 0) {
            this.lost();
        }
    }
    validateIfWin() {
        if (this.matchs == this.totalmatchs) {
            this.win();
        }
    }
    validatePair(card) {
        if (this.pairs.length < 2) {
            this.pairs.push(card);
            if (this.pairs.length == 2) {

                if (this.pairs[0].type == this.pairs[1].type) {
                    this.pairs[0].disabled = true;
                    this.pairs[1].disabled = true;
                    this.matchs += 1;
                    this.score += 100;
                    this.progressTimer.add(1);
                    this.validateIfWin();
                } else {
                    this.score -= 120;
                    if (this.score < 0) {
                        this.score = 0;
                    }
                    this.spentMove()
                    let cards = this.pairs.map(card => card);
                    // QUE DEMORE EN REGRESAR PARA QUE SE VEA...
                    setTimeout(() => {
                        cards[0].hide();
                        cards[1].hide();
                    }, 300);

                }
                this.scoreText.render();
                this.pairs = [];

            }
        }
    }
    hideAllCards() {
        Object.values(this.board.cellMap).forEach((cell) => {
            cell.card.hide(true);
            cell.card.disabled = false;
        });
    }
    startLevel() {
        if (!this.started) {
            this.started = true;
            this.pairs = [];
            this.moves = LEVEL[this.level].moves;
            this.matchs = 0;
            this.totalmatchs = (LEVEL[this.level].grid[0] * LEVEL[this.level].grid[1]) / 2;
            this.board.render();
            this.movesText.render();
            setTimeout(() => {
                this.board.fill();
                Sounds.wallClockTick.loop = true;

                this.progressTimer.start(1, LEVEL[this.level].waittime).then(() => {
                    this.hideAllCards();
                    Sounds.cardflip2.play()
                    this.progressTimer.start(1, LEVEL[this.level].beattime)
                        .then(() => {

                            // SI NO HA TERMINADO HASTA AHORA PERDIO 
                            this.lost("TIMES UP...");
                        })
                });
            }, 2);
        }else{
            this.progressTimer.resume()
        }
    }
    view() {


        setTimeout(() => {
            this.scoreText = new ScoreText(document.getElementById("score-text-wrapper"))
            this.movesText = new MovesText(document.getElementById("move-text-wrapper"));
            this.progressTimer = new ProgressTimer(document.getElementById("progress-wrapper"));
            this.board = new Board(document.getElementById("board"));
            this.startscreen = new Startscreen(document.getElementById("game-screen1"));
            this.gamemenu = new GameMenu(document.getElementById("game-menu"));
            this.resultview = new ResultView(document.getElementById("result-set"))
            this.scrollview = document.getElementById("scrollview");


            this.scrollview.max = 3;
            this.scrollview.current = 0;

            this.scrollview.setpage = function (page) {
                this.current = page;
                this.update()
            }
            this.scrollview.update = () => {

                if (this.current > this.max) {
                    this.current = this.max;
                }

                if (this.current < 0) {
                    this.current = 0;
                }
                this.scrollview.style.top = (this.scrollview.current * -this._element.offsetHeight) + "px";
            }
            document.getElementById("clicktorules").onclick = () => {
                this.progressTimer.pause(); 
                this.scrollview.setpage(1);
            }
            window.$game = this;
            //  this.startLevel();
        }, 1);
        // CREATE TABLE NxN
        return `<div id="game-wrapper" >
            <div id="scrollview" class="full-view" >
                <div id="game-screen1" class="valign full-view " >
                    
                </div>
                <div id="game-menu" class="valign full-view " >
                
                </div>
                <div id="game-board" class=" full-view">
                    <div style="width:${WIDTH}px;margin:0 auto;position:relative;"> 
                        <div id="clicktorules" class="top right " style="z-index:100;padding:20px;"><a href="javascript:nothing()">Reglas 📏</a> </div>
                        <div id="score-text-wrapper"></div> 
                        <div id="move-text-wrapper"></div> 
                        <div id="progress-wrapper"></div> 
                        <div id="board"   style=" position:relative;width:${WIDTH}px;height:${HEIGHT}px;" ></div>
                    </div>
                </div>
                <div id="result-set"></div>
            </div>
        </div>`;
    }
}