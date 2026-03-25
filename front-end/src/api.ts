// src/api.ts
import axios from "axios";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "/api").replace(
	/\/$/,
	""
);

export const api = axios.create({
	baseURL: apiBaseUrl,
	withCredentials: true
});
