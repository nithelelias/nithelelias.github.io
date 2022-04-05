import Sound from "../Sound.js";
const WIDTH = document.body.offsetWidth - 10 > 400 ? 400 : document.body.offsetWidth - 10;
const HEIGHT = 400;

function random(min, max) {
    if (!max) {
        max = min;
        min = 0;
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getFINAL_SCORE() {
    return SCORE > 0 ? Math.ceil((SCORE) * MAXCOMBO - (MOVES * 10) + (_game.toolsPanel.bombs * 100) + (_game.toolsPanel.wishes * 100) + (_game.toolsPanel.hints * 100)) : 0;
}

var SOUNDS = {
    pop: new Sound("sounds/pop.mp3"),
    plop: new Sound("sounds/plop.mp3"),
    score: new Sound("sounds/score.mp3"),
    clapping_hands1: new Sound("sounds/clapping_hands1.mp3"),
    hinge: new Sound("sounds/hinge.mp3"),
    explosionpop: new Sound("sounds/explosionpop.mp3"),
    wish: new Sound("sounds/wish.mp3")
};
window.SOUNDS = SOUNDS
var MAXCOMBO = 1;
var SCORE = 0;
var COMBO = 0;
var MOVES = 0;
var idcounter = 0;
var candyColor = ["red", "green", "blue", "orange", "purple", "yellow"];
var _Game;
 
var addScore = function (val) {
    COMBO += 1;
    SCORE += val * (100 * COMBO);
    if (COMBO >= 4) {
        _game.toolsPanel.bombs += 1;
        _game.toolsPanel.wishes += 1;
    }
    if (COMBO > MAXCOMBO) {
        MAXCOMBO = COMBO;
    }

    _game.scorePanel.render();
    _game.switchBgColor()
}

class Candy {
    constructor(cell) {

        this.cell = cell;
        this.cssSize = "calc(100% - 10px)"
        this._element = document.createElement("div");
        this._element.classList.add("candy")
        this.color = candyColor[random(0, candyColor.length - 1)];
        // this._element.style.backgroundColor = this.color;
        this._element.classList.add(this.color)
        this._element.style.height = this._element.style.width = this.cssSize;
        this._element.style.position = "relative";
        this._element.style.top = this._element.style.left = 'calc(50% - 15px)';
        this._element.candy = this;
        cell._element.appendChild(this._element);

        this._element.setAttribute("draggable", true);
        // FOR MOBILE IT REQUIRES FROM SCRATCH
        var dragging = false
        var position = { x: 0, y: 0 }
        var lasteventmove = null;
        this._element.addEventListener('touchmove', (e) => {
            // grab the location of touch
            var touchLocation = e.targetTouches[0];
            if (!dragging) {
                // assign box new coordinates based on the touch.4
                dragging = true;
                this._element.style.width = this._element.offsetWidth + "px";
                this._element.style.height = this._element.offsetHeight + "px";

                this._element.style.position = "fixed";
            }

            var gamebox = document.querySelector("#gamebox");
            this._element.style.left = (touchLocation.pageX - gamebox.offsetLeft - this._element.offsetWidth / 2) + 'px';
            this._element.style.top = (touchLocation.pageY - gamebox.offsetTop - this._element.offsetHeight / 2) + 'px';
            this._element.style.zIndex = 10000;

            position.x = Math.round((touchLocation.pageX - gamebox.offsetLeft - this._element.offsetWidth / 2) / this.cell.width)
            position.y = Math.round((touchLocation.pageY - gamebox.offsetTop - this._element.offsetHeight / 2) / this.cell.height)
            lasteventmove = e
            e.preventDefault();
        });

        this._element.addEventListener('touchend', (e) => {
            // current box position. 
            dragging = false;

            this._element.style.height = this._element.style.width = this.cssSize;
            this._element.style.position = "relative";
            this._element.style.top = this._element.style.left = 'calc(50% - 15px)';
            // CALCULATE CELL BY POSITION..   
            if (_Game.map.length > position.x && _Game.map[position.x].length > position.y) {
                var cell = _Game.map[position.x][position.y];
                if (cell.dropCandy(this)) {
                    MOVES += 1
                }
            }
            e.preventDefault();
        })
    }
    switchColor() {
        let color = this.color;
        this._element.classList.remove(color)
        while (color == this.color) {
            color = candyColor[random(0, candyColor.length - 1)];
        }
        this.color = color;
        //this._element.style.backgroundColor = this.color;
        this._element.classList.add(color)
    }
    animateToDestiny(cellDestiny) {
        return new Promise((resolve) => {

            this._element.classList.add("animated", "jello")
            setTimeout(() => {
                this._element.classList.remove("animated", "jello");
                // cellDestiny.setCandy(this);
                resolve();
            }, 500)

        })
    }
    flinch() {

        this._element.classList.add("animated", "headShake")
        setTimeout(() => {
            this._element.classList.remove("animated", "headShake")
        }, 500)
    }
    pulse(until = 500) {
        this._element.classList.add("animated", "pulse", "infinite");
        setTimeout(() => {
            this._element.classList.remove("animated", "pulse", "infinite");
        }, until)
    }
    bombAway() {
        var bang = document.createElement("div");
        bang.classList.add("bang")
        bang.innerHTML = `<div class=" animated fadeOut" style="font-size:32px;z-index:100;position:absolute;">💥</div>`;
        this.cell._element.appendChild(bang)
        this._element.classList.add("animated", "hinge");
        SOUNDS.explosionpop.play();
        setTimeout(() => {
            this._element.display = "none";
            this.cell.removeCandy();
            this.cell._element.querySelector(".bang").remove();
        }, 500)
    }
    wishChangeColor() {
        var magic = document.createElement("div");
        magic.classList.add("magic")
        magic.innerHTML = `<div class=" animated fadeOut" style="font-size:22px;z-index:100;position:absolute;">⚡⭐</div>`;
        this.cell._element.appendChild(magic)
        SOUNDS.wish.play();
        this.switchColor();
        setTimeout(() => {
            this.cell._element.querySelector(".magic").remove();
        }, 500)
    }
    hintTo(_cell) {

        let vel = 20;
        let dirx = (_cell.x == this.cell.x ? 0 : _cell.x > this.cell.x ? 1 : -1) * vel;
        let diry = (_cell.y == this.cell.y ? 0 : _cell.y > this.cell.y ? 1 : -1) * vel;
        this._element.style.position = "absolute"
        this._element.style.transition = "all 0.5s ";
        let startp = {
            y: this._element.offsetTop,
            x: this._element.offsetLeft
        };
        let times = 4;
        let blink = () => {
            if (times > 0) {
                this._element.style.top = (this._element.offsetTop + diry) + "px";
                this._element.style.left = (this._element.offsetLeft + dirx) + "px";
                //console.log(this._element.style.top, this._element.style.left)
                dirx *= -1;
                diry *= -1;
                times -= 1;
                setTimeout(() => { blink() }, 500);
            } else {
                this._element.style.position = "relative";
                this._element.style.top = startp.y + "px";
                this._element.style.left = startp.x + "px";
                this._element.style.transition = "none";
            }
        }
        _cell.candy.pulse(2000);
        //console.log("HINT ", dirx, diry)
        blink();

    }
    remove() {
        // this._element.style.height = this._element.style.width = "1px"
        this._element.classList.add("animated", "bounceOut")
        setTimeout(() => {
            this._element.remove();
        }, 500)

    }
}
class Cell {
    constructor(x, y, w, h) {
        this._element = null;
        idcounter += 1;
        this.id = "id" + idcounter;
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.candy = null;
        setTimeout(() => {
            this.initCell()
        }, 100)
    }


    initCell() {
        this._element = document.getElementById("cell_" + this.x + "_" + this.y);
        this._element.classList.add("cell")

        this._element.style.width = this.width + "px";
        this._element.style.height = this.height + "px";

        this._element.style.position = "absolute";
        this._element.style.left = (this.x * this.width) + "px";
        this._element.style.top = (this.y * this.height) + "px";
        this._element.cell = this;
        this.candy = new Candy(this)
    }

    removeCandy() {
        if (this.candy != null) {
            this.candy.remove();
            this.candy = null;
        }
    }
    setCandy(candy) {

        // QUITO MI CANDY DE MI POSICION
        if (this.candy != null && this._element.hasChildNodes(this.candy._element)) {
            this._element.removeChild(this.candy._element);
        }
        if (candy != null) {
            // LE QUITAMOS EL PARENT DEL CANDY
            if (candy._element.parentNode != null) {
                candy._element.parentNode.removeChild(candy._element)
            }
            // GUARDAMOS A ESTE COMO MI CANDY
            this.candy = candy;
            candy.cell = this;

            this._element.appendChild(this.candy._element);
        } else {
            this.candy = null;
        }
    }
    isNear(cell) {
        if (cell != null) {
            var d = Math.abs(cell.x - this.x) + Math.abs(cell.y - this.y)
            return d == 1;
        }
        return false
    }
    dropCandy(dropcandy, _validate = true) {
        if (dropcandy != null && dropcandy.cell != null) {
            if (dropcandy.cell != this) {
                if (this.isNear(dropcandy.cell)) {
                    var cell2 = dropcandy.cell;
                    var mycandy = this.candy;
                    // NOW MY CANDY IS THERE

                    cell2.setCandy(mycandy);

                    //DROPED CANDY IS NOW MY CANDY
                    this.setCandy(dropcandy);
                    //
                    if (_validate) {

                        SOUNDS.pop.play();
                        if (!_game.validateScoreMatch()) {
                            // RETURN CANDY TO OWNER...
                            dropcandy.flinch()
                            cell2.dropCandy(dropcandy, false)
                        } else {


                            return true;
                        }

                    }
                } else {
                    //console.log("NOT ADYACENT")
                }
            }
        }
        return false;
    }

};

class ScorePanel {
    constructor(e) {
        this._element = e;
        this.lastCombo = 0
        this.render()
    }
    getScore() {
        return SCORE
    }
    render() {
        this._element.innerHTML = this.view();
    }
    view() {
        var showcombo = this.lastCombo != COMBO && COMBO > 1
        if (showcombo) {

            var gamebox = document.querySelector("#gamebox");
            setTimeout(() => {
                this.render()
            }, 1000);

            if (COMBO > 2) {
                SOUNDS.hinge.play();
                gamebox.classList.add("animated", "swing");
                setTimeout(() => {
                    gamebox.classList.remove("animated", "swing")
                }, 900)
            }
        }
        this.lastCombo = COMBO;
        return `<div class="score_box" style="position:relative;width:100%;">
             <div style="width:90%;margin:0 auto;display:flex;">
                <div class="score_num_box" style="">
                    <h2 style="color:#d50938;">SCORE</h2>
                    <h1 class="score_h1 animated bounceIn" > ${this.getScore()} <h1>  
                </div>
                <div class="score_move_box">
                    <h2 style="color:#715c9e;">MOVES</h5>
                    <h1 class="moves_h1    " >${MOVES}<h1>
                </div>
             </div>
             ${showcombo ? `  <div class="animated bounceIn top right"> <h1 class=" combo_h1 "  > COMBO X  ${COMBO} </h1> </div>` : ""}
         </div>`;
    }
}

class ToolsPanel {
    constructor(e) {
        this._element = e;
        this.hints = 2;
        this.bombs = 2;
        this.wishes = 2;
        this.busy = false;
        this.render()
    }
    render() {
        this._element.innerHTML = this.view();
        this._element.querySelectorAll("[click]").forEach((target) => {
            var method = target.attributes["click"].value;
            target.onclick = (event) => {
                if (!this.busy) {
                    eval("this." + method)
                    this.render();
                }
            }
        })
    }
    wish() {
        this.wishes -= 1;
        this.busy = true;
        // CHANGE COLORS OF 50% OF CANDYS
        var all_candys = [];
        _game.map.forEach((row) => {
            row.forEach((_cell) => {
                if (_cell.candy != null) {
                    all_candys.push(_cell.candy)
                }
            })
        });
        var total = all_candys.length;
        var max = Math.ceil(total * 0.30);
        var picked = {}
        var maxiterations = 300
        while (max > 0 && maxiterations > 0) {

            var choosed = random(0, total);
            if (!picked.hasOwnProperty(choosed) && all_candys[choosed] != null) {
                all_candys[choosed].wishChangeColor();
                picked[choosed] = 1;
                //console.log("BOMB ", all_candys[choosed])
                max -= 1;
            }
            maxiterations -= 1
        }
        setTimeout(() => {
            _game.gravityFall();
            setTimeout(() => {
                this.busy = false;
                this.render();
            }, 1000)
        }, 1000)
    }
    bomb() {
        this.bombs -= 1;
        this.busy = true;
        // THROW A BOMB TO TABLE RANDOM KICKING 25% PERCENT OF CANDYS...
        var all_candys = [];
        _game.map.forEach((row) => {
            row.forEach((_cell) => {
                if (_cell.candy != null) {
                    all_candys.push(_cell.candy)
                }
            })
        });
        var total = all_candys.length;
        var max = Math.ceil(total * 0.25);
        var picked = {}
        var maxiterations = 300
        while (max > 0 && maxiterations > 0) {

            var choosed = random(0, total);
            if (!picked.hasOwnProperty(choosed) && all_candys[choosed] != null) {
                all_candys[choosed].bombAway();
                picked[choosed] = 1;
                //console.log("BOMB ", all_candys[choosed])
                max -= 1;
            }
            maxiterations -= 1
        }
        setTimeout(() => {
            _game.gravityFall();
            setTimeout(() => {
                this.busy = false;
                this.render();
            }, 1000)
        }, 1000)
    }
    hint() {
        this.hints -= 1;
        this.busy = true
        // MUESTRA VARIOS HINTS MAX 4 AT TIME.
        var max = 4;
        _game.validatePosibleMoves();
        for (let i in _game.POSIBLES) {
            if (_game.POSIBLES[i].from.candy != null && _game.POSIBLES[i].to.candy != null) {
                _game.POSIBLES[i].from.candy.hintTo(_game.POSIBLES[i].to);
                //console.log("HINT TO", _game.POSIBLES[i]);
                max -= 1;
            }
            if (max <= 0) {
                break;
            }
        }
        setTimeout(() => {
            this.busy = false;
            this.render();
        }, 1000)
    }
    restart() {
        _game.endGame.show();
    }
    view() {

        return `<div style="margin:0 auto;text-align:center;padding:20px;" >
         <button  style="font-family:gamefont2;" click="bomb()" ${this.busy || this.bombs < 1 ? "disabled" : ""} >  💣 BOMB (${this.bombs})</button>
         <button style="font-family:gamefont2;" click="wish()" ${this.busy || this.wishes < 1 ? "disabled" : ""} >  🌟 WISH (${this.wishes})</button>
         <button style="font-family:gamefont2;" click="hint()" ${this.busy || this.hints < 1 ? "disabled" : ""} >  👁️‍🗨️ HINT (${this.hints})</button>
         <button style="font-family:gamefont2;" click="restart()" ${this.busy ? "disabled" : ""} >  RESTART</button>
         
         </div>`;
    }
}
class EndGame {
    constructor(e) {
        this._element = e;
        this.render();
        this.open = false;
    }
    render() {
        this._element.innerHTML = this.view();
        this._element.querySelectorAll("[click]").forEach((target) => {
            var method = target.attributes["click"].value;
            target.onclick = (event) => {
                if (!this.busy) {
                    eval("this." + method)
                    this.render();
                }
            }
        })
    }
    show() {
        this.open = true;
        this.render();
    }
    end() {
        _game.clear();
    }
    view() {
        if (this.open) {
            var total = getFINAL_SCORE();
            if (total > 1000) {
                SOUNDS.clapping_hands1.play();
            }
            return `<div id="EndGamebox-wrapper">
                    <div style="position:absolute;top:20%;width:100%;text-align:center;" >
                        <div id="EndGamebox"> 
                            <h1 class="EndGameBox-title ${total > 30000 ? "BIG" : total > 20000 ? "OMG" : total > 10000 ? "EXCELENT" : "normal"} " > ${total > 30000 ? " 🤩😲😲🤩👏👏🏻👏🏼👏🏽👏🏾👏🏿 " : total > 20000 ? " OMG !!! BRAVO " : total > 10000 ? "WOW IMPRESSIVE" : total > 5000 ? "EXCELENT" : total > 1000 ? "GOOD JOB" : "TRY AGAIN!"}</h1>
                            <br/ >
                            <div style="width:200px;margin:0 auto;text-align:center">
                            <h3>SCORE: ${SCORE}</h3> 
                            <h3>MOVES: ${MOVES}</h3> 
                            <h3>MAX COMBO: ${MAXCOMBO}</h3> 
                            <hr/>
                            <h1>FINAL SCORE:   ${total}  </h1>
                            <button click="end()"> OK</button>
                            </div>
                        </div>
                    </div>
                <div>`;
        } else {
            return "";
        }
    }


}

class SpoilerPanel {
    constructor(e) {
        this._element = e;
        this.open = false;
        this.spoilerOpen = false;
        this.render();
    }
    render() {
        this._element.innerHTML = this.view();
        this._element.querySelectorAll("[click]").forEach((target) => {
            var method = target.attributes["click"].value;
            target.onclick = (event) => {
                if (!this.busy) {
                    eval("this." + method)
                    this.render();
                }
            }
        })
    }
    toggleOpen() {
        this.open = !this.open;
    }
    toggleSpoiler() {
        this.spoilerOpen = !this.spoilerOpen;
    }
    view() {
        return `<div style="width:100%;background:#d1d1d1;font-family:gamefont2"> 
                ${this.open ? ` <div style="width:${WIDTH}px;max-width:80%;margin:0 auto;"> <h1>RULES</h1>
                <p> Combina 3 casillas del mismo color para sumar puntos</p>
                <p> Puedes cambiar la posicion arrastrando el color a una casilla adyacente</p>
                <p> Este se movera si se combinan 3 o mas casillas del mismo color ganando puntos por cada cuadro combinado </p>
                <p> Podras moverte sobre el aire si asi ganas puntos, de lo contrario regresaras.</p>
                <p> Tienes 3 Botones que te ayudaran si te sientes atascad@ </p>
                <p> 💣 Bomb explotara el 25% de los colores restantes </p>
                <p> 🌟 Wish Cambiara de color 30% de los colores restantes </p>
                <p> 👁️‍🗨️ Hint Te mostrara un maximo de 4 movimientos que puedes realizar </p>
                <p> El juego se acaba al no poder realizar mas movimientos </p>
                <p> Al final califico que tan bien te fue con varios mensajes 😉 </p>
                <button  click="toggleSpoiler()" style="font-family:gamefont2" >${this.spoilerOpen ? "Cerrar Spoiler" : "Mostrar Spoiler"}</button>
                ${this.spoilerOpen ? `<img width="99%" src="images/beatme_on_my_own_game1.png"  />` : ""}
                 </div>
                `: ""}

              
                <div style="width:100%;text-align:center">
                <button click="toggleOpen()"  style="font-family:gamefont2" >${this.open ? "Cerrar" : "Mostrar Reglas"}</button>
                </div>
         </div>`;
    }
}
class Game {
    constructor(e) {
        this.initiated = false;
        this._element = e;
        this.gridsize = [10, 10];
        this.cellwidth = Math.round(WIDTH / this.gridsize[0])
        this.cellheight = Math.round(HEIGHT / this.gridsize[1]);

        this.POSIBLES = [];
        this.map = new Array(this.gridsize[0])

        _Game = this;
        window._game = this;

    }
    render() {
        this._element.innerHTML = this.view();
    }
    clear() {
        COMBO = 0;
        MAXCOMBO = 1;
        SCORE = 0;
        MOVES = 0;
        this.render();
    }
    initGame() {

        setTimeout(() => {
            this.reRollColorsIfMatchAtBeggining();
        }, 100)


        this.scorePanel = new ScorePanel(document.querySelector("#scorePanel"));
        this.toolsPanel = new ToolsPanel(document.querySelector("#toolsPanel"));
        this.endGame = new EndGame(document.querySelector("#EndGameWrapper"));
        this.spoilerPanel = new SpoilerPanel(document.querySelector("#spoilerPanel"))
        // INIT EVENT LISTENERS
        if (this.hasOwnProperty("initiated") && !this.initiated) {

            this.initiated = true

            var dragged;


            // INIT LISTENERS

            document.addEventListener("dragstart", function (event) {
                // store a ref. on the dragged elem
                dragged = event.target;
            }, false);
            /* events fired on the drop targets */
            document.addEventListener("dragover", function (event) {
                // prevent default to allow drop
                event.preventDefault();
            }, false);

            document.addEventListener("drop", function (event) {
                // prevent default action (open as link for some elements)
                event.preventDefault();

                var dropcell = event.target;
                // move dragged elem to the selected drop target
                if (event.target.classList.contains("candy")) {
                    dropcell = event.target.parentNode;
                }
                if (dragged != null && dropcell.classList.contains("cell")) {
                    if (dropcell.cell.dropCandy(dragged.candy)) {
                        MOVES += 1;
                    }
                }

            }, false);



        }

    }
    reRollColorsIfMatchAtBeggining() {
        var matches = this.getComboMatch();

        for (let i in matches) {
            matches[i].candy.switchColor();
        }
        if (matches.length > 0) {
            setTimeout(() => { this.reRollColorsIfMatchAtBeggining() }, 1);
        } else {
            setTimeout(() => { this.validatePosibleMoves(); }, 1);
        }
    }
    getComboMatch() {

        var totalRows = this.gridsize[0]
        var totalCols = this.gridsize[1]
        var AFFECT = [];
        var compareColor = (_i, _j, _color) => {
            if (_i < totalRows && _j < totalRows && this.map[_i][_j].candy != null) {
                return this.map[_i][_j].candy.color == _color ? 1 : 0
            }
            return 0;
        }
        for (let i = 0; i < totalRows; i++) {
            for (let j = 0; j < totalCols; j++) {
                let cell = this.map[i][j];
                if (cell.candy != null) {
                    let color = cell.candy.color;
                    let matchHor = compareColor(i + 1, j, color) + compareColor(i + 2, j, color)
                    let matchVer = compareColor(i, j + 1, color) + compareColor(i, j + 2, color)
                    if (matchHor == 2) {
                        // ADD THIS CELL TO AFFECT
                        AFFECT.push(this.map[i + 1][j])
                        AFFECT.push(this.map[i + 2][j])
                    }
                    if (matchVer == 2) {
                        // ADD THIS CELL TO AFFECT
                        AFFECT.push(this.map[i][j + 1])
                        AFFECT.push(this.map[i][j + 2])
                    }
                    if (matchHor == 2 || matchVer == 2) {
                        AFFECT.push(cell);
                    }


                }
            }
        }
        return AFFECT
    }

    validatePosibleMoves() {
        // ITERATE ALL POSITIONS AND 
        var posibles = [];
        var touched = {};
        var totalRows = this.gridsize[0];
        var totalCols = this.gridsize[1];

        var val = (fromcell, _i, _j) => {
            if (_i > 0 && _j > 0 && _i < totalRows && _j < totalCols) {
                let cell = this.map[_i][_j];
                if (cell.candy != null && !touched.hasOwnProperty(cell.id)) {
                    let tempcolor = fromcell.candy.color;
                    fromcell.candy.color = cell.candy.color;
                    cell.candy.color = tempcolor;
                    // SWITCH COLORS
                    var affect = this.getComboMatch();

                    cell.candy.color = fromcell.candy.color;
                    fromcell.candy.color = tempcolor;

                    if (affect.length > 0) {
                        touched[fromcell.id] = 1;
                        touched[cell.id] = 1;
                        posibles.push({
                            from: fromcell,
                            to: cell
                        });
                        return true;
                    }
                }

            }
            return false;
        }
        for (let i = 0; i < totalRows; i++) {
            for (let j = 0; j < totalCols; j++) {
                var cell = this.map[i][j]
                if (cell.candy != null) {
                    // VALIDATE IF CAN MOVE TO EACH DIRECTION 
                    // TO RIGHT
                    val(cell, i + 1, j);
                    val(cell, i - 1, j);
                    val(cell, i, j + 1);
                    val(cell, i, j - 1);
                }
            }
        }
        //console.log("posibles", posibles)
        this.POSIBLES = posibles;
        if (posibles == 0) {
            _game.endGame.show();
        }
    }

    validateScoreMatch() {
        // ITERATE MATRIX AND SEARCH FOR ADYACENT COINCIDENCES...
        var AFFECT = this.getComboMatch();

        // GET AFFECTED CELLS AND CLEAN HIS CANDYS...
        for (let i in AFFECT) {
            setTimeout((_i) => {
                SOUNDS.score.play()
                AFFECT[_i].removeCandy();
            }, 100 * i, i)

        }
        if (AFFECT.length > 0) {
            addScore(AFFECT.length);
            setTimeout(function () { _game.gravityFall(0) }, 1000);
            return true
        } else {
            COMBO = 0;
            setTimeout(() => { this.validatePosibleMoves(); }, 1);
        }
        return false;
    }
    gravityFall(_iteration = 0) {
        // MAKE CANDY FALL
        // VALIDATE EACH COLUMN IF MISS SOME CANDY IF IT DOES MOVE ALL CANDY BELOW..

        var hadfellonce = false, falling_candys = 0
        for (let i = 0; i < this.gridsize[0]; i++) {
            var fall = false
            for (let j = this.gridsize[1] - 1; j > -1; j--) {
                if (fall) {
                    if (!hadfellonce && this.map[i][j].candy != null) {
                        hadfellonce = true;
                    }
                    // MOVE THIS CANDY BELOW.
                    this.map[i][j + 1].setCandy(this.map[i][j].candy);
                    if (this.map[i][j].candy != null) {
                        this.map[i][j].candy.animateToDestiny(this.map[i][j + 1])
                        falling_candys += 1;
                    }

                    this.map[i][j].candy = null;
                }
                fall = this.map[i][j].candy == null;
            }
        }

        if (_iteration > 5 && !hadfellonce) {
            setTimeout(() => {
                this.validateScoreMatch()
            }, 1)
            COMBO = 0;
            setTimeout(() => { this.validatePosibleMoves(); }, 1);

        } else {
            setTimeout(() => { this.gravityFall(_iteration + 1) }, 1);
        }



        if (falling_candys > 0) {
            while (falling_candys > 0) {
                SOUNDS.plop.play()
                falling_candys -= 1;
            }
        }
    }
    switchBgColor() {
        // A MEDIDA QUE ACUMULA PUNTOS...
        var gamebox = document.getElementById("gamebox");
        var gamewrapper = document.getElementById("game-crush");
        if (SCORE > 300) {
            if (gamebox.grayscale == null) {
                gamebox.grayscale = 0.4;
            }

            gamebox.style.filter = "grayscale(" + gamebox.grayscale + ")";
            gamebox.grayscale -= 0.2
            if (gamebox.grayscale < 0) {
                gamebox.grayscale = 0;
            }
        }


        if (SCORE > 3000) {
            gamewrapper.style.backgroundColor = `rgb(${random(10, 255)},${random(100, 255)},${random(10, 255)})`;
        }
    }
    view() {
        setTimeout(() => this.initGame(), 100);
        var cells = [];
        for (let i = 0; i < this.gridsize[0]; i++) {
            this.map[i] = new Array(this.gridsize[1])
            for (let j = 0; j < this.gridsize[1]; j++) {
                this.map[i][j] = (new Cell(i, j, this.cellwidth, this.cellheight));
                cells.push(`<div id="cell_${i}_${j}" ></div>`)
            }
        } 
        return `<div id="game-crush"> 
              
             
            <div id="spoilerPanel"></div>
            <br />
            <div id="scorePanel" >   </div> 
                <div id="gamebox" style="margin:0 auto;position:relative;width:${WIDTH}px;height:${HEIGHT}px;" >
                    ${cells.join("")}
                </div>
            
             <div id="toolsPanel"> 
             </div>
             <div id="EndGameWrapper"></div> 
         
        </div>
        `
    }
}

export default Game;