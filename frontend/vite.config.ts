/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";
import { readFileSync } from "fs";
import type { Plugin } from "vite";

// Custom plugin to handle app-config.yaml imports
function appConfigPlugin(): Plugin {
  const configPath = resolve(__dirname, "../app-config.yaml");
  const virtualModuleId = "@config?raw";
  const resolvedVirtualModuleId = "\0" + virtualModuleId;

  return {
    name: "app-config",
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        const content = readFileSync(configPath, "utf-8");
        return `export default ${JSON.stringify(content)};`;
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [appConfigPlugin(), react(), tailwindcss()],
  server: {
    proxy: {
      "/api": "http://localhost:3001",
    },
    allowedHosts: true,
  },
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
  },
});
