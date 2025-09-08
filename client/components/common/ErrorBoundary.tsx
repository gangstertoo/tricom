import React from "react";

export class ErrorBoundary extends React.Component<
  { fallback?: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: any) {
    console.error("UI Error:", error, info);
  }
  render() {
    if (this.state.error) {
      return (
        this.props.fallback || (
          <div className="p-6 text-sm text-destructive">
            <div className="font-semibold">Something went wrong.</div>
            <pre className="mt-2 whitespace-pre-wrap">
              {this.state.error.message}
            </pre>
          </div>
        )
      );
    }
    return this.props.children as any;
  }
}
