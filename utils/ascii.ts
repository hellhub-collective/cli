import path from "path";
import fs from "fs/promises";

function get_install_dir() {
  // the script being run is always ./build/index.mjs ?
  let script = process.argv[1];
  return path.resolve(script, './../../');
}

const INSTALL_DIR = get_install_dir();

export default async function ascii(
  name: string,
  replace: Record<string, string> = {},
) {
  if (Bun.argv.includes("--no-ascii") || Bun.argv.includes("-a")) {
    return;
  }

  const file = await fs.readFile(
    path.join(INSTALL_DIR, "./ascii", `${name}.txt`),
  );

  let _ascii = file.toString();
  for (const [key, value] of Object.entries(replace)) {
    _ascii = _ascii.replace(`[${key.toUpperCase()}]`, value);
  }

  console.log(`\n${_ascii}\n`);
}
