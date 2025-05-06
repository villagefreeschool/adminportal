/**
 * Prettier configuration
 *
 * This config is set to ONLY format Markdown files since Biome handles other file types.
 */
import type { Config } from "prettier";

const config: Config = {
  overrides: [
    {
      /**
       * We use Biome (biome.jsonc) instead of Prettier to format all
       * Javascript, Typescript, and CSS code. This line disables
       * Prettier for all other files.
       */
      files: "*.{js,jsx,ts,tsx,json,css,scss,html,vue,astro,svelte}",
      options: {
        formatter: "off",
      },
    },
    {
      /**
       * But as of May 2025, Biome doesn't support formatting in Markdown files,
       * so we enable it on these files.
       */
      files: "*.{md,markdown}",
      options: {
        proseWrap: "always",
        printWidth: 80,
        tabWidth: 2,
      },
    },
  ],
};

export default config;
