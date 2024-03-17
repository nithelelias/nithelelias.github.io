const width = "180",
  height = "140";
const bg_color = "c1c1c1db";
const fg_color = "ec7fff";
const link_color = "196676";
const border_color = bg_color;
const params = `bg_color=${bg_color}&amp;fg_color=${fg_color}&amp;link_color=${link_color}&amp;border_color=${border_color}`;
const itchWidgets = [
  {
    src: "https://itch.io/embed/2392746?" + params,
    name: "The Panda merge by Niteru",
    href: "https://nithelelias.itch.io/the-panda-merge",
  },

  {
    src: "https://itch.io/embed/2498979?" + params,
    name: "Smiling! by Niteru",
    href: "https://nithelelias.itch.io/smiling",
  },
  {
    src: "https://itch.io/embed/2574898?" + params,
    name: " Slashy Dashy - Sobrevive Simulator by Niteru",
    href: "https://nithelelias.itch.io/dashy-survivor",
  },
  {
    src: "https://itch.io/embed/1429697?" + params,
    name: "Bob and the Dungeon of Latomia by Niteru",
    href: "https://nithelelias.itch.io/bobandthedungeon",
  },
  {
    src: "https://itch.io/embed/1507124?"+ params,
    name: "The Village by Niteru",
    href: "https://nithelelias.itch.io/the-village",
  },
  {
    src: "https://itch.io/embed/1093829?"+ params,
    name: "The Arena by Niteru",
    href: "https://nithelelias.itch.io/the-arena",
  },
  {
    src: "https://itch.io/embed/1456262?"+ params,
    name: "Simple Adventure by Niteru",
    href: "https://nithelelias.itch.io/adventure",
  },
  {
    src: "https://itch.io/embed/702878?"+ params,
    name: "Ninja-color by Niteru",
    href: "https://nithelelias.itch.io/ninja-color",
  },
  {
    src: "https://itch.io/embed/1490708?"+ params,
    name: "My Vengance by Niteru",
    href: "https://nithelelias.itch.io/my-vengance",
  },
  {
    src: "https://itch.io/embed/1907425?"+ params,
    name: "Cuadradin by Niteru",
    href: "https://nithelelias.itch.io/cuadradin",
  },
];
export function getItchWidgetFrames() {
  return itchWidgets.map((widget) => {
    return `<iframe
        frameborder="0"
        src="${widget.src}"
        width="${width}"
        height="${height}"
      >
        <a href="${widget.href}">${widget.name}</a>
      </iframe>`;
  });
}
