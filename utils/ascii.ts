const TEXT_URL =
  "https://vxspqnuarwhjjbxzgauv.supabase.co/storage/v1/object/public/ascii";

export default async function ascii(
  name: string,
  replace: Record<string, string> = {},
) {
  if (Bun.argv.includes("--no-ascii") || Bun.argv.includes("-a")) {
    return;
  }

  try {
    const response = await fetch(`${TEXT_URL}/${name}.txt`);
    if (!response.ok) return;

    let _ascii = await response.text();
    for (const [key, value] of Object.entries(replace)) {
      _ascii = _ascii.replace(`[${key.toUpperCase()}]`, value);
    }

    console.log(`\n${_ascii}\n`);
  } catch {
    return;
  }
}
