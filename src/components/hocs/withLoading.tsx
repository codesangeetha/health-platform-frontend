import React from 'react';

interface LoadingStates {
  [key: string]: boolean;
}

interface ErrorStates {
  [key: string]: string | null;
}

interface RetryFunctions {
  [key: string]: () => void;
}

interface WithLoadingProps {
  loadingStates: LoadingStates;
  errorStates?: ErrorStates;
  retryFunctions?: RetryFunctions;
  children: React.ReactNode;
}

export const withLoading = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  const WithLoadingComponent: React.FC<P & WithLoadingProps> = ({
    loadingStates,
    errorStates,
    retryFunctions,
    children,
    ...props
  }) => {
    const isLoading = loadingStates && Object.values(loadingStates).some(loading => loading);
    const hasErrors = errorStates && Object.values(errorStates).some(error => error);

    if (isLoading) {
      return (
        <div className="pd-card" style={{ textAlign: 'center', padding: '40px' }}>
          <div>Loading dashboard data...</div>
        </div>
      );
    }

    if (hasErrors && errorStates) {
      const errorMessages = Object.values(errorStates || {}).filter(error => error);
      const hasRetryFunctions = retryFunctions && Object.keys(retryFunctions).length > 0;

      return (
        <div 
          className="pd-card" 
          style={{
            textAlign: 'center',
            padding: '40px',
            borderColor: '#dc3545',
            color: '#dc3545'
          }}
        >
          <div>Error: {errorMessages[0]}</div>
          {hasRetryFunctions && (
            <button
              onClick={() => {
                // Retry the first available retry function
                if (retryFunctions) {
                  const firstRetryKey = Object.keys(retryFunctions)[0];
                  retryFunctions[firstRetryKey]();
                }
              }}
              style={{
                marginTop: '16px',
                padding: '8px 16px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          )}
        </div>
      );
    }

    return <WrappedComponent {...(props as P)}>{children}</WrappedComponent>;
  };

  return WithLoadingComponent;
};