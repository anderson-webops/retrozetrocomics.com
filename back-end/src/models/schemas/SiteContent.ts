import type { HydratedDocument, InferSchemaType, Model } from "mongoose";
import mongoose, { Schema } from "mongoose";

const siteContentSchema = new Schema(
	{
		key: { type: String, required: true, unique: true, index: true },
		data: { type: Schema.Types.Mixed, required: true }
	},
	{ timestamps: true }
);

export type SiteContentDocument = HydratedDocument<
	InferSchemaType<typeof siteContentSchema>
>;
export const SiteContent: Model<InferSchemaType<typeof siteContentSchema>> = mongoose.model(
	"SiteContent",
	siteContentSchema
);
