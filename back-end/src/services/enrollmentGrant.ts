import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export const MFA_ENROLLMENT_GRANT_LIFETIME_MS = 30 * 60 * 1000;

export function hashEnrollmentGrant(grant: string): string {
	return createHash("sha256").update(grant.trim(), "utf8").digest("base64url");
}

export function createEnrollmentGrant(now = Date.now()) {
	const plainTextGrant = `RZ-MFA-${randomBytes(32).toString("base64url")}`;
	return {
		expiresAt: new Date(now + MFA_ENROLLMENT_GRANT_LIFETIME_MS),
		hash: hashEnrollmentGrant(plainTextGrant),
		plainTextGrant
	};
}

export function enrollmentGrantMatches(grant: string, expectedHash: string): boolean {
	const actual = Buffer.from(hashEnrollmentGrant(grant), "utf8");
	const expected = Buffer.from(expectedHash, "utf8");
	return actual.length === expected.length && timingSafeEqual(actual, expected);
}
