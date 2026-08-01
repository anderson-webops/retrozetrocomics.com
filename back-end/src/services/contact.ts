import { env } from "node:process";
import rateLimit from "express-rate-limit";
import nodemailer from "nodemailer";
import { z } from "zod";

const truthyValues = new Set(["1", "true", "yes", "on"]);
const emailAddressSchema = z.string().trim().email().max(320);

function isEnabled(value?: string) {
	return truthyValues.has(value?.trim().toLowerCase() || "");
}

function trimToUndefined(value?: string) {
	const trimmed = value?.trim();
	return trimmed || undefined;
}

function parseEmailAddress(value: string, variableName: string) {
	const parsed = emailAddressSchema.safeParse(value);
	if (!parsed.success) {
		throw new TypeError(`${variableName} must contain a valid email address`);
	}

	return parsed.data;
}

function parseAddressList(value: string | undefined, variableName: string) {
	return value
		?.split(",")
		.map(part => part.trim())
		.filter(Boolean)
		.map(address => parseEmailAddress(address, variableName));
}

export const contactFormSchema = z.object({
	name: z.string().trim().min(1).max(120),
	email: z.string().trim().email().max(320),
	subject: z.string().trim().min(1).max(160),
	message: z.string().trim().min(10).max(5000),
	website: z.string().trim().max(0).optional().or(z.literal(""))
});

export type ContactFormPayload = z.infer<typeof contactFormSchema>;

export const contactRateLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 5,
	standardHeaders: true,
	legacyHeaders: false
});

function getContactMailConfig() {
	const rawFromEmail = trimToUndefined(env.CONTACT_FROM_EMAIL);
	if (!rawFromEmail) {
		return null;
	}
	const fromEmail = parseEmailAddress(rawFromEmail, "CONTACT_FROM_EMAIL");

	const toEmail = parseEmailAddress(
		trimToUndefined(env.CONTACT_TO_EMAIL) || "contacts@jacobdanderson.net",
		"CONTACT_TO_EMAIL"
	);
	const bccEmail = parseAddressList(env.CONTACT_BCC_EMAIL, "CONTACT_BCC_EMAIL");
	const fromName = trimToUndefined(env.CONTACT_FROM_NAME) || "RetroZetro Comics";
	const sendmailPath = trimToUndefined(env.CONTACT_SENDMAIL_PATH);
	const useSendmail = isEnabled(env.CONTACT_USE_SENDMAIL) || !!sendmailPath;

	if (useSendmail) {
		return {
			fromEmail,
			fromName,
			toEmail,
			bccEmail,
			transport: nodemailer.createTransport({
				sendmail: true,
				newline: "unix",
				...(sendmailPath ? { path: sendmailPath } : {})
			})
		};
	}

	const host = trimToUndefined(env.CONTACT_SMTP_HOST);
	if (!host) {
		return null;
	}

	const secure = isEnabled(env.CONTACT_SMTP_SECURE);
	const port = Number(env.CONTACT_SMTP_PORT || (secure ? "465" : "587"));
	if (!Number.isInteger(port) || port < 1 || port > 65_535) {
		throw new TypeError("Invalid CONTACT_SMTP_PORT");
	}

	const user = trimToUndefined(env.CONTACT_SMTP_USER);
	const pass = trimToUndefined(env.CONTACT_SMTP_PASS);
	if (Boolean(user) !== Boolean(pass)) {
		throw new TypeError("CONTACT_SMTP_USER and CONTACT_SMTP_PASS must be configured together");
	}

	return {
		fromEmail,
		fromName,
		toEmail,
		bccEmail,
		transport: nodemailer.createTransport({
			host,
			port,
			secure,
			connectionTimeout: 10_000,
			greetingTimeout: 10_000,
			requireTLS: true,
			socketTimeout: 20_000,
			tls: {
				minVersion: "TLSv1.2",
				rejectUnauthorized: true
			},
			...(user && pass ? { auth: { user, pass } } : {})
		})
	};
}

export function isContactMailConfigured() {
	try {
		return !!getContactMailConfig();
	}
	catch {
		return false;
	}
}

function escapeHtml(value: string) {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll("\"", "&quot;")
		.replaceAll("'", "&#039;");
}

function sanitizeHeaderValue(value: string, maximumLength: number) {
	return value
		.replace(/[\r\n]+/g, " ")
		.trim()
		.slice(0, maximumLength);
}

export function buildContactMail(payload: ContactFormPayload, submittedAt = new Date().toISOString()) {
	const safeName = sanitizeHeaderValue(payload.name, 120);
	const safeSubject = sanitizeHeaderValue(payload.subject, 160);
	const escapedName = escapeHtml(safeName);
	const escapedEmail = escapeHtml(payload.email);
	const escapedSubject = escapeHtml(safeSubject);
	const escapedMessage = escapeHtml(payload.message).replaceAll("\n", "<br />");
	const metadata = [
		`Submitted: ${submittedAt}`,
		`From name: ${safeName}`,
		`From email: ${payload.email}`,
		`Subject: ${safeSubject}`,
		`Reply-To: ${payload.email}`
	].join("\n");

	return {
		html: `
			<p>A new contact form submission was received from <strong>${escapedName}</strong>.</p>
			<p><strong>Email:</strong> ${escapedEmail}</p>
			<p><strong>Subject:</strong> ${escapedSubject}</p>
			<p><strong>Submitted:</strong> ${escapeHtml(submittedAt)}</p>
			<hr />
			<p>${escapedMessage}</p>
		`,
		subject: `[retrozetrocomics.com] Contact form from ${safeName}: ${safeSubject}`,
		text: `${metadata}\n\nMessage:\n${payload.message}`
	};
}

export async function sendContactMessage(payload: ContactFormPayload) {
	const mailConfig = getContactMailConfig();
	if (!mailConfig) {
		throw new Error("Contact mail is not configured");
	}

	const message = buildContactMail(payload);

	await mailConfig.transport.sendMail({
		from: {
			address: mailConfig.fromEmail,
			name: sanitizeHeaderValue(mailConfig.fromName, 120)
		},
		to: mailConfig.toEmail,
		...(mailConfig.bccEmail?.length ? { bcc: mailConfig.bccEmail } : {}),
		replyTo: payload.email,
		...message
	});
}
