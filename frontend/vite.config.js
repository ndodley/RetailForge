import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173, // Define port manually (default Vite picks a free one)
    },
    resolve: {
        alias: {
            "@components": "/src/components", // Example alias to shorten import paths
            "@pages": "/src/pages",
        },
    },
});
