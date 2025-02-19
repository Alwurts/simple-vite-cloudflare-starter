import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import path from "node:path";
import rawPlugin from "vite-raw-plugin";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		cloudflare(),
		rawPlugin({
			fileRegex: /\.sql$/,
		}),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
