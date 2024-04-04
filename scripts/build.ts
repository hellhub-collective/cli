await Bun.build({
  minify: true,
  target: "node",
  outdir: "./build",
  entrypoints: ["./index.ts"],
  naming: { entry: "[name].mjs" },
});

export {};
