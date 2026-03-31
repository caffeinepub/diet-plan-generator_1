import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { InternetIdentityProvider } from "./hooks/useInternetIdentity";
import "./index.css";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(135deg, #0d0520 0%, #1a0533 35%, #2d1066 70%, #4c1d95 100%)",
            fontFamily: "sans-serif",
            padding: "2rem",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.07)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "1.5rem",
              padding: "3rem 2.5rem",
              textAlign: "center",
              maxWidth: "420px",
              width: "100%",
              boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>⚠️</div>
            <h2
              style={{
                color: "#fff",
                fontSize: "1.4rem",
                fontWeight: 800,
                marginBottom: "0.75rem",
              }}
            >
              Something went wrong
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.65)",
                fontSize: "0.95rem",
                marginBottom: "2rem",
                lineHeight: 1.6,
              }}
            >
              Please refresh the page to try again. If the problem persists,
              clear your browser cache.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                color: "#fff",
                border: "none",
                borderRadius: "0.75rem",
                padding: "0.85rem 2.5rem",
                fontSize: "1rem",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(124,58,237,0.5)",
              }}
            >
              🔄 Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <InternetIdentityProvider>
        <App />
      </InternetIdentityProvider>
    </QueryClientProvider>
  </ErrorBoundary>,
);
