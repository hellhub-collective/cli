import dts from "bun-plugin-dts";

await Bun.build({
  minify: true,
  target: "node",
  outdir: "./build",
  plugins: [dts()],
  entrypoints: ["./index.ts"],
  naming: { entry: "[name].mjs" },
});
