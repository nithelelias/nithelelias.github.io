import WebComponent from "./Nithel.WebComponent.js"
import values from "./values.js"
(function () {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
})();

function hex(c) {
    var s = "0123456789abcdef";
    var i = parseInt(c);
    if (i == 0 || isNaN(c))
        return "00";
    i = Math.round(Math.min(Math.max(0, i), 255));
    return s.charAt((i - i % 16) / 16) + s.charAt(i % 16);
}

/* Convert an RGB triplet to a hex string */
function convertToHex(rgb) {
    return hex(rgb[0]) + hex(rgb[1]) + hex(rgb[2]);
}

/* Remove '#' in color hex string */
function trim(s) { return (s.charAt(0) == '#') ? s.substring(1, 7) : s }

/* Convert a hex string to an RGB triplet */
function convertToRGB(hex) {
    var color = [];
    color[0] = parseInt((trim(hex)).substring(0, 2), 16);
    color[1] = parseInt((trim(hex)).substring(2, 4), 16);
    color[2] = parseInt((trim(hex)).substring(4, 6), 16);
    return color;
}

function generateColor(colorStart, colorEnd, colorCount) {

    // The beginning of your gradient
    var start = convertToRGB(colorStart);

    // The end of your gradient
    var end = convertToRGB(colorEnd);

    // The number of colors to compute
    var len = colorCount;

    //Alpha blending amount
    var alpha = 0.0;

    var saida = [];

    for (let i = 0; i < len; i++) {
        var c = [];
        alpha += (1.0 / len);

        c[0] = start[0] * alpha + (1 - alpha) * end[0];
        c[1] = start[1] * alpha + (1 - alpha) * end[1];
        c[2] = start[2] * alpha + (1 - alpha) * end[2];

        saida.push(convertToHex(c));

    }

    return saida;

}

class About extends WebComponent {
    constructor(e) {
        super(e);
    }
    view() {
        return `<p  >${values.text.about}</p>`
    }
}

class Pic extends WebComponent {
    constructor(e) {
        super(e);

        var index = 0;
        var dir = 1;
        var changing = false;
        var pics = ["foto.jpg", "foto2.jpg", "foto3.jpg"];
        this.loaded = {}

        this.setBackground(pics[index])

        e.style.transition = "transform 0.6s";
        e.style.transformStyle = "preserve-3d";

        e.onclick = () => {
            if (!changing) {
                changing = true;
                var count = 0;
                var ang = 180;
                var preloadend = false;
                index += dir;
                if (index >= pics.length - 1) {
                    dir = -1
                }
                if (index <= 0) {
                    dir = 1
                }
                // ROTATION LOOP.
                var rotate_loop = () => {

                    if (!preloadend) {
                        count += 1
                        e.style.transform = `rotateY(${ang * count}deg)`;
                        setTimeout(() => { rotate_loop() }, 10)
                    } else {
                        e.style.transform = `rotateY(0deg)`;
                        this.setBackground(pics[index])
                    }

                }
                // WAIT 1 sec
                setTimeout(() => {
                    this.preloadImage(pics[index]).then(() => {
                        preloadend = true;
                        changing = false;
                        count = 0;
                    });
                }, 1000);

                rotate_loop();


            }

        }
    }
    preloadImage(img) {
        return new Promise((r) => {
            if (!this.loaded.hasOwnProperty(img)) {
                var a = new Image();
                a.src = "images/" + img;
                a.onload = function () {
                    r()
                }
            } else {
                r();
            }
        })

    }
    setBackground(img) {
        this.loaded[img] = true
        this._element.style.backgroundImage = `url('images/${img}')`;
        this._element.style.backgroundSize = "cover";
        this._element.style.backgroundPosition = "center";
    }

}

class Skills extends WebComponent {
    constructor(e) {
        super(e);
        this.filtertext = ""
    }
    updateFilter(_str) {
        this.filtertext = _str;
        this.render();
    }
    view() {
        let _filter = this.filtertext.toLowerCase().trim();
        let highlightfnc = function (skillname) {

            var name = skillname.split(":")[0];
            var percentage = skillname.split(":")[1];
            var percentageNum = Number(percentage.replace("%", ""));
            var backgroundlevel = percentageNum >= 90 ? "#90f6d1" : percentageNum >= 70 ? "#dcec9b" :
                percentageNum >= 50 ? "#e8d282" : percentageNum >= 30 ? "#f8f7c6" : "white";
            if (_filter.length > 1) {
                let from = name.toLowerCase().indexOf(_filter);
                if (from > -1) {
                    let to = from + _filter.length
                    name = (name.substring(0, from) + "<span class='highlighted'>") +
                        (name.substring(from, to) + "</span>") +
                        name.substring(to, name.length);
                } else {
                    name += "[NOT FOUND]"
                }
            }
            return `<div class="skillchip">
                <div class="top left full-width full-height " style="z-index:-1;width:${percentage};background:${backgroundlevel}"></div>
                ${name}              
            </div>`
        }
        let skillList = values.text.SKILLS.languages.filter((a) => {
            return _filter == "" || _filter.length < 2 || a.toLowerCase().indexOf(_filter) > -1
        }).concat(
            values.text.SKILLS.programs.filter((a) => {
                return _filter == "" || _filter.length < 2 || a.toLowerCase().indexOf(_filter) > -1
            })
        ).map(highlightfnc).join("");

        return ` 
                
                <h1 class="center-text">${values.text.skillsSectionTitle}</h1> 
                
                <div class="center-text center full-width">
                    <input placeholder="${values.text.placeholderfilterskills}" type="text" value="${this.filtertext}" input="updateFilter(event.target.value)" />
                </div>
                <br/>
                <div style=" width:80%;margin:0 auto;display:flow-root">
                    ${skillList}
                </div>   
                <br/>
             
        `
    }
}

class LifeExperience extends WebComponent {
    constructor(e) {
        super(e);

    }
    view() {

        var colors = generateColor("#ffffff", "#90f6d1", values.text.LIFE_EXPERIENCE.length * 2);

        return `
        <h1 class="center-text">${values.text.lifeExperienceTitle}</h1>              
        <div style=" overflow:hidden;width: calc(100% + 17px);margin-left: -9px;">
            ${values.text.LIFE_EXPERIENCE.map((item, index) => {
            let color = colors[index * 2]
            return `
                        <div class="full-width" style="background:#${color}"> 
                            <div class="wrapper-timeline-section center">
                                <div class="left top" style="height:100%;margin-right:10px"> 
                                    <div style="width:15px;height:1px;background:#111;margin-top:25px"></div>
                                   <div style="height:100%;width:1px;background:#111;"></div>
                                </div>
                                <div class="card  " >
                                    <div style="position:relative;float:left;width:calc(50% - 10px);word-break:break-word">
                                       <h3 class="no-margin"> ${item.title}</h3>
                                        <p>${item.position}</p>
                                        <p>${item.date}</p>
                                    </div>
                                    <div style=" float:right;width:50%">
                                        ${item.skills.map((a) => {
                return `<div   class="experience-skill-item" >  ${a}  </div>`;
            }).join("")
                }
                                    </div>
                                </div>
                            </div>
                        </div>`;
        }).join("")
            }
        </div>
        `;
    }
}

class LetterIA {
    constructor(e, holder) {
        this._element = e;
        this.holder = holder;
        this.exploded = false
        this.ticks = 0;
        this.animationList = [];
        this.letter = e.innerText;
        holder.style.color = "transparent"
        e.style.color = "red";
        e.style.position = "absolute";
        e.style.top = holder.offsetTop + "px";
        e.style.left = holder.offsetLeft + "px";
        e.style.cursor = "pointer";
        e.addEventListener("click", () => {
            if (!this.exploded) {
                this.ticks = 0;
                this.exploded = true;

                this.explote()
            }
        });
        window.requestAnimationFrame(() => this.enterframe_loop());
    }

    explote() {
        // GET PARENT AND REMOVE THIS, AND GET ALL TEXT IN HERE AND MAKER RADIUS ZONE...

        var from = { top: this._element.offsetTop, left: this._element.offsetLeft };
        // ITERATE INSIDE UNTIL FIND textCOntent

        function random(min, max) {
            if (!max) {
                max = min;
                min = 0;
            }
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        var iterateIn = (node) => {

            if (node != null && node.nodeName == "P" && node.innerText != null) {
                var content = node.innerText

                if (content != null && content != "") {
                    content = content.trim();

                    var _savedHeight = node.offsetHeight;
                    var _savedWidth = node.offsetWidth;

                    node.innerHTML = content.split("").map((letter) => {
                        return `<span class='boomletter'  >${letter}</span>`;
                    }).join("")
                    setTimeout(() => {
                        node.querySelectorAll(".boomletter").forEach((boomletter) => {
                            if (boomletter.innerText.toString().trim().length > 0) {
                                var diry = Math.round(from.top - (boomletter.offsetTop));
                                var dirx = Math.round(from.left - (boomletter.offsetLeft));
                                var dist = Math.sqrt(dirx * dirx + diry * diry);
                                var velangle = (Math.atan2(diry, dirx))
                                var speed = random(10, 20) + (dist < 20 ? 10 : 2);
                                // console.log(node, top, left)
                                var divblow = document.createElement("div");
                                divblow.velx = Math.cos(velangle) * speed;
                                divblow.vely = Math.sin(velangle) * speed;

                                divblow.innerHTML = boomletter.innerText;

                                divblow.style.position = "absolute";
                                divblow.style.top = boomletter.offsetTop + "px";
                                divblow.style.left = boomletter.offsetLeft + "px";
                                // divblow.style.transition = "all 0.2s"
                                divblow.ticks = divblow.init_ticks = random(5, 20);
                                divblow.ticks_toStart = Math.abs(Math.round(dist / 15));
                                divblow.deg = 0;
                                divblow.degVel = random(2, 20)
                                divblow.intensity = 0.1;
                                divblow.on_enterframe = function () {

                                    if (this.ticks_toStart <= 0) {
                                        this.ticks -= 1;
                                        if (this.ticks > 0) {
                                            if (this.intensity < 1.2) {
                                                this.intensity += 0.1;
                                            }
                                        } else {
                                            this.style.color = "black"

                                            return false;
                                        }

                                        if (this.ticks >= this.init_ticks * 0.6) {
                                            this.style.color = "yellow"
                                        } else if (this.ticks >= this.init_ticks * 0.4) {
                                            this.style.color = "orange"
                                        } else {
                                            this.style.color = "red"
                                        }


                                        // FRICTION
                                        if (this.ticks % 5 == 0) {
                                            this.velx *= 0.8
                                            this.vely *= 0.8
                                        }
                                        if (Math.abs(this.vely) > 0.1) {
                                            this.style.top = (this.offsetTop - this.vely * this.intensity) + "px";
                                        }
                                        if (Math.abs(this.velx) > 0.1) {
                                            this.style.left = (this.offsetLeft - this.velx * this.intensity) + "px";
                                        }
                                        if (Math.abs(this.velx) > 0.1 || Math.abs(this.vely) > 0.1) {
                                            this.deg += this.degVel;
                                            this.style.transform = "rotate(" + this.deg + "deg)";
                                            return true
                                        }


                                    } else {
                                        this.ticks_toStart -= 1
                                        return true;
                                    }
                                    this.style.color = "black";
                                    return false;
                                }

                                document.body.appendChild(divblow);
                                setTimeout((_divblow) => {
                                    this.animationList.push(() => {
                                        return divblow.on_enterframe();
                                    });
                                }, 1, divblow)


                            }
                        });
                        node.innerHTML = "";
                        node.style.height = _savedHeight + "px";
                        node.style.width = _savedWidth + "px";
                    }, 100)



                    // node.remove();
                }
            } else if (node.childElementCount > 0) {
                for (let i in node.children) {
                    iterateIn(node.children[i])
                }

            }
        }

        iterateIn(this.holder.parentElement)
        //this._element.parentElement.removeChild(this._element);
    }
    enterframe_loop() {
        this.ticks += 1;
        if (this.isVisibleScrolled() && !this.exploded) {

            if (this.ticks % 30 == 0) {
                this._element.style.color = this._element.style.color == "red" ? "black" : "red";
                this._element.style.fontSize = this._element.style.fontSize == "16px" ? "20px" : "16px";
            }

        }

        if (this.exploded) {

            if (this.ticks > 50 && this.ticks < 100) {
                //this._element.innerHTML = this.letter + "[ Upps... ] ";
                this._element.color = "blue"
            } else if (this.ticks < 50 || this.ticks == 100) {
                this._element.style.color = "black";
                this._element.innerHTML = this.letter + " ";
            }
            if (this.animationList.length > 0) {

                for (let i in this.animationList) {
                    if (!this.animationList[i]()) {
                        this.animationList.splice(i, 1);
                    }
                }
            } else if (this.ticks > 10) {
                //this._element.innerHTML = this.letter + "[ Sorry... ] ";
                this._element.color = "white"
                //return;
            }

        }

        window.requestAnimationFrame(() => this.enterframe_loop());

    }

    isVisibleScrolled() {
        var docViewTop = window.scrollY;
        var docViewBottom = docViewTop + document.body.offsetHeight;

        var elemTop = this._element.offsetTop;
        var elemBottom = elemTop + this._element.offsetHeight;

        return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
    }
}

function setLetterBomb(_node) {

    let text = _node.innerText;
    let randomIndex = Math.floor(Math.random() * text.length - 1)
    while (text[randomIndex] == "" || text[randomIndex] == " ") {
        randomIndex = Math.floor(Math.random() * text.length - 1)
    }
    var letter = text[randomIndex];
    text = text.substring(0, randomIndex) + `<span id='liahold'>${letter}</span>` + text.substring(randomIndex + 1, text.length)


    var letterIa = document.createElement("div");
    letterIa.style.color = "red";
    letterIa.position = "absolute";
    letterIa.innerHTML = letter;
    _node.innerHTML = text;
    document.body.appendChild(letterIa);
    setTimeout(() => {
        new LetterIA(letterIa, document.getElementById("liahold"));
    }, 1000)
}
class Profile {
    constructor(e) {
        this._element = e;
        this.initiated = false;
    }
    render() {
        if (!this.initiated) {
            this.initiated = true;
            this._element.innerHTML = this.view();
        }
    }

    view() {
        // GET 1 letter and make it ALIVE...
        setTimeout(() => {
            setLetterBomb(this._element.querySelector("p"))
        }, 1)
        return `
            <h1 class="center-text">${values.text.profileTitle}</h1>              
            <div style=" width:80%;margin:0 auto;display:flow-root">
                <p >${values.text.profileinfo}</p>
            </div>
          
        `;
    }
}

class Main extends WebComponent {
    constructor() {
        super();
        this.number = 0;
    }
    add(a, b) {

        this.number += 1;
        this.render()
    }
    view() {
        return ` `
    }
}

class Footer extends WebComponent {
    constructor(e) {
        super(e);

    }
    view() {
        return ` 
      <div style=" background:lightblue; margin-left:-10px;   width: calc( 100% + -3px);    
      padding: 5px 10px;">Te gusto mi juego simple? <a href="/games/">Pincha aqui para Mas Juegos</a></div> 
         <div style="background:#99f6d4;  margin-left:-10px;   width: calc( 100% + -3px);    
                     padding: 5px 10px;">
        <p style="font-family:customfont">
           ${values.text.footerinfo
            }
       </p> 
        <div component="Connections"></div> 
       </div >
       `;
    }
}

class Connections extends WebComponent {
    constructor(e) {
        super(e);
    }
    view() {
        return ` <div style=" width: 100%;background: #d0fbeb;margin-top: -7px;        padding: 10px 9px;        margin-left: -8px;">  Correo: nithelelias@gmail.com  |  Facebook: Nithel Elias  | Twitter: Nithel Elias  |  GitHub: Nithelelias       </div> `;

    }
}
class Game extends WebComponent {
    constructor(e) {
        super(e);
        this.number = 0;

    }

    view() {

        return `<div style="text-align:center">  
                   <h1 >${values.text.letsfun} </h1>        
                   <p> ${values.text.explainwhygame} </p>
                 </div> 
                <iframe src="./games/candygame/" frameborder="0" style="overflow:hidden;height:110vh;width:100%" height="100vh" width="100%"></iframe>`
    }
}


export default { About, Main, Pic, Skills, LifeExperience, Profile, Footer, Game, Connections }