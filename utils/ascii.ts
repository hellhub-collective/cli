import path from "path";
import fs from "fs/promises";

export default async function ascii(
  name: string,
  replace: Record<string, string> = {},
) {
  if (Bun.argv.includes("--no-ascii") || Bun.argv.includes("-a")) {
    return;
  }

  const file = await fs.readFile(
    path.join(process.cwd(), "./ascii", `${name}.txt`),
  );

  let _ascii = file.toString();
  for (const [key, value] of Object.entries(replace)) {
    _ascii = _ascii.replace(`[${key.toUpperCase()}]`, value);
  }

  console.log(`\n${_ascii}\n`);
}
