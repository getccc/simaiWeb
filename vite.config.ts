import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    cors: true, // 启用 CORS
    proxy: {
      "/api": {
        target: "http://0.0.0.0:8000/",
        changeOrigin: true, // 修改请求头中的源
        rewrite: (path) => path.replace(/^\/api/, ""), // 可选的路径重写
      },
    },
  },
});
