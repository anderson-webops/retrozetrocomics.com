import type { HydratedDocument, InferSchemaType, Model } from "mongoose";
import mongoose, { Schema } from "mongoose";

const siteContentRevisionSchema = new Schema(
	{
		actorId: { type: String, default: "", trim: true },
		actorName: { type: String, default: "", trim: true },
		data: { type: Schema.Types.Mixed, required: true },
		key: { type: String, required: true, index: true, trim: true },
		reason: {
			type: String,
			enum: ["direct-publish", "draft-publish", "revision-restore"],
			required: true
		},
		version: { type: Number, min: 1, required: true }
	},
	{
		timestamps: {
			createdAt: true,
			updatedAt: false
		}
	}
);

siteContentRevisionSchema.index({ key: 1, createdAt: -1 });
siteContentRevisionSchema.index({ key: 1, version: -1 });

export type SiteContentRevisionDocument = HydratedDocument<
	InferSchemaType<typeof siteContentRevisionSchema>
>;
export const SiteContentRevision: Model<InferSchemaType<typeof siteContentRevisionSchema>>
	= mongoose.model("SiteContentRevision", siteContentRevisionSchema);
