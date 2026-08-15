import fs from "fs";
import path from "path";
import { halls } from "../src/lib/data";
import { HALL_SEO_COLLECTION_ORDER, getHallSeoConfig, hallMatchesSeoCollection } from "../src/lib/hall-seo";
import { generateCSVContent } from "../src/lib/excel-export";

function main() {
  const publicExportsDir = path.join(process.cwd(), "public", "exports");

  if (!fs.existsSync(publicExportsDir)) {
    fs.mkdirSync(publicExportsDir, { recursive: true });
  }

  console.log("Generating static CSV files for SEO Collections...");

  for (const key of HALL_SEO_COLLECTION_ORDER) {
    const config = getHallSeoConfig(key);
    const matchedHalls = halls.filter((h) => hallMatchesSeoCollection(h, key));
    const csvContent = generateCSVContent(matchedHalls);

    const fileName = key === "all" ? "seoul-wedding-halls.csv" : `seoul-${key}-wedding-halls.csv`;
    const filePath = path.join(publicExportsDir, fileName);

    fs.writeFileSync(filePath, csvContent, "utf-8");
    console.log(`- Created ${fileName} (${matchedHalls.length} halls)`);
  }

  console.log("Successfully generated all SEO CSV files!");
}

main();
