function importJS(path) {
  return new Promise((resolve) => {
    var s = document.createElement("script");
    s.src = path;
    s.type = "module";
    s.onload = () => {
      resolve();
    };
    document.head.appendChild(s);
    document.head.removeChild(s);
  });
}

function importCss(path) {
  return new Promise((resolve) => {
    var s = document.createElement("link");
    s.href = path;
    s.rel = "stylesheet";
    s.classList.add("imported");
    s.onload = () => {
      resolve();
    };
    document.head.appendChild(s);
  });
}

function clearImports() {
  document.querySelectorAll(".imported").forEach((element) => element.remove());
}

export default function (container) {
  clearImports();
  const promises = [];
  container.querySelectorAll("[import]").forEach((element) => {
    const importArray = element.attributes.import.value
      .trim()
      .replaceAll(" ", "")
      .split(",");

    element.removeAttribute("import");
    importArray.forEach((file) => {
      let ext = file.split(".").pop();
      if (ext === "js") {
        promises.push(importJS(`components/${file}`));
        return;
      }
      if (ext === "css") {
        promises.push(importCss(`styles/${file}`));
        return;
      }
    });
  });
  return Promise.resolve(promises);
}
