import { CarsData } from "../interfaces/CarsData";

class LegendGUI {
  private readonly container: HTMLDivElement;
  public constructor(container: HTMLDivElement) {
    this.container = container;
  }

  public addEntry(color: string, d: CarsData) {
    const div = document.createElement("div");
    div.classList.add("legend-entry");
    const rect = document.createElement("div");
    rect.style.backgroundColor = color;
    const text = document.createElement("p");
    text.textContent = d.name;
    const btn = document.createElement("button");
    btn.textContent = "X";
    btn.addEventListener("click", () => {
      document.dispatchEvent(
        new CustomEvent("deselection", {
          detail: {
            color: color,
            data: d,
          },
        }),
      );
      div.remove();
    });
    div.append(rect, text, btn);
    this.container.append(div);
  }
}

export { LegendGUI };
