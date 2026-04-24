import type {
	CharacterBoardProfile,
	CharacterBoardWorldEntry,
	CharactersPageContent
} from "@/types/site";

import { cloneCharactersPageContent } from "@/content/defaultCharactersPageContent";
import { updateCharactersPageContent } from "@/lib/siteApi";
import { useCharactersPageContent } from "./useCharactersPageContent";

function nextDraftId(prefix: string) {
	return `${prefix}-${Date.now().toString(36)}-${Math.random()
		.toString(36)
		.slice(2, 7)}`;
}

function isBlankCharacter(character: CharacterBoardProfile) {
	return [
		character.description,
		character.fallbackImage,
		character.frequency,
		character.image,
		character.imgAlt,
		character.name,
		character.role,
		character.specialty
	].every(value => !(value || "").trim());
}

function isBlankWorldEntry(entry: CharacterBoardWorldEntry) {
	return (
		[entry.body, entry.label, entry.title].every(
			value => !(value || "").trim()
		) &&
		(entry.facts || []).every(
			fact => !(fact.label || "").trim() && !(fact.value || "").trim()
		)
	);
}

function createCharacterDraft(): CharacterBoardProfile {
	return {
		description: "",
		fallbackImage: "",
		frequency: "",
		id: nextDraftId("character"),
		image: "",
		imgAlt: "",
		name: "",
		role: "",
		specialty: ""
	};
}

function createWorldEntryDraft(): CharacterBoardWorldEntry {
	return {
		body: "",
		facts: [{ label: "", value: "" }],
		id: nextDraftId("world"),
		label: "",
		title: ""
	};
}

export function useCharactersPageContentEditor() {
	const { apply, content } = useCharactersPageContent();
	const saving = ref(false);
	const error = ref("");

	async function persist(
		mutate: (nextContent: CharactersPageContent) => void
	) {
		saving.value = true;
		error.value = "";

		try {
			const nextContent = cloneCharactersPageContent(content.value);
			mutate(nextContent);
			const savedContent = await updateCharactersPageContent(nextContent);
			apply(savedContent);
			return savedContent;
		} catch (saveError: any) {
			error.value =
				saveError?.response?.data?.message ||
				saveError?.message ||
				"Unable to save the character board.";
			throw saveError;
		} finally {
			saving.value = false;
		}
	}

	function addCharacterDraft() {
		const nextContent = cloneCharactersPageContent(content.value);
		const draft = createCharacterDraft();
		nextContent.characters.unshift(draft);
		apply(nextContent);
		return draft.id;
	}

	function discardCharacterDraft(characterId: string) {
		if (!characterId.startsWith("character-")) {
			return;
		}

		const target = content.value.characters.find(
			character => character.id === characterId
		);
		if (!target || !isBlankCharacter(target)) {
			return;
		}

		const nextContent = cloneCharactersPageContent(content.value);
		nextContent.characters = nextContent.characters.filter(
			character => character.id !== characterId
		);
		apply(nextContent);
	}

	function saveCharacter(character: CharacterBoardProfile) {
		return persist(nextContent => {
			const index = nextContent.characters.findIndex(
				entry => entry.id === character.id
			);
			if (index >= 0) {
				nextContent.characters[index] = character;
				return;
			}

			nextContent.characters.unshift(character);
		});
	}

	function removeCharacter(characterId: string) {
		if (content.value.characters.length <= 1) {
			error.value = "At least one character card must remain.";
			return Promise.resolve(content.value);
		}

		return persist(nextContent => {
			nextContent.characters = nextContent.characters.filter(
				character => character.id !== characterId
			);
		});
	}

	function addWorldEntryDraft() {
		const nextContent = cloneCharactersPageContent(content.value);
		const draft = createWorldEntryDraft();
		nextContent.worldEntries.unshift(draft);
		apply(nextContent);
		return draft.id;
	}

	function discardWorldEntryDraft(entryId: string) {
		if (!entryId.startsWith("world-")) {
			return;
		}

		const target = content.value.worldEntries.find(
			entry => entry.id === entryId
		);
		if (!target || !isBlankWorldEntry(target)) {
			return;
		}

		const nextContent = cloneCharactersPageContent(content.value);
		nextContent.worldEntries = nextContent.worldEntries.filter(
			entry => entry.id !== entryId
		);
		apply(nextContent);
	}

	function saveWorldEntry(entry: CharacterBoardWorldEntry) {
		return persist(nextContent => {
			const index = nextContent.worldEntries.findIndex(
				currentEntry => currentEntry.id === entry.id
			);
			if (index >= 0) {
				nextContent.worldEntries[index] = entry;
				return;
			}

			nextContent.worldEntries.unshift(entry);
		});
	}

	function removeWorldEntry(entryId: string) {
		if (content.value.worldEntries.length <= 1) {
			error.value = "At least one world note must remain.";
			return Promise.resolve(content.value);
		}

		return persist(nextContent => {
			nextContent.worldEntries = nextContent.worldEntries.filter(
				entry => entry.id !== entryId
			);
		});
	}

	return {
		addCharacterDraft,
		addWorldEntryDraft,
		content,
		discardCharacterDraft,
		discardWorldEntryDraft,
		error,
		removeCharacter,
		removeWorldEntry,
		saveCharacter,
		saveWorldEntry,
		saving
	};
}
