
export default class Sound {
    constructor(url) {

        this.url = url;
        this.loop = false;
        let preload = this.get();
    }
    get() {
        return new Audio(this.url);
    }
    play() {
        let audio = this.get();
        audio.loop = this.loop;
        audio.onended = function () {
            audio.remove();
        }
        setTimeout(() => {
            audio.play();
        }, 1)
        return audio;
    }
}