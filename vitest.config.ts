import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],

  resolve: {
    // We leave alias blank and get the values
    // from tsconfig.compilerOptions.paths via
    // the tsconfigPaths plugin.
    alias: {},
  },

  test: {
    globals: true,
    environment: "jsdom",

    server: {
      deps: {},
    },

    setupFiles: ["./src/setupTests.ts"],

    coverage: {
      provider: "v8",

      exclude: [
        "build/",
        "coverage/",
        "dist/",
        "estlint.config.js",
        "scripts/",
        "src/__generated__",
        "src/_tests",
        "src/types.ts",
        "vite.config.ts",
        "vitest.config.ts",
        "src/setupTests.ts",
        ".prettierrc.ts",
        "**/types.ts",
      ],

      reporter: ["text", "cobertura", "json", "html"],

      reportsDirectory: "coverage/",
    },
  },
});
