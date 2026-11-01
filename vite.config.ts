import { defineConfig, type ProxyOptions } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

const apiProxy: Record<string, string | ProxyOptions> = {
  "/api": {
    target: "http://localhost:8000",
    configure: (proxy) => {
      proxy.on("proxyReq", (proxyReq) => proxyReq.removeHeader("origin"));
    },
  },
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: { proxy: apiProxy },
  preview: { proxy: apiProxy },
});
