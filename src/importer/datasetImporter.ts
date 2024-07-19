import { CarsData } from "../interfaces/CarsData";

async function datasetImporter(dataset: File): Promise<Array<CarsData>> {
  const res = new Array<CarsData>();
  const textContent = await dataset.text();
  const lines = textContent.split("\n");
  for (let i = 0; i < lines.length; ++i) {
    // first line contains attribute names
    if (i == 0) {
      continue;
    }
    const split = lines[i].split(",");
    res.push({
      name: split[0],
      economy: Number(split[1]),
      cylinders: Number(split[2]),
      displacement: Number(split[3]),
      power: Number(split[4]),
      weight: Number(split[5]),
      speed: Number(split[6]),
      year: Number(split[7]),
    });
  }
  return res;
}

export { datasetImporter };
