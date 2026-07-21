import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, Button } from "./components";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error boundary catch:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: "grid", justifyContent: "center", alignItems: "center", minHeight: "60vh", padding: 20, background: "var(--wash-a)" }}>
          <Card style={{ maxWidth: 460, border: "2px solid var(--danger)", boxShadow: "var(--shadow-pop)", textAlign: "center" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--danger)", margin: "0 0 10px" }}>
              ⚠️ Application Error Occurred
            </h2>
            <p style={{ fontSize: 14.5, color: "var(--ink)", margin: "0 0 14px", lineHeight: 1.6 }}>
              Something went wrong. Let's try reloading the workspace.
              <br />
              <strong style={{ color: "var(--indigo)" }}>
                (ఏదో తప్పు జరిగింది. దయచేసి మళ్లీ ప్రయత్నించండి)
              </strong>
            </p>

            {this.state.error && (
              <pre style={{
                background: "rgba(217, 58, 58, 0.05)",
                border: "1px solid var(--line)",
                borderRadius: "10px",
                padding: 10,
                fontSize: 12,
                color: "var(--danger)",
                overflowX: "auto",
                textAlign: "left",
                margin: "0 0 16px",
                whiteSpace: "pre-wrap"
              }}>
                {this.state.error.toString()}
              </pre>
            )}

            <Button type="button" onClick={this.handleReset} style={{ width: "100%", background: "var(--danger)" }}>
              Reset & Reload Workspace
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
