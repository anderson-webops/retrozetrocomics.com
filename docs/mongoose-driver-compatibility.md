# Mongoose driver compatibility

Mongoose 9.12.2 declares a MongoDB 7.8 driver. Its scoped override selects
[MongoDB 7.9.1](https://github.com/mongodb/node-mongodb-native/releases/tag/v7.9.1)
for the authentication and credential-redaction fixes. Both packages remain
registry dependencies and both dependency audits remain in force.

An isolated Node 26.13.1 compatibility check against synthetic MongoDB 9.0.8
covered model creation, indexes, population, sessions, updates, cursors,
aggregation, deletion and reconnect with this pairing. For a release, require
the site's full locked-install, browser, and runtime artifact checks. Verify
that the installed Mongoose consumer resolves MongoDB 7.9.1 and that the
production artifact contains no older copy.

Remove the override when a supported Mongoose release declares a patched
driver, then repeat the locked-install and release checks.
