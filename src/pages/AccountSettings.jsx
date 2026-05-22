import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AccountSettings() {
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE') return;
    setLoading(true);
    try {
      // Send a deletion-request email to the admin so they can action it
      await base44.integrations.Core.SendEmail({
        to: 'info@ruglyfloor.com',
        subject: 'Account Deletion Request',
        body: `A user has requested deletion of their account.\n\nPlease remove all personal data associated with this account within 30 days per applicable privacy law.\n\nTimestamp: ${new Date().toISOString()}`
      });
      setDone(true);
    } catch (e) {
      alert('Something went wrong. Please email info@ruglyfloor.com directly to request account deletion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-black mb-2" style={{ color: 'var(--brand-dark)' }}>Account Settings</h1>
        <p className="text-gray-500 mb-10">Manage your account and personal data.</p>

        {/* Delete Account Section */}
        <div className="bg-white rounded-2xl border-2 border-red-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-black text-red-700">Delete My Account</h2>
              <p className="text-xs text-gray-500">Permanently remove all your data</p>
            </div>
          </div>

          {done ? (
            <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-700 font-semibold">
              ✓ Your deletion request has been received. We will remove your data within 30 days and confirm by email.
            </div>
          ) : (
            <>
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 mb-5 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  This action is <strong>irreversible</strong>. All your orders, designs, and personal information will be permanently deleted. This cannot be undone.
                </p>
              </div>

              <p className="text-sm font-semibold text-gray-700 mb-2">
                Type <span className="font-mono bg-gray-100 px-1 rounded">DELETE</span> to confirm:
              </p>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                placeholder="DELETE"
                className="mb-4 font-mono"
              />
              <Button
                variant="destructive"
                disabled={confirmText !== 'DELETE' || loading}
                onClick={handleDeleteAccount}
                className="w-full gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {loading ? 'Sending request…' : 'Permanently Delete My Account'}
              </Button>

              <p className="text-xs text-gray-400 mt-3 text-center">
                You can also email <a href="mailto:info@ruglyfloor.com" className="underline">info@ruglyfloor.com</a> to request deletion.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}