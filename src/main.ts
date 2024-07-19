import { LegendGUI } from "./guis/LegendGUI";
import { datasetImporter } from "./importer/datasetImporter";
import { RadarVisualization } from "./visualizations/RadarVisualization";
import { ScatterplotVisualization } from "./visualizations/ScatterplotVisualization";
import { TableVisualization } from "./visualizations/TableVisualization";

///////////////////////////////////////////////////////////////////////////////
////////////////////////////////// QUERIES ////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
const csvDatasetImporter = document.querySelector(
  "#csv-dataset-importer",
) as HTMLInputElement;
if (csvDatasetImporter == null) {
  throw new Error("couldn't find the CSV dataset importer");
}
const importBtn = document.querySelector("#import-btn") as HTMLButtonElement;
if (importBtn == null) {
  throw new Error("couldn't find the import button");
}
const tableContainer = document.querySelector(
  "#table-container",
) as HTMLDivElement;
if (tableContainer == null) {
  throw new Error("couldn't find the table container");
}
const scatterplotContainer = document.querySelector(
  "#scatterplot-container",
) as HTMLDivElement;
if (scatterplotContainer == null) {
  throw new Error("couldn't find the scatterplot container");
}
const radarChartContainer = document.querySelector(
  "#radar-chart-container",
) as HTMLDivElement;
if (radarChartContainer == null) {
  throw new Error("couldn't find the radar chart container");
}
const xAxisEncoder = document.querySelector(
  "#x-axis-encoder-select",
) as HTMLInputElement;
if (xAxisEncoder == null) {
  throw new Error();
}
const yAxisEncoder = document.querySelector(
  "#y-axis-encoder-select",
) as HTMLInputElement;
if (yAxisEncoder == null) {
  throw new Error();
}
const sizeEncoder = document.querySelector(
  "#size-encoder-select",
) as HTMLInputElement;
if (sizeEncoder == null) {
  throw new Error();
}
const legendContainer = document.querySelector(
  "#legend-container",
) as HTMLDivElement;
if (legendContainer == null) {
  throw new Error();
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////// Visualizations //////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

const legendGUI = new LegendGUI(legendContainer);

///////////////////////////////////////////////////////////////////////////////
///////////////////////////// Event Listeners /////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
importBtn.addEventListener("click", async () => {
  if (!csvDatasetImporter.files?.length) {
    alert("Please select a .csv dataset then click on import.");
    return;
  }
  const data = await datasetImporter(csvDatasetImporter.files[0]);
  new TableVisualization(tableContainer, data);
  const sv = new ScatterplotVisualization(scatterplotContainer, data, {
    xAxisEncoder: (d) => d.weight,
    xAxisTitle: "weight",
    yAxisEncoder: (d) => d.economy,
    yAxisTitle: "economy",
    sizeEncoder: (d) => d.cylinders,
    sizeTitle: "cylinders",
  });

  xAxisEncoder.addEventListener("change", (e) => {
    const v = (e.currentTarget as HTMLInputElement).value;
    // @ts-ignore
    sv.setXAxisEncoder((d) => d[v], v);
  });

  yAxisEncoder.addEventListener("change", (e) => {
    const v = (e.currentTarget as HTMLInputElement).value;
    // @ts-ignore
    sv.setYAxisEncoder((d) => d[v], v);
  });

  sizeEncoder.addEventListener("change", (e) => {
    const v = (e.currentTarget as HTMLInputElement).value;
    // @ts-ignore
    sv.setSizeEncoder((d) => d[v], v);
  });

  const rv = new RadarVisualization(radarChartContainer, data);

  document.addEventListener("selection", (e: any) => {
    legendGUI.addEntry(e.detail.color, e.detail.data);
    rv.setPath(e.detail.color, e.detail.data);
  });

  document.addEventListener("deselection", (e: any) => {
    rv.removePath(e.detail.color);
  });
});
