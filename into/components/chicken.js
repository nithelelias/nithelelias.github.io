import getDirAndDistance from "../utils/getDirAndDistance.js";
import loopAnimationFrame from "../utils/loopAnimationFrame.js";
import onHtmlChange from "../utils/onHtmlChange.js";
import pointer from "../utils/pointer.js";
import random from "../utils/random.js";
import stateMachine from "../utils/stateMachine.js";
const offset = 100;

function findRandomTarget(position, maxFollowDistance) {
  return {
    x: random(position.x - maxFollowDistance, position.x + maxFollowDistance),
    y: random(position.y - maxFollowDistance, position.y + maxFollowDistance),
  };
}
function addBubbleMessage(x, y, message) {
  const container = document.querySelector(".layer");
  const div = document.createElement("div");
  div.className = "bubble-message fixed";
  div.innerHTML = message;
  div.style.left = x + "px";
  div.style.top = y + "px";
  container.appendChild(div);
  setTimeout(() => {
    div.remove();
  }, 5000);
}
function addEggAt(x, y) {
  const container = document.querySelector(".layer");
  const div = document.createElement("div");
  div.className = "fixed icon-pack egg white";
  div.style.left = x + "px";
  div.style.top = y + "px";
  container.appendChild(div);
}
function chickenStates(set_state) {
  var props = {};

  const __setState = (_state) => {
    props = {};
    set_state(_state);
    this.overlay.innerHTML = "";
  };
  const isMouseNear = () => {
    const { dist } = getDirAndDistance(this.getGlobalPosition(), pointer);
    return dist < offset;
  };
  const idle = () => {
    if (!props.idleStart) {
      props.idleStart = Date.now();
      props.waitTime = random(1, 2);
    }
    let timedif = (Date.now() - props.idleStart) / 1000;
    if (isMouseNear()) {
      __setState("run_away");
      return;
    }
    if (timedif >= props.waitTime) {
      const rnd = random(0, 5);
      if ([0, 1].includes(rnd)) {
        __setState("sing");
      } else if ([2, 3].includes(rnd)) {
        __setState("put_egg");
      } else {
        __setState("randomMove");
      }
    }
  };

  const sing = () => {
    if (!props.state_start) {
      props.state_start = Date.now();
      props.waitTime = random(2, 3);
      const pos = this.getGlobalPosition();
      addBubbleMessage(pos.x, pos.y, "cocoro coco");
    }
    let timedif = (Date.now() - props.state_start) / 1000;
    if (isMouseNear()) {
      __setState("run_away");
      return;
    }
    if (timedif >= props.waitTime) {
      __setState("random_move");
    }
  };

  const random_move = () => {
    if (!props.randomTarget) {
      props.randomTarget = findRandomTarget(
        this.getGlobalPosition(),
        random(100, 300)
      );
      props.randomTarget.x = Math.max(0, props.randomTarget.x);
      props.randomTarget.y = Math.max(0, props.randomTarget.y);

      return;
    }
    if (isMouseNear()) {
      __setState("run_away");
      return;
    }
    const { dir } = getDirAndDistance(
      this.getGlobalPosition(),
      props.randomTarget
    );

    if (dir.x != 0) {
      this.x += dir.x;
    } else if (dir.y != 0) {
      this.y += dir.y;
    } else {
      props.randomTarget = null;
      __setState("idle");
    }

    return;
  };
  const put_egg = () => {
    if (!props.state_start) {
      props.state_start = Date.now();
      props.waitTime = random(1, 2);
      const pos = this.getGlobalPosition();
      addBubbleMessage(pos.x, pos.y, "...");
    }
    let timedif = (Date.now() - props.state_start) / 1000;
    if (timedif > props.waitTime) {
      __setState("random_move");
      props.state_start = Date.now();
      const pos = this.getGlobalPosition();
      addBubbleMessage(pos.x, pos.y, "*plop");
      addEggAt(this.x + offset, this.y + offset);
      return;
    }
  };
  const run_away = () => {
    if (!isMouseNear()) {
      __setState("idle");
      return;
    }
    if (!props.time_to_sing) {
      props.time_to_sing = Date.now();
      props.wait = random(1, 3);
    }

    let dif = (Date.now() - props.time_to_sing) / 1000;
    if (dif >= props.wait) {
      const pos = this.getGlobalPosition();
      addBubbleMessage(pos.x, pos.y, "CO CO!!");
      props.time_to_sing = Date.now();
      props.wait = random(1, 3);
    }

    const { dir } = getDirAndDistance(pointer, this.getGlobalPosition());
    // REVERSE.
    this.x = Math.max(0, this.x + dir.x);
    this.y = Math.max(0, this.y + dir.y);
  };
  return { idle, random_move, sing, run_away, put_egg };
}

class Chicken {
  x = 0;
  y = 0;
  constructor(element, x = 0, y = 0) {
    this.element = element;
    this.x = x;
    this.y = y;
    this.move();
    this.element.style.width = this.element.style.height = offset * 2 + "px";
    this.element.innerHTML += `<div class='overlay'></div>`;
    this.overlay = this.element.querySelector(".overlay");

    this._loopManager = loopAnimationFrame(() => this.update());
    this._stateMachine = stateMachine(
      "idle",
      chickenStates.call(this, (_state) => {
        this._stateMachine.set(_state);
      })
    );
  }
  getGlobalPosition() {
    const bounds = this.element.getBoundingClientRect();

    return { x: bounds.x + offset, y: bounds.y + offset };
  }

  move() {
    this.element.style.transform = `translate(${this.x}px,${this.y}px)`;
  }
  update() {
    this._stateMachine.run();
    this.move();

    if (!this.element.isConnected) {
      this._loopManager.stop();
    }
  }
}

function update() {
  document.querySelectorAll("chicken").forEach((element) => {
    const div = document.createElement("div");
    div.className = "mob chicken " + element.className;
    div.innerHTML = `<div class="sprite icon-pack chicken x2"></div>`;
    element.replaceWith(div);
    new Chicken(
      div,
      parseInt(window.innerWidth / 2),
      parseInt(window.innerHeight / 2)
    );
  });
}

onHtmlChange(update);
update();
