import type { CharacterBoardWorldEntry } from "@/types/site";

export const featuredWorldEntryIds = ["apex-army", "bitgam", "zlugnoid-hive-wars"] as const;

const worldEntryDisplayOrder = [
	"apex-army",
	"team-rimlaw-star-hunters",
	"zego-order",
	"bitgam",
	"galgri-and-galnoids",
	"council-of-orpex",
	"zlugnoid-hive-wars",
	"linkpods-and-cbots",
	"fz-and-oddverse"
] as const;

const worldEntryRanks = new Map<string, number>(worldEntryDisplayOrder.map((id, index) => [id, index]));

export function orderWorldEntriesForDisplay(entries: CharacterBoardWorldEntry[]) {
	return entries
		.map((entry, sourceIndex) => ({ entry, sourceIndex }))
		.sort((left, right) => {
			const leftRank = worldEntryRanks.get(left.entry.id);
			const rightRank = worldEntryRanks.get(right.entry.id);

			if (leftRank !== undefined && rightRank !== undefined) return leftRank - rightRank;
			if (leftRank !== undefined) return -1;
			if (rightRank !== undefined) return 1;
			return left.sourceIndex - right.sourceIndex;
		})
		.map(({ entry }) => entry);
}
