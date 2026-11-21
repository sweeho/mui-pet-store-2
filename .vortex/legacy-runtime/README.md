# Legacy runtime: Java Pet Store 1.3.2

Starts the legacy J2EE application from the initiative's legacy source
(`legacy-source/`, Sun Java Pet Store 1.3.2) on the J2EE 1.3.1 Reference
Implementation. The RI holds the web and EJB containers, JMS and the Cloudscape
database, so there is a single service, `petstore`.

## Start

```sh
docker compose -f .vortex/legacy-runtime/compose.yaml up --build -d
docker compose -f .vortex/legacy-runtime/compose.yaml ps   # wait for "healthy" (2 to 5 minutes)
```

## URL the acceptance suite uses

`http://localhost:8000/petstore/` (storefront). The same port serves
`/opc`, `/supplier` and `/admin`. Readiness: `GET /petstore/` returns 200.

## What is not in the repository

Both are Sun/Oracle downloads under a click-through licence; put them in
`.vortex/legacy-runtime/vendor/` before building:

| File | Content |
|---|---|
| `j2sdk-1_4_2-linux.tar.gz` | Java 2 SDK 1.4.2 for Linux (the RI needs Java 1.4) |
| `j2sdkee-1_3_1-linux.tar.gz` | J2EE SDK 1.3.1 (the Reference Implementation, with Cloudscape) |

Rename the downloaded archives to those names, or edit the two `tar` lines in
`compose.yaml`. Apache Ant 1.6.5 is downloaded during the build (the Ant bundled
with the original source is not in the repository).

## Notes

- The compose file reads the legacy tree from `../../legacy-source`. That path
  exists once the Spec Extraction branch (`vortex/legacy-spec/sx-0001`) is
  merged. Neither it nor the new-system code is modified here.
- Not run in the authoring workspace (no Docker, no Sun archives); the steps follow
  `legacy-source/app/setup.xml`, `src/build.xml` and the Sun install guide. Expect
  to adjust the 40-second RI start-up wait on slow hosts.
- Port 8000 collides with nothing the acceptance suite uses (new system: 3101).
