import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Mail, MailOpen, Archive, Reply, Phone, Clock, Trash2 } from 'lucide-react';
import AdminProtected from '@/components/AdminProtected';
import { format } from 'date-fns';

function AdminInboxContent() {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [filter, setFilter] = useState('unread');
  const [replyText, setReplyText] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['inbox-messages', filter],
    queryFn: () => {
      if (filter === 'all') {
        return base44.entities.InboxMessage.list('-created_date');
      }
      return base44.entities.InboxMessage.filter({ status: filter }, '-created_date');
    }
  });

  const updateMessageMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.InboxMessage.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbox-messages'] });
    }
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
      updateMessageMutation.mutate({ 
        id: message.id, 
        data: { status: 'read' } 
      });
    }
    setSelectedMessage(message);
    setAdminNotes(message.admin_notes || '');
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selectedMessage) return;

    try {
      await base44.integrations.Core.SendEmail({
        from_name: 'Rugly Floors',
        to: selectedMessage.from_email,
        subject: `Re: ${selectedMessage.subject || 'Your message'}`,
        body: replyText
      });

      updateMessageMutation.mutate({
        id: selectedMessage.id,
        data: { replied: true, status: 'read' }
      });

      setReplyText('');
      alert('Reply sent successfully!');
    } catch (error) {
      alert('Failed to send reply: ' + error.message);
    }
  };

  const saveNotes = () => {
    if (!selectedMessage) return;
    updateMessageMutation.mutate({
      id: selectedMessage.id,
      data: { admin_notes: adminNotes }
    });
  };

  const unreadCount = messages.filter(m => m.status === 'unread').length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Inbox</h1>
            <p className="text-gray-600">info@ruglyfloors.com</p>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {unreadCount} Unread
          </Badge>
        </div>

        <div className="flex gap-4 mb-6">
          <Button 
            variant={filter === 'unread' ? 'default' : 'outline'}
            onClick={() => setFilter('unread')}
          >
            <Mail className="w-4 h-4 mr-2" />
            Unread
          </Button>
          <Button 
            variant={filter === 'read' ? 'default' : 'outline'}
            onClick={() => setFilter('read')}
          >
            <MailOpen className="w-4 h-4 mr-2" />
            Read
          </Button>
          <Button 
            variant={filter === 'archived' ? 'default' : 'outline'}
            onClick={() => setFilter('archived')}
          >
            <Archive className="w-4 h-4 mr-2" />
            Archived
          </Button>
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All Messages
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Messages List */}
          <div className="space-y-3">
            {isLoading ? (
              <Card><CardContent className="p-6">Loading...</CardContent></Card>
            ) : messages.length === 0 ? (
              <Card><CardContent className="p-6 text-center text-gray-500">No messages</CardContent></Card>
            ) : (
              messages.map((message) => (
                <Card 
                  key={message.id}
                  className={`cursor-pointer transition-all ${
                    selectedMessage?.id === message.id ? 'ring-2 ring-blue-500' : ''
                  } ${message.status === 'unread' ? 'bg-blue-50' : ''}`}
                  onClick={() => markAsRead(message)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {message.status === 'unread' ? (
                            <Mail className="w-4 h-4 text-blue-600" />
                          ) : (
                            <MailOpen className="w-4 h-4 text-gray-400" />
                          )}
                          <span className="font-semibold">{message.from_name || 'Anonymous'}</span>
                          {message.replied && (
                            <Badge variant="secondary" className="text-xs">Replied</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{message.from_email}</p>
                        {message.subject && (
                          <p className="text-sm font-medium mt-1">{message.subject}</p>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(message.created_date), 'MMM d, h:mm a')}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">{message.message}</p>
                  </CardContent>
                </Card>
              ))
            )}
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
                        <Phone className="w-3 h-3" />
                        {selectedMessage.from_phone}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateMessageMutation.mutate({
                        id: selectedMessage.id,
                        data: { status: selectedMessage.status === 'archived' ? 'read' : 'archived' }
                      })}
                    >
                      <Archive className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (confirm('Delete this message?')) {
                          deleteMessageMutation.mutate(selectedMessage.id);
                        }
                      }}
                    >
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
                  <p className="text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                    {selectedMessage.message}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">Admin Notes (Internal)</h4>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add internal notes..."
                    rows={3}
                  />
                  <Button 
                    size="sm" 
                    className="mt-2" 
                    onClick={saveNotes}
                  >
                    Save Notes
                  </Button>
                </div>

                <div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        <Reply className="w-4 h-4 mr-2" />
                        Reply via Email
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Reply to {selectedMessage.from_email}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type your reply..."
                          rows={6}
                        />
                        <Button onClick={handleReply} className="w-full">
                          Send Reply
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

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