import type { Admin, Tutor, User } from "@/stores/app";
// src/composables/useEditable.ts
import { api } from "@/api";
import { useAppStore } from "@/stores/app";

type Role = "user" | "tutor" | "admin";

interface EntityByRole {
	user: User;
	tutor: Tutor;
	admin: Admin;
}

export function useEditable<R extends Role>(role: R) {
	const app = useAppStore();

	async function save(entity: EntityByRole[R]) {
		if (role === "user") {
			const previousEmail = app.currentUser?.email;
			const payload = { ...(entity as User) };

			if (previousEmail && payload.email !== previousEmail) {
				await api.post(`/accounts/changeEmail/${payload._id}`, {
					email: payload.email
				});
			}

			await api.put(`/users/user/${payload._id}`, payload);
			app.setCurrentUser(payload);
			return;
		}

		if (role === "tutor") {
			const payload = { ...(entity as Tutor) };

			await api.put(`/tutors/${payload._id}`, payload);
			app.setCurrentTutor(payload);
			return;
		}

		const payload = { ...(entity as Admin) };
		await api.put(`/admins/${payload._id}`, payload);
		app.setCurrentAdmin(payload);
	}

	return { save };
}
