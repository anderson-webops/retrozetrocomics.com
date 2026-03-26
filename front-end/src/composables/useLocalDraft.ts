import { watchDebounced } from "@vueuse/core";
import { computed, onScopeDispose, ref, watch } from "vue";

interface StoredLocalDraft<T> {
	hasFiles: boolean;
	savedAt: string;
	value: T;
	version: 1;
}

interface UseLocalDraftOptions<T> {
	debounce?: number;
	enabled?: boolean | (() => boolean);
	isEmpty: (snapshot: T) => boolean;
	source: () => T;
	storageKey: string | (() => string);
}

export function useLocalDraft<T>({
	debounce = 700,
	enabled = true,
	isEmpty,
	source,
	storageKey
}: UseLocalDraftOptions<T>) {
	const available = ref(false);
	const hasStoredFiles = ref(false);
	const restorePromptVisible = ref(false);
	const savedAt = ref<string | null>(null);

	const isClient = typeof window !== "undefined";
	const isAutosaveEnabled = computed(() =>
		typeof enabled === "function" ? enabled() : enabled
	);
	const resolvedStorageKey = computed(() =>
		typeof storageKey === "function" ? storageKey() : storageKey
	);

	function readDraft(targetStorageKey = resolvedStorageKey.value) {
		if (!isClient) return null;

		const raw = window.localStorage.getItem(targetStorageKey);
		if (!raw) return null;

		try {
			const parsed = JSON.parse(raw) as StoredLocalDraft<T>;

			if (
				parsed?.version !== 1 ||
				typeof parsed.savedAt !== "string" ||
				typeof parsed.hasFiles !== "boolean" ||
				!parsed.value
			) {
				window.localStorage.removeItem(targetStorageKey);
				return null;
			}

			return parsed;
		} catch {
			window.localStorage.removeItem(targetStorageKey);
			return null;
		}
	}

	function syncFromStorage(targetStorageKey = resolvedStorageKey.value) {
		const stored = readDraft(targetStorageKey);
		available.value = Boolean(stored);
		hasStoredFiles.value = stored?.hasFiles ?? false;
		savedAt.value = stored?.savedAt ?? null;
		return stored;
	}

	function clearDraft(targetStorageKey = resolvedStorageKey.value) {
		if (isClient) window.localStorage.removeItem(targetStorageKey);

		available.value = false;
		hasStoredFiles.value = false;
		restorePromptVisible.value = false;
		savedAt.value = null;
	}

	function saveNow(
		snapshot = source(),
		targetStorageKey = resolvedStorageKey.value
	) {
		if (!isClient) return;

		if (isEmpty(snapshot)) {
			clearDraft(targetStorageKey);
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

		window.localStorage.setItem(targetStorageKey, JSON.stringify(record));
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
		if (!isAutosaveEnabled.value) return;
		saveNow();
	};

	syncFromStorage();
	restorePromptVisible.value = available.value;

	const stopKeyWatch = watch(resolvedStorageKey, () => {
		syncFromStorage();
		restorePromptVisible.value = available.value;
	});

	const stopWatching = watchDebounced(
		source,
		snapshot => {
			if (!isAutosaveEnabled.value) return;
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
		stopKeyWatch();
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
