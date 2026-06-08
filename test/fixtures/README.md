# Test fixtures

Real, committed responses from the Vampire Survivors wiki Bucket API
(`https://vampire.survivors.wiki/api.php`). Each `<table>.json` is the raw API
response (`{ bucketQuery, bucket: [...] }`) for one Bucket table.

Tests read these files and must **never** hit the network. Re-capture only when
the wiki schema changes:

```bash
bun run test/fixtures/capture.ts
```

See `capture.ts` for the exact tables and fields captured.
