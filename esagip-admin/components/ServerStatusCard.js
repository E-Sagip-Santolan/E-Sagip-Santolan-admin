"use client";

import { useEffect, useState } from "react";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Card from "@/components/Card";
import { getHealth } from "@/lib/api";
import styles from "./ServerStatusCard.module.css";

export default function ServerStatusCard() {
  const [state, setState] = useState({ status: "waiting", error: "" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;

    getHealth()
      .then(() => {
        if (active) setState({ status: "connected", error: "" });
      })
      .catch((error) => {
        if (active) {
          setState({
            status: "error",
            error: error instanceof Error ? error.message : "The server health check failed.",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  const statusLabel = {
    waiting: "Waiting",
    connected: "Connected",
    error: "Error",
  }[state.status];

  return (
    <Card
      title="Server status"
      subtitle="Live connection to the E-Sagip API"
      action={<Badge variant={state.status === "connected" ? "success" : state.status === "error" ? "danger" : "neutral"}>{statusLabel}</Badge>}
    >
      <div className={styles.content}>
        <span className={`${styles.indicator} ${styles[state.status]}`} aria-hidden="true" />
        <p aria-live="polite">
          {state.status === "waiting" && "Checking server connection…"}
          {state.status === "connected" && "The health endpoint responded successfully."}
          {state.status === "error" && state.error}
        </p>
        {state.status === "error" && (
          <Button
            size="small"
            variant="secondary"
            onClick={() => {
              setState({ status: "waiting", error: "" });
              setAttempt((current) => current + 1);
            }}
          >
            Try again
          </Button>
        )}
      </div>
    </Card>
  );
}
