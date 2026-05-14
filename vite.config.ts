import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  server: {
    port: 5173,
    host: true, // Allow access from any host (localhost, admin.localhost, ceo.localhost, etc.)
    hmr: {
      host: "localhost",
      port: 5173,
    },
  },
})
