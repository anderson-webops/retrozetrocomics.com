import type {
	AboutMilestone,
	AboutPageContent,
	AboutStoryArc
} from "@/types/site";

import { cloneAboutPageContent } from "@/content/defaultAboutPageContent";
import { updateAboutPageContent } from "@/lib/siteApi";
import { useAboutPageContent } from "./useAboutPageContent";

function nextDraftId(prefix: string) {
	return `${prefix}-${Date.now().toString(36)}-${Math.random()
		.toString(36)
		.slice(2, 7)}`;
}

function isBlankStoryArc(arc: AboutStoryArc) {
	return [
		arc.climax,
		arc.description,
		arc.firstPlotPoint,
		arc.hook,
		arc.incitingIncident,
		arc.label,
		arc.midpoint,
		arc.note,
		arc.resolution,
		arc.thirdPlotPoint,
		arc.title
	].every(value => !(value || "").trim());
}

function isBlankMilestone(milestone: AboutMilestone) {
	return [milestone.body, milestone.label, milestone.title].every(
		value => !(value || "").trim()
	);
}

function createStoryArcDraft(): AboutStoryArc {
	return {
		climax: "",
		description: "",
		firstPlotPoint: "",
		hook: "",
		id: nextDraftId("story-arc"),
		incitingIncident: "",
		label: "",
		midpoint: "",
		note: "",
		resolution: "",
		thirdPlotPoint: "",
		title: ""
	};
}

function createMilestoneDraft(): AboutMilestone {
	return {
		body: "",
		id: nextDraftId("milestone"),
		label: "",
		title: ""
	};
}

export function useAboutPageContentEditor() {
	const { apply, content } = useAboutPageContent();
	const saving = ref(false);
	const error = ref("");

	async function persist(mutate: (nextContent: AboutPageContent) => void) {
		saving.value = true;
		error.value = "";

		try {
			const nextContent = cloneAboutPageContent(content.value);
			mutate(nextContent);
			const savedContent = await updateAboutPageContent(nextContent);
			apply(savedContent);
			return savedContent;
		} catch (saveError: any) {
			error.value =
				saveError?.response?.data?.message ||
				saveError?.message ||
				"Unable to save the about page content.";
			throw saveError;
		} finally {
			saving.value = false;
		}
	}

	function addStoryArcDraft() {
		const nextContent = cloneAboutPageContent(content.value);
		const draft = createStoryArcDraft();
		nextContent.storyArcs.unshift(draft);
		apply(nextContent);
		return draft.id;
	}

	function discardStoryArcDraft(arcId: string) {
		if (!arcId.startsWith("story-arc-")) {
			return;
		}

		const target = content.value.storyArcs.find(arc => arc.id === arcId);
		if (!target || !isBlankStoryArc(target)) {
			return;
		}

		const nextContent = cloneAboutPageContent(content.value);
		nextContent.storyArcs = nextContent.storyArcs.filter(
			arc => arc.id !== arcId
		);
		apply(nextContent);
	}

	function saveStoryArc(arc: AboutStoryArc) {
		return persist(nextContent => {
			const index = nextContent.storyArcs.findIndex(
				currentArc => currentArc.id === arc.id
			);
			if (index >= 0) {
				nextContent.storyArcs[index] = arc;
				return;
			}

			nextContent.storyArcs.unshift(arc);
		});
	}

	function removeStoryArc(arcId: string) {
		if (content.value.storyArcs.length <= 1) {
			error.value = "At least one story arc must remain.";
			return Promise.resolve(content.value);
		}

		return persist(nextContent => {
			nextContent.storyArcs = nextContent.storyArcs.filter(
				arc => arc.id !== arcId
			);
		});
	}

	function addMilestoneDraft() {
		const nextContent = cloneAboutPageContent(content.value);
		const draft = createMilestoneDraft();
		nextContent.milestones.unshift(draft);
		apply(nextContent);
		return draft.id;
	}

	function discardMilestoneDraft(milestoneId: string) {
		if (!milestoneId.startsWith("milestone-")) {
			return;
		}

		const target = content.value.milestones.find(
			milestone => milestone.id === milestoneId
		);
		if (!target || !isBlankMilestone(target)) {
			return;
		}

		const nextContent = cloneAboutPageContent(content.value);
		nextContent.milestones = nextContent.milestones.filter(
			milestone => milestone.id !== milestoneId
		);
		apply(nextContent);
	}

	function saveMilestone(milestone: AboutMilestone) {
		return persist(nextContent => {
			const index = nextContent.milestones.findIndex(
				currentMilestone => currentMilestone.id === milestone.id
			);
			if (index >= 0) {
				nextContent.milestones[index] = milestone;
				return;
			}

			nextContent.milestones.unshift(milestone);
		});
	}

	function removeMilestone(milestoneId: string) {
		if (content.value.milestones.length <= 1) {
			error.value = "At least one roadmap step must remain.";
			return Promise.resolve(content.value);
		}

		return persist(nextContent => {
			nextContent.milestones = nextContent.milestones.filter(
				milestone => milestone.id !== milestoneId
			);
		});
	}

	return {
		addMilestoneDraft,
		addStoryArcDraft,
		content,
		discardMilestoneDraft,
		discardStoryArcDraft,
		error,
		removeMilestone,
		removeStoryArc,
		saveMilestone,
		saveStoryArc,
		saving
	};
}
