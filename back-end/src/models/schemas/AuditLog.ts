import type { HydratedDocument, InferSchemaType, Model } from "mongoose";
import mongoose, { Schema } from "mongoose";

const auditLogSchema = new Schema(
	{
		action: {
			type: String,
			required: true,
			index: true,
			trim: true
		},
		actorEmail: {
			type: String,
			default: "",
			trim: true
		},
		actorId: {
			type: String,
			default: "",
			index: true,
			trim: true
		},
		actorName: {
			type: String,
			default: "",
			trim: true
		},
		actorRole: {
			type: String,
			enum: ["admin", "user"],
			required: true,
			index: true
		},
		category: {
			type: String,
			enum: ["auth", "comment", "member", "post", "site-content"],
			required: true,
			index: true
		},
		details: {
			type: Schema.Types.Mixed,
			default: {}
		},
		ipAddress: {
			type: String,
			default: ""
		},
		outcome: {
			type: String,
			enum: ["failure", "success"],
			default: "success",
			index: true
		},
		summary: {
			type: String,
			required: true,
			trim: true
		},
		targetId: {
			type: String,
			default: "",
			index: true,
			trim: true
		},
		targetLabel: {
			type: String,
			default: "",
			trim: true
		},
		targetType: {
			type: String,
			default: "",
			trim: true
		},
		userAgent: {
			type: String,
			default: ""
		}
	},
	{
		timestamps: {
			createdAt: true,
			updatedAt: false
		}
	}
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ category: 1, createdAt: -1 });
auditLogSchema.index({ actorRole: 1, actorId: 1, createdAt: -1 });

export type AuditLogDocument = HydratedDocument<
	InferSchemaType<typeof auditLogSchema>
>;
export const AuditLog: Model<InferSchemaType<typeof auditLogSchema>>
	= mongoose.model("AuditLog", auditLogSchema);
