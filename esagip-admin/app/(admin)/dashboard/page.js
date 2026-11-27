import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Card from "@/components/Card";
import ServerStatusCard from "@/components/ServerStatusCard";
import Link from "next/link";
import styles from "./page.module.css";

const metrics = [
  { label: "Verified volunteers", value: "3", icon: "volunteer", tone: "blue" },
  { label: "Pending ID reviews", value: "2", icon: "clock", tone: "orange" },
  { label: "Active operations today", value: "2", icon: "briefcase", tone: "blue" },
  { label: "Volunteer hours logged", value: "1", icon: "check", tone: "green" },
];

const operations = [
  { name: "Flood Relief Distribution", location: "Santolan Covered Court", date: "Jun 18, 2025, 8:00 AM", status: "Cancelled" },
  { name: "Community Evacuation Drill", location: "Santolan Elementary School", date: "Jun 21, 2025, 7:30 AM", status: "Scheduled" },
  { name: "Post-Flood Medical Mission", location: "Barangay Health Center", date: "Jun 22, 2025, 9:00 AM", status: "Scheduled" },
];

function MetricIcon({ type, tone }) {
  const paths = {
    volunteer: <><circle cx="9" cy="8" r="3" /><path d="M3.5 19v-1.5a5.5 5.5 0 0 1 11 0V19M17 8v6m-3-3h6" /></>,
    clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3 2" /></>,
    briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M3 12h18m-11 0v2h4v-2" /></>,
    check: <path d="m5 12 4.5 4.5L19 7" />,
  };

  return (
    <span className={`${styles.metricIcon} ${styles[tone]}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        {paths[type]}
      </svg>
    </span>
  );
}

export default function DashboardPage() {
  return (
    <div className={styles.dashboard}>
      <div className={styles.sectionLabel}>COMMAND OVERVIEW</div>
      <div className={styles.welcomeRow}>
        <div>
          <h1>Mabuhay, Admin!</h1>
          <p>Here&apos;s the current response picture for Barangay Santolan.</p>
        </div>
        <Button leadingIcon={<span aria-hidden="true">＋</span>}>Create operation</Button>
      </div>

      <section className={styles.quickActions} aria-label="Quick actions">
        <h2>QUICK ACTIONS</h2>
        <div className={styles.quickActionList}>
          <Link href="/operations"><span className={`${styles.actionIcon} ${styles.blue}`}>＋</span><span><strong>Create operation</strong><small>Schedule a response</small></span></Link>
          <Link href="/attendance"><span className={`${styles.actionIcon} ${styles.green}`}>✓</span><span><strong>Attendance console</strong><small>Open duty console</small></span></Link>
          <Link href="/volunteers"><span className={`${styles.actionIcon} ${styles.orange}`}>♙</span><span><strong>Review pending IDs</strong><small>2 awaiting review</small></span></Link>
          <Link href="/community"><span className={`${styles.actionIcon} ${styles.red}`}>⚑</span><span><strong>Post advisory</strong><small>Notify the community</small></span></Link>
        </div>
      </section>

      <Card className={styles.advisory} title="Orange Rainfall Warning" action={<Link href="/community" className={styles.textLink}>View advisory</Link>}>
        <p>Moderate to heavy rainfall is expected within the next three hours. Residents near waterways should remain alert and prepare emergency kits.</p>
      </Card>

      <div className={styles.metricGrid}>
        {metrics.map((metric) => (
          <Card key={metric.label} className={styles.metricCard}>
            <MetricIcon type={metric.icon} tone={metric.tone} />
            <p className={styles.metricLabel}>{metric.label}</p>
            <strong className={styles.metricValue}>{metric.value}</strong>
            <span className={styles.metricFootnote}><Badge variant="success">LIVE</Badge> Payload data</span>
          </Card>
        ))}
      </div>

      <ServerStatusCard />

      <Card title="Operation readiness" subtitle="Volunteer capacity across current operations" action={<Link href="/operations" className={styles.textLink}>Manage operations</Link>}>
        <div className={styles.readinessList}>
          <div><div><strong>Community Evacuation Drill</strong><span>3 of 50 joined</span></div><div className={styles.progress}><i style={{ width: "9%" }} /></div></div>
          <div><div><strong>Post-Flood Medical Mission</strong><span>2 of 25 joined</span></div><div className={styles.progress}><i style={{ width: "12%" }} /></div></div>
        </div>
      </Card>

      <Card title="Approval queue" subtitle="New volunteer accounts awaiting review" action={<Link href="/volunteers" className={styles.textLink}>Review all</Link>}>
        <div className={styles.approvalList}>
          <div><span className={styles.avatar}>CM</span><span><strong>Carla Mendoza</strong><small>Relief, Encoding</small></span><Badge variant="success">Ready</Badge></div>
          <div><span className={styles.avatar}>AR</span><span><strong>Ana Reyes</strong><small>Medical, Counseling</small></span><Badge variant="success">Ready</Badge></div>
        </div>
      </Card>

      <Card title="Operations status" subtitle="Current response activities and sign-up capacity" action={<Link href="/operations" className={styles.textLink}>View all</Link>}>
        <div className={styles.operationList}>
          {operations.map((operation) => (
            <div className={styles.operationRow} key={operation.name}>
              <span className={styles.operationIcon} aria-hidden="true">▣</span>
              <span className={styles.operationName}><strong>{operation.name}</strong><small>{operation.location}</small></span>
              <span className={styles.operationDate}>{operation.date}</span>
              <Badge variant={operation.status === "Cancelled" ? "danger" : "warning"}>{operation.status}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
