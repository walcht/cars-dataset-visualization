import { scaleLinear, ScaleLinear, ScalePower, scaleSqrt } from "d3-scale";
import { ResizableVisualzation } from "../core/ResizableVisualization";
import { CarsData } from "../interfaces/CarsData";
import { create, select, Selection } from "d3-selection";
import { extent } from "d3-array";
import { axisBottom, axisLeft } from "d3-axis";

class ScatterplotVisualization extends ResizableVisualzation {
  private readonly data: CarsData[];
  private readonly svg: Selection<SVGSVGElement, undefined, null, undefined>;
  private readonly g: Selection<SVGGElement, undefined, null, undefined>;
  private readonly x: ScaleLinear<number, number>;
  private readonly y: ScaleLinear<number, number>;
  private readonly radius: ScalePower<number, number>;

  private readonly margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  } = {
    top: 30,
    right: 30,
    bottom: 50,
    left: 80,
  };

  private xAxisEncoder: (d: CarsData) => number;
  private xAxisTitle: string;
  public setXAxisEncoder(encoder: (d: CarsData) => number, name: string) {
    this.xAxisEncoder = encoder;
    this.xAxisTitle = name;
    this.update();
  }
  private yAxisEncoder: (d: CarsData) => number;
  private yAxisTitle: string;
  public setYAxisEncoder(encoder: (d: CarsData) => number, name: string) {
    this.yAxisEncoder = encoder;
    this.yAxisTitle = name;
    this.update();
  }
  private sizeEncoder: (d: CarsData) => number;
  // @ts-ignore
  private sizeTitle: string;
  public setSizeEncoder(encoder: (d: CarsData) => number, name: string) {
    this.sizeEncoder = encoder;
    this.sizeTitle = name;
    this.update();
  }

  private selectionPool: Map<
    string,
    Selection<SVGCircleElement, any, any, any> | undefined
  > = new Map([
    ["red", undefined],
    ["green", undefined],
    ["blue", undefined],
    ["orange", undefined],
    ["yellow", undefined],
  ]);

  public constructor(
    container: HTMLDivElement,
    data: CarsData[],
    initialOptions: {
      xAxisEncoder: (d: CarsData) => number;
      xAxisTitle: string;
      yAxisEncoder: (d: CarsData) => number;
      yAxisTitle: string;
      sizeEncoder: (d: CarsData) => number;
      sizeTitle: string;
    },
  ) {
    super(container);
    this.data = data;
    this.svg = create("svg").attr("width", "100%").attr("height", "100%");
    this.g = this.svg
      .append("g")
      .attr("stroke", "#000")
      .attr("stroke-opacity", 0.2);
    this.x = scaleLinear();
    this.y = scaleLinear();
    this.radius = scaleSqrt().range([2, 8]);
    this.container.append(this.svg.node()!);
    this.xAxisEncoder = initialOptions.xAxisEncoder;
    this.xAxisTitle = initialOptions.xAxisTitle;
    this.yAxisEncoder = initialOptions.yAxisEncoder;
    this.yAxisTitle = initialOptions.yAxisTitle;
    this.sizeEncoder = initialOptions.sizeEncoder;
    this.sizeTitle = initialOptions.sizeTitle;
    setTimeout(this.update.bind(this), 0);

    document.addEventListener("deselection", (e: any) =>
      this.onDeselection(e.detail.color),
    );
  }

  public update() {
    // update domains
    this.x.domain(extent(this.data, this.xAxisEncoder) as [number, number]);
    this.y.domain(extent(this.data, this.yAxisEncoder) as [number, number]);
    this.radius.domain(extent(this.data, this.sizeEncoder) as [number, number]);

    this.svg.select<SVGGElement>("g.x-axis").remove();
    this.svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${this.height - this.margins.bottom})`)
      .call(axisBottom(this.x))
      .call((g) =>
        g
          .append("text")
          .attr("text-anchor", "end")
          .attr("x", this.width - this.margins.right)
          .attr("y", this.margins.bottom - 15)
          .text(`→ ${this.xAxisTitle}`),
      )
      .call((g) =>
        g
          .selectAll(".tick line")
          .clone()
          .attr("y2", -this.height + this.margins.bottom + this.margins.top)
          .attr("stroke-opacity", 0.1),
      );
    this.svg.select<SVGGElement>("g.y-axis").remove();
    this.svg
      .append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${this.margins.left},0)`)
      .call(axisLeft(this.y))
      .call((g) =>
        g
          .append("text")
          .attr("text-anchor", "start")
          .attr("x", -this.margins.left + 10)
          .attr("y", 15)
          .text(`↑ ${this.yAxisTitle}`),
      );
    // update dots
    this.g
      .selectAll("circle")
      .data(this.data)
      .join("circle")
      .attr("fill", "#95a5a6")
      .attr("opacity", 0.5)
      .attr("cx", (d) => this.x(this.xAxisEncoder(d)))
      .attr("cy", (d) => this.y(this.yAxisEncoder(d)))
      .attr("r", (d) => this.radius(this.sizeEncoder(d)))
      .on("click", this.onSelection.bind(this));
  }

  protected override resize(): void {
    this.x.range([this.margins.left, this.width - this.margins.right]);
    this.y.range([this.height - this.margins.bottom, this.margins.top]);
    this.update();
  }

  private onSelection(e: any, d: CarsData) {
    for (const [color, v] of this.selectionPool) {
      if (v == undefined) {
        const s = select(e.currentTarget);
        this.selectionPool.set(color, s);
        document.dispatchEvent(
          new CustomEvent("selection", {
            detail: {
              data: d,
              color: color,
            },
          }),
        );
        s.attr("fill", color).attr("opacity", 1.0);
        return;
      }
    }
  }

  private onDeselection(color: string) {
    let v = this.selectionPool.get(color);
    if (v) {
      v.attr("fill", "#95a5a6").attr("opacity", 0.5);
      this.selectionPool.set(color, undefined);
    }
  }

}

export { ScatterplotVisualization };
