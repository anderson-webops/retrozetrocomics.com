import type { HydratedDocument, InferSchemaType, Model } from "mongoose";
import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema(
	{
		postId: {
			type: Schema.Types.ObjectId,
			ref: "Post",
			required: true,
			index: true
		},
		authorId: {
			type: Schema.Types.ObjectId,
			required: true,
			index: true
		},
		authorRole: {
			type: String,
			enum: ["user", "admin"],
			required: true
		},
		authorName: { type: String, required: true },
		body: { type: String, required: true, trim: true },
		status: {
			type: String,
			enum: ["pending", "approved", "rejected", "hidden"],
			default: "pending",
			index: true
		},
		moderationNote: { type: String, default: "" },
		moderatedAt: { type: Date, default: null },
		moderatedBy: {
			type: Schema.Types.ObjectId,
			ref: "Admin",
			default: null
		}
	},
	{ timestamps: true }
);

export type CommentDocument = HydratedDocument<InferSchemaType<typeof commentSchema>>;
export const Comment: Model<InferSchemaType<typeof commentSchema>> = mongoose.model("Comment", commentSchema);
