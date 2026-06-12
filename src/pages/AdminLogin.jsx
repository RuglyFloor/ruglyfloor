import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { createPageUrl } from '../utils';

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
    if (sessionStorage.getItem('rugly_admin_auth') === 'true') {
      navigate(createPageUrl('AdminPortal'));
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const hash = await hashPassword(password);
    if (hash === ADMIN_PASSWORD_HASH) {
      sessionStorage.setItem('rugly_admin_auth', 'true');
      navigate(createPageUrl('AdminPortal'));
    } else {
      setError('Incorrect password');
      setPassword('');
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
          </form>
        </CardContent>
      </Card>
    </div>
  );
}