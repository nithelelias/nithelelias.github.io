var chickens = 0;

const random = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
};
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

function addEggAt(x, y, bornOnClick = false) {
  const container = document.body;
  const div = document.createElement("div");
  var active = true;
  div.classList.add("egg");
  div.style.position = "absolute";
  div.style.width = ".5rem";
  div.style.height = ".8rem";
  div.style.background = "white";
  div.style.borderRadius = "50%";
  div.style.border = "solid #111";
  div.style.left = x + "px";
  div.style.top = y + "px";
  div.style.cursor = "pointer";
  div.title = "is an egg";
  div.kill = () => {
    active = false;
    div.remove();
  };
  container.appendChild(div);

  var lastTime = Date.now(),
    timeStart = Date.now();

  const shake = () => {
    let t = Date.now() - lastTime;

    if (t < 1000) {
      return;
    }

    lastTime = Date.now();
    var ang = random(-5, 5);
    div.style.transform = `rotate(${ang}deg)`;
    div.title = "is an egg - and is moving";
  };
  const born = () => {
    let t = Date.now() - timeStart;

    if (t < 10000) {
      return;
    }

    createChicken(x, y);
    div.remove();
    active = false;
  };
  if(bornOnClick){
    const onClick=() => {
      born();
      div.removeEventListener("click", onClick);
    }
    div.addEventListener("click", onClick);
  }
  if (!bornOnClick) {
    const loop = () => {
      if (!active) {
        return;
      }
      shake();
      born();

      requestAnimationFrame(loop);
    };
    loop();
  }
}
function putMessage(x, y, message) {
  const container = document.body;
  const div = document.createElement("div");

  div.style.zIndex = 1000 + y;
  div.style.left = x + "px";
  div.style.top = y + "px";
  div.classList.add("message");

  div.innerHTML = message;
  container.appendChild(div);

  setTimeout(() => {
    div.classList.add("puff");
    setTimeout(() => {
      div.remove();
    }, 800);
  }, 600);
}

function createChicken(_x, _y) {
  chickens++;
  const maxPath = random(20, 100);
  var active = true;
  var x =
      _x ||
      random(document.body.clientWidth * 0.4, document.body.clientWidth * 0.8),
    y =
      _y ||
      random(
        document.body.clientHeight * 0.4,
        document.body.clientHeight * 0.8
      ),
    vel = { x: 0, y: 0 },
    scaleX = 1;
  var lastTime = Date.now();
  var lastTimePutEgg = Date.now();
  var timeoutPutEgg = random(3000, 30000);
  var delayMove = 100;
  var hen = document.createElement("img");
  hen.classList.add("chicken");
  hen.src = "images/hen.png";
  hen.alt = "es una gallina";
  hen.title = "Ko.";

  hen.style.filter = `hue-rotate(${random(
    0,
    chickens * 10
  )}deg)  drop-shadow(2px -2px .5px var(--color2))`;
  hen.onclick = () => {
    if (hen.src === "none") {
      return;
    }
    if (!active) {
      return;
    }
    putMessage(x + 10, y - 12, "KO KO!");
    active = false;
    setTimeout(() => {
      active = true;
      loop();
    }, 1200);
  };
  hen.kill = () => {
    hen.src = "none";
    hen.alt = "killed";
    hen.style.width = "4rem";
    active = false;
    setTimeout(() => {
      hen.remove();
      chickens--;
    }, 5000);
  };
  document.body.appendChild(hen);
  const move = () => {
    hen.style.transform = `translate(${x}px,${y}px) scaleX(${scaleX})`;
  };
  const limitMove = () => {
    if (x < 1) {
      x = 2;
    }
    if (x > document.body.clientWidth) {
      x = document.body.clientWidth - 1;
    }
    if (y < 1) {
      y = 2;
    }
    if (y > document.body.clientHeight) {
      y = document.body.clientHeight - 1;
    }
  };
  const randomMove = () => {
    if (vel.x === 0 && vel.y === 0) {
      if (random(0, 10) > 5) {
        vel.x = random(-maxPath, maxPath);
      } else {
        vel.y = random(-maxPath, maxPath);
      }
    }
  };
  const doMove = () => {
    let dirx = clamp(vel.x, -1, 1);
    let diry = clamp(vel.y, -1, 1);
    if (dirx > 0) {
      scaleX = -1;
    } else {
      scaleX = 1;
    }
    x += dirx;
    y += diry;
    vel.x -= dirx;
    vel.y -= diry;
  };
  const putEgg = () => {
    if (chickens > 30) {
      return;
    }
    let t = Date.now() - lastTimePutEgg;
    if (t < timeoutPutEgg) {
      return;
    }
    timeoutPutEgg = random(3000, 19000);
    lastTimePutEgg = Date.now();
    addEggAt(x, y);
  };
  const run = () => {
    let t = Date.now() - lastTime;
    if (t < delayMove) {
      return;
    }
    lastTime = Date.now();
    randomMove();
    doMove();
    limitMove();
    putEgg();
  };
  const loop = () => {
    if (!active) {
      return;
    }
    run();
    move();
    requestAnimationFrame(loop);
  };
  loop();
}

function createRandomEgg() {
  const x = random(
    document.body.clientWidth * 0.4,
    document.body.clientWidth * 0.8
  );
  const y = random(
    document.body.clientHeight * 0.4,
    document.body.clientHeight * 0.8
  );
  addEggAt(x, y,true);
}

createRandomEgg();
