import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";

import TheCharacters from "../src/components/TheCharacters.vue";
import { useSessionStore } from "../src/stores/session";

const character = {
	description: "Zetro is brave, stubborn, and quick to step into danger.",
	fallbackImage: "/fallback.png",
	frequency: "Hope under pressure",
	id: "zetro",
	image: "/zetro.png",
	imgAlt: "Zetro in orange armor",
	name: "Zetro",
	role: "Lead hero",
	specialty: "Frontline improvisation"
};

describe("inline character editor safety", () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		const session = useSessionStore();
		session.account = {
			email: "owner@example.com",
			id: "owner",
			name: "Owner",
			role: "admin",
			status: "active"
		};
	});

	it("keeps entered text visible after a failed save", async () => {
		const wrapper = mount(TheCharacters, {
			props: {
				inlineEditing: true,
				items: [character]
			},
			global: {
				stubs: {
					AdminConfirmDialog: true,
					ResolvedImage: true,
					teleport: true
				}
			}
		});

		await wrapper.get(".characters-grid__edit").trigger("click");
		const name = wrapper.get('input[type="text"]');
		await name.setValue("Zetro Revised");
		await wrapper.get("form").trigger("submit.prevent");
		await wrapper.setProps({ savingId: "zetro" });
		await wrapper.setProps({ saveError: "The server could not save this.", savingId: "" });

		expect(wrapper.find("form").exists()).toBe(true);
		expect((wrapper.get('input[type="text"]').element as HTMLInputElement).value).toBe("Zetro Revised");
		expect(wrapper.text()).toContain("Your edits are still here");
	});

	it("names the edit action for the exact character", () => {
		const wrapper = mount(TheCharacters, {
			props: { inlineEditing: true, items: [character] },
			global: { stubs: { ResolvedImage: true } }
		});

		expect(wrapper.get(".characters-grid__edit").attributes("aria-label")).toBe("Edit Zetro");
		expect(wrapper.get(".characters-grid__edit").text()).toBe("Edit Zetro");
	});
});
