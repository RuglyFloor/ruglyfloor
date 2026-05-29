import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, MailOpen, Archive, Reply, Phone, Clock, Trash2, Settings, Save } from 'lucide-react';
import AdminProtected from '@/components/AdminProtected';
import { format } from 'date-fns';

const SENDER_IDENTITIES = [
  { label: 'info@ruglyfloor.com', value: 'info@ruglyfloor.com', name: 'Rugly Floors' },
  { label: 'ryan@ruglyfloor.com', value: 'ryan@ruglyfloor.com', name: 'Ryan @ Rugly' },
  { label: 'admin@ruglyfloor.com', value: 'admin@ruglyfloor.com', name: 'Rugly Admin' },
  { label: 'production@ruglyfloor.com', value: 'production@ruglyfloor.com', name: 'Rugly Production' },
];

const FONTS = [
  { label: 'Roboto (Default)', value: 'Roboto, sans-serif' },
  { label: 'Georgia (Serif)', value: 'Georgia, serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Courier New (Mono)', value: 'Courier New, monospace' },
  { label: 'Barlow Condensed (Brand)', value: "'Barlow Condensed', sans-serif" },
];

const DEFAULT_SIGNATURES = {
  'info@ruglyfloor.com': `Best,\nRugly Floors Team\n📧 info@ruglyfloor.com\n🌐 ruglyfloor.com`,
  'ryan@ruglyfloor.com': `Best,\nRyan\nFounder & Lead Designer, Rugly Floors\n📧 ryan@ruglyfloor.com\n📞 Contact us at ruglyfloor.com`,
  'admin@ruglyfloor.com': `Thank you,\nRugly Admin Team\n📧 admin@ruglyfloor.com\n🌐 ruglyfloor.com`,
  'production@ruglyfloor.com': `Thank you,\nRugly Production Team\n📧 production@ruglyfloor.com\n🌐 ruglyfloor.com`,
};

function SignatureManager({ signatures, setSignatures }) {
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState('');

  const startEdit = (email) => {
    setEditing(email);
    setEditValue(signatures[email] || DEFAULT_SIGNATURES[email] || '');
  };

  const saveEdit = () => {
    setSignatures(prev => ({ ...prev, [editing]: editValue }));
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Manage email signatures for each sender identity.</p>
      {SENDER_IDENTITIES.map(id => (
        <div key={id.value} className="border rounded-lg p-3">
          <div className="flex justify-between items-center mb-1">
            <span className="font-medium text-sm">{id.label}</span>
            <Button size="sm" variant="outline" onClick={() => startEdit(id.value)}>Edit</Button>
          </div>
          {editing === id.value ? (
            <div className="space-y-2">
              <Textarea
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                rows={4}
                className="text-sm font-mono"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={saveEdit}><Save className="w-3 h-3 mr-1" />Save</Button>
                <Button size="sm" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <pre className="text-xs text-gray-500 whitespace-pre-wrap mt-1 bg-gray-50 p-2 rounded">
              {signatures[id.value] || DEFAULT_SIGNATURES[id.value] || '(No signature)'}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}

function ReplyComposer({ selectedMessage, onSent }) {
  const [replyText, setReplyText] = useState('');
  const [sender, setSender] = useState(SENDER_IDENTITIES[0].value);
  const [font, setFont] = useState(FONTS[0].value);
  const [signatures, setSignatures] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('rugly_inbox_signatures') || '{}');
    } catch { return {}; }
  });
  const [showSigManager, setShowSigManager] = useState(false);
  const [sending, setSending] = useState(false);

  const saveSignatures = (sigs) => {
    setSignatures(sigs);
    localStorage.setItem('rugly_inbox_signatures', JSON.stringify(sigs));
  };

  const currentSig = signatures[sender] || DEFAULT_SIGNATURES[sender] || '';
  const senderInfo = SENDER_IDENTITIES.find(s => s.value === sender);

  const fullBody = `${replyText}\n\n--\n${currentSig}`;

  const handleSend = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await base44.integrations.Core.SendEmail({
        from_name: senderInfo.name,
        to: selectedMessage.from_email,
        subject: `Re: ${selectedMessage.subject || 'Your message to Rugly Floors'}`,
        body: fullBody,
      });
      onSent();
      setReplyText('');
    } catch (error) {
      alert('Failed to send: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* From / Font selectors */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">From</label>
          <Select value={sender} onValueChange={setSender}>
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SENDER_IDENTITIES.map(id => (
                <SelectItem key={id.value} value={id.value}>{id.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Font</label>
          <Select value={font} onValueChange={setFont}>
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONTS.map(f => (
                <SelectItem key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 mb-1 block">To</label>
        <div className="text-sm px-3 py-2 bg-gray-50 rounded border">{selectedMessage.from_email}</div>
      </div>

      {/* Message body */}
      <div>
        <label className="text-xs font-semibold text-gray-500 mb-1 block">Message</label>
        <textarea
          value={replyText}
          onChange={e => setReplyText(e.target.value)}
          placeholder="Type your reply here..."
          rows={6}
          className="w-full border rounded-md px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ fontFamily: font }}
        />
      </div>

      {/* Signature preview */}
      <div className="bg-gray-50 rounded border p-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-semibold text-gray-500">Signature Preview</span>
          <Button size="sm" variant="ghost" className="text-xs h-6 px-2" onClick={() => setShowSigManager(!showSigManager)}>
            <Settings className="w-3 h-3 mr-1" />Edit Signatures
          </Button>
        </div>
        <pre className="text-xs text-gray-600 whitespace-pre-wrap" style={{ fontFamily: font }}>
          {currentSig || '(No signature set)'}
        </pre>
      </div>

      {showSigManager && (
        <div className="border rounded-lg p-4 bg-white">
          <h4 className="font-semibold text-sm mb-3">Manage Signatures</h4>
          <SignatureManager signatures={signatures} setSignatures={saveSignatures} />
        </div>
      )}

      <Button onClick={handleSend} disabled={sending || !replyText.trim()} className="w-full">
        {sending ? 'Sending...' : `Send from ${sender}`}
      </Button>
    </div>
  );
}

function AdminInboxContent() {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [filter, setFilter] = useState('unread');
  const [adminNotes, setAdminNotes] = useState('');
  const [replyOpen, setReplyOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['inbox-messages', filter],
    queryFn: () => {
      if (filter === 'all') return base44.entities.InboxMessage.list('-created_date');
      return base44.entities.InboxMessage.filter({ status: filter }, '-created_date');
    }
  });

  const updateMessageMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.InboxMessage.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inbox-messages'] })
  });

  const deleteMessageMutation = useMutation({
    mutationFn: (id) => base44.entities.InboxMessage.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbox-messages'] });
      setSelectedMessage(null);
    }
  });

  const markAsRead = (message) => {
    if (message.status === 'unread') {
      updateMessageMutation.mutate({ id: message.id, data: { status: 'read' } });
    }
    setSelectedMessage(message);
    setAdminNotes(message.admin_notes || '');
  };

  const saveNotes = () => {
    if (!selectedMessage) return;
    updateMessageMutation.mutate({ id: selectedMessage.id, data: { admin_notes: adminNotes } });
  };

  const handleReplySent = () => {
    updateMessageMutation.mutate({ id: selectedMessage.id, data: { replied: true, status: 'read' } });
    setReplyOpen(false);
    alert('Reply sent!');
  };

  const unreadCount = messages.filter(m => m.status === 'unread').length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Inbox</h1>
            <p className="text-gray-500 text-sm">info@ruglyfloor.com · ryan@ruglyfloor.com · production@ruglyfloor.com</p>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">{unreadCount} Unread</Badge>
        </div>

        <div className="flex gap-3 mb-6">
          {[
            { key: 'unread', icon: Mail, label: 'Unread' },
            { key: 'read', icon: MailOpen, label: 'Read' },
            { key: 'archived', icon: Archive, label: 'Archived' },
            { key: 'all', icon: null, label: 'All' },
          ].map(({ key, icon: Icon, label }) => (
            <Button key={key} variant={filter === key ? 'default' : 'outline'} onClick={() => setFilter(key)}>
              {Icon && <Icon className="w-4 h-4 mr-2" />}
              {label}
            </Button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Message List */}
          <div className="space-y-3">
            {isLoading ? (
              <Card><CardContent className="p-6">Loading...</CardContent></Card>
            ) : messages.length === 0 ? (
              <Card><CardContent className="p-6 text-center text-gray-500">No messages</CardContent></Card>
            ) : messages.map((message) => (
              <Card
                key={message.id}
                className={`cursor-pointer transition-all ${selectedMessage?.id === message.id ? 'ring-2 ring-blue-500' : ''} ${message.status === 'unread' ? 'bg-blue-50' : ''}`}
                onClick={() => markAsRead(message)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {message.status === 'unread' ? <Mail className="w-4 h-4 text-blue-600" /> : <MailOpen className="w-4 h-4 text-gray-400" />}
                        <span className="font-semibold">{message.from_name || 'Anonymous'}</span>
                        {message.replied && <Badge variant="secondary" className="text-xs">Replied</Badge>}
                      </div>
                      <p className="text-sm text-gray-600">{message.from_email}</p>
                      {message.subject && <p className="text-sm font-medium mt-1">{message.subject}</p>}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(message.created_date), 'MMM d, h:mm a')}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">{message.message}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Message Detail */}
          {selectedMessage ? (
            <Card className="sticky top-6 h-fit">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedMessage.from_name || 'Anonymous'}</CardTitle>
                    <p className="text-sm text-gray-600">{selectedMessage.from_email}</p>
                    {selectedMessage.from_phone && (
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <Phone className="w-3 h-3" />{selectedMessage.from_phone}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() =>
                      updateMessageMutation.mutate({ id: selectedMessage.id, data: { status: selectedMessage.status === 'archived' ? 'read' : 'archived' } })
                    }>
                      <Archive className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => {
                      if (confirm('Delete this message?')) deleteMessageMutation.mutate(selectedMessage.id);
                    }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedMessage.subject && (
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Subject</h4>
                    <p className="text-sm">{selectedMessage.subject}</p>
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-sm mb-1">Message</h4>
                  <p className="text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">{selectedMessage.message}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2">Internal Notes</h4>
                  <Textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} placeholder="Add internal notes..." rows={3} />
                  <Button size="sm" className="mt-2" onClick={saveNotes}>Save Notes</Button>
                </div>

                {/* Reply Dialog */}
                <Dialog open={replyOpen} onOpenChange={setReplyOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <Reply className="w-4 h-4 mr-2" />Reply
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Reply to {selectedMessage.from_name || selectedMessage.from_email}</DialogTitle>
                    </DialogHeader>
                    <ReplyComposer selectedMessage={selectedMessage} onSent={handleReplySent} />
                  </DialogContent>
                </Dialog>

                <div className="text-xs text-gray-500 pt-4 border-t">
                  Received: {format(new Date(selectedMessage.created_date), 'PPpp')}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-6 h-fit">
              <CardContent className="p-12 text-center text-gray-400">
                <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Select a message to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminInbox() {
  return (
    <AdminProtected>
      <AdminInboxContent />
    </AdminProtected>
  );
}