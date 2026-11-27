import Badge from "@/components/Badge";
import Card from "@/components/Card";
import styles from "./PagePlaceholder.module.css";

export default function PagePlaceholder({ title, description, section }) {
  return (
    <div className={styles.page}>
      <div className={styles.sectionLabel}>{section}</div>
      <div className={styles.heading}>
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <Badge variant="primary">Coming soon</Badge>
      </div>
      <Card title={`${title} workspace`} subtitle="This section is ready for its next feature." className={styles.placeholder}>
        <p>Use this workspace to manage {title.toLowerCase()} for Barangay Santolan. Feature tools and connected data will appear here as they are added.</p>
      </Card>
    </div>
  );
}
