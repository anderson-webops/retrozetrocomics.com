// src/api.ts
import axios from "axios";
import { resolveClientApiBaseUrl, resolveSsgApiBaseUrl } from "@/lib/apiBase";

const apiBaseUrl = import.meta.env.SSR
	? resolveSsgApiBaseUrl(import.meta.env)
	: resolveClientApiBaseUrl(import.meta.env);

export const api = axios.create({
	baseURL: apiBaseUrl,
	withCredentials: true
});
