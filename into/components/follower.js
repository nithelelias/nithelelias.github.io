

const styleSheet = document.createElement("style");
styleSheet.__template = ` [follower]{ 
 pointer-events: none;
 position:fixed;
 top:0px;
 left:0px;
 $add
}`;
styleSheet.innerHTML = styleSheet.__template.replace("$add", "");
document.head.appendChild(styleSheet);

function move(x, y) {
  styleSheet.innerHTML = styleSheet.__template.replace(
    "$add",
    `
        
            transform:translate3d(${x}px, ${y}px, 0)
        
      `
  );
}
const ismousemove = (e) => {
  move(e.clientX, e.clientY);
};

function istouchmove(e) {
  const touch = e.touches[0];
  move(touch.clientX, touch.clientY);
}
window.addEventListener("mousemove", ismousemove);
window.addEventListener("touchmove", istouchmove);
