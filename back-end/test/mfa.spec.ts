import { describe, expect, it } from "vitest";

import type { SecurityConfig } from "../src/config/security.js";
import {
	createPasskeyAuthenticationOptions,
	createPasskeyRegistrationOptions,
	createRecoveryCodes,
	findMatchingRecoveryCode
} from "../src/services/mfa.js";

const securityConfig = {
	webAuthnOrigin: "https://retrozetrocomics.com",
	webAuthnRpId: "retrozetrocomics.com"
} as SecurityConfig;

describe("owner multifactor authentication", () => {
	it("creates single-use recovery codes without storing their plaintext", async () => {
		const { plainTextCodes, storedCodes } = await createRecoveryCodes();

		expect(plainTextCodes).toHaveLength(8);
		expect(new Set(plainTextCodes).size).toBe(8);
		expect(storedCodes).toHaveLength(8);
		expect(storedCodes.map(code => code.hash).join(" ")).not.toContain(plainTextCodes[0]);

		const match = await findMatchingRecoveryCode(plainTextCodes[0] || "", storedCodes);
		expect(match?.id).toBe(storedCodes[0]?.id);
		if (match) match.usedAt = new Date();
		expect(await findMatchingRecoveryCode(plainTextCodes[0] || "", storedCodes)).toBeNull();
		expect(await findMatchingRecoveryCode("RZ-0000-0000-0000", storedCodes)).toBeNull();
	});

	it("binds registration and authentication challenges to the canonical site", async () => {
		const account = {
			email: "owner@example.com",
			id: "507f1f77bcf86cd799439011",
			name: "Owner",
			passkeys: []
		};
		const registration = await createPasskeyRegistrationOptions(account, securityConfig);
		expect(registration.rp.id).toBe("retrozetrocomics.com");
		expect(registration.authenticatorSelection?.userVerification).toBe("required");

		const authentication = await createPasskeyAuthenticationOptions([], securityConfig);
		expect(authentication.rpId).toBe("retrozetrocomics.com");
		expect(authentication.userVerification).toBe("required");
	});
});
