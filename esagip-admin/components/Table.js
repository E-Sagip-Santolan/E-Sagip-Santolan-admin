import styles from "./Table.module.css";

export default function Table({ columns = [], rows = [], emptyMessage = "No records to display." }) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length ? rows.map((row, rowIndex) => (
            <tr key={row.id ?? rowIndex}>
              {columns.map((column) => (
                <td key={column.key}>
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
            </tr>
          )) : (
            <tr><td className={styles.empty} colSpan={Math.max(columns.length, 1)}>{emptyMessage}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
