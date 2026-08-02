# Direct production service

This directory replaces the removed production container path. It does not change DNS, certificates, firewall rules,
or routing outside the existing Nginx TLS server.

1. Back up MongoDB and existing uploads. Complete the required Vault credential rotation documented in the security
   audit before production promotion.
2. Create a locked `retrozetro` system account with no interactive shell and install Node 24.18.1/npm 12.0.2 at the
   paths validated by the scripts.
3. Run `install-service.sh --dry-run`, inspect every target, then run it as root. Replace every placeholder in
   `/etc/retrozetro/retrozetro.env`; the application intentionally refuses to start with the example values.
4. Include `../nginx/retrozetro.locations.conf` inside the existing TLS server block and validate Nginx.
5. Clone the exact release tag beneath `/srv/retrozetro/releases/<release>`, preserving a clean Git checkout.
6. As `retrozetro`, run `prepare-release.sh` with that absolute checkout path.
7. As root, run `promote-release.sh` with the same path. The script either verifies local readiness and both public
   address families or restores the previous release.

Do not replace `/srv/retrozetro/current` with a directory, place secrets in a release checkout, or write uploads into a
release. Do not promote while the historical Vault AppRole credential remains valid.

The application retains a narrowly scoped transition adapter for the pre-existing
`/srv/retrozetrocomics.com/back-end` plus `/var/www/retrozetrocomics.com` deployment. It supplies only non-secret,
exact-path defaults and derives release identity from the installed `release.json`; all credential, MongoDB, origin,
and runtime validation remains enforced. This compatibility path does not replace the credential rotation or the
atomic direct-release migration above.
