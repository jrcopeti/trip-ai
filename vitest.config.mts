import { defineConfig, type Plugin } from "vitest/config";
import react from "@vitejs/plugin-react";
import { basename } from "node:path";
import { fileURLToPath } from "node:url";

const IMAGE_IMPORT = /\.(jpe?g|png|webp|gif|avif|svg)(\?.*)?$/;
const STUB_PREFIX = "\0asset-stub:";
const stubModule = fileURLToPath(new URL("./src/test/imageStub.ts", import.meta.url));

/**
 * Turns `import sun from "@/assets/weather/sun.png"` into an object with `.src`,
 * the way Next's loader does. Keyed by filename so the ten weather icons stay
 * distinguishable — `placeWeatherIcons` picks between them and the tests assert
 * which one it picked.
 */
function staticAssetStub(): Plugin {
  return {
    name: "static-asset-stub",
    enforce: "pre",
    resolveId(source) {
      if (!IMAGE_IMPORT.test(source)) return null;
      return `${STUB_PREFIX}${basename(source.split("?")[0])}`;
    },
    load(id) {
      if (!id.startsWith(STUB_PREFIX)) return null;
      const name = id.slice(STUB_PREFIX.length);
      return [
        `import { makeImageStub } from ${JSON.stringify(stubModule)};`,
        `export default makeImageStub(${JSON.stringify(name)});`,
      ].join("\n");
    },
  };
}

export default defineConfig({
  plugins: [staticAssetStub(), react()],
  // `@/` comes from tsconfig.json — Vite 8 reads it natively.
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["node_modules/**", ".next/**", "e2e/**"],
    restoreMocks: true,
  },
});
