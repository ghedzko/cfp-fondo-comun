'use client';

import React, { Suspense, lazy, ComponentType } from 'react';
import { LoadingSpinner, CardSkeleton } from './loading-spinner';

// Types for lazy loading
type LazyComponentType = ComponentType<any>;

interface LazyWrapperProps {
  fallback?: 'spinner' | 'skeleton' | 'card' | React.ReactNode;
  errorBoundary?: boolean;
  loadingText?: string;
}

// HOC for lazy loading components
export function withLazyLoading<T extends object>(
  importFunc: () => Promise<{ default: ComponentType<T> }>,
  options: LazyWrapperProps = {}
) {
  const LazyComponent = lazy(importFunc);
  
  return function LazyWrapper(props: T) {
    const { 
      fallback = 'spinner', 
      errorBoundary = true,
      loadingText = 'Cargando componente...'
    } = options;

    // Render fallback based on type
    const renderFallback = () => {
      if (React.isValidElement(fallback)) {
        return fallback;
      }

      switch (fallback) {
        case 'skeleton':
          return <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>;
        case 'card':
          return <CardSkeleton />;
        case 'spinner':
        default:
          return <LoadingSpinner text={loadingText} />;
      }
    };

    const WrappedComponent = (
      <Suspense fallback={renderFallback()}>
        <LazyComponent {...props} />
      </Suspense>
    );

    // Add error boundary if requested
    if (errorBoundary) {
      return (
        <ErrorBoundary>
          {WrappedComponent}
        </ErrorBoundary>
      );
    }

    return WrappedComponent;
  };
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Error al cargar componente
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Hubo un problema al cargar este componente. Por favor, recarga la página.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Recargar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Utility function to create lazy components with default options
export const createLazyComponent = <T extends object>(
  importFunc: () => Promise<{ default: ComponentType<T> }>,
  loadingText?: string
) => {
  return withLazyLoading(importFunc, {
    fallback: 'spinner',
    errorBoundary: true,
    loadingText
  });
};

// Specific lazy loaders for common component types
export const createLazyDashboardCard = <T extends object>(
  importFunc: () => Promise<{ default: ComponentType<T> }>
) => {
  return withLazyLoading(importFunc, {
    fallback: 'card',
    errorBoundary: true,
    loadingText: 'Cargando tarjeta...'
  });
};

export const createLazyTable = <T extends object>(
  importFunc: () => Promise<{ default: ComponentType<T> }>
) => {
  return withLazyLoading(importFunc, {
    fallback: 'skeleton',
    errorBoundary: true,
    loadingText: 'Cargando tabla...'
  });
};

// Hook for dynamic imports with loading state
export function useLazyImport<T>(
  importFunc: () => Promise<T>,
  deps: React.DependencyList = []
) {
  const [state, setState] = React.useState<{
    loading: boolean;
    data: T | null;
    error: Error | null;
  }>({
    loading: false,
    data: null,
    error: null
  });

  React.useEffect(() => {
    let cancelled = false;
    
    setState({ loading: true, data: null, error: null });
    
    importFunc()
      .then(data => {
        if (!cancelled) {
          setState({ loading: false, data, error: null });
        }
      })
      .catch(error => {
        if (!cancelled) {
          setState({ loading: false, data: null, error });
        }
      });

    return () => {
      cancelled = true;
    };
  }, deps);

  return state;
}
