import type { HydratedDocument, InferSchemaType, Model } from "mongoose";
import { randomUUID } from "node:crypto";
import mongoose, { Schema } from "mongoose";

const mediaAssetSchema = new Schema(
	{
		id: { type: String, default: () => randomUUID() },
		provider: { type: String, default: "local" },
		kind: { type: String, enum: ["image", "document"], required: true },
		originalName: { type: String, required: true },
		mimeType: { type: String, required: true },
		size: { type: Number, required: true },
		storageKey: { type: String, required: true },
		url: { type: String, required: true }
	},
	{ _id: false }
);

const postSchema = new Schema(
	{
		title: { type: String, required: true, trim: true },
		slug: { type: String, required: true, unique: true, index: true },
		type: {
			type: String,
			enum: ["comic", "storyboard", "photo", "outline"],
			required: true,
			index: true
		},
		status: {
			type: String,
			enum: ["draft", "private", "published"],
			default: "published",
			index: true
		},
		summary: { type: String, required: true, trim: true },
		content: { type: String, required: true },
		allowComments: { type: Boolean, default: true },
		tags: { type: [String], default: [] },
		media: { type: [mediaAssetSchema], default: [] },
		createdBy: {
			type: Schema.Types.ObjectId,
			ref: "Admin",
			required: true,
			index: true
		},
		deletedAt: { type: Date, default: null },
		deletedBy: {
			type: Schema.Types.ObjectId,
			ref: "Admin",
			default: null
		},
		isDeleted: { type: Boolean, default: false, index: true },
		publishedAt: { type: Date, default: null }
	},
	{ timestamps: true }
);

export type MediaAsset = InferSchemaType<typeof mediaAssetSchema>;
export type PostDocument = HydratedDocument<InferSchemaType<typeof postSchema>>;
export const Post: Model<InferSchemaType<typeof postSchema>> = mongoose.model("Post", postSchema);
