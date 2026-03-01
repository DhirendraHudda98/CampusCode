import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, fontFamily: "monospace", color: "#dc2626" }}>
          <h2>App crashed — open browser DevTools (F12) for details:</h2>
          <pre style={{ whiteSpace: "pre-wrap", background: "#fef2f2", padding: 16, borderRadius: 8 }}>
            {this.state.error.message}
            {"\n\n"}{this.state.error.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
