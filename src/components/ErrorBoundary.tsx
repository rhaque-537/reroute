"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="px-5 py-8">
          <div className="bg-navy-light border border-navy-lighter rounded-2xl p-6 text-center">
            <p className="text-gray-400 text-sm mb-2">Something went wrong loading this section.</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="text-teal text-sm font-semibold hover:underline min-h-[44px]"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
