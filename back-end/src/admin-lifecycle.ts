import { exit } from "node:process";

import mongoose from "mongoose";
import * as readlineSync from "readline-sync";
import { z } from "zod";

import { Admin } from "./models/schemas/Admin.js";
import { AuditLog } from "./models/schemas/AuditLog.js";
import { recordAuditLog } from "./services/auditLog.js";
import { connectToMongo } from "./services/database.js";
import "dotenv/config";

const commandSchema = z.enum([
	"create",
	"disable",
	"enable",
	"reset-password",
	"sanitize-audit-logs"
]);
const emailSchema = z.string().trim().email().transform(value => value.toLowerCase());
const passwordSchema = z.string().min(14).max(256);

function readOption(name: string) {
	const index = process.argv.indexOf(`--${name}`);
	if (index < 0) {
		return undefined;
	}

	const value = process.argv[index + 1];
	if (!value || value.startsWith("--")) {
		throw new TypeError(`--${name} requires a value`);
	}

	return value.trim();
}

function hasFlag(name: string) {
	return process.argv.includes(`--${name}`);
}

function maskEmail(email: string) {
	const [localPart, domain] = email.split("@");
	return `${localPart?.slice(0, 2) || "**"}***@${domain || "invalid"}`;
}

function readPassword() {
	if (process.argv.some(argument => argument.startsWith("--password"))) {
		throw new TypeError("Passwords must not be passed through command-line arguments");
	}

	return passwordSchema.parse(
		readlineSync.question("New password (14+ characters): ", {
			hideEchoBack: true
		})
	);
}

function printUsage() {
	console.log(`Usage:
  npm run admin -- create --email <email> --name <name> [--apply]
  npm run admin -- enable --email <email> [--apply]
  npm run admin -- disable --email <email> [--apply]
  npm run admin -- reset-password --email <email> [--apply]
  npm run admin -- sanitize-audit-logs [--apply]

Commands are dry-run only unless --apply is present. Passwords are prompted
interactively and are rejected if supplied as command-line arguments.`);
}

async function recordLifecycleAction(
	action: string,
	admin: { id: string; name: string },
	summary: string,
	before: Record<string, unknown> | null,
	after: Record<string, unknown> | null
) {
	await recordAuditLog({
		action,
		actor: {
			id: "operator-cli",
			name: "Operator CLI",
			role: "admin"
		},
		after,
		before,
		category: "auth",
		entityId: admin.id,
		entityLabel: admin.id,
		entityType: "account",
		summary,
		targetId: admin.id,
		targetLabel: admin.id,
		targetType: "account"
	});
}

async function handleCreate(email: string, apply: boolean) {
	const name = z.string().trim().min(1).max(120).parse(readOption("name"));
	const existing = await Admin.findOne({ email });
	if (existing) {
		throw new Error(`An account already exists for ${maskEmail(email)}`);
	}

	console.log(`${apply ? "Creating" : "Would create"} active admin ${maskEmail(email)} (${name}).`);
	if (!apply) {
		return;
	}

	const password = readPassword();
	const admin = await Admin.create({
		email,
		name,
		password,
		role: "admin",
		status: "active"
	});
	await recordLifecycleAction(
		"ADMIN_ACCOUNT_CREATED",
		admin,
		"Created an admin account",
		null,
		{ role: "admin", status: "active" }
	);
}

async function handleStatusChange(
	email: string,
	status: "active" | "disabled",
	apply: boolean
) {
	const admin = await Admin.findOne({ email });
	if (!admin) {
		throw new Error(`No account exists for ${maskEmail(email)}`);
	}

	if (admin.status === status) {
		console.log(`Admin ${maskEmail(email)} is already ${status}.`);
		return;
	}

	if (status === "disabled") {
		const activeAdminCount = await Admin.countDocuments({
			role: "admin",
			status: "active"
		});
		if (activeAdminCount <= 1) {
			throw new Error("Refusing to disable the final active admin account");
		}
	}

	console.log(`${apply ? "Changing" : "Would change"} ${maskEmail(email)} to ${status}.`);
	if (!apply) {
		return;
	}

	const previousStatus = admin.status;
	admin.status = status;
	admin.sessionVersion += 1;
	await admin.save();
	await recordLifecycleAction(
		status === "active" ? "ADMIN_ACCOUNT_ENABLED" : "ADMIN_ACCOUNT_DISABLED",
		admin,
		status === "active" ? "Enabled an admin account" : "Disabled an admin account",
		{ status: previousStatus },
		{ status }
	);
}

async function handlePasswordReset(email: string, apply: boolean) {
	const admin = await Admin.findOne({ email });
	if (!admin) {
		throw new Error(`No account exists for ${maskEmail(email)}`);
	}

	console.log(`${apply ? "Resetting" : "Would reset"} the password for ${maskEmail(email)} and revoke its sessions.`);
	if (!apply) {
		return;
	}

	admin.password = readPassword();
	await admin.save();
	await recordLifecycleAction(
		"ADMIN_PASSWORD_RESET",
		admin,
		"Reset an admin password and revoked existing sessions",
		null,
		{ sessionsRevoked: true }
	);
}

async function handleAuditSanitization(apply: boolean) {
	const query = {
		$or: [
			{ actorEmail: { $exists: true } },
			{ entityLabel: /@/ },
			{ ipAddress: { $exists: true } },
			{ targetLabel: /@/ },
			{ userAgent: { $exists: true } }
		]
	};
	const affected = await AuditLog.collection.countDocuments(query);
	console.log(`${apply ? "Sanitizing" : "Would sanitize"} ${affected} historical audit log record(s).`);
	if (!apply || affected === 0) {
		return;
	}

	await AuditLog.collection.updateMany(query, {
		$unset: {
			actorEmail: "",
			ipAddress: "",
			userAgent: ""
		}
	});
	await AuditLog.collection.updateMany(
		{ entityLabel: /@/ },
		[{ $set: { entityLabel: "$entityId" } }]
	);
	await AuditLog.collection.updateMany(
		{ targetLabel: /@/ },
		[{ $set: { targetLabel: "$targetId" } }]
	);
}

async function main() {
	const rawCommand = process.argv[2];
	if (!rawCommand || rawCommand === "--help" || rawCommand === "-h") {
		printUsage();
		return;
	}

	const command = commandSchema.parse(rawCommand);
	const apply = hasFlag("apply");
	await connectToMongo();

	if (command === "sanitize-audit-logs") {
		await handleAuditSanitization(apply);
		return;
	}

	const email = emailSchema.parse(readOption("email"));
	if (command === "create") {
		await handleCreate(email, apply);
	}
	else if (command === "enable") {
		await handleStatusChange(email, "active", apply);
	}
	else if (command === "disable") {
		await handleStatusChange(email, "disabled", apply);
	}
	else {
		await handlePasswordReset(email, apply);
	}

	if (!apply) {
		console.log("Dry run complete; rerun with --apply to make this change.");
	}
}

main()
	.catch((error) => {
		console.error(error instanceof Error ? error.message : String(error));
		exitCode = 1;
	})
	.finally(async () => {
		if (mongoose.connection.readyState !== 0) {
			await mongoose.disconnect();
		}
	});

let exitCode = 0;
process.once("beforeExit", () => {
	if (exitCode) {
		exit(exitCode);
	}
});
