# Archive Conventions

The archive tree is organized by topic bucket first, then by dated snapshot or `legacy-undated/` grouping inside that topic.

Current top-level archive buckets:

1. `authoring/`
2. `runtime/`
3. `code_quality/`
4. `website/`
5. `concepts/`
6. `workshops/`
7. `audits/`
8. `reviews/`
9. `reference/`

Conventions:

1. Put historical material under the most specific topic bucket available.
2. Prefer dated snapshot folders when the archive came from a known migration, audit, or retirement event.
3. Use `legacy-undated/` when older material has no reliable date but still needs a clear topical home.
4. Keep named archival collections inside a dated snapshot folder or inside `legacy-undated/`, not directly under the topic root.
5. Keep archive content intact; do not rewrite old historical claims unless a path move forces a link fix.
6. Maintained docs may link into the archive, but archive files are not part of maintained-doc validation scope.
