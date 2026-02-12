import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function Products() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect /products to /shop
    navigate(createPageUrl('Shop'), { replace: true });
  }, [navigate]);

  return null;
}