import { effectScope, nextTick, reactive, ref } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useLocalDraft } from "../src/composables/useLocalDraft";

function createStorageMock() {
	const store = new Map<string, string>();

	return {
		clear() {
			store.clear();
		},
		getItem(key: string) {
			return store.get(key) ?? null;
		},
		key(index: number) {
			return Array.from(store.keys())[index] ?? null;
		},
		get length() {
			return store.size;
		},
		removeItem(key: string) {
			store.delete(key);
		},
		setItem(key: string, value: string) {
			store.set(key, String(value));
		}
	} satisfies Storage;
}

describe("useLocalDraft()", () => {
	let storage: Storage;

	beforeEach(() => {
		storage = createStorageMock();
		Object.defineProperty(window, "localStorage", {
			configurable: true,
			value: storage
		});
		Object.defineProperty(globalThis, "localStorage", {
			configurable: true,
			value: storage
		});
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
		storage.clear();
	});

	it("autosaves a non-empty draft and restores it", async () => {
		let form!: {
			content: string;
			hasFiles: boolean;
			title: string;
		};
		let draft!: ReturnType<typeof useLocalDraft<{
			content: string;
			hasFiles: boolean;
			title: string;
		}>>;

		const scope = effectScope();

		scope.run(() => {
			form = reactive({
				content: "",
				hasFiles: false,
				title: ""
			});

			draft = useLocalDraft({
				isEmpty(snapshot) {
					return !snapshot.title && !snapshot.content && !snapshot.hasFiles;
				},
				source: () => ({
					content: form.content,
					hasFiles: form.hasFiles,
					title: form.title
				}),
				storageKey: "retrozetro:test:drafts:new-post"
			});
		});

		form.title = "Recovered Signal";
		form.content = "Transmission log";
		form.hasFiles = true;

		await nextTick();
		vi.advanceTimersByTime(900);
		await Promise.resolve();

		const raw = storage.getItem("retrozetro:test:drafts:new-post");
		expect(raw).toBeTruthy();

		const restored = draft.restoreDraft();
		expect(restored).toEqual({
			content: "Transmission log",
			hasFiles: true,
			title: "Recovered Signal"
		});
		expect(draft.savedAt.value).toBeTruthy();
		expect(draft.hasStoredFiles.value).toBe(true);

		scope.stop();
	});

	it("clears storage when the snapshot returns to empty", async () => {
		let form!: {
			content: string;
			hasFiles: boolean;
			title: string;
		};

		const scope = effectScope();

		scope.run(() => {
			form = reactive({
				content: "",
				hasFiles: false,
				title: ""
			});

			useLocalDraft({
				isEmpty(snapshot) {
					return !snapshot.title && !snapshot.content && !snapshot.hasFiles;
				},
				source: () => ({
					content: form.content,
					hasFiles: form.hasFiles,
					title: form.title
				}),
				storageKey: "retrozetro:test:drafts:new-post"
			});
		});

		form.title = "Temporary";
		await nextTick();
		vi.advanceTimersByTime(900);
		await Promise.resolve();
		expect(storage.getItem("retrozetro:test:drafts:new-post")).toBeTruthy();

		form.title = "";
		await nextTick();
		vi.advanceTimersByTime(900);
		await Promise.resolve();
		expect(storage.getItem("retrozetro:test:drafts:new-post")).toBeNull();

		scope.stop();
	});

	it("switches draft namespaces without overwriting the stored draft on key change", async () => {
		let draftKey!: { value: string };
		let form!: {
			content: string;
			hasFiles: boolean;
			title: string;
		};
		let autosaveEnabled!: { value: boolean };
		let draft!: ReturnType<typeof useLocalDraft<{
			content: string;
			hasFiles: boolean;
			title: string;
		}>>;

		storage.setItem(
			"retrozetro:test:drafts:edit:post-42",
			JSON.stringify({
				hasFiles: false,
				savedAt: "2026-03-26T12:00:00.000Z",
				value: {
					content: "Recovered edit copy",
					hasFiles: false,
					title: "Recovered Outline"
				},
				version: 1
			})
		);

		const scope = effectScope();

		scope.run(() => {
			form = reactive({
				content: "",
				hasFiles: false,
				title: ""
			});
			draftKey = ref("retrozetro:test:drafts:new-post");
			autosaveEnabled = ref(true);

			draft = useLocalDraft({
				enabled: () => autosaveEnabled.value,
				isEmpty(snapshot) {
					return !snapshot.title && !snapshot.content && !snapshot.hasFiles;
				},
				source: () => ({
					content: form.content,
					hasFiles: form.hasFiles,
					title: form.title
				}),
				storageKey: () => draftKey.value
			});
		});

		form.title = "New Post";
		form.content = "Fresh draft";

		await nextTick();
		vi.advanceTimersByTime(900);
		await Promise.resolve();
		expect(storage.getItem("retrozetro:test:drafts:new-post")).toBeTruthy();

		autosaveEnabled.value = false;
		draftKey.value = "retrozetro:test:drafts:edit:post-42";
		form.title = "Server copy";
		form.content = "Current published version";

		await nextTick();
		vi.advanceTimersByTime(900);
		await Promise.resolve();

		expect(draft.restorePromptVisible.value).toBe(true);

		const restored = draft.restoreDraft();
		expect(restored).toEqual({
			content: "Recovered edit copy",
			hasFiles: false,
			title: "Recovered Outline"
		});

		scope.stop();
	});
});
