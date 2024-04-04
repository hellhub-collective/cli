import path from "path";
import fs from "fs/promises";

const asciiFolder = path.resolve(process.cwd(), "./ascii");
const asciiFiles = await fs.readdir(asciiFolder);

for (const file of asciiFiles) {
  const sourceFilePath = path.resolve(asciiFolder, file);
  const targetFilePath = path.resolve(process.cwd(), "./build", "ascii", file);

  await fs.mkdir(path.dirname(targetFilePath), { recursive: true });
  await fs.copyFile(sourceFilePath, targetFilePath);
}
