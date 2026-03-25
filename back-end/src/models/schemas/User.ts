import type { HydratedDocument, InferSchemaType, Model } from "mongoose";
import { randomUUID } from "node:crypto";
import mongoose, { Schema } from "mongoose";

import { passwordPlugin } from "../plugins/password.js";

const userSchema = new Schema(
	{
		name: { type: String, required: true, trim: true },
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
			index: true
		},
		password: { type: String, required: true },
		status: {
			type: String,
			enum: ["active", "suspended"],
			default: "active",
			index: true
		},
		bio: { type: String, default: "" },
		profileHandle: {
			type: String,
			default: () => randomUUID().slice(0, 8),
			index: true
		}
	},
	{ timestamps: true }
);

userSchema.plugin(passwordPlugin);

export type UserDocument = HydratedDocument<InferSchemaType<typeof userSchema>>;
export const User: Model<InferSchemaType<typeof userSchema>> = mongoose.model("User", userSchema);
