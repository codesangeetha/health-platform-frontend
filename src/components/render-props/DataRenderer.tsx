import React, { useState, useEffect } from 'react';

// Generic data fetching render prop component
interface DataRendererProps<T> {
  service: {
    getData: (...params: any[]) => Promise<T>;
  };
  params?: any[];
  children: (data: {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
  }) => React.ReactNode;
  fallback?: React.ReactNode;
}

export const DataRenderer = <T,>({
  service,
  params = [],
  children,
  fallback = <div>Loading...</div>
}: DataRendererProps<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await service.getData(...params);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading && !data) {
    return <>{fallback}</>;
  }

  if (error && !data) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: '#dc3545' }}>
        <p>Error: {error}</p>
        <button onClick={fetchData} style={{ marginTop: '10px' }}>
          Retry
        </button>
      </div>
    );
  }

  return <>{children({ data, loading, error, refetch: fetchData })}</>;
};

// Scroll-aware render prop component
interface ScrollAwareProps {
  threshold?: number;
  children: (scrolled: boolean) => React.ReactNode;
}

export const ScrollAware: React.FC<ScrollAwareProps> = ({
  threshold = 8,
  children
}) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return <>{children(scrolled)}</>;
};

// Conditional rendering render prop
interface ConditionalRendererProps {
  condition: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ConditionalRenderer: React.FC<ConditionalRendererProps> = ({
  condition,
  children,
  fallback = null
}) => {
  return <>{condition ? children : fallback}</>;
};

// Device-aware render prop
export const DeviceAware: React.FC<{
  children: (device: 'mobile' | 'tablet' | 'desktop') => React.ReactNode;
}> = ({ children }) => {
  const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
    if (typeof window === 'undefined') return 'desktop';
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  };

  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>(
    getDeviceType()
  );

  useEffect(() => {
    const handleResize = () => setDevice(getDeviceType());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <>{children(device)}</>;
};

// Animation-aware render prop
export const AnimationAware: React.FC<{
  children: (animated: boolean) => React.ReactNode;
  trigger?: any; // Dependency that triggers animation
}> = ({ children, trigger }) => {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    setAnimated(false);
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, [trigger]);

  return <>{children(animated)}</>;
};

// User preference render prop
interface UserPreferencesProps {
  children: (preferences: {
    theme: 'light' | 'dark';
    reducedMotion: boolean;
    highContrast: boolean;
  }) => React.ReactNode;
}

export const UserPreferencesAware: React.FC<UserPreferencesProps> = ({
  children
}) => {
  const [preferences, setPreferences] = useState<{
    theme: 'light' | 'dark';
    reducedMotion: boolean;
    highContrast: boolean;
  }>({
    theme: 'light',
    reducedMotion: false,
    highContrast: false
  });

  useEffect(() => {
    // Detect user preferences
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const highContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    
    setPreferences({
      theme: savedTheme || 'light',
      reducedMotion,
      highContrast
    });

    // Listen for changes
    const mediaQueries = [
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(prefers-contrast: high)')
    ];

    const handleChange = () => {
      setPreferences(prev => ({
        ...prev,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        highContrast: window.matchMedia('(prefers-contrast: high)').matches
      }));
    };

    mediaQueries.forEach(mq => mq.addEventListener('change', handleChange));
    
    return () => mediaQueries.forEach(mq => mq.removeEventListener('change', handleChange));
  }, []);

  return <>{children(preferences)}</>;
};