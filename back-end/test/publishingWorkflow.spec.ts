import type { Request, Response } from "express";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
	publishSiteContentDraft,
	restoreSiteContentRevision,
	saveSiteContentDraft
} from "../src/controllers/siteContentController.js";
import { SiteContent } from "../src/models/schemas/SiteContent.js";
import { SiteContentRevision } from "../src/models/schemas/SiteContentRevision.js";
import { createDefaultSiteContent } from "../src/services/siteContent.js";

vi.mock("../src/services/auditLog.js", () => ({ recordAuditLog: vi.fn().mockResolvedValue(undefined) }));
afterEach(() => vi.restoreAllMocks());
function request(body: unknown, revisionId?: string) {
	return {
		authAccount: { id: "owner", name: "Owner", role: "admin" },
		body,
		params: { page: "about", revisionId }
	} as unknown as Request;
}
function response() {
	const res = { json: vi.fn(), status: vi.fn() };
	res.status.mockReturnValue(res);
	return res as unknown as Response & { json: ReturnType<typeof vi.fn>; status: ReturnType<typeof vi.fn> };
}

describe("isolated draft and publish workflow", () => {
	it("saves privately, publishes a validated chapter, and restores a prior version only to draft", async () => {
		let document: any = null;
		const history: any[] = [];
		vi.spyOn(SiteContent, "findOne").mockImplementation(async () => structuredClone(document) as never);
		vi.spyOn(SiteContent, "findOneAndUpdate").mockImplementation(async (_filter: any, update: any) => {
			if (!document) document = { ...update.$setOnInsert, editVersion: 0 };
			Object.assign(document, update.$set);
			document.editVersion += update.$inc.editVersion;
			return structuredClone(document) as never;
		});
		vi.spyOn(SiteContentRevision, "create").mockImplementation(async (value: any) => {
			const revision = { ...structuredClone(value), _id: "507f1f77bcf86cd799439011" };
			history.push(revision);
			return revision;
		});
		const original = createDefaultSiteContent("about");
		const draft = structuredClone(original);
		(draft.storyArcs as any[])[0].readingSections = [
			{ id: "opening", image: "", heading: "The opening", text: "A privately revised story passage." }
		];
		await saveSiteContentDraft(request({ content: draft, expectedVersion: 0 }), response());
		expect(document.data).toEqual(original);
		expect(document.draftData).toEqual(draft);
		expect(history).toHaveLength(0);
		await expect(
			saveSiteContentDraft(request({ content: original, expectedVersion: 0 }), response())
		).rejects.toMatchObject({ statusCode: 409 });
		await publishSiteContentDraft(request({ expectedVersion: 1 }), response());
		expect(document.data.storyArcs[0].readingSections[0].text).toBe("A privately revised story passage.");
		expect(document.draftData).toBeNull();
		expect(history[0].data).toEqual(original);
		vi.spyOn(SiteContentRevision, "findOne").mockResolvedValue(history[0]);
		const publicVersion = structuredClone(document.data);
		await restoreSiteContentRevision(request({}, history[0]._id), response());
		expect(document.data).toEqual(publicVersion);
		expect(document.draftData).toEqual(original);
	});
	it("does not publish an incomplete draft or a draft changed since preview", async () => {
		const draft = createDefaultSiteContent("about");
		(draft.storyArcs as any[])[0].readingSections = [{ id: "opening", heading: "", text: "" }];
		vi.spyOn(SiteContent, "findOne").mockResolvedValue({
			data: createDefaultSiteContent("about"),
			draftData: draft,
			editVersion: 3
		} as never);
		const writes = vi.spyOn(SiteContent, "findOneAndUpdate");
		await expect(publishSiteContentDraft(request({ expectedVersion: 2 }), response())).rejects.toMatchObject({
			statusCode: 409
		});
		const res = response();
		await publishSiteContentDraft(request({ expectedVersion: 3 }), res);
		expect(res.status).toHaveBeenCalledWith(400);
		expect(writes).not.toHaveBeenCalled();
	});
	it("rejects a competing publication and removes only its unused recovery revision", async () => {
		const published = createDefaultSiteContent("about");
		vi.spyOn(SiteContent, "findOne").mockResolvedValue({
			data: published,
			draftData: published,
			editVersion: 4
		} as never);
		const update = vi.spyOn(SiteContent, "findOneAndUpdate").mockResolvedValue(null);
		vi.spyOn(SiteContentRevision, "create").mockResolvedValue({ _id: "unused-revision" } as never);
		const cleanup = vi
			.spyOn(SiteContentRevision, "deleteOne")
			.mockResolvedValue({ acknowledged: true, deletedCount: 1 } as never);
		await expect(publishSiteContentDraft(request({ expectedVersion: 4 }), response())).rejects.toMatchObject({
			statusCode: 409
		});
		expect(update).toHaveBeenCalledWith(
			{ key: "about-page", editVersion: 4 },
			expect.anything(),
			expect.objectContaining({ upsert: false })
		);
		expect(cleanup).toHaveBeenCalledWith({ _id: "unused-revision" });
	});
});
