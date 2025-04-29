
import * as fs from "fs";

export async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, jsonString, "utf8");
  } catch (error) {
    console.error(`Error writing JSON file ${filePath}:`, error);
    throw error; // Re-throw to handle upstream
  }
}
