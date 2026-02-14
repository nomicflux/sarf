import { init, analyze_word } from "../../../pkg/sarf_core";

async function setup() {
  await init();
  const input = document.getElementById("word") as HTMLInputElement;
  const button = document.getElementById("analyze") as HTMLButtonElement;
  const result = document.getElementById("result") as HTMLDivElement;

  button.addEventListener("click", () => {
    result.textContent = analyze_word(input.value);
  });
}

setup();
