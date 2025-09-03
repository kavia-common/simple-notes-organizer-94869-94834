import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function AuthError() {
  const loc = useLocation();
  const params = new URLSearchParams(loc.search);
  const type = params.get('type') || 'unknown';
  return (
    <div style={{ padding: 24 }}>
      <h2>Authentication Error</h2>
      <p>There was an issue completing sign-in. Type: {type}</p>
      <p><Link to="/signin">Go back to Sign In</Link></p>
    </div>
  );
}
