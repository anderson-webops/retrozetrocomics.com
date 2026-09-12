import type { HydratedDocument, InferSchemaType, Model } from "mongoose";
import mongoose, { Schema } from "mongoose";

const contentTrashItemSchema = new Schema(
	{
		contentCollection: {
			type: String,
			enum: ["characters", "items", "showcaseItems", "storyArcs", "worldEntries"],
			required: true,
			index: true
		},
		data: { type: Schema.Types.Mixed, required: true },
		deletedById: { type: String, default: "", trim: true },
		deletedByName: { type: String, default: "", trim: true },
		itemId: { type: String, required: true, trim: true },
		itemLabel: { type: String, required: true, trim: true },
		key: { type: String, required: true, index: true, trim: true },
		restoredAt: { type: Date, default: null, index: true },
		restoredById: { type: String, default: "", trim: true },
		restoredByName: { type: String, default: "", trim: true }
	},
	{ timestamps: true }
);

contentTrashItemSchema.index({ restoredAt: 1, createdAt: -1 });
contentTrashItemSchema.index({ key: 1, contentCollection: 1, createdAt: -1 });

export type ContentTrashItemDocument = HydratedDocument<
	InferSchemaType<typeof contentTrashItemSchema>
>;
export const ContentTrashItem: Model<InferSchemaType<typeof contentTrashItemSchema>>
	= mongoose.model("ContentTrashItem", contentTrashItemSchema);
