import type { HydratedDocument, InferSchemaType, Model } from "mongoose";
import mongoose, { Schema } from "mongoose";

const mediaAssetSchema = new Schema(
	{
		altText: { type: String, default: "", maxlength: 180, trim: true },
		deletedAt: { type: Date, default: null, index: true },
		deletedById: { type: String, default: "", trim: true },
		deletedByName: { type: String, default: "", trim: true },
		kind: { type: String, enum: ["document", "image"], required: true },
		mimeType: { type: String, required: true, trim: true },
		originalName: { type: String, required: true, maxlength: 255, trim: true },
		provider: { type: String, enum: ["local", "s3"], required: true },
		purpose: {
			type: String,
			enum: ["character", "comic", "other", "picture", "storyboard"],
			default: "picture",
			required: true
		},
		restoredAt: { type: Date, default: null },
		restoredById: { type: String, default: "", trim: true },
		restoredByName: { type: String, default: "", trim: true },
		size: { type: Number, min: 0, required: true },
		storageKey: { type: String, required: true, unique: true, trim: true },
		title: { type: String, required: true, maxlength: 120, trim: true },
		uploadedById: { type: String, default: "", trim: true },
		uploadedByName: { type: String, default: "", trim: true },
		url: { type: String, default: "", trim: true }
	},
	{ timestamps: true }
);

mediaAssetSchema.index({ deletedAt: 1, createdAt: -1 });
mediaAssetSchema.index({ purpose: 1, createdAt: -1 });

export type MediaAssetDocument = HydratedDocument<InferSchemaType<typeof mediaAssetSchema>>;
export const MediaAsset: Model<InferSchemaType<typeof mediaAssetSchema>>
	= mongoose.model("MediaAsset", mediaAssetSchema);
