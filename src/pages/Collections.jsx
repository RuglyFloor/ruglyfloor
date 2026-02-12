import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function Collections() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect /collections to /shop
    navigate(createPageUrl('Shop'), { replace: true });
  }, [navigate]);

  return null;
}