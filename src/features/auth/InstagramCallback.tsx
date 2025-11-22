import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const InstagramCallback = () => {
  const navigate = useNavigate();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double processing when component re-runs due to navigation
    if (hasProcessed.current) {
      console.log('🔄 Instagram callback already processed, skipping...');
      return;
    }

    const handleCallback = async () => {
      try {
        console.log('🔄 Processing Instagram OAuth callback...');
        console.log('📍 Current URL:', window.location.href);

        // Extract query parameters
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const success = urlParams.get('success');
        const error = urlParams.get('error');

        console.log('📋 URL Parameters:', {
          hasToken: !!token,
          success,
          error,
          tokenLength: token?.length || 0
        });

        // Handle error case
        if (error || !success || !token) {
          throw new Error(`OAuth error: ${error || 'Missing token or success parameter'}`);
        }

        console.log('✅ Valid Instagram OAuth callback parameters received');

        // Decode token to get user information (simple JWT decode)
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
          throw new Error('Invalid JWT token format');
        }

        const tokenPayload = JSON.parse(atob(tokenParts[1]));
        console.log('🔓 Decoded token payload:', tokenPayload);

        const user = {
          userId: tokenPayload.id || tokenPayload.userId || tokenPayload.sub,
          email: tokenPayload.email,
          userType: tokenPayload.userType || tokenPayload.role
        };

        console.log('👤 Extracted user information:', user);

        // Store token in localStorage with user-type specific key
        const userType = user.userType as 'patient' | 'doctor' | 'admin';
        const storageKeys: Record<'patient' | 'doctor' | 'admin', { user: string; token: string }> = {
          patient: { user: 'patient', token: 'patient_token' },
          doctor: { user: 'doctor', token: 'doctor_token' },
          admin: { user: 'admin', token: 'admin_token' }
        };

        // Store token in localStorage (matching your existing pattern)
        localStorage.setItem(storageKeys[userType].token, token);
        console.log('💾 Token stored in localStorage as:', storageKeys[userType].token);

        // Store user data in localStorage with user-type specific key
        localStorage.setItem(storageKeys[userType].user, JSON.stringify(user));
        console.log('💾 User data stored in localStorage as:', storageKeys[userType].user);

        // Mark as processed to prevent double execution
        hasProcessed.current = true;

        // Dispatch custom event to notify AuthContext of external auth update
        console.log('📡 Dispatching instagram-auth-success event');
        window.dispatchEvent(new CustomEvent('instagram-auth-success', {
          detail: { user, token }
        }));

        console.log('✅ Instagram OAuth callback processing completed successfully');

        // Redirect based on user type
        const redirectPath = `/${user.userType}/dashboard`;
        console.log('🧭 Redirecting to:', redirectPath);

        switch (user.userType) {
          case 'patient':
            navigate('/patient/dashboard', { replace: true });
            break;
          case 'doctor':
            navigate('/doctor/dashboard', { replace: true });
            break;
          case 'admin':
            navigate('/admin/dashboard', { replace: true });
            break;
          default:
            console.warn('⚠️ Unknown user type:', user.userType);
            navigate('/', { replace: true });
        }
      } catch (error) {
        console.error('❌ Instagram OAuth callback failed:', error);
        console.error('🔍 Error details:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          url: window.location.href
        });

        // Clear any partial auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Also clear user-type specific keys that might have been partially set
        localStorage.removeItem('patient_token');
        localStorage.removeItem('patient');
        localStorage.removeItem('doctor_token');
        localStorage.removeItem('doctor');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin');
        console.log('🗑️ Cleared partial auth data due to error');

        // Mark as processed even on error to prevent loops
        hasProcessed.current = true;

        // Redirect to home page on error
        navigate('/', { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #E4405F',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <p>Completing Instagram sign-in...</p>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default InstagramCallback;