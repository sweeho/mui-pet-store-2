# TDD result — SWHM3-T-0007

## Notes

Platform-recorded runs (cases SWHM3-C-0001 to C-0027, linked tests cite the case keys):

- Red run id: 4cc12aa8-f76e-4a6a-b2fb-ba2ee4c8c915 (valid, 27 cases `stub_failure`).
- Green run id: see the ticket comment (recorded after the final commit).

Local full gate: `npm run lint`, `npm run format:check`, `npm run typecheck`, `npm test` (16 suites, 51 tests pass), `npm run test:e2e` (12 pass). Acceptance e2e: localization C-0006/7/11 and site-shell C-0163..0167 pass; other capabilities' acceptance specs fail because their features are not built yet (not this ticket).
