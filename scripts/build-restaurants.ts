import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeRestaurantRow, type RestaurantSourceRow } from "../src/domain/restaurant-normalization";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const spreadsheetId = process.env.VIEWDDING_RESTAURANT_SHEET_ID ?? "1-aC-dMvSfVnBfzpTuqY2tWwzgdJ15aBoZ6KOomvJZD4";
const sheetName = process.env.VIEWDDING_RESTAURANT_SHEET_NAME ?? "Restaurants";
const outputPath = path.join(projectRoot, "src", "data", "restaurants.generated.json");
const metadataPath = path.join(projectRoot, "src", "data", "restaurant-metadata.generated.json");

function parseCsv(contents: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < contents.length; index += 1) {
    const character = contents[index];
    const next = contents[index + 1];
    if (character === '"' && quoted && next === '"') {
      field += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && next === "\n") index += 1;
      row.push(field);
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }
  if (field || row.length > 0) {
    row.push(field);
    if (row.some((value) => value.length > 0)) rows.push(row);
  }
  return rows;
}

function objectsFromCsv(contents: string): RestaurantSourceRow[] {
  const [headers, ...rows] = parseCsv(contents);
  if (!headers) return [];
  return rows.map((values) => Object.fromEntries(headers.map((header, index) => [header.trim(), values[index] ?? ""])));
}

const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
const response = await fetch(csvUrl);
if (!response.ok) throw new Error(`Google Sheet 음식점 데이터를 가져오지 못했습니다: ${response.status}`);

const csv = await response.text();
const sourceRows = objectsFromCsv(csv);
const restaurants = sourceRows.flatMap((row) => {
  const restaurant = normalizeRestaurantRow(row);
  return restaurant?.active ? [restaurant] : [];
});

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, `${JSON.stringify(restaurants, null, 2)}\n`, "utf8");
await fs.writeFile(metadataPath, `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  sourceSpreadsheetId: spreadsheetId,
  sourceSheetName: sheetName,
  sourceRows: sourceRows.length,
  exportedRestaurants: restaurants.length,
  districts: Array.from(new Set(restaurants.map((restaurant) => restaurant.district))).sort((a, b) => a.localeCompare(b, "ko")),
}, null, 2)}\n`, "utf8");

console.log(`Generated ${restaurants.length} active restaurants from Google Sheet ${sheetName}`);
