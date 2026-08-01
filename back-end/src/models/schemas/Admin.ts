import type { HydratedDocument, InferSchemaType, Model } from "mongoose";
import mongoose, { Schema } from "mongoose";

import { passwordPlugin } from "../plugins/password.js";

const adminSchema = new Schema(
	{
		name: { type: String, required: true, trim: true },
		email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
		password: { type: String, required: true },
		passwordChangedAt: { type: Date, default: null },
		role: {
			type: String,
			enum: ["admin"],
			default: "admin",
			immutable: true,
			required: true
		},
		sessionVersion: {
			type: Number,
			default: 0,
			min: 0,
			required: true
		},
		status: {
			type: String,
			enum: ["active", "disabled"],
			default: "active",
			required: true,
			index: true
		}
	},
	{ timestamps: true }
);

adminSchema.plugin(passwordPlugin);

export type AdminDocument = HydratedDocument<InferSchemaType<typeof adminSchema>>;
export const Admin: Model<InferSchemaType<typeof adminSchema>> = mongoose.model("Admin", adminSchema);
