import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock, Mail } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '../utils';

export default function AdminLogin() {
  const [email, setEmail] = useState('info@ruglyfloor.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If already authenticated as admin, go straight to portal
    (async () => {
      const isAuth = await base44.auth.isAuthenticated().catch(() => false);
      if (isAuth) {
        const user = await base44.auth.me().catch(() => null);
        if (user?.role === 'admin') {
          window.location.href = createPageUrl('AdminPortal');
        }
      }
    })();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      const user = await base44.auth.me();
      if (user?.role !== 'admin') {
        await base44.auth.logout();
        setError('This account does not have admin access.');
        setLoading(false);
        return;
      }
      sessionStorage.setItem('rugly_admin_auth', 'true');
      window.location.href = createPageUrl('AdminPortal');
    } catch (err) {
      setError('Incorrect email or password.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-6 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <Lock className="w-6 h-6" />
            Admin Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Admin email"
                className="pl-9"
                required
              />
            </div>
            <Input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="Password"
              className="text-lg"
              autoFocus
              required
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Access Admin Portal'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}