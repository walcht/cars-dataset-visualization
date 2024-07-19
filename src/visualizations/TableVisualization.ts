import { select } from "d3-selection";
import { CarsData } from "../interfaces/CarsData";

class TableVisualization {
  private readonly container: HTMLDivElement;
  private readonly data: CarsData[];

  public constructor(container: HTMLDivElement, data: CarsData[]) {
    this.container = container;
    this.data = data;
    this.createTable();
  }

  private createTable() {
    const table = select(this.container).append("table");
    table
      .append("thead")
      .append("tr")
      .selectAll("th")
      .data(Object.keys(this.data[0]))
      .join("th")
      .text((d) => d);
    table
      .append("tbody")
      .selectAll("tr")
      .data(this.data)
      .join("tr")
      .selectAll("td")
      .data((d) => Object.values(d))
      .join("td")
      .text((d) => d);
  }
}

export { TableVisualization };
