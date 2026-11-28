"use client";

import { useEffect, useState } from "react";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Card from "@/components/Card";
import Icon from "@/components/Icon";
import Input from "@/components/Input";
import Modal from "@/components/Modal";
import Select from "@/components/Select";
import Table from "@/components/Table";
import { createAdmin, getAdmins, updateAdmin } from "@/lib/api";
import {
  ALL_PERMISSION_KEYS,
  getInitials,
  PERMISSIONS,
  RBAC_PRESETS,
  validatePassword,
} from "@/lib/rbac";
import styles from "./page.module.css";

function detectPreset(role, permissions = []) {
  if (role === "superadmin") return "super_administrator";
  const sorted = [...permissions].sort().join(",");
  const matched = RBAC_PRESETS.find(
    (preset) => preset.permissions && preset.role === role && [...preset.permissions].sort().join(",") === sorted,
  );
  return matched ? matched.id : "custom";
}

export default function RbacPage() {
  const [admins, setAdmins] = useState([]);
  const [meta, setMeta] = useState({ page: 1, per_page: 15, total: 0, last_page: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Create Admin Modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
    preset: "operations_manager",
    permissions: ["volunteer_approvals", "operation_management", "attendance_confirmation"],
  });
  const [createErrors, setCreateErrors] = useState({});
  const [createErrorMsg, setCreateErrorMsg] = useState("");
  const [createSaving, setCreateSaving] = useState(false);

  // Manage Access Modal state
  const [manageTarget, setManageTarget] = useState(null);
  const [manageForm, setManageForm] = useState({
    name: "",
    role: "admin",
    is_active: true,
    preset: "custom",
    permissions: [],
  });
  const [manageErrorMsg, setManageErrorMsg] = useState("");
  const [manageSaving, setManageSaving] = useState(false);

  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    let active = true;
    getAdmins({ page, per_page: 15 })
      .then((res) => {
        if (!active) return;
        setAdmins(Array.isArray(res?.data) ? res.data : []);
        if (res?.meta) setMeta(res.meta);
        setError("");
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load administrator accounts.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, reloadTick]);

  function openCreateModal() {
    setCreateForm({
      name: "",
      email: "",
      password: "",
      role: "admin",
      preset: "operations_manager",
      permissions: ["volunteer_approvals", "operation_management", "attendance_confirmation"],
    });
    setCreateErrors({});
    setCreateErrorMsg("");
    setCreateOpen(true);
  }

  function applyCreatePreset(presetId) {
    const preset = RBAC_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;
    setCreateForm((prev) => ({
      ...prev,
      preset: preset.id,
      role: preset.id === "custom" ? prev.role : preset.role,
      permissions: preset.permissions ? [...preset.permissions] : prev.permissions,
    }));
  }

  function toggleCreatePermission(key) {
    setCreateForm((prev) => {
      const exists = prev.permissions.includes(key);
      const nextPerms = exists ? prev.permissions.filter((p) => p !== key) : [...prev.permissions, key];
      return {
        ...prev,
        role: "admin",
        permissions: nextPerms,
        preset: detectPreset("admin", nextPerms),
      };
    });
  }

  async function handleCreateSubmit(event) {
    event.preventDefault();
    setCreateErrors({});
    setCreateErrorMsg("");

    const errors = {};
    if (!createForm.name.trim()) errors.name = "Full name is required.";
    if (!createForm.email.trim()) errors.email = "Email address is required.";
    const pwErr = validatePassword(createForm.password);
    if (pwErr) errors.password = pwErr;

    if (Object.keys(errors).length) {
      setCreateErrors(errors);
      return;
    }

    setCreateSaving(true);
    try {
      await createAdmin({
        name: createForm.name.trim(),
        email: createForm.email.trim(),
        password: createForm.password,
        role: createForm.role,
        permissions: createForm.role === "superadmin" ? ALL_PERMISSION_KEYS : createForm.permissions,
      });
      setNotice(`Administrator account created for ${createForm.name.trim()}.`);
      setCreateOpen(false);
      setLoading(true);
      setReloadTick((t) => t + 1);
    } catch (err) {
      if (err?.errors) {
        const mapped = {};
        Object.entries(err.errors).forEach(([k, v]) => {
          mapped[k] = Array.isArray(v) ? v[0] : String(v);
        });
        setCreateErrors(mapped);
      }
      setCreateErrorMsg(err instanceof Error ? err.message : "Failed to create administrator.");
    } finally {
      setCreateSaving(false);
    }
  }

  function openManageModal(admin) {
    const perms = admin.role === "superadmin" ? [...ALL_PERMISSION_KEYS] : [...(admin.permissions || [])];
    setManageTarget(admin);
    setManageForm({
      name: admin.name,
      role: admin.role,
      is_active: admin.is_active !== false,
      preset: detectPreset(admin.role, perms),
      permissions: perms,
    });
    setManageErrorMsg("");
  }

  function applyManagePreset(presetId) {
    const preset = RBAC_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;
    setManageForm((prev) => ({
      ...prev,
      preset: preset.id,
      role: preset.id === "custom" ? prev.role : preset.role,
      permissions: preset.permissions ? [...preset.permissions] : prev.permissions,
    }));
  }

  function toggleManagePermission(key) {
    setManageForm((prev) => {
      const exists = prev.permissions.includes(key);
      const nextPerms = exists ? prev.permissions.filter((p) => p !== key) : [...prev.permissions, key];
      return {
        ...prev,
        role: "admin",
        permissions: nextPerms,
        preset: detectPreset("admin", nextPerms),
      };
    });
  }

  async function handleManageSubmit(event) {
    event.preventDefault();
    if (!manageTarget) return;
    setManageErrorMsg("");

    if (!manageForm.name.trim()) {
      setManageErrorMsg("Administrator name is required.");
      return;
    }

    setManageSaving(true);
    try {
      await updateAdmin(manageTarget.id, {
        name: manageForm.name.trim(),
        role: manageForm.role,
        is_active: manageForm.is_active,
        permissions: manageForm.role === "superadmin" ? ALL_PERMISSION_KEYS : manageForm.permissions,
      });
      setNotice(`Updated access for ${manageForm.name.trim()}.`);
      setManageTarget(null);
      setLoading(true);
      setReloadTick((t) => t + 1);
    } catch (err) {
      setManageErrorMsg(err instanceof Error ? err.message : "Failed to update administrator access.");
    } finally {
      setManageSaving(false);
    }
  }

  const columns = [
    {
      key: "name",
      label: "ADMINISTRATOR",
      render: (_, row) => (
        <div className={styles.adminCell}>
          <span className={styles.avatar}>{getInitials(row.name)}</span>
          <div>
            <strong>{row.name}</strong>
            <small>{row.email}</small>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "ROLE",
      render: (val) => (
        <Badge variant={val === "superadmin" ? "primary" : "neutral"}>
          {val === "superadmin" ? "Superadmin" : "Admin"}
        </Badge>
      ),
    },
    {
      key: "permissions",
      label: "PERMISSIONS",
      render: (perms, row) => (
        <span className={styles.mutedText}>
          {row.role === "superadmin" ? "All permissions" : `${(perms || []).length} assigned`}
        </span>
      ),
    },
    {
      key: "is_active",
      label: "STATUS",
      render: (active) => (
        <Badge variant={active !== false ? "success" : "danger"}>
          {active !== false ? "Active" : "Disabled"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "ACTIONS",
      render: (_, row) => (
        <Button size="small" variant="secondary" onClick={() => openManageModal(row)}>
          Manage access
        </Button>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <h1>Roles &amp; permissions</h1>
          <p>Superadmin controls for administrator accounts and access privileges.</p>
        </div>
        <Button
          leadingIcon={<Icon name="plus" className={styles.btnIcon} />}
          onClick={openCreateModal}
        >
          Create admin
        </Button>
      </div>

      {notice && (
        <div className={styles.notice} role="status">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice("")} aria-label="Dismiss notice">×</button>
        </div>
      )}

      {error && (
        <div className={styles.errorBanner} role="alert">
          {error}
        </div>
      )}

      <Card title="Access matrix" subtitle="Effective platform privileges by role">
        <div className={styles.matrixWrap}>
          <table className={styles.matrix}>
            <thead>
              <tr>
                <th>PERMISSION</th>
                <th>KEY</th>
                <th>SUPERADMIN</th>
                <th>ADMIN</th>
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((perm) => (
                <tr key={perm.key}>
                  <td><strong>{perm.label}</strong></td>
                  <td><code className={styles.permCode}>{perm.key}</code></td>
                  <td><span className={styles.fullAccess}>✓ Full access</span></td>
                  <td><span className={styles.configurable}>✓ Configurable</span></td>
                </tr>
              ))}
              <tr>
                <td><strong>Admin &amp; RBAC management</strong></td>
                <td><code className={styles.permCode}>superadmin_only</code></td>
                <td><span className={styles.fullAccess}>✓ Full access</span></td>
                <td><span className={styles.noAccess}>No access</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Administrator accounts" subtitle={`${meta.total} users provisioned`}>
        <Table
          columns={columns}
          rows={admins}
          emptyMessage={loading ? "Loading administrators…" : "No administrator accounts found."}
        />
        {meta.last_page > 1 && (
          <div className={styles.pagination}>
            <span className={styles.mutedText}>
              Page {meta.page} of {meta.last_page} ({meta.total} total)
            </span>
            <div className={styles.pageButtons}>
              <Button size="small" variant="secondary" disabled={meta.page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <Button size="small" variant="secondary" disabled={meta.page >= meta.last_page} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Create Admin Modal */}
      <Modal
        open={createOpen}
        onClose={() => !createSaving && setCreateOpen(false)}
        title="Create administrator account"
        subtitle="Provision a new Barangay Santolan administrator account."
        icon={<Icon name="access" />}
        size="wide"
      >
        <form className={styles.modalForm} onSubmit={handleCreateSubmit} noValidate>
          {createErrorMsg && <div className={styles.errorBanner} role="alert">{createErrorMsg}</div>}

          <div className={styles.twoCol}>
            <Input
              label="Full name"
              placeholder="Pedro Reyes"
              value={createForm.name}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, name: event.target.value }))}
              error={createErrors.name}
            />
            <Input
              label="Email address"
              type="email"
              placeholder="pedro@esagip.gov.ph"
              value={createForm.email}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, email: event.target.value }))}
              error={createErrors.email}
            />
          </div>

          <div>
            <Input
              label="Temporary password"
              type="password"
              placeholder="Min. 8 characters with letters & numbers"
              value={createForm.password}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, password: event.target.value }))}
              error={createErrors.password}
            />
            <p className={styles.helperText}>
              At least 8 characters, including at least one letter and one number.
            </p>
          </div>

          <div className={styles.twoCol}>
            <Select
              label="Role"
              value={createForm.role}
              options={[
                { value: "admin", label: "Administrator" },
                { value: "superadmin", label: "Superadmin" },
              ]}
              onChange={(event) => {
                const nextRole = event.target.value;
                setCreateForm((prev) => ({
                  ...prev,
                  role: nextRole,
                  preset: nextRole === "superadmin" ? "super_administrator" : detectPreset("admin", prev.permissions),
                  permissions: nextRole === "superadmin" ? [...ALL_PERMISSION_KEYS] : prev.permissions,
                }));
              }}
            />
            <Select
              label="RBAC preset"
              value={createForm.preset}
              options={RBAC_PRESETS.map((p) => ({ value: p.id, label: p.label }))}
              onChange={(event) => applyCreatePreset(event.target.value)}
            />
          </div>

          <div className={styles.permCard}>
            <h4>Assigned permissions</h4>
            <div className={styles.permGrid}>
              {PERMISSIONS.map((perm) => {
                const checked = createForm.role === "superadmin" || createForm.permissions.includes(perm.key);
                return (
                  <label
                    key={perm.key}
                    className={`${styles.permItem} ${checked ? styles.permItemChecked : ""}`.trim()}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={createForm.role === "superadmin"}
                      onChange={() => toggleCreatePermission(perm.key)}
                    />
                    <span>
                      <strong>{perm.label}</strong>
                      <small>{perm.key}</small>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className={styles.modalActions}>
            <Button variant="secondary" disabled={createSaving} onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createSaving}>
              {createSaving ? "Creating…" : "Create administrator"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Manage Access Modal */}
      <Modal
        open={Boolean(manageTarget)}
        onClose={() => !manageSaving && setManageTarget(null)}
        title={manageTarget ? `Manage ${manageTarget.name}` : "Manage access"}
        subtitle="Configure role, account status, and workspace permissions."
        icon={<Icon name="access" />}
        size="wide"
      >
        {manageTarget && (
          <form className={styles.modalForm} onSubmit={handleManageSubmit} noValidate>
            {manageErrorMsg && <div className={styles.errorBanner} role="alert">{manageErrorMsg}</div>}

            <div className={styles.twoCol}>
              <Input
                label="Full name"
                value={manageForm.name}
                onChange={(event) => setManageForm((prev) => ({ ...prev, name: event.target.value }))}
              />
              <Select
                label="Account status"
                value={manageForm.is_active ? "active" : "disabled"}
                options={[
                  { value: "active", label: "Active" },
                  { value: "disabled", label: "Disabled" },
                ]}
                onChange={(event) =>
                  setManageForm((prev) => ({ ...prev, is_active: event.target.value === "active" }))
                }
              />
            </div>

            <div className={styles.twoCol}>
              <Select
                label="Role"
                value={manageForm.role}
                options={[
                  { value: "admin", label: "Administrator" },
                  { value: "superadmin", label: "Superadmin" },
                ]}
                onChange={(event) => {
                  const nextRole = event.target.value;
                  setManageForm((prev) => ({
                    ...prev,
                    role: nextRole,
                    preset: nextRole === "superadmin" ? "super_administrator" : detectPreset("admin", prev.permissions),
                    permissions: nextRole === "superadmin" ? [...ALL_PERMISSION_KEYS] : prev.permissions,
                  }));
                }}
              />
              <Select
                label="RBAC preset"
                value={manageForm.preset}
                options={RBAC_PRESETS.map((p) => ({ value: p.id, label: p.label }))}
                onChange={(event) => applyManagePreset(event.target.value)}
              />
            </div>

            <div className={styles.permCard}>
              <h4>Assigned permissions</h4>
              <div className={styles.permGrid}>
                {PERMISSIONS.map((perm) => {
                  const checked = manageForm.role === "superadmin" || manageForm.permissions.includes(perm.key);
                  return (
                    <label
                      key={perm.key}
                      className={`${styles.permItem} ${checked ? styles.permItemChecked : ""}`.trim()}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={manageForm.role === "superadmin"}
                        onChange={() => toggleManagePermission(perm.key)}
                      />
                      <span>
                        <strong>{perm.label}</strong>
                        <small>{perm.key}</small>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className={styles.modalActions}>
              <Button variant="secondary" disabled={manageSaving} onClick={() => setManageTarget(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={manageSaving}>
                {manageSaving ? "Updating…" : "Update access"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
