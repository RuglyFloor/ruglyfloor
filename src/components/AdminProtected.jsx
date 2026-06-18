import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';

export default function AdminProtected({ children }) {
  const navigate = useNavigate();
  const [status, setStatus] = useState('checking'); // 'checking' | 'ok' | 'denied'

  useEffect(() => {
    const check = async () => {
      // First check the custom session flag
      if (sessionStorage.getItem('rugly_admin_auth') !== 'true') {
        navigate(createPageUrl('AdminLogin'));
        return;
      }
      // Then verify the Base44 user is actually an admin
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          setStatus('denied');
          return;
        }
        const user = await base44.auth.me();
        if (user?.role === 'admin') {
          setStatus('ok');
        } else {
          setStatus('denied');
        }
      } catch {
        setStatus('denied');
      }
    };
    check();
  }, [navigate]);

  if (status === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (status === 'denied') {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="bg-white border border-red-200 rounded-2xl p-8 max-w-md text-center shadow-lg">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-2 text-red-600">Admin Access Required</h2>
          <p className="text-gray-600 mb-4">
            You must be logged in as a Base44 admin user to manage products.
          </p>
          <p className="text-sm text-gray-400 mb-6">
            Log in at <strong>ruglyfloor.com/login</strong> with your admin account, then return here.
          </p>
          <button
            onClick={() => base44.auth.redirectToLogin(window.location.href)}
            className="bg-blue-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Log In as Admin
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}