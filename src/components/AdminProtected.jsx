import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function AdminProtected({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem('rugly_admin_auth') !== 'true') {
      navigate(createPageUrl('AdminLogin'));
    }
  }, [navigate]);

  if (sessionStorage.getItem('rugly_admin_auth') !== 'true') {
    return null;
  }

  return <>{children}</>;
}