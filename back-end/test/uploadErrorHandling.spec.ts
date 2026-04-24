import type { AddressInfo } from "node:net";

import { once } from "node:events";
import express from "express";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SAFE_UPLOAD_FAILURE_MESSAGE } from "../src/errors/appError.js";

async function startUploadTestApp() {
	const { errorHandler } = await import("../src/middleware/errorHandler.js");
	const { postUpload } = await import("../src/services/storage.js");

	const app = express();
	app.post("/upload", postUpload.array("media", 8), (_req, res) => {
		res.status(201).json({ ok: true });
	});
	app.use(errorHandler);

	const server = app.listen(0);
	await once(server, "listening");

	return {
		server,
		url: `http://127.0.0.1:${(server.address() as AddressInfo).port}/upload`
	};
}

describe("upload error handling", () => {
	afterEach(() => {
		vi.resetModules();
		vi.restoreAllMocks();
		vi.doUnmock("node:fs");
	});

	it("sanitizes storage permission failures before returning JSON", async () => {
		vi.doMock("node:fs", async () => {
			const actual = await vi.importActual<typeof import("node:fs")>("node:fs");

			return {
				...actual,
				mkdirSync: vi.fn((target: import("node:fs").PathLike, options?: import("node:fs").MakeDirectoryOptions) => {
					const normalizedTarget = String(target).replace(/\\/g, "/");
					if (normalizedTarget.includes("/uploads/content/")) {
						const error = new Error(
							"EACCES: permission denied, mkdir '/srv/retrozetrocomics.com/back-end/uploads/content/2026-04'"
						) as NodeJS.ErrnoException;
						error.code = "EACCES";
						throw error;
					}

					return actual.mkdirSync(target, options);
				})
			};
		});

		const { server, url } = await startUploadTestApp();

		try {
			const formData = new FormData();
			formData.set(
				"media",
				new Blob(["retrozetro"], { type: "image/png" }),
				"retrozetro.png"
			);

			const response = await fetch(url, {
				method: "POST",
				body: formData
			});
			const payload = await response.json() as { message: string };

			expect(response.status).toBe(503);
			expect(payload).toEqual({
				message: SAFE_UPLOAD_FAILURE_MESSAGE
			});
			expect(JSON.stringify(payload)).not.toContain("/srv/");
			expect(JSON.stringify(payload)).not.toContain("/back-end/uploads");
		}
		finally {
			server.close();
			await once(server, "close");
		}
	});
});
