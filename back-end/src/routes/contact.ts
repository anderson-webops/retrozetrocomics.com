import { Router } from "express";

import {
	contactFormSchema,
	contactRateLimiter,
	isContactMailConfigured,
	sendContactMessage
} from "../services/contact.js";

export const contactRouter = Router();

contactRouter.post("/", contactRateLimiter, async (req, res) => {
	const parsedBody = contactFormSchema.safeParse(req.body);
	if (!parsedBody.success) {
		return res.status(400).json({
			ok: false,
			error: "Please provide a valid name, email address, subject, and message."
		});
	}

	if (parsedBody.data.website) {
		return res.status(202).json({ ok: true });
	}

	if (!isContactMailConfigured()) {
		return res.status(503).json({
			ok: false,
			error: "The contact form is not configured on the server yet."
		});
	}

	try {
		await sendContactMessage(parsedBody.data, req);
		return res.status(202).json({ ok: true });
	}
	catch (error) {
		console.error("Contact form email failed:", error);
		return res.status(502).json({
			ok: false,
			error: "The message could not be sent right now. Please try again later."
		});
	}
});
