import AuthGuard, { PermissionGate } from "@/components/AuthGuard";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import styles from "./layout.module.css";

export default function AdminLayout({ children }) {
  return (
    <AuthGuard>
      <div className={styles.shell}>
        <Sidebar />
        <div className={styles.main}>
          <Header />
          <main className={styles.content}>
            <PermissionGate>{children}</PermissionGate>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
