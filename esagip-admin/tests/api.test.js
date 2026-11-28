const test = require("node:test");
const assert = require("node:assert/strict");
const health = require("../mock/health.json");
const skills = require("../mock/skills.json");
const volunteers = require("../mock/volunteers.json");
const admins = require("../mock/admins.json");

const ERD_PERMISSIONS = [
  "volunteer_approvals",
  "operation_management",
  "attendance_confirmation",
  "community_publishing",
  "reports_exports",
  "activity_logs",
];

test("mock health fixture reports an available mock server", () => {
  assert.deepEqual(health, { status: "ok", source: "mock" });
});

test("mock skills fixture matches all 15 seeded GET /api/skills records", () => {
  assert.ok(Array.isArray(skills) && skills.length === 15);
  for (const skill of skills) {
    assert.equal(typeof skill.id, "number");
    assert.equal(typeof skill.name, "string");
    assert.equal(typeof skill.category, "string");
  }
});

test("mock volunteers fixture matches GET /api/volunteers ERD contract with example.test emails", () => {
  assert.ok(Array.isArray(volunteers) && volunteers.length === 5);
  const pendingNames = volunteers.filter((v) => v.status === "pending").map((v) => v.name).sort();
  const approvedNames = volunteers.filter((v) => v.status === "approved").map((v) => v.name).sort();
  assert.deepEqual(pendingNames, ["Ana Reyes", "Carla Mendoza"]);
  assert.deepEqual(approvedNames, ["Juan Dela Cruz", "Maria Santos", "Miguel Garcia"]);

  for (const vol of volunteers) {
    assert.equal(typeof vol.id, "number");
    assert.equal(typeof vol.name, "string");
    assert.ok(vol.email.endsWith("@example.test"), `Expected @example.test email, got ${vol.email}`);
    assert.equal(typeof vol.contact_number, "string");
    assert.equal(typeof vol.address_area, "string");
    assert.equal(typeof vol.birthdate, "string");
    assert.equal(typeof vol.is_resident, "boolean");
    assert.ok(["pending", "approved", "rejected"].includes(vol.status));
    assert.ok(["available", "unavailable", "on_operation"].includes(vol.availability));
    assert.ok(Array.isArray(vol.skills));
  }
});

test("mock admins fixture uses exact snake_case ERD permission keys and example.test emails", () => {
  assert.ok(Array.isArray(admins) && admins.length >= 3);
  for (const admin of admins) {
    assert.ok(admin.email.endsWith("@example.test"), `Expected @example.test email, got ${admin.email}`);
    assert.ok(["admin", "superadmin"].includes(admin.role));
    assert.equal(typeof admin.is_active, "boolean");
    assert.ok(Array.isArray(admin.permissions));
    for (const perm of admin.permissions) {
      assert.ok(ERD_PERMISSIONS.includes(perm), `Unexpected permission key: ${perm}`);
    }
  }
});
