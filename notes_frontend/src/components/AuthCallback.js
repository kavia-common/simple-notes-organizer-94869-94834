import { useEffect } from 'react';
import { supabase } from '../utils/supabase';

export default function AuthCallback({ onSuccess, onError, navigate }) {
  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true });
      if (error) {
        // eslint-disable-next-line no-console
        console.error('Auth callback error:', error);
        if (onError) onError(error);
        if (navigate) navigate('/auth/error');
        return;
      }
      if (data?.session) {
        if (onSuccess) onSuccess(data.session);
        if (navigate) navigate('/'); // default to home
      }
    };

    handleAuthCallback();
  }, [navigate, onError, onSuccess]);

  return <div>Processing authentication...</div>;
}
