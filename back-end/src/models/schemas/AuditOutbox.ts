import type { HydratedDocument, InferSchemaType, Model } from "mongoose";
import mongoose, { Schema } from "mongoose";

const auditOutboxSchema = new Schema(
	{
		failureName: { type: String, default: "AuditWriteError", trim: true },
		payload: { type: Schema.Types.Mixed, required: true }
	},
	{ timestamps: true }
);

auditOutboxSchema.index({ createdAt: 1 });

export type AuditOutboxDocument = HydratedDocument<InferSchemaType<typeof auditOutboxSchema>>;
export const AuditOutbox: Model<InferSchemaType<typeof auditOutboxSchema>>
	= mongoose.model("AuditOutbox", auditOutboxSchema);
