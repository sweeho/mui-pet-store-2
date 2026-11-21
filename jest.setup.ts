import "@testing-library/jest-dom";

// A test file that used the database closes it, so no connection outlives the file. Jest runs a
// fast suite in its own process, where an open connection would keep it from exiting. The client
// registers the close (src/db/client.ts); a file that never touched the database has none.
afterAll(async () => {
  await (globalThis as { appDbClose?: () => Promise<void> }).appDbClose?.();
});
