import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // Base absoluta del sitio en GitHub Pages (subcarpeta del repositorio).
  // Si cambias el nombre del repositorio, actualiza esta ruta también.
  base: "/Trabajo-de-don-Oscar/",
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    hmr: {
      port: 3000,
    },
  },
});
