// vite.config.ts
import { defineConfig } from "file:///C:/Users/Clemente/Desktop/U/smart-wardrobe/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Clemente/Desktop/U/smart-wardrobe/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path from "path";
var __vite_injected_original_dirname = "C:\\Users\\Clemente\\Desktop\\U\\smart-wardrobe";
var vite_config_default = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  server: {
    host: true,
    // Permite conexiones externas
    port: 5173,
    // Puerto por defecto de Vite
    allowedHosts: [
      ".ngrok-free.app",
      // Permite todos los subdominios de ngrok
      ".ngrok.io",
      // Permite subdominios de ngrok.io también
      "3136d6d219ee.ngrok-free.app",
      // Tu URL específica de ngrok
      "localhost",
      "127.0.0.1"
    ]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxDbGVtZW50ZVxcXFxEZXNrdG9wXFxcXFVcXFxcc21hcnQtd2FyZHJvYmVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXENsZW1lbnRlXFxcXERlc2t0b3BcXFxcVVxcXFxzbWFydC13YXJkcm9iZVxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvQ2xlbWVudGUvRGVza3RvcC9VL3NtYXJ0LXdhcmRyb2JlL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xyXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBwbHVnaW5zOiBbcmVhY3QoKV0sXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgc2VydmVyOiB7XHJcbiAgICBob3N0OiB0cnVlLCAvLyBQZXJtaXRlIGNvbmV4aW9uZXMgZXh0ZXJuYXNcclxuICAgIHBvcnQ6IDUxNzMsIC8vIFB1ZXJ0byBwb3IgZGVmZWN0byBkZSBWaXRlXHJcbiAgICBhbGxvd2VkSG9zdHM6IFtcclxuICAgICAgJy5uZ3Jvay1mcmVlLmFwcCcsIC8vIFBlcm1pdGUgdG9kb3MgbG9zIHN1YmRvbWluaW9zIGRlIG5ncm9rXHJcbiAgICAgICcubmdyb2suaW8nLCAgICAgICAvLyBQZXJtaXRlIHN1YmRvbWluaW9zIGRlIG5ncm9rLmlvIHRhbWJpXHUwMEU5blxyXG4gICAgICAnMzEzNmQ2ZDIxOWVlLm5ncm9rLWZyZWUuYXBwJywgLy8gVHUgVVJMIGVzcGVjXHUwMEVEZmljYSBkZSBuZ3Jva1xyXG4gICAgICAnbG9jYWxob3N0JyxcclxuICAgICAgJzEyNy4wLjAuMSdcclxuICAgIF1cclxuICB9XHJcbn0pXHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNFQsU0FBUyxvQkFBb0I7QUFDelYsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUZqQixJQUFNLG1DQUFtQztBQUt6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUEsRUFDakIsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBO0FBQUEsSUFDTixNQUFNO0FBQUE7QUFBQSxJQUNOLGNBQWM7QUFBQSxNQUNaO0FBQUE7QUFBQSxNQUNBO0FBQUE7QUFBQSxNQUNBO0FBQUE7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
