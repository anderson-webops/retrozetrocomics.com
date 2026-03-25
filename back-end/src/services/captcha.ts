import { Buffer } from "node:buffer";
import { createHmac, randomInt, randomUUID } from "node:crypto";
import { env } from "node:process";

export interface CaptchaSessionPayload {
	expectedDigest: string;
	issuedAt: number;
	nonce: string;
	prompt: string;
}

const CAPTCHA_TTL_MS = 5 * 60 * 1000;

function createDigest(answer: string, nonce: string) {
	const secret = env.SESSION_SECRET;
	if (!secret) {
		throw new Error("Missing SESSION_SECRET");
	}

	return createHmac("sha256", secret)
		.update(`${answer}:${nonce}`)
		.digest("hex");
}

function createSvg(prompt: string) {
	const svg = `
		<svg xmlns="http://www.w3.org/2000/svg" width="280" height="90" viewBox="0 0 280 90" role="img" aria-label="Captcha challenge">
			<rect width="280" height="90" rx="18" fill="#160021" />
			<rect x="4" y="4" width="272" height="82" rx="14" fill="none" stroke="#ff914d" stroke-width="2" />
			<path d="M18 26 C74 12 124 44 176 28 S246 24 262 44" fill="none" stroke="#7a4bb4" stroke-width="3" opacity="0.55" />
			<path d="M24 70 C82 48 126 74 174 62 S236 48 256 68" fill="none" stroke="#ff914d" stroke-width="2" opacity="0.65" />
			<text x="140" y="54" text-anchor="middle" font-family="Verdana, sans-serif" font-size="28" fill="#fff3e8">${prompt} = ?</text>
		</svg>
	`.trim();

	return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export function generateCaptchaChallenge() {
	const useAddition = randomInt(0, 2) === 0;
	const first = randomInt(3, 13);
	const second = useAddition ? randomInt(1, 10) : randomInt(1, first);
	const answer = useAddition ? first + second : first - second;
	const prompt = `${first} ${useAddition ? "+" : "-"} ${second}`;
	const nonce = randomUUID();

	return {
		sessionPayload: {
			expectedDigest: createDigest(String(answer), nonce),
			issuedAt: Date.now(),
			nonce,
			prompt
		} satisfies CaptchaSessionPayload,
		imageDataUrl: createSvg(prompt),
		prompt
	};
}

export function verifyCaptcha(
	sessionPayload: CaptchaSessionPayload | null | undefined,
	response: string
) {
	if (!sessionPayload) {
		return false;
	}

	if (Date.now() - sessionPayload.issuedAt > CAPTCHA_TTL_MS) {
		return false;
	}

	return createDigest(response.trim(), sessionPayload.nonce) === sessionPayload.expectedDigest;
}
