import { scaleLinear, ScaleLinear } from "d3-scale";
import { ResizableVisualzation } from "../core/ResizableVisualization";
import { CarsData } from "../interfaces/CarsData";
import { create, Selection } from "d3-selection";
import { extent, max, min } from "d3-array";
import { curveLinearClosed, line } from "d3-shape";

class RadarVisualization extends ResizableVisualzation {
  private readonly data: CarsData[];
  private readonly svg: Selection<SVGSVGElement, undefined, null, undefined>;
  private readonly axisContainer: Selection<
    SVGGElement,
    undefined,
    null,
    undefined
  >;
  private readonly gridContainer: Selection<
    SVGGElement,
    undefined,
    null,
    undefined
  >;
  private readonly g: Selection<SVGGElement, undefined, null, undefined>;

  private readonly scales: Map<
    keyof CarsData,
    { scale: ScaleLinear<number, number>; angle: number }
  >;
  private radius: number = 200;

  private readonly margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  } = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20,
  };

  private pathsPool: Map<string, CarsData> = new Map();

  public constructor(container: HTMLDivElement, data: CarsData[]) {
    super(container);
    this.data = data;
    this.svg = create("svg").attr("width", "100%").attr("height", "100%");
    this.gridContainer = this.svg
      .append("g")
      .attr("stroke", "#95a5a6")
      .attr("stroke-opacity", 0.2)
      .attr("fill", "none");
    this.axisContainer = this.svg
      .append("g")
      .attr("stroke", "#000")
      .attr("stroke-opacity", 0.2);
    this.g = this.svg
      .append("g")
      .attr("stroke-opacity", 1)
      .attr("fill", "none")
      .attr("stroke-width", 2);
    this.scales = new Map([
      [
        "economy",
        {
          scale: scaleLinear().domain(
            extent(this.data, (d) => d.economy) as [number, number],
          ),
          angle: 0,
        },
      ],
      [
        "cylinders",
        {
          scale: scaleLinear().domain(
            extent(this.data, (d) => d.cylinders) as [number, number],
          ),
          angle: 51,
        },
      ],
      [
        "displacement",
        {
          scale: scaleLinear().domain(
            extent(this.data, (d) => d.displacement) as [number, number],
          ),
          angle: 102,
        },
      ],
      [
        "power",
        {
          scale: scaleLinear().domain(
            extent(this.data, (d) => d.power) as [number, number],
          ),
          angle: 153,
        },
      ],
      [
        "weight",
        {
          scale: scaleLinear().domain(
            extent(this.data, (d) => d.weight) as [number, number],
          ),
          angle: 204,
        },
      ],
      [
        "speed",
        {
          scale: scaleLinear().domain(
            extent(this.data, (d) => d.speed) as [number, number],
          ),
          angle: 255,
        },
      ],
      [
        "year",
        {
          scale: scaleLinear().domain(
            extent(this.data, (d) => d.year) as [number, number],
          ),
          angle: 306,
        },
      ],
    ]);
    this.container.append(this.svg.node()!);
    setTimeout(this.update.bind(this), 0);
  }

  private lineGenerator = line<[keyof CarsData, number]>()
    .x(([k, v]) => {
      const q = this.scales.get(k)!;
      return this.radialToCartesian(q.angle, v, q.scale).x;
    })
    .y(([k, v]) => {
      const q = this.scales.get(k)!;
      return this.radialToCartesian(q.angle, v, q.scale).y;
    })
    .curve(curveLinearClosed);

  public update() {
    // draw axis lines
    this.axisContainer
      .selectAll("line")
      .data(this.scales)
      .join("line")
      .attr("stroke", "white")
      .attr("x1", this.width / 2)
      .attr("y1", this.height / 2)
      .attr(
        "x2",
        ([_, v]) =>
          this.radialToCartesian(v.angle, max(v.scale.domain())!, v.scale).x,
      )
      .attr(
        "y2",
        ([_, v]) =>
          this.radialToCartesian(v.angle, max(v.scale.domain())!, v.scale).y,
      );
    // draw axis labels
    this.axisContainer
      .selectAll("text")
      .data(this.scales)
      .join("text")
      .attr("text-anchor", "middle")
      .attr(
        "x",
        ([_, v]) =>
          this.radialToCartesian(v.angle, max(v.scale.domain())!, v.scale).x,
      )
      .attr(
        "y",
        ([_, v]) =>
          this.radialToCartesian(v.angle, max(v.scale.domain())!, v.scale).y,
      )
      .text(([k]) => k);
    // draw grid lines
    const ticks = [0.25, 0.5, 0.75, 1.0];
    this.gridContainer.selectAll("path").remove();
    for (const p of ticks) {
      const vals: [keyof CarsData, number][] = [];
      for (const [k, { scale }] of this.scales) {
        vals.push([
          k,
          min(scale.domain())! +
            (max(scale.domain())! - min(scale.domain())!) * p,
        ]);
      }
      this.gridContainer.append("path").attr("d", this.lineGenerator(vals));
    }
    // finally draw visualization paths
    this.g.selectAll("path").remove();
    for (const [color, d] of this.pathsPool) {
      const vals: [keyof CarsData, number][] = [];
      for (const [k] of this.scales) {
        // @ts-ignore
        vals.push([k, d[k]]);
      }
      this.g
        .append("path")
        .attr("d", this.lineGenerator(vals))
        .attr("stroke", color);
    }
  }

  protected override resize(): void {
    // recalculate radius
    this.radius = Math.floor(
      Math.min(
        this.width / 2 - this.margins.right,
        this.height / 2 - this.margins.top,
      ) - 10,
    );
    // update radial scales
    for (const [, v] of this.scales) {
      v.scale.range([0, this.radius]);
    }
    this.update();
  }

  private radialToCartesian(
    angle: number,
    value: number,
    scale: ScaleLinear<number, number>,
  ) {
    let x = Math.cos((angle * Math.PI) / 180.0) * scale(value);
    let y = Math.sin((angle * Math.PI) / 180.0) * scale(value);
    return { x: this.width / 2 + x, y: this.height / 2 - y };
  }

  public setPath(color: string, d: CarsData) {
    this.pathsPool.set(color, d);
    this.update();
  }

  public removePath(color: string) {
    this.pathsPool.delete(color);
    this.update();
  }
}

export { RadarVisualization };
