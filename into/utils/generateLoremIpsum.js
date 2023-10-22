const words =
  `Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Eu turpis egestas pretium aenean pharetra magna ac placerat vestibulum Enim ut sem viverra aliquet eget sit amet tellus cras Sed euismod nisi porta lorem mollis aliquam ut porttitor leo`.split(
    " "
  );
const total_words = words.length;
function random(min, max) {
  return parseInt(min + Math.random() * (max + 1));
}
function randomword() {
  return words[random(0, total_words - 1)];
}
export default function generateLoremIpsum(maxSize) {
  let count = maxSize + 0;

  const paragraph = [];
  let expected_punctuation = random(3, 6);
  while (count > 0) {
    expected_punctuation--;
    count--;
    let newword = randomword();
    if (expected_punctuation < 1 && count > 3) {
      newword += ",";
      expected_punctuation = random(3, 6);
    }
    paragraph.push(newword);
  }

  return paragraph.join(" ") + ".";
}
