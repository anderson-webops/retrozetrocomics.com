import type { HydratedDocument, InferSchemaType, Model } from "mongoose";
import mongoose, { Schema } from "mongoose";

import { passwordPlugin } from "../plugins/password.js";

const adminPasskeySchema = new Schema(
	{
		backedUp: { type: Boolean, default: false, required: true },
		counter: { type: Number, default: 0, min: 0, required: true },
		createdAt: { type: Date, default: Date.now, required: true },
		credentialId: { type: String, required: true, trim: true },
		deviceType: {
			type: String,
			enum: ["multiDevice", "singleDevice"],
			required: true
		},
		lastUsedAt: { type: Date, default: null },
		publicKey: { type: Buffer, required: true },
		transports: [{ type: String, trim: true }]
	},
	{ _id: false }
);

const recoveryCodeSchema = new Schema(
	{
		createdAt: { type: Date, default: Date.now, required: true },
		hash: { type: String, required: true },
		id: { type: String, required: true, trim: true },
		usedAt: { type: Date, default: null }
	},
	{ _id: false }
);

const adminSchema = new Schema(
	{
		name: { type: String, required: true, trim: true },
		email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
		password: { type: String, required: true },
		passwordChangedAt: { type: Date, default: null },
		mfaEnrolledAt: { type: Date, default: null },
		passkeys: { type: [adminPasskeySchema], default: [] },
		recoveryCodes: { type: [recoveryCodeSchema], default: [], select: false },
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
