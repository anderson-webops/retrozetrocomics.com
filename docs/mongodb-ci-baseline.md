# MongoDB CI baseline

The ARM64 immutable-runtime jobs use official MongoDB 9.0.4, pinned by its multi-platform image digest. This release contains the Ubuntu kernel compatibility fix tracked in https://jira.mongodb.org/browse/SERVER-131779 and supports the existing hosted ARM64 runner.

Only the disposable authenticated loopback `retrozetro_artifact_*` fixture changes. Architecture, artifact isolation, acceptance tests, health checks, and dependent gates remain unchanged. This image pin does not upgrade a production database.

Before any production upgrade, separately verify the actual server version and FCV, topology, driver support, supported upgrade path, tested recoverable backup, downtime needs, and rollback limits. Never copy live production data or credentials into the CI fixture.
