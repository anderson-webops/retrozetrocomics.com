import { watchDebounced } from "@vueuse/core";
import { onScopeDispose, ref } from "vue";

interface StoredLocalDraft<T> {
	hasFiles: boolean;
	savedAt: string;
	value: T;
	version: 1;
}

interface UseLocalDraftOptions<T> {
	debounce?: number;
	isEmpty: (snapshot: T) => boolean;
	source: () => T;
	storageKey: string;
}

export function useLocalDraft<T>({
	debounce = 700,
	isEmpty,
	source,
	storageKey
}: UseLocalDraftOptions<T>) {
	const available = ref(false);
	const hasStoredFiles = ref(false);
	const restorePromptVisible = ref(false);
	const savedAt = ref<string | null>(null);

	const isClient = typeof window !== "undefined";

	function readDraft() {
		if (!isClient) return null;

		const raw = window.localStorage.getItem(storageKey);
		if (!raw) return null;

		try {
			const parsed = JSON.parse(raw) as StoredLocalDraft<T>;

			if (
				parsed?.version !== 1 ||
				typeof parsed.savedAt !== "string" ||
				typeof parsed.hasFiles !== "boolean" ||
				!parsed.value
			) {
				window.localStorage.removeItem(storageKey);
				return null;
			}

			return parsed;
		} catch {
			window.localStorage.removeItem(storageKey);
			return null;
		}
	}

	function syncFromStorage() {
		const stored = readDraft();
		available.value = Boolean(stored);
		hasStoredFiles.value = stored?.hasFiles ?? false;
		savedAt.value = stored?.savedAt ?? null;
		return stored;
	}

	function clearDraft() {
		if (isClient) window.localStorage.removeItem(storageKey);

		available.value = false;
		hasStoredFiles.value = false;
		restorePromptVisible.value = false;
		savedAt.value = null;
	}

	function saveNow(snapshot = source()) {
		if (!isClient) return;

		if (isEmpty(snapshot)) {
			clearDraft();
			return;
		}

		const draftSnapshot = snapshot as { hasFiles?: boolean };

		const record: StoredLocalDraft<T> = {
			hasFiles:
				typeof draftSnapshot.hasFiles === "boolean"
					? Boolean(draftSnapshot.hasFiles)
					: false,
			savedAt: new Date().toISOString(),
			value: snapshot,
			version: 1
		};

		window.localStorage.setItem(storageKey, JSON.stringify(record));
		available.value = true;
		hasStoredFiles.value = record.hasFiles;
		restorePromptVisible.value = false;
		savedAt.value = record.savedAt;
	}

	function restoreDraft() {
		const stored = syncFromStorage();
		restorePromptVisible.value = false;
		return stored?.value ?? null;
	}

	function discardStoredDraft() {
		clearDraft();
	}

	const flushDraft = () => {
		saveNow();
	};

	syncFromStorage();
	restorePromptVisible.value = available.value;

	const stopWatching = watchDebounced(
		source,
		snapshot => {
			saveNow(snapshot);
		},
		{
			debounce,
			deep: true,
			maxWait: Math.max(debounce * 2, 1800)
		}
	);

	if (isClient) {
		const handleVisibilityChange = () => {
			if (document.visibilityState === "hidden") flushDraft();
		};

		window.addEventListener("beforeunload", flushDraft);
		window.addEventListener("pagehide", flushDraft);
		document.addEventListener("visibilitychange", handleVisibilityChange);

		onScopeDispose(() => {
			window.removeEventListener("beforeunload", flushDraft);
			window.removeEventListener("pagehide", flushDraft);
			document.removeEventListener(
				"visibilitychange",
				handleVisibilityChange
			);
		});
	}

	onScopeDispose(() => {
		stopWatching();
	});

	return {
		available,
		clearDraft,
		discardStoredDraft,
		hasStoredFiles,
		restoreDraft,
		restorePromptVisible,
		savedAt,
		saveNow
	};
}
