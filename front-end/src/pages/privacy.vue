<script setup lang="ts">
import { toAbsoluteSiteUrl } from "@/lib/siteAssets";

useHead({
	title: "Privacy | RetroZetro Comics",
	link: [{ rel: "canonical", href: toAbsoluteSiteUrl("/privacy") }],
	meta: [
		{
			name: "description",
			content: "How RetroZetro handles messages, essential browser storage, and website requests."
		}
	]
});
</script>

<template>
	<article class="reading-page">
		<header>
			<p class="reading-eyebrow">RetroZetro Comics</p>
			<h1>Privacy</h1>
			<p>Last updated: September 12, 2026</p>
		</header>
		<section>
			<h2>Reading the site</h2>
			<p>
				You can read the stories and view the artwork without creating an account. Your browser sends ordinary
				connection information, including your IP address, requested page, and browser information, to the
				services that host and protect the site. Server logs and request limits may use that information to
				deliver pages, diagnose errors, and prevent abuse.
			</p>
		</section>
		<section>
			<h2>Contacting us</h2>
			<p>
				If you send a contact form, the name, email address, subject, and message you provide are sent to the
				site's configured contact mailbox through its email service. We use those details to handle your request
				and reply. Emailing us directly also shares your message and email address with the email services
				involved. Please do not include passwords or sensitive personal information.
			</p>
			<p>
				Messages may remain in the receiving mailbox and its backups. To ask about a message or request its
				deletion, contact <a href="mailto:retrozetrocomics@gmail.com">retrozetrocomics@gmail.com</a>. We will
				explain what can be removed and any records that must be retained.
			</p>
		</section>
		<section>
			<h2>Browser storage and owner access</h2>
			<p>
				The site uses browser storage for display preferences. Owner sign-in uses an essential session cookie;
				editing tools may keep unfinished drafts in the owner's browser to help recover work. You can clear this
				information in your browser settings, but doing so may sign you out or remove locally saved drafts.
			</p>
			<p>
				If you choose “Save this place,” your browser stores one story and section identifier on this device.
				This saved place is not sent to an account or a reading-history service. Choose “Forget saved place” to
				remove it. Shared devices share this saved place.
			</p>
			<p>
				Search words appear in the search page's address. Like other requested addresses, they may appear in
				ordinary hosting logs. No separate search-history or audience-tracking service is used.
			</p>
		</section>
		<section>
			<h2>Advertising and audience measurement</h2>
			<p>
				This version of the site does not load advertising or optional audience-measurement scripts. An AdSense
				ownership-verification record is retained, but it does not itself display ads or load Google's
				advertising script.
			</p>
			<p>
				If advertising is introduced, this page and the site's privacy choices will be updated before those
				services are enabled. Google and other advertising providers may use cookies, web beacons, IP addresses,
				or other identifiers when their services run. Read
				<a href="https://policies.google.com/technologies/partner-sites" rel="noopener"
					>how Google uses information from sites that use its services</a
				>.
			</p>
		</section>
		<section>
			<h2>Questions</h2>
			<p>
				For questions about information handled by RetroZetro Comics, email
				<a href="mailto:retrozetrocomics@gmail.com">retrozetrocomics@gmail.com</a>.
			</p>
		</section>
	</article>
</template>
