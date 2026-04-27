import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminProtected from '@/components/AdminProtected';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Phone, Mail, MessageSquare, Search, Eye, X } from 'lucide-react';

const STATUS_COLORS = {
  new: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'New' },
  contacted: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Contacted' },
  quoted: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Quoted' },
  closed: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Closed' },
};

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.new;
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>{s.label}</span>;
}

function SubmissionCard({ sub, onStatusChange, onNotesChange }) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(sub.admin_notes || '');
  const shareUrl = sub.share_token ? `${window.location.origin}/VisualizerShare?token=${sub.share_token}` : null;

  return (
    <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-4">
          {sub.preview_url && (
            <img src={sub.preview_url} alt="Preview" className="w-20 h-20 rounded-lg object-cover flex-shrink-0 border border-gray-200" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
              <div>
                <div className="font-bold text-gray-900 text-base">{sub.name || 'Anonymous'}</div>
                <div className="text-sm text-gray-500">{sub.email}</div>
              </div>
              <StatusBadge status={sub.status} />
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
              {sub.size && <span className="font-semibold text-gray-800">📐 {sub.size}</span>}
              {sub.price_estimate && <span>~${sub.price_estimate}</span>}
              {sub.style_tags?.length > 0 && <span className="text-gray-400">{sub.style_tags.join(', ')}</span>}
              <span className="text-gray-400">{new Date(sub.created_date).toLocaleDateString()}</span>
            </div>
            {sub.room_description && (
              <p className="text-sm text-gray-600 italic truncate">"{sub.room_description}"</p>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 items-center">
          {/* Status buttons */}
          {['new', 'contacted', 'quoted', 'closed'].map(s => (
            <button
              key={s}
              onClick={() => onStatusChange(sub.id, s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${sub.status === s ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
            >
              {STATUS_COLORS[s].label}
            </button>
          ))}
          <div className="ml-auto flex gap-2">
            {sub.phone && (
              <a href={`tel:${sub.phone}`}>
                <Button size="sm" variant="outline" className="gap-1"><Phone className="w-3 h-3" />Call</Button>
              </a>
            )}
            {sub.email && (
              <a href={`mailto:${sub.email}?subject=Your Rugly Design`}>
                <Button size="sm" variant="outline" className="gap-1"><Mail className="w-3 h-3" />Email</Button>
              </a>
            )}
            <Button size="sm" variant="ghost" onClick={() => setExpanded(e => !e)}>
              {expanded ? <X className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 p-5 bg-gray-50 space-y-4">
          {sub.preview_url && (
            <img src={sub.preview_url} alt="Preview" className="w-full max-w-sm rounded-xl border border-gray-200" />
          )}
          {sub.notes && (
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-1">CUSTOMER NOTES</div>
              <p className="text-sm text-gray-700">{sub.notes}</p>
            </div>
          )}
          {shareUrl && (
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-1">SHAREABLE LINK</div>
              <div className="flex gap-2">
                <input readOnly value={shareUrl} className="flex-1 text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 font-mono" />
                <Button size="sm" onClick={() => navigator.clipboard.writeText(shareUrl)}>Copy</Button>
              </div>
            </div>
          )}
          <div>
            <div className="text-xs font-semibold text-gray-500 mb-2">ADMIN NOTES</div>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              onBlur={() => onNotesChange(sub.id, notes)}
              placeholder="Add internal notes..."
              className="text-sm min-h-[80px]"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function AdminVisualizerContent() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const qc = useQueryClient();

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ['visualizer-submissions'],
    queryFn: () => base44.entities.VisualizerSubmission.list('-created_date', 100)
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.VisualizerSubmission.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['visualizer-submissions'] })
  });

  const filtered = submissions.filter(s => {
    const matchSearch = !search || [s.name, s.email, s.phone, s.room_description].some(v => v?.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = { new: 0, contacted: 0, quoted: 0, closed: 0 };
  submissions.forEach(s => { if (counts[s.status] !== undefined) counts[s.status]++; });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Visualizer Submissions</h1>
          <p className="text-gray-500">Manage rug design requests from the Rugly Visualizer</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Object.entries(counts).map(([status, count]) => (
            <div key={status} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center cursor-pointer hover:border-gray-300 transition-colors" onClick={() => setFilterStatus(status === filterStatus ? 'all' : status)}>
              <div className="text-2xl font-black text-gray-900">{count}</div>
              <StatusBadge status={status} />
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, description…" className="pl-9" />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="quoted">Quoted</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-gray-400">Loading submissions…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-4xl mb-4">🎨</div>
            <div className="font-semibold">No submissions yet</div>
            <div className="text-sm mt-1">Share the Visualizer link to start getting designs</div>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(sub => (
              <SubmissionCard
                key={sub.id}
                sub={sub}
                onStatusChange={(id, status) => updateMutation.mutate({ id, data: { status } })}
                onNotesChange={(id, admin_notes) => updateMutation.mutate({ id, data: { admin_notes } })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminVisualizer() {
  return (
    <AdminProtected>
      <AdminVisualizerContent />
    </AdminProtected>
  );
}