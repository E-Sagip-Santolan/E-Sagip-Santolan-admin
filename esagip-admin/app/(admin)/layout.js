import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import styles from "./layout.module.css";

export default function AdminLayout({ children }) {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.main}>
        <Header />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
