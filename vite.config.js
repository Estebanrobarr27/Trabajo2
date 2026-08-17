import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  // viteSingleFile incrusta TODO el JavaScript y el CSS dentro de index.html:
  // el resultado es un único archivo autocontenido que funciona con DOBLE CLIC
  // (sin servidor) y también publicado en GitHub Pages con cualquier nombre
  // de repositorio (ya no depende de rutas ni de archivos externos).
  base: "./",
  plugins: [react(), tailwindcss(), viteSingleFile()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    hmr: {
      port: 3000,
    },
  },
});
