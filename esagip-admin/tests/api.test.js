const test = require("node:test");
const assert = require("node:assert/strict");
const health = require("../mock/health.json");

test("mock health fixture reports an available mock server", async () => {
  assert.deepEqual(health, { status: "ok", source: "mock" });
});
