import * as fs from "fs";

export async function readJsonFile<T>(filePath: string): Promise<T> {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data) as T;
  } catch (error) {
    console.error(`Error reading JSON file ${filePath}:`, error);
    throw error; // Re-throw to handle upstream
  }
}
