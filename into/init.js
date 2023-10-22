import { buildpage } from "./src/builder.js";
import startScrollDriven from "./utils/scrollDriven.js";
const main = document.querySelector("main");
///// -----
const navigation = {
  history: [],
  path: "",
};

function timeOut(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}
function render() {
  return buildpage(main, navigation.path, {
    route,
    back,
  });
}
async function route(path) {
  if (main.busy) {
    return;
  }
  main.busy = true;
  navigation.path = path;
  navigation.history.push(path);
  main.classList.add("busy");
  document.body.classList.add("transition-out");
  await timeOut(900);

  await render();
  document.body.classList.add("transition-in");
  document.body.classList.remove("transition-out");
  await timeOut(1100);
  main.busy = false;
  document.body.classList.remove("transition-in");
  main.classList.remove("busy");
}
function back() {
  const path = navigation.history.pop();
  navigation.path = path;
  render();
}

route("combination");
startScrollDriven();
