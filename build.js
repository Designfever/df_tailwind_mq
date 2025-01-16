import esbuild from 'esbuild';

const baseConfig = {
  entryPoints: ["src/index.ts"],
  outdir:'dist',
  bundle: true,
  sourcemap: true,
  minify: true,
}

export default async function make() {
  await esbuild.build({
    ...baseConfig,
    format: "cjs",
    outExtension:{ ".js": ".cjs" }
  });

  await esbuild.build({
    ...baseConfig,
    format: "esm",
    minify: false,
  });
}

make().then(() => {});