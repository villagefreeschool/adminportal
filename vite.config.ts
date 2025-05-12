import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
      filename: "dist/bundle-size-stats.html",
    }),
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    minify: "esbuild", // esbuild is faster than terser
    chunkSizeWarningLimit: 1500, // Increase warning limit to 1.5MB
    rollupOptions: {
      input: {
        main: "index.html",
      },
      output: {
        manualChunks: {
          "vendor-mui": [
            "@mui/material",
            "@mui/icons-material",
            "@mui/x-date-pickers",
            "@emotion/react",
            "@emotion/styled",
          ],
          "vendor-firebase": [
            "firebase/app",
            "firebase/auth",
            "firebase/firestore",
            "firebase/storage",
          ],
          "vendor-charts": ["plotly.js-basic-dist"],
          "vendor-utils": ["lodash", "dayjs", "exceljs", "file-saver"],
          "vendor-react": ["react", "react-dom", "react-router-dom"],
        },
      },
    },
    target: "esnext",
  },
  server: {
    hmr: {
      overlay: true,
    },
    port: 3000,
    open: true,
  },
});
