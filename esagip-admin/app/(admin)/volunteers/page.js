"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Card from "@/components/Card";
import Icon from "@/components/Icon";
import Modal from "@/components/Modal";
import Select from "@/components/Select";
import Table from "@/components/Table";
import {
  approveVolunteer,
  getSkills,
  getVolunteers,
  getVolunteersSummary,
  rejectVolunteer,
} from "@/lib/api";
import {
  calculateAge,
  formatAvailability,
  formatDate,
  formatDateTime,
  getInitials,
} from "@/lib/rbac";
import styles from "./page.module.css";

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const AVAILABILITY_OPTIONS = [
  { value: "", label: "All availability" },
  { value: "available", label: "Available" },
  { value: "unavailable", label: "Unavailable" },
  { value: "on_operation", label: "On Operation" },
];

function statusVariant(status) {
  if (status === "approved") return "success";
  if (status === "pending") return "warning";
  if (status === "rejected") return "danger";
  return "neutral";
}

function statusLabel(status) {
  if (!status) return "—";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function VolunteersPage() {
  const { setPendingVolunteerCount, refreshPendingCount } = useAuth();
  const [summary, setSummary] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [skills, setSkills] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [meta, setMeta] = useState({ page: 1, per_page: 10, total: 0, last_page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Filters
  const [status, setStatus] = useState("");
  const [skill, setSkill] = useState("");
  const [availability, setAvailability] = useState("");
  const [addressArea, setAddressArea] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Selected volunteer for Review Modal or Detail Drawer
  const [reviewTarget, setReviewTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all([getVolunteersSummary(), getSkills()])
      .then(([sumRes, skillsRes]) => {
        if (!active) return;
        if (sumRes?.data) {
          setSummary(sumRes.data);
          if (typeof sumRes.data.pending === "number") {
            setPendingVolunteerCount(sumRes.data.pending);
          }
        }
        if (Array.isArray(skillsRes?.data)) setSkills(skillsRes.data);
      })
      .catch(() => {
        // Handled gracefully by list fetch error banner if API is unreachable
      });
    return () => {
      active = false;
    };
  }, [reloadTick, setPendingVolunteerCount]);

  useEffect(() => {
    let active = true;
    getVolunteers({
      status,
      skill,
      availability,
      address_area: addressArea,
      search,
      page,
      per_page: 10,
    })
      .then((res) => {
        if (!active) return;
        setVolunteers(Array.isArray(res?.data) ? res.data : []);
        if (res?.meta) setMeta(res.meta);
        setError("");
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load volunteers.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [status, skill, availability, addressArea, search, page, reloadTick]);

  useEffect(() => {
    if (!detailTarget) return undefined;
    function onKeyDown(event) {
      if (event.key === "Escape") setDetailTarget(null);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [detailTarget]);

  function openReview(volunteer) {
    setDetailTarget(null);
    setReviewTarget(volunteer);
    setRejectionReason("");
    setActionError("");
  }

  async function handleApprove() {
    if (!reviewTarget) return;
    setActionLoading(true);
    setActionError("");
    try {
      await approveVolunteer(reviewTarget.id);
      setNotice(`${reviewTarget.name} has been approved.`);
      setReviewTarget(null);
      setLoading(true);
      setReloadTick((t) => t + 1);
      refreshPendingCount();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to approve volunteer.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject() {
    if (!reviewTarget) return;
    if (rejectionReason.trim().length > 255) {
      setActionError("Rejection reason must be 255 characters or fewer.");
      return;
    }
    setActionLoading(true);
    setActionError("");
    try {
      await rejectVolunteer(reviewTarget.id, rejectionReason);
      setNotice(`${reviewTarget.name} has been rejected.`);
      setReviewTarget(null);
      setLoading(true);
      setReloadTick((t) => t + 1);
      refreshPendingCount();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to reject volunteer.");
    } finally {
      setActionLoading(false);
    }
  }

  const skillOptions = [
    { value: "", label: "All skills" },
    ...skills.map((item) => ({ value: String(item.id), label: item.name })),
  ];

  const columns = [
    {
      key: "name",
      label: "VOLUNTEER",
      render: (_, row) => (
        <div className={styles.volunteerCell}>
          <span className={styles.avatar}>{getInitials(row.name)}</span>
          <div>
            <strong>{row.name}</strong>
            <small>{row.email}</small>
          </div>
        </div>
      ),
    },
    {
      key: "skills",
      label: "SKILLS",
      render: (list) => (
        <div className={styles.skillList}>
          {(list || []).slice(0, 3).map((item) => (
            <span key={item.id || item.name} className={styles.skillChip}>{item.name}</span>
          ))}
          {list && list.length > 3 && (
            <span className={styles.skillChip}>+{list.length - 3}</span>
          )}
        </div>
      ),
    },
    {
      key: "availability",
      label: "AVAILABILITY",
      render: (val) => <Badge variant="neutral">{formatAvailability(val)}</Badge>,
    },
    {
      key: "status",
      label: "ACCOUNT STATUS",
      render: (val) => <Badge variant={statusVariant(val)}>{statusLabel(val)}</Badge>,
    },
    {
      key: "created_at",
      label: "REGISTERED",
      render: (val) => <span className={styles.mutedText}>{formatDateTime(val)}</span>,
    },
    {
      key: "actions",
      label: "ACTIONS",
      render: (_, row) => (
        <div className={styles.rowActions}>
          {row.status === "pending" && (
            <Button size="small" variant="primary" onClick={() => openReview(row)}>
              Review
            </Button>
          )}
          <Button size="small" variant="secondary" onClick={() => setDetailTarget(row)}>
            View profile
          </Button>
        </div>
      ),
    },
  ];

  const startItem = meta.total === 0 ? 0 : (meta.page - 1) * meta.per_page + 1;
  const endItem = Math.min(meta.total, meta.page * meta.per_page);
  const pageNumbers = Array.from({ length: Math.max(1, meta.last_page) }, (_, i) => i + 1);

  return (
    <div className={styles.page}>
      <div className={styles.headerBlock}>
        <h1>Volunteer account approval</h1>
        <p>Review applications, search the roster, and filter by skills, area, and availability.</p>
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

      <div className={styles.summaryGrid}>
        <Card className={styles.summaryCard}>
          <div className={styles.summaryRow}>
            <span className={`${styles.summaryIcon} ${styles.blue}`}><Icon name="users" /></span>
            <div>
              <span className={styles.summaryLabel}>Registered volunteers</span>
              <strong className={styles.summaryValue}>{summary.total}</strong>
              <small className={styles.summaryNote}>Live system total</small>
            </div>
          </div>
        </Card>
        <Card className={styles.summaryCard}>
          <div className={styles.summaryRow}>
            <span className={`${styles.summaryIcon} ${styles.green}`}><Icon name="check" /></span>
            <div>
              <span className={styles.summaryLabel}>Approved accounts</span>
              <strong className={styles.summaryValue}>{summary.approved}</strong>
              <small className={styles.summaryNote}>Active volunteers</small>
            </div>
          </div>
        </Card>
        <Card className={styles.summaryCard}>
          <div className={styles.summaryRow}>
            <span className={`${styles.summaryIcon} ${styles.orange}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
            </span>
            <div>
              <span className={styles.summaryLabel}>Pending approval</span>
              <strong className={styles.summaryValue}>{summary.pending}</strong>
              <small className={styles.summaryNote}>{summary.rejected} rejected</small>
            </div>
          </div>
        </Card>
      </div>

      <Card className={styles.tableCard}>
        <div className={styles.toolbar}>
          <div className={styles.tabs} role="tablist" aria-label="Filter by status">
            {STATUS_TABS.map((tab) => {
              const countKey = tab.value || "total";
              const tabCount = summary[countKey] ?? 0;
              return (
                <button
                  key={tab.value || "all"}
                  type="button"
                  role="tab"
                  aria-selected={status === tab.value}
                  className={`${styles.tab} ${status === tab.value ? styles.tabActive : ""}`.trim()}
                  onClick={() => {
                    setStatus(tab.value);
                    setPage(1);
                  }}
                >
                  <span>{tab.label}</span>
                  <span className={styles.tabCount}>{tabCount}</span>
                </button>
              );
            })}
          </div>

          <div className={styles.filters}>
            <input
              type="search"
              className={styles.filterInput}
              placeholder="Search name, email, contact…"
              aria-label="Search volunteers"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
            <input
              type="text"
              className={styles.filterInput}
              placeholder="Filter area (e.g. Zone 1)"
              aria-label="Filter by address area"
              value={addressArea}
              onChange={(event) => {
                setAddressArea(event.target.value);
                setPage(1);
              }}
            />
            <Select
              aria-label="Filter by skill"
              options={skillOptions}
              value={skill}
              onChange={(event) => {
                setSkill(event.target.value);
                setPage(1);
              }}
            />
            <Select
              aria-label="Filter by availability"
              options={AVAILABILITY_OPTIONS}
              value={availability}
              onChange={(event) => {
                setAvailability(event.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <Table
          columns={columns}
          rows={volunteers}
          emptyMessage={loading ? "Loading volunteers…" : "No volunteers match the selected filters."}
        />

        <div className={styles.pagination}>
          <span className={styles.paginationText}>
            Showing {startItem}–{endItem} of {meta.total} volunteers
          </span>
          <div className={styles.pageButtons}>
            <button
              type="button"
              className={styles.pageBtn}
              disabled={meta.page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            {pageNumbers.map((num) => (
              <button
                key={num}
                type="button"
                className={`${styles.pageBtn} ${num === meta.page ? styles.pageBtnActive : ""}`.trim()}
                onClick={() => setPage(num)}
                disabled={loading}
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              className={styles.pageBtn}
              disabled={meta.page >= meta.last_page || loading}
              onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </Card>

      {/* Volunteer Application Review Modal */}
      <Modal
        open={Boolean(reviewTarget)}
        onClose={() => !actionLoading && setReviewTarget(null)}
        title="Volunteer application review"
        subtitle="Verify Santolan residency, age eligibility (18+), and profile details."
        icon={<Icon name="users" />}
        size="wide"
      >
        {reviewTarget && (
          <div className={styles.reviewLayout}>
            <div className={styles.eligibilityCard}>
              <span className={styles.eligibilityHeader}>AUTHORIZED BARANGAY SANTOLAN DRRMO REVIEW ONLY</span>
              <strong className={styles.eligibilityTag}>SANTOLAN</strong>
              <div className={styles.eligibilityBottom}>
                <div className={styles.eligibilityAvatar}>{getInitials(reviewTarget.name)}</div>
                <div>
                  <small>ELIGIBILITY &amp; CONSENT SUMMARY</small>
                  <h3>{reviewTarget.name}</h3>
                  <p>
                    {reviewTarget.is_resident ? "Santolan resident" : "Non-resident"} ·{" "}
                    {calculateAge(reviewTarget.birthdate) !== null
                      ? `Age ${calculateAge(reviewTarget.birthdate)}`
                      : "Age N/A"}{" "}
                    · Consent accepted
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.reviewDetails}>
              <span className={styles.detailEyebrow}>SUBMISSION DETAILS</span>
              <h3 className={styles.reviewName}>{reviewTarget.name}</h3>
              <p className={styles.reviewEmail}>{reviewTarget.email}</p>

              <dl className={styles.detailList}>
                <div><dt>Contact</dt><dd>{reviewTarget.contact_number || "—"}</dd></div>
                <div><dt>Address / Area</dt><dd>{reviewTarget.address_area || "—"}</dd></div>
                <div>
                  <dt>Birthdate</dt>
                  <dd>
                    {formatDate(reviewTarget.birthdate)}
                    {calculateAge(reviewTarget.birthdate) !== null ? ` (${calculateAge(reviewTarget.birthdate)} yrs)` : ""}
                  </dd>
                </div>
                <div><dt>Availability</dt><dd>{formatAvailability(reviewTarget.availability)}</dd></div>
                <div><dt>Skills</dt><dd>{(reviewTarget.skills || []).map((s) => s.name).join(", ") || "—"}</dd></div>
                <div><dt>Training</dt><dd>{reviewTarget.training || "None listed"}</dd></div>
              </dl>

              <label className={styles.reasonLabel} htmlFor="rejection-reason">
                REJECTION REASON / REVIEW NOTE ({rejectionReason.length}/255)
              </label>
              <textarea
                id="rejection-reason"
                className={styles.textarea}
                rows={3}
                maxLength={255}
                placeholder="Optional reason when rejecting (max 255 characters)"
                value={rejectionReason}
                onChange={(event) => setRejectionReason(event.target.value)}
              />

              <div className={styles.privacyCallout}>
                <strong>Protected personal information</strong>
                <p>Contact details (email, phone, address) are restricted to authorized DRRMO admins.</p>
              </div>

              {actionError && <p className={styles.actionError} role="alert">{actionError}</p>}

              <div className={styles.reviewActions}>
                <Button variant="danger" disabled={actionLoading} onClick={handleReject}>
                  {actionLoading ? "Saving…" : "Reject volunteer"}
                </Button>
                <Button
                  variant="success"
                  disabled={actionLoading}
                  leadingIcon={<Icon name="check" className={styles.btnIcon} />}
                  onClick={handleApprove}
                >
                  {actionLoading ? "Saving…" : "Approve volunteer"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Volunteer Detail Panel Slide-over Drawer */}
      {detailTarget && (
        <div
          className={styles.drawerOverlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDetailTarget(null);
          }}
        >
          <aside className={styles.drawer} role="dialog" aria-modal="true" aria-label="Volunteer details">
            <header className={styles.drawerHeader}>
              <div>
                <span className={styles.detailEyebrow}>VOLUNTEER PROFILE</span>
                <h2>Volunteer details</h2>
              </div>
              <button
                type="button"
                className={styles.drawerClose}
                onClick={() => setDetailTarget(null)}
                aria-label="Close panel"
              >
                ×
              </button>
            </header>

            <div className={styles.drawerBody}>
              <div className={styles.drawerHero}>
                <span className={styles.drawerAvatar}>{getInitials(detailTarget.name)}</span>
                <div>
                  <h3>{detailTarget.name}</h3>
                  <p>{detailTarget.email} · ID #{detailTarget.id}</p>
                  <div className={styles.drawerBadges}>
                    <Badge variant={statusVariant(detailTarget.status)}>{statusLabel(detailTarget.status)}</Badge>
                    <Badge variant="neutral">{formatAvailability(detailTarget.availability)}</Badge>
                    {detailTarget.is_resident && <Badge variant="primary">Santolan Resident</Badge>}
                  </div>
                </div>
              </div>

              <div className={styles.drawerSection}>
                <h4>CONTACT &amp; PROFILE</h4>
                <dl className={styles.drawerList}>
                  <div><dt>Contact number</dt><dd>{detailTarget.contact_number || "—"}</dd></div>
                  <div><dt>Address / Area</dt><dd>{detailTarget.address_area || "—"}</dd></div>
                  <div>
                    <dt>Birthdate</dt>
                    <dd>
                      {formatDate(detailTarget.birthdate)}
                      {calculateAge(detailTarget.birthdate) !== null ? ` (${calculateAge(detailTarget.birthdate)} yrs)` : ""}
                    </dd>
                  </div>
                  <div><dt>Training</dt><dd>{detailTarget.training || "None listed"}</dd></div>
                  <div><dt>Registered</dt><dd>{formatDateTime(detailTarget.created_at)}</dd></div>
                </dl>
              </div>

              <div className={styles.drawerSection}>
                <h4>SKILLS &amp; CERTIFICATIONS</h4>
                <div className={styles.skillList}>
                  {(detailTarget.skills || []).length ? (
                    detailTarget.skills.map((item) => (
                      <span key={item.id || item.name} className={styles.skillChipBlue}>
                        {item.name}
                      </span>
                    ))
                  ) : (
                    <span className={styles.mutedText}>No skills listed</span>
                  )}
                </div>
              </div>

              <div className={`${styles.verifyBox} ${detailTarget.status === "rejected" ? styles.verifyBoxDanger : ""}`.trim()}>
                <div>
                  <strong>
                    {detailTarget.status === "approved" && "Eligibility & consent verified"}
                    {detailTarget.status === "pending" && "Pending administrator review"}
                    {detailTarget.status === "rejected" && "Application rejected"}
                  </strong>
                  <p>
                    {detailTarget.status === "approved" &&
                      `Approved on ${formatDateTime(detailTarget.approved_at)}`}
                    {detailTarget.status === "pending" &&
                      "Awaiting approval by an authorized Barangay Santolan administrator."}
                    {detailTarget.status === "rejected" &&
                      (detailTarget.rejection_reason || "No rejection reason provided.")}
                  </p>
                </div>
                <Badge variant={statusVariant(detailTarget.status)}>{statusLabel(detailTarget.status)}</Badge>
              </div>
            </div>

            <footer className={styles.drawerFooter}>
              <Button variant="secondary" onClick={() => setDetailTarget(null)}>Close</Button>
              {detailTarget.status === "pending" && (
                <>
                  <Button variant="danger" onClick={() => openReview(detailTarget)}>Reject</Button>
                  <Button variant="success" onClick={() => openReview(detailTarget)}>Approve</Button>
                </>
              )}
            </footer>
          </aside>
        </div>
      )}
    </div>
  );
}
