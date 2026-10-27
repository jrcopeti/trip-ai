/**
 * Resolves image imports to `{ src }` under tsx, as `src/test/imageStub.ts` does under Vitest.
 * `prompt.ts` reads its labels from `@/data`, which imports the travel photos.
 */
import Module from "node:module";

const extensions = (Module as unknown as { _extensions: Record<string, unknown> })._extensions;
for (const ext of [".jpg", ".jpeg", ".png", ".webp", ".svg"]) {
  extensions[ext] = (module: { exports: unknown }, filename: string) => {
    module.exports = { src: filename, height: 1, width: 1 };
  };
}
