'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      const { error, errorInfo } = this.state;
      
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={error!} reset={() => this.setState({ hasError: false })} />;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg border border-red-200 p-6">
            <div className="text-center mb-6">
              <div className="text-red-600 text-6xl mb-4">💥</div>
              <h1 className="text-2xl font-bold text-red-800 mb-2">
                Application Error
              </h1>
              <p className="text-red-600 mb-4">
                Something went wrong while loading the application.
              </p>
            </div>

            <div className="space-y-4">
              <details className="bg-gray-50 p-4 rounded border">
                <summary className="cursor-pointer font-medium text-gray-700">
                  Error Details
                </summary>
                <div className="mt-3 text-sm">
                  <p><strong>Error:</strong> {error?.message}</p>
                  <p><strong>Stack:</strong></p>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
                    {error?.stack}
                  </pre>
                </div>
              </details>

              {errorInfo && (
                <details className="bg-gray-50 p-4 rounded border">
                  <summary className="cursor-pointer font-medium text-gray-700">
                    Component Stack
                  </summary>
                  <pre className="mt-3 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                    {errorInfo.componentStack}
                  </pre>
                </details>
              )}

              <div className="bg-blue-50 p-4 rounded border border-blue-200">
                <h3 className="font-medium text-blue-800 mb-2">Troubleshooting Steps:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Try refreshing the page</li>
                  <li>• Clear your browser cache</li>
                  <li>• Check the browser console for more details</li>
                  <li>• Contact support if the problem persists</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3 mt-6 justify-center">
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Reload Page
              </button>
              <button 
                onClick={() => this.setState({ hasError: false })} 
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}