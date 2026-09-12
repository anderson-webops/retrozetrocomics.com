import type { ReadingPlace } from "@/lib/readerDiscovery";
import { onMounted, onUnmounted, ref } from "vue";
import { parseReadingPlace, readingPlaceKey } from "@/lib/readerDiscovery";

const changeEvent = "retrozetro-reading-place-changed";
export function useReadingPlace() {
	const place = ref<ReadingPlace | null>(null);
	const error = ref("");
	const ready = ref(false);
	function read() {
		try {
			place.value = parseReadingPlace(localStorage.getItem(readingPlaceKey));
		} catch {
			place.value = null;
		}
	}
	function save(storyId: string, sectionId: string) {
		try {
			localStorage.setItem(readingPlaceKey, JSON.stringify({ version: 1, storyId, sectionId }));
			error.value = "";
			window.dispatchEvent(new Event(changeEvent));
		} catch {
			error.value = "Your browser could not save this place. You can bookmark the section link instead.";
		}
	}
	function clear() {
		try {
			localStorage.removeItem(readingPlaceKey);
			error.value = "";
			window.dispatchEvent(new Event(changeEvent));
		} catch {
			error.value =
				"Your browser could not remove the saved place. You can clear this site's storage in browser settings.";
		}
	}
	onMounted(() => {
		read();
		ready.value = true;
		window.addEventListener("storage", read);
		window.addEventListener(changeEvent, read);
	});
	onUnmounted(() => {
		window.removeEventListener("storage", read);
		window.removeEventListener(changeEvent, read);
	});
	return { place, error, ready, save, clear };
}
