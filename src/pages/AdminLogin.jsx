import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';

// SHA-256 hash of the admin password — never store plaintext here
const ADMIN_PASSWORD_HASH = '5ae5e897673c83dda54c80d47c07920db651e4ab4ea57e57ff772bfe47c4afa8';

async function hashPassword(pw) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Returning from Base44 login: if password was already verified and we're
    // now authenticated, proceed to the portal.
    (async () => {
      if (sessionStorage.getItem('rugly_admin_auth') === 'true') {
        const isAuth = await base44.auth.isAuthenticated().catch(() => false);
        if (isAuth) {
          navigate(createPageUrl('AdminPortal'));
        }
      }
    })();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const hash = await hashPassword(password);
    if (hash !== ADMIN_PASSWORD_HASH) {
      setError('Incorrect password');
      setPassword('');
      return;
    }
    // Password OK — now make sure we have a real Base44 admin session,
    // which is what the database requires to edit products.
    sessionStorage.setItem('rugly_admin_auth', 'true');
    const isAuth = await base44.auth.isAuthenticated().catch(() => false);
    if (isAuth) {
      navigate(createPageUrl('AdminPortal'));
    } else {
      // Send to Base44 hosted login, then come back here.
      base44.auth.redirectToLogin(window.location.href);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-6 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <Lock className="w-6 h-6" />
            Admin Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Enter admin password"
                className="text-lg"
                autoFocus
              />
              {error && (
                <p className="text-red-600 text-sm mt-2">{error}</p>
              )}
            </div>
            <Button type="submit" className="w-full">
              Access Admin Portal
            </Button>
            <p className="text-xs text-gray-400 text-center">
              If prompted, sign in with your admin account (info@ruglyfloor.com).
              This is required to edit products.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}