const alphabet = genCharArray("A", "Z");
var textToVoice = new SpeechSynthesisUtterance();
var bgsound=new Audio("./bgsound.mp3");
var happysuccess=new Audio("./happysuccess.mp3");
var failedSound=new Audio("./failedSound.mp3");
bgsound.volume=0.3;
bgsound.loop=true;
textToVoice.volume=2;
var _game;
function random(min, max) {
    if (!max) {
        max = min;
        min = 0;
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function genCharArray(charA, charZ) {
    var a = [], i = charA.charCodeAt(0), j = charZ.charCodeAt(0);
    for (; i <= j; ++i) {
        a.push(String.fromCharCode(i));
    }
    return a;
}
var eventInspector = function (event) {
    this._element.querySelectorAll("[" + event + "]").forEach((target) => {
        console.log(target)
        var method = target.attributes[event].value;
        console.log(method)
        target["on"+event.toLowerCase()] = (event) => {
            eval("this." + method)
        }
    })
}




export default class BabyKey {
    constructor(e) {
        this._element = e;
        _game = this;
        this.board = null;
        this.score = 0;
        this.scoretext = null;
        this.page = 0;
        this.currentword = "A";
        this.currentCursor=-1;
        this.volumeBG=bgsound.volume;
    }
    render() {
        this._element.innerHTML = this.view();
        eventInspector.call(this, "click");
        eventInspector.call(this, "change");
    }
    start() {
        bgsound.play();
        this.page = 1;
        this.nextWord();
    }
    failed() {
        let typemessage = document.querySelector("#typemessage");
        let _el = document.querySelector(".wordToSay");
        typemessage.style.display = "none";
        _el.classList.add("animated");
        _el.classList.add("wobble");
        _el.classList.add("red-text");
        failedSound.play();
        setTimeout(() => {
            _el.classList.remove("animated");
            _el.classList.remove("wobble");
            _el.classList.remove("red-text");
             
            this.testWord();
        }, 1000);
    }
    success() {
        let typemessage = document.querySelector("#typemessage");
        let _el = document.querySelector(".wordToSay");
        typemessage.style.display = "none";
        happysuccess.play();
        _el.classList.add("animated");
        _el.classList.add("tada");
        _el.classList.add("green-text");
        setTimeout(() => {
             
            this.nextWord();
        }, 1200);
    }
    nextWord() {
     //  this.currentword = alphabet[random(0, alphabet.length - 1)];
     this.currentCursor+=1;
     if(this.currentCursor>=alphabet.length){
        this.currentCursor=0;
     }      
     this.currentword =alphabet[this.currentCursor];
        this.render();
        happysuccess.currentTime=0;
        happysuccess.pause();
        failedSound.currentTime=0;
        failedSound.pause();
        setTimeout(() => {
            this.testWord();
        }, 100);
    }

    testWord() {
        let _el = document.querySelector("#typemessage");
        _el.style.display = "inline";
        this.readOutLoud();
        let onkeydown = (event) => {
            const keyName = event.key;
            console.log('keydown event\n\n' + 'key: ' + keyName);
            document.removeEventListener("keydown", onkeydown);
            if (keyName === this.currentword.toLocaleLowerCase()) {
                this.success();
            } else {
                this.failed();
            }
        }
        document.addEventListener('keydown', onkeydown);
    }
    readOutLoud(){
        bgsound.volume=0.1;
        textToVoice.text = this.currentword;
        window.speechSynthesis.speak(textToVoice);
        setTimeout(()=>{
            bgsound.volume=0.3;
        },1000)
    }
    onVolumeChange(event){
        bgsound.volume=event.target.value;
    }
    view() {
        if (this.page == 0) {
            return `<div class='game-wrapper full-view valign'>
        
        <div style="text-align:center">
            <h1 id="babyTitle" class='center '>Baby Keys for desktop</h1>
            <br/>
            <button id='btnEmpezar' click="start()">Empezar</button>
        </div>
        
        
        </div>`;
        }
        if (this.page == 1) {
            return `<div class='game-wrapper full-view valign'>
        
        <div style="text-align:center">
         <div id='typemessage' style='display:none;'>Busca y unde la tecla:</div> <div class="wordToSay" click="readOutLoud()">${this.currentword}</div>           
         <span>volume: <input type="range" id="music" min="0" max="1" step="0.1" value="${this.volumeBG}" change="onVolumeChange(event)" /></span>
        </div>
        
        
        </div>`;
        }
    }
}