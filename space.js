const POINT = 10;
const emojis = `🛸👾🤖⚪🔴🟡⭐🏵️💥❤️`;
var container = null;
const center = {
  x: 0,
  y: 0,
};
const heroList = [];
const alienList = [];
const STORE = {
  lifes: 3,
  points: 0,
};
const Loop = (function () {
  var active = false;
  var loopList = [];
  const start = () => {
    active = true;
  };
  const end = () => {
    active = false;
    loopList = [];
  };
  const add = (callback) => {
    const hold = {
      run: callback,
    };
    loopList.push(hold);
    return () => {
      hold.run = null;
      delete hold.run;
    };
  };
  const onLoop = () => {
    if (!active) {
      return;
    }
    loopList.forEach((_hold) => {
      _hold.run();
    });
    clearLoop();
  };
  const clearLoop = () => {
    let newloop = loopList.filter((hold) => hold.run);
    loopList = [...newloop];
  };
  const loop = () => {
    onLoop();
    requestAnimationFrame(loop);
  };
  loop();
  return {
    start,
    end,
    add,
  };
})();

////===============================
const random = (min, max) => {
  return Math.random() * (parseInt(max) - parseInt(min)) + parseInt(min);
};
////===============================
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
////===============================
const promiseTimeout = (timeout = 1) =>
  new Promise((resolve) => setTimeout(resolve, timeout));
////===============================
const hitAnimation = async (elmNode) => {
  elmNode.style.setProperty("color", "transparent");
  elmNode.style.setProperty("transition", "all .2s");

  elmNode.style.setProperty("text-shadow", "0 0 0 red");
  await promiseTimeout(120);
  elmNode.style.setProperty("text-shadow", "0 0 0 white");
  await promiseTimeout(120);
  elmNode.style.setProperty("text-shadow", "0 0 0 red");
  await promiseTimeout(120);

  await promiseTimeout(50);

  elmNode.style.setProperty("color", "inherit");
  elmNode.style.setProperty("text-shadow", "none");
};
////===============================
const boundType = {
  left: 0,
  right: 0,
  bottom: 0,
  top: 0,
};
const hitTest = (bound1 = boundType, bound2 = boundType) => {
  // has horizontal gap

  if (bound1.right < bound2.left || bound1.left > bound2.right) return false;

  if (bound1.bottom < bound2.top || bound1.top > bound2.bottom) return false;

  return true;
};
////===============================
const createInputKey = (inputMap = {}) => {
  const listener = (event) => {
    if (event.isComposing || event.keyCode === 229) {
      return;
    }
    if (inputMap.hasOwnProperty(event.code)) {
      inputMap[event.code](event.type === "keydown");
    }
  };
  document.addEventListener("keydown", listener);
  document.addEventListener("keyup", listener);

  return () => {
    document.removeEventListener("keydown", listener);
    document.removeEventListener("keyup", listener);
  };
};
////===============================
function createDiv(props = {}) {
  const div = document.createElement("div");

  for (let i in props) {
    if (i === "style") {
      for (let s in props[i]) {
        div.style.setProperty(s, props[i][s]);
      }
    } else {
      div[i] = props[i];
    }
  }
  container.appendChild(div);
  return div;
}
////===============================
function Go(x, y, w, h, props) {
  const element = createDiv({
    ...props,
    className: "-go " + (props.className || ""),
    style: {
      position: "absolute",
      left: "0px",
      right: "0px",
      width: w + "px",
      height: h + "px",
      "font-size": h * 0.75 + "px",
      ...props.style,
    },
  });
  this.x = x;
  this.y = y;
  this.elementNode = element;
  this.updatePosition = () => {
    element.style.transform = `translate(${this.x}px,${this.y}px)`;
  };
  this.setPosition = (_x, _y) => {
    this.x = _x;
    this.y = _y;
    this.updatePosition();
  };
  this.move = ([vx, vy]) => {
    this.x += vx;
    this.y += vy;
    this.updatePosition();
  };
  this.getBounds = (_w = w, _h = h) => {
    let w_half = _w / 2,
      h_half = _h / 2;
    return {
      left: this.x - w_half,
      right: this.x + w_half,
      top: this.y - h_half,
      bottom: this.y + h_half,
    };
  };
  this.updatePosition();

  this.destroy = () => {
    element.remove();
  };
}

function Alien(x, y, max_distance = 100) {
  let unbindLoop;
  let size = 24;
  let entity = new Go(x, y, size, size, {
    innerText: `👾`,
    className: "alien",
  });

  let minx = x - max_distance;
  let maxX = x + max_distance;
  let speedX = 2,
    speedY = 8;
  let directionX = -speedX;
  let velocityY = 0;
  let alive = true;
  let timeoutToNextAttack = random(300, 800);
  const doShot = () => {
    timeoutToNextAttack--;
    if (timeoutToNextAttack < 0) {
      Shot(entity.x, entity.y, [0, 3], heroList, `🟡`);
      timeoutToNextAttack = random(300, 1000);
    }
  };
  this.isAlive = () => alive;
  this.getEntity = () => entity;
  this.hit = async () => {
    if (!alive) {
      return;
    }
    alive = false;
    unbindLoop();
    STORE.points += POINT;
    await hitAnimation(entity.elementNode);
    entity.elementNode.innerText = `💥 `;
    await promiseTimeout(100);
    entity.elementNode.innerText = `🏵️`;
    entity.destroy();
  };
  this.getBounds = (bodyBounds) => {
    return entity.getBounds();
  };
  this.kill = () => {
    entity.destroy();
  };
  unbindLoop = Loop.add(() => {
    entity.move([directionX, velocityY]);
    if (directionX < 0 && entity.x < minx) {
      directionX = speedX;
      velocityY = speedY;
    } else if (directionX > 0 && entity.x > maxX) {
      directionX = -speedX;
      velocityY = speedY;
    }
    velocityY = clamp(velocityY - 1, 0, speedY);
    //
    doShot();
  });
}
function Hero(x, y) {
  const size = 32;
  let entity = new Go(x, y, size, size, {
    innerHTML: `<div style="transform:rotate(90deg)">🔫</div>🤖`,
    className: "hero",
  });
  this.move = entity.move;
  let invinsible = false;
  this.position = () => {
    return {
      x: entity.x,
      y: entity.y,
    };
  };
  this.getBounds = (bodyBounds) => {
    return entity.getBounds(size / 2, size / 4);
  };
  this.kill = () => {
    entity.destroy();
  };
  this.hit = async () => {
    if (invinsible) {
      return;
    }
    STORE.lifes -= 1;
    invinsible = true;
    await hitAnimation(entity.elementNode);
    invinsible = false;
  };
  this.size = () => {
    return size;
  };
  const limit = {
    minX: size / 2,
    maxX: center.x * 2 - size / 2,
  };
  Loop.add(() => {
    if (entity.x < limit.minX) {
      entity.x = limit.minX + 1;
    }
    if (entity.x > limit.maxX) {
      entity.x = limit.maxX - 1;
    }
  });
}
function Shot(x, y, speedDir = [0, -1], targets = [], bullet = `🔴`) {
  const minY = 0,
    maxY = container.offsetHeight;
  let entity = new Go(x, y, 12, 12, { innerText: bullet, className: "shot" });
  var unbindLoop;
  const kill = async (explode = false) => {
    unbindLoop();
    setTimeout(() => {
      entity.destroy();
    }, 100);
  };
  const testHitToTarget = () => {
    let hitted = false;
    for (let i in targets) {
      if (hitTest(targets[i].getBounds(), entity.getBounds())) {
        targets[i].hit();
        hitted = true;
        entity.elementNode.innerText = `💥`;
      }
    }

    return hitted;
  };
  unbindLoop = Loop.add(() => {
    entity.move(speedDir);
    if (testHitToTarget()) {
      kill(true);
      return;
    }
    if (entity.y < minY || entity.y > maxY) {
      kill();
    }
  });
}
function createAliens() {
  const gap = 30;
  const totals = 40;
  const maxPosibleRow = Math.min(
    12,
    parseInt(container.offsetWidth / (gap * 2))
  );
  const totalX = Math.min(maxPosibleRow, totals);
  const totalY = parseInt(totals / totalX);
  const startX = center.x - (totalX / 2) * gap;
  const startY = 30;
  const max_distance = center.x * 0.5 - gap;
  for (let i = 0; i < totalX; i++) {
    for (let y = 0; y < totalY; y++) {
      let alien = new Alien(startX + i * gap, startY + y * gap, max_distance);
      alienList.push(alien);
    }
  }
}
function createHero() {
  let hero = new Hero(center.x, center.y * 1.8);
  let heroSpeed = 4;
  let velocityX = 0;
  let shotActive = true;
  let delayShot = 1000;
  let keyCursor = {
    left: false,
    right: false,
    space: false,
  };
  heroList.push(hero);
  createInputKey({
    ArrowLeft: (is_down) => {
      keyCursor.left = is_down;
    },
    ArrowRight: (is_down) => {
      keyCursor.right = is_down;
    },
    Space: (is_down) => {
      keyCursor.space = is_down;
    },
  });
  const doMoveByUser = () => {
    velocityX *= 0.9;

    if (keyCursor.left) {
      velocityX--;
    }
    if (keyCursor.right) {
      velocityX++;
    }
    velocityX = clamp(velocityX, -heroSpeed, heroSpeed);
    hero.move([velocityX, 0]);
  };
  const doShot = () => {
    if (!keyCursor.space) {
      return;
    }
    if (!shotActive) {
      return;
    }
    shotActive = false;
    let pos = hero.position();
    Shot(
      pos.x + parseInt(hero.size() / 2) - 6,
      pos.y,
      [0, -5],
      alienList,
      `⚪`
    );
    setTimeout(() => {
      shotActive = true;
    }, delayShot);
  };
  Loop.add(() => {
    doShot();
    doMoveByUser();
  });
}
function createSpaceShip() {
  let startTime = Date.now();
  let state = "waiting";
  let spaceship = null;
  let speed = 4;
  const wait_time = 5000;
  const idle_time = 5000;
  const STATES = {
    waiting: () => {
      let time = Date.now() - startTime;
      if (time < wait_time) {
        return;
      }
      startTime = 0;
      state = "moving";
      spaceship = new Go(0, 0, 64, 64, {
        innerHTML: `🛸`,
        className: "spaceship",
        style: {
          "z-index": -1,
        },
      });
      let alive = true;
      spaceship.isAlive = () => alive;
      spaceship.hit = async () => {
        if (!alive) {
          return;
        }
        alive = false;
        state = "idle";
        STORE.points += 100;
        await hitAnimation(spaceship.elementNode);
        spaceship.elementNode.innerText = `💥 `;
        await promiseTimeout(100);
        spaceship.elementNode.innerText = `🏵️`;
        spaceship.destroy();
        spaceship = null;
      };
      spaceship.setPosition(0, 20);
      spaceship.velocityX = speed;
      alienList.push(spaceship);
    },
    moving: () => {
      if (spaceship.velocityX < 0 && spaceship.x < -100) {
        spaceship.velocityX = speed;
      }
      if (
        spaceship.velocityX > 0 &&
        spaceship.x > container.offsetWidth + 100
      ) {
        spaceship.velocityX = -speed;
      }
      let maxDist = container.offsetWidth / 2;
      let p = Math.max(0.3, Math.abs((spaceship.x - maxDist) / maxDist));
      spaceship.move([spaceship.velocityX * p, 0]);
    },
    idle: () => {
      if (startTime === 0) {
        startTime = Date.now();
        return;
      }
      let time = Date.now() - startTime;
      if (time < idle_time) {
        return;
      }
      state = "waiting";
    },
  };
  let unbindLooper = Loop.add(() => {
    STATES[state]();
  });
}
function createNightStart() {}
function createUI() {
  let divUI = createDiv({
    id: "ui",
    style: {
      left: "20px",
      bottom: "8px",
      position: "fixed",
      color: "white",
      "font-size": "16px",
    },
  });

  Loop.add(() => {
    divUI.innerHTML = `
    <p>LIFE: ${
      STORE.lifes < 1 ? 0 : new Array(STORE.lifes).fill(`❤️`).join("")
    }</p>
    <p>POINTS: <b>${STORE.points}</b></p>
    `;
  });
}

function updateRemaining() {
  let remain = alienList.length;
  while (remain > 0) {
    remain--;
    let alien = alienList.shift();
    if (alien.isAlive()) {
      alienList.push(alien);
    }
  }
}
function lose() {
  Loop.end();
  let div = createDiv({
    style: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      zIndex: 100,
      background: "#561b1b80",
      "backdrop-filter": "blur(3px)",
      color: "red",
      display: "flex",
      "flex-direction": "column",
      "font-size": "3.5rem",
      "justify-content": "center",
      "align-items": "center",
      transition: "all 1s",
      opacity: "0",
    },
    innerHTML: `
    <h2>PERDISTE</h2>`,
  });
  setTimeout(() => {
    div.style.opacity = 1;
  }, 100);
  setTimeout(() => {
    div.innerHTML = `${div.innerHTML}
    <div style="display:flex;justify-content:center;align-items:center;gap:1rem;margin-top:2rem;" >
        <button onClick="playGame()">Volver a jugar </button>
        ${window.endGame ? `<button onClick="endGame()">Salir </button>` : ""}
    </div>
    `;
  }, 1000);
}
function win() {
  //Loop.end();
  Loop.end();
  let div = createDiv({
    style: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      zIndex: 100,
      background: "#1b435680",
      "backdrop-filter": "blur(3px)",
      color: "#66ff7d",
      display: "flex",
      "flex-direction": "column",
      "font-size": "3.5rem",
      "justify-content": "center",
      "align-items": "center",
      transition: "all 1s",
      opacity: "0",
    },
    innerHTML: `
    <h2>¡GANASTE!</h2><h3 style="color:white;">${STORE.points} PUNTOS!</h3>`,
  });
  setTimeout(() => {
    div.style.opacity = 1;
  }, 100);
  setTimeout(() => {
    div.innerHTML = `${div.innerHTML}
    <div style="display:flex;justify-content:center;align-items:center;gap:1rem;margin-top:2rem;" >
        <button onClick="playGame()">Volver a jugar </button>
        ${window.endGame ? `<button onClick="endGame()">Salir </button>` : ""}
    </div>
    `;
  }, 1000);
}
function validateIfLoseOrWin() {
  if (STORE.lifes < 1) {
    lose();
    return;
  }
  if (alienList.length === 0) {
    win();
    return;
  }
  let bottomLine = container.offsetHeight * 0.9;
  for (let i in alienList) {
    if (alienList[i].getBounds().top > bottomLine) {
      lose();
      break;
    }
  }
}
function clear() {
  STORE.points = 0;
  STORE.lifes = 3;
  while (alienList.length > 0) {
    alienList.shift().kill();
  }
  while (heroList.length > 0) {
    heroList.shift().kill();
  }
  container.innerHTML = "";
}
function create() {
  container = document.querySelector(".game-container");
  center.x = container.offsetWidth / 2;
  center.y = container.offsetHeight / 2;
  container.style.background = `linear-gradient(0deg, #6778a5 -20%, #031032e0 20%, #000000e0 50%)`;
  clear();
  createAliens();
  createHero();
  createSpaceShip();
  createUI();
  Loop.start();
  Loop.add(() => {
    // validate if ther eis aliens alive
    updateRemaining();
    validateIfLoseOrWin();
  });
}
window.playGame = () => {
  Loop.end();
  create();
};
create();
