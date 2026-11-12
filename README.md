# TC Local Caching PoC

Silo holds the canonical testcase bytes. The seeder packages each directory under
`fixtures/` into an immutable `bundles/<version>.tar.gz` object. Conditional
uploads refuse to replace an existing version. The seeder also writes
`/pins/pins.json` with each version and the SHA-256 of its compressed bundle.
The client uses that file as a stand-in for the version and checksum pinned to a
submission.

The Go manager fetches the exact Silo key, verifies the compressed checksum,
then checks the manifest and every file while unpacking on the cache filesystem.
A rename makes the complete artifact visible. On a hit, it opens all requested
`.in` and `.out` files before GC can evict the entry. A Unix
`SOCK_SEQPACKET` socket passes the read-only FDs via `SCM_RIGHTS`. The client
reads the files from those FDs, and the manager may unlink the cache paths as
soon as the complete set is open.

## Run with Docker Compose

```sh
docker compose up --build -d --wait
docker compose run --rm client read -version sum-v1 -cases 1,2
docker compose run --rm client read -version sum-v2
docker compose exec -T manager /tc-cache stats
```

The demo clients mount the socket and pins only. Silo and the manager use the
Compose network. Silo data persists in `silo-data`; the manager has a separate
16 MiB tmpfs for the cache. The `cache-volume` container keeps that filesystem
mounted across manager container restarts. Taking the whole stack down discards
the cache. The default 6 MiB/3 MiB high/low watermarks make GC reproducible.

The manager serializes cold installs to avoid overcommitting disk space and
shares each version's load result among concurrent callers. Cache admission uses
the actual filesystem usage and available space, including allocation retained by
open, unlinked files. When eviction cannot make enough space, the request returns
`resource_exhausted`. On restart the manager removes abandoned staging paths
and verifies committed entries before serving them.

## Verify

```sh
docker compose run --build --rm verify
```

The verification service uses the real Silo API and a dedicated test tmpfs.
It checks independent clients reading after eviction, a 260-FD response, a failed
checksum followed by a retry, FD cleanup on incomplete transfer and exhaustion,
and Manager restart while readers still hold unlinked files. It also verifies
that closing the last FD releases space and lets a blocked version load.

This prototype covers the cache-through manager and test clients. It uses local
Compose credentials and a tmpfs to exercise Linux filesystem semantics. The
submission database, Iris integration, cache-aside comparison and Kubernetes PV
validation are later stages.
