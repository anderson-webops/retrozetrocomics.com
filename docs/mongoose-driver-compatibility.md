# Mongoose driver compatibility

Mongoose 9.13.1 declares a MongoDB 7.9 driver directly. The application uses
that supported dependency range without a driver override.

An isolated Node 26.13.1 compatibility check against synthetic MongoDB 9.0.8
covered model creation, indexes, population, sessions, updates, cursors,
aggregation, deletion and reconnect with Mongoose 9.13.1 and MongoDB 7.9.1.
The isolated dependency graph matched the application lockfile integrities.
For a release, require
the site's full locked-install, browser, and runtime artifact checks. Verify
that the installed Mongoose consumer resolves MongoDB 7.9.1 and that the
production artifact contains no older copy.
