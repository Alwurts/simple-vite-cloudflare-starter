import { hc } from "hono/client";
import type { AppType } from "../api";

const API_HOST = import.meta.env.VITE_API_HOST || "http://localhost:5173";

export const client = hc<AppType>(API_HOST);
