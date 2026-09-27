import { describe, expect, it } from "vitest";

import {
	createEnrollmentGrant,
	enrollmentGrantMatches,
	hashEnrollmentGrant,
	MFA_ENROLLMENT_GRANT_LIFETIME_MS
} from "../src/services/enrollmentGrant.js";

describe("operator MFA recovery grants", () => {
	it("creates an account-independent secret that is stored only as a bounded hash", () => {
		const now = Date.UTC(2026, 8, 27, 12, 0, 0);
		const grant = createEnrollmentGrant(now);

		expect(grant.plainTextGrant).toMatch(/^RZ-MFA-[A-Za-z0-9_-]{43}$/);
		expect(grant.hash).toBe(hashEnrollmentGrant(grant.plainTextGrant));
		expect(grant.hash).not.toContain(grant.plainTextGrant);
		expect(grant.expiresAt.getTime()).toBe(now + MFA_ENROLLMENT_GRANT_LIFETIME_MS);
		expect(enrollmentGrantMatches(grant.plainTextGrant, grant.hash)).toBe(true);
		expect(enrollmentGrantMatches(`${grant.plainTextGrant}x`, grant.hash)).toBe(false);
	});
});
