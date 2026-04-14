import React from 'react';

interface SerializedError {
  message: string;
  stack?: string;
}

const serializeError = (error: unknown): SerializedError => {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
    };
  }
  return { message: JSON.stringify(error, null, 2) };
};

interface ErrorBoundaryState {
  hasError: boolean;
  error: SerializedError | null;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { hasError: true, error: serializeError(error) };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-red-500 rounded">
          <h2 className="text-red-500">Something went wrong.</h2>
          <pre className="mt-2 text-sm">
            {this.state.error?.message}
            {this.state.error?.stack && `\n${this.state.error.stack}`}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}