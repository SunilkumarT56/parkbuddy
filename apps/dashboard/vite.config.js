import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// http://vitejs.dev/config/

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3008",
        changeOrigin: true,
      },
    },
  },
});
