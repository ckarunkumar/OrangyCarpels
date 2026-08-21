import { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-md mx-auto mt-16 bg-white border border-studio-border rounded-lg p-6 text-center space-y-4 font-sans">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-studio-text">Something went wrong</h3>
            <p className="text-[12px] text-studio-muted mt-1 leading-relaxed">
              An unexpected error occurred in this view.
            </p>
            {this.state.error && (
              <pre className="text-[10px] text-red-700 bg-red-50 border border-red-100 p-2 rounded text-left overflow-x-auto max-h-32 mt-3 font-mono">
                {this.state.error.message}
              </pre>
            )}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-brand-orange text-white rounded text-[12px] font-semibold hover:bg-opacity-95 transition-colors"
          >
            Reload application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
