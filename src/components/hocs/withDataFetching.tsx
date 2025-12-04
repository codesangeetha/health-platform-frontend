import React, { useState, useEffect, useCallback } from 'react';

interface FetchConfig {
  service: any;
  method: string;
  params?: any[];
  transform?: (data: any) => any;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  key?: string;
}

interface FetchState {
  loading: boolean;
  error: string | null;
  data: any;
  lastFetched: Date | null;
}

interface WithDataFetchingState {
  [key: string]: FetchState;
}

export const withDataFetching = <P extends object>(
  WrappedComponent: React.ComponentType<P & any>,
  fetchConfigs: FetchConfig[]
) => {
  const WithDataFetchingComponent: React.FC<P> = ({ ...props }) => {
    const [fetchStates, setFetchStates] = useState<WithDataFetchingState>({});
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize fetch states
    useEffect(() => {
      if (!isInitialized) {
        const initialStates: WithDataFetchingState = {};
        fetchConfigs.forEach((fetchConfig, index) => {
          const key = fetchConfig.key || `fetch_${index}`;
          initialStates[key] = {
            loading: false,
            error: null,
            data: null,
            lastFetched: null
          };
        });
        setFetchStates(initialStates);
        setIsInitialized(true);
      }
    }, [fetchConfigs, isInitialized]);

    // Single fetch function
    const executeFetch = useCallback(async (config: FetchConfig, index: number) => {
      const key = config.key || `fetch_${index}`;
      
      try {
        // Update loading state
        setFetchStates(prev => ({
          ...prev,
          [key]: {
            ...prev[key],
            loading: true,
            error: null
          }
        }));

        // Execute the actual fetch
        const result = await config.service[config.method](...(config.params || []));
        
        // Handle async onSuccess
        let finalData = result;
        if (config.transform) {
          finalData = config.transform(result);
        }

        if (config.onSuccess) {
          const successResult = await config.onSuccess(finalData);
          if (successResult !== undefined) {
            finalData = successResult;
          }
        }
        
        // Update success state
        setFetchStates(prev => ({
          ...prev,
          [key]: {
            loading: false,
            error: null,
            data: finalData,
            lastFetched: new Date()
          }
        }));

        return finalData;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        
        // Update error state
        setFetchStates(prev => ({
          ...prev,
          [key]: {
            ...prev[key],
            loading: false,
            error: errorMessage,
            data: null
          }
        }));

        // Call error callback if provided
        config.onError?.(error instanceof Error ? error : new Error(errorMessage));
        
        throw error;
      }
    }, []);

    // Retry function for specific fetch
    const retryFetch = useCallback((index: number) => {
      return executeFetch(fetchConfigs[index], index);
    }, [executeFetch, fetchConfigs]);

    // Retry all fetches
    const retryAll = useCallback(() => {
      return Promise.all(
        fetchConfigs.map((fetchConfig, index) => 
          executeFetch(fetchConfig, index)
        )
      );
    }, [executeFetch, fetchConfigs]);

    // Execute all fetches on mount
    useEffect(() => {
      if (isInitialized) {
        fetchConfigs.forEach((fetchConfig, index) => {
          executeFetch(fetchConfig, index);
        });
      }
    }, [executeFetch, fetchConfigs, isInitialized]);

    // Check if any fetch is loading
    const isLoading = Object.values(fetchStates).some(state => state.loading);
    
    // Get combined error state
    const hasErrors = Object.values(fetchStates).some(state => state.error);

    // Create the data object for the wrapped component
    const enhancedData: any = {};
    fetchConfigs.forEach((fetchConfig, index) => {
      const key = fetchConfig.key || `fetch_${index}`;
      enhancedData[key] = fetchStates[key]?.data;
    });

    // Create retry functions object
    const retryFunctions: Record<string, () => void> = {};
    fetchConfigs.forEach((fetchConfig, index) => {
      const key = fetchConfig.key || `fetch_${index}`;
      retryFunctions[`retry${key.charAt(0).toUpperCase() + key.slice(1)}`] = () => retryFetch(index);
    });
    retryFunctions.retryAll = retryAll;

    // Create loading states object
    const loadingStates: Record<string, boolean> = {};
    fetchConfigs.forEach((fetchConfig, index) => {
      const key = fetchConfig.key || `fetch_${index}`;
      loadingStates[key] = fetchStates[key]?.loading || false;
    });

    // Create error states object
    const errorStates: Record<string, string | null> = {};
    fetchConfigs.forEach((fetchConfig, index) => {
      const key = fetchConfig.key || `fetch_${index}`;
      errorStates[key] = fetchStates[key]?.error || null;
    });

    // Filter out null errors for the main errors object
    const errorEntries = Object.entries(errorStates).filter(([_, error]) => error !== null);
    const errors: Record<string, string> = {};
    errorEntries.forEach(([key, error]) => {
      if (error !== null) {
        errors[key] = error as string;
      }
    });

    // Pass all necessary props to the wrapped component
    const enhancedProps: P & any = {
      ...props,
      data: enhancedData,
      loadingStates,
      errorStates,
      retryFunctions,
      isLoading,
      hasErrors,
      errors
    };

    return <WrappedComponent {...enhancedProps} />;
  };

  return WithDataFetchingComponent;
};