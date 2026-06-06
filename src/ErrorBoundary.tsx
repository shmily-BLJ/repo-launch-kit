import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

type ErrorBoundaryState = {
  hasError: boolean;
  message: string;
};

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message || "界面渲染失败" };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Repo Launch Kit UI error", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="app-shell error-shell">
        <div className="fatal-panel">
          <AlertTriangle />
          <h1>界面刚才崩了一下</h1>
          <p>{this.state.message}</p>
          <button type="button" onClick={() => window.location.reload()}>
            刷新页面
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
