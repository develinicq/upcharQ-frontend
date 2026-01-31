import { useLocation } from 'react-router-dom';

// Unified SignIn page that passes the variant prop from URL search params
export default function UnifiedSignIn() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const variant = params.get('variant') || 'neutral';

  return <SignIn variant={variant} />
}
