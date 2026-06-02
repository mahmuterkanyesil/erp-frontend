import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@erp/ui": path.resolve(__dirname, "../../packages/ui/src/index.ts"),
      "@erp/api-client": path.resolve(__dirname, "../../packages/api-client/src/index.ts"),
      "@erp/hooks": path.resolve(__dirname, "../../packages/hooks/src/index.ts"),
      "@erp/utils": path.resolve(__dirname, "../../packages/utils/src/index.ts"),
      "@erp/i18n": path.resolve(__dirname, "../../packages/i18n/src/index.ts"),
    },
  },
  server: {
    port: 3001,
    proxy: {
      "/api/v1": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
})
