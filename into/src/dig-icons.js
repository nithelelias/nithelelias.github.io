export default function (container) {
  container.querySelectorAll("icon").forEach((element) => {
    const icondiv = document.createElement("div");
    icondiv.className = "icon-pack " + element.className;  
     
    element.replaceWith(icondiv);
  });
}
