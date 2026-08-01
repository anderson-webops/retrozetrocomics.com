// src/models/plugins/password.ts
import type { Document, HydratedDocument, Schema } from "mongoose";
import argon2 from "argon2";

export const ARGON2_OPTIONS = {
	hashLength: 32,
	memoryCost: 65_536,
	parallelism: 1,
	timeCost: 3,
	type: argon2.argon2id
} as const;

interface PasswordDocument extends Document {
	password: string;
	passwordChangedAt?: Date | null;
	sessionVersion?: number;
}

export function passwordPlugin<T extends PasswordDocument>(
	schema: Schema<T>
) {
	schema.pre("save", async function (this: HydratedDocument<T>) {
		if (!this.isModified("password")) {
			return;
		}

		this.password = await argon2.hash(this.password, ARGON2_OPTIONS);
		this.set("passwordChangedAt", new Date());
		this.set("sessionVersion", Number(this.get("sessionVersion") || 0) + 1);
	});

	schema.methods.comparePassword = function (pw: string) {
		return argon2.verify(this.password, pw);
	};

	schema.methods.passwordNeedsRehash = function () {
		return argon2.needsRehash(this.password, ARGON2_OPTIONS);
	};

	schema.methods.toJSON = function () {
		const obj = this.toObject();
		delete obj.password;
		return obj;
	};
}
