import { effectScope, nextTick, reactive } from "vue";
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
});
