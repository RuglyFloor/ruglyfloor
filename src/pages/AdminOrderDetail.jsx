import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Mail, CheckCircle, Loader2, ZoomIn, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import AdminProtected from '../components/AdminProtected';

// ─── Email Templates ───────────────────────────────────────────────────────────
const EMAIL_TEMPLATES = {
  paid: (order) => ({
    subject: `Order Confirmed — ${order.order_number} 🎨`,
    body: `Hi ${order.customer_name?.split(' ')[0] || 'there'},

Thank you so much for your order! We're thrilled to get started on your custom rug.

📦 Order #: ${order.order_number}
💰 Amount Paid: $${order.amount_paid ? (order.amount_paid / 100).toFixed(2) : order.total_amount?.toFixed(2)}

Our artists will begin working on your design soon. You'll hear from us when it goes into production.

If you have any questions or changes, just reply to this email or text us at (517) 777-8474.

With love,
The Rugly Team
ruglyfloor.com`
  }),

  in_production: (order) => ({
    subject: `Your Rug is in Production! — ${order.order_number} 🖌️`,
    body: `Hi ${order.customer_name?.split(' ')[0] || 'there'},

Great news — your rug is now being hand-painted by our artists!

📦 Order #: ${order.order_number}
🖌️ Status: In Production
⏱️ Estimated completion: 10–14 business days for Crugly, 14–21 for Rugly

We'll send you another update as soon as it ships. In the meantime, feel free to reach out with any questions.

Text or call us: (517) 777-8474

With love,
The Rugly Team
ruglyfloor.com`
  }),

  shipped: (order) => ({
    subject: `Your Rug is on the Way! — ${order.order_number} 🚚`,
    body: `Hi ${order.customer_name?.split(' ')[0] || 'there'},

Your custom rug has shipped! 🎉

📦 Order #: ${order.order_number}
🚚 Tracking #: ${order.tracking_number || '[ADD TRACKING NUMBER]'}
🔗 Track your package: ${order.tracking_url || '[ADD TRACKING URL]'}

Please inspect it within 24 hours of delivery. If there are any quality issues or damage, we make it right — full replacement or refund.

Thank you for choosing Rugly!

With love,
The Rugly Team
ruglyfloor.com`
  }),

  custom: (order) => ({
    subject: `Update on Your Order — ${order.order_number}`,
    body: `Hi ${order.customer_name?.split(' ')[0] || 'there'},

We wanted to reach out about your Rugly order #${order.order_number}.

[ADD YOUR MESSAGE HERE]

If you have any questions, reply here or text us at (517) 777-8474.

With love,
The Rugly Team
ruglyfloor.com`
  })
};

// ─── Image Lightbox ────────────────────────────────────────────────────────────
function ImageLightbox({ src, alt, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <button className="absolute top-4 right-4 text-white hover:text-gray-300" onClick={onClose}>
        <X className="w-8 h-8" />
      </button>
      <img src={src} alt={alt} className="max-w-full max-h-full rounded-lg shadow-2xl" onClick={e => e.stopPropagation()} />
    </div>
  );
}

// ─── Item Images Panel ─────────────────────────────────────────────────────────
function ItemImagesPanel({ item }) {
  const [lightbox, setLightbox] = useState(null);

  const images = [
    { url: item.image_url || item.original_upload_url, label: 'Customer Upload' },
    { url: item.ai_preview_url, label: 'AI Preview Shown' },
    { url: item.preview_url !== item.ai_preview_url ? item.preview_url : null, label: 'Preview' },
  ].filter(img => img.url);

  if (images.length === 0) return <p className="text-xs text-gray-400 italic">No images available</p>;

  return (
    <>
      <div className="flex gap-3 flex-wrap">
        {images.map((img, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="relative group cursor-pointer" onClick={() => setLightbox(img)}>
              <img src={img.url} alt={img.label} className="w-28 h-28 object-cover rounded-lg border-2 border-gray-200 group-hover:border-blue-400 transition-colors" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg flex items-center justify-center transition-all">
                <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <span className="text-xs text-gray-500 font-medium">{img.label}</span>
          </div>
        ))}
      </div>
      {lightbox && <ImageLightbox src={lightbox.url} alt={lightbox.label} onClose={() => setLightbox(null)} />}
    </>
  );
}

// ─── Email Panel ───────────────────────────────────────────────────────────────
function EmailPanel({ order }) {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const loadTemplate = (key) => {
    setSelectedTemplate(key);
    if (key && EMAIL_TEMPLATES[key]) {
      const tpl = EMAIL_TEMPLATES[key](order);
      setEmailSubject(tpl.subject);
      setEmailBody(tpl.body);
      setSent(false);
    }
  };

  const sendEmail = async () => {
    if (!emailSubject || !emailBody) return;
    setSending(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: order.customer_email,
        subject: emailSubject,
        body: emailBody.replace(/\n/g, '<br>'),
        from_name: 'Rugly Floors'
      });
      setSent(true);
    } catch (err) {
      alert('Failed to send email: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Send Customer Email
        </CardTitle>
        <p className="text-sm text-gray-500">To: {order.customer_email}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Template Picker */}
        <div>
          <Label className="mb-2 block">Load a Template</Label>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'paid', label: '✅ Order Confirmed' },
              { key: 'in_production', label: '🖌️ In Production' },
              { key: 'shipped', label: '🚚 Shipped' },
              { key: 'custom', label: '✉️ Custom Message' },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => loadTemplate(t.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold border-2 transition-all ${selectedTemplate === t.key ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-400'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {selectedTemplate && (
          <>
            <div>
              <Label className="mb-1 block">Subject</Label>
              <Input value={emailSubject} onChange={e => setEmailSubject(e.target.value)} className="font-medium" />
            </div>
            <div>
              <Label className="mb-1 block">Body</Label>
              <Textarea value={emailBody} onChange={e => setEmailBody(e.target.value)} rows={12} className="text-sm font-mono" />
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={sendEmail} disabled={sending || sent} className="gap-2">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : sent ? <CheckCircle className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                {sending ? 'Sending...' : sent ? 'Sent!' : `Send to ${order.customer_email}`}
              </Button>
              {sent && <span className="text-green-600 text-sm font-semibold">✓ Email delivered</span>}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
function AdminOrderDetailContent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('id');

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const orders = await base44.entities.Order.filter({ id: orderId });
      return orders[0];
    },
    enabled: !!orderId
  });

  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ status: '', tracking_number: '', tracking_url: '', notes: '' });

  useEffect(() => {
    if (order) {
      setFormData({
        status: order.status,
        tracking_number: order.tracking_number || '',
        tracking_url: order.tracking_url || '',
        notes: order.notes || ''
      });
    }
  }, [order]);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const statusHistory = [...(order.status_history || [])];
      if (data.status !== order.status) {
        statusHistory.push({ status: data.status, timestamp: new Date().toISOString(), note: `Status updated to ${data.status}` });
      }
      await base44.entities.Order.update(orderId, { ...data, status_history: statusHistory });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['order', orderId]);
      setEditing(false);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.status === 'in_production' && order.status === 'pending_payment') {
      alert('Cannot move to production. Order must be paid first.');
      return;
    }
    updateMutation.mutate(formData);
  };

  if (isLoading) return <div className="min-h-screen py-12 px-6 bg-gray-50 text-center">Loading...</div>;
  if (!order) return (
    <div className="min-h-screen py-12 px-6 bg-gray-50 text-center">
      <p className="text-gray-600 mb-4">Order not found</p>
      <Button onClick={() => navigate(createPageUrl('AdminOrders'))}>Back to Orders</Button>
    </div>
  );

  const getStatusBadge = (status) => {
    const config = {
      pending_payment: { label: 'Pending Payment', className: 'bg-yellow-100 text-yellow-800' },
      paid: { label: 'Paid', className: 'bg-green-100 text-green-800' },
      in_production: { label: 'In Production', className: 'bg-blue-100 text-blue-800' },
      shipped: { label: 'Shipped', className: 'bg-purple-100 text-purple-800' },
      cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-800' },
      refunded: { label: 'Refunded', className: 'bg-red-100 text-red-800' }
    };
    const { label, className } = config[status] || { label: status, className: 'bg-gray-100' };
    return <Badge className={className}>{label}</Badge>;
  };

  // Prices stored as dollars (not cents)
  const displayPrice = (val) => typeof val === 'number' ? (val > 1000 ? (val / 100).toFixed(2) : val.toFixed(2)) : '—';

  return (
    <div className="min-h-screen py-12 px-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <Button variant="outline" size="sm" onClick={() => navigate(createPageUrl('AdminOrders'))} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN — Order details */}
          <div className="lg:col-span-2 space-y-6">

            {/* Header */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{order.order_number}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">Created: {new Date(order.created_date).toLocaleString()}</p>
                  </div>
                  <div className="text-right space-y-1">
                    {getStatusBadge(order.status)}
                    {order.status === 'pending_payment' && (
                      <div className="text-xs text-orange-600 font-semibold">⚠️ Awaiting Payment</div>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Customer */}
            <Card>
              <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
              <CardContent className="space-y-1 text-sm">
                <div><strong>Name:</strong> {order.customer_name || 'N/A'}</div>
                <div><strong>Email:</strong> {order.customer_email}</div>
                {order.customer_phone && <div><strong>Phone:</strong> {order.customer_phone}</div>}
                {order.shipping_address?.street && (
                  <div><strong>Ship to:</strong> {order.shipping_address.street}, {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}</div>
                )}
              </CardContent>
            </Card>

            {/* Payment */}
            {(order.amount_paid || order.payment_timestamp) && (
              <Card>
                <CardHeader><CardTitle>Payment</CardTitle></CardHeader>
                <CardContent className="space-y-1 text-sm">
                  {order.amount_paid && <div><strong>Paid:</strong> ${displayPrice(order.amount_paid)}</div>}
                  {order.payment_timestamp && <div><strong>Time:</strong> {new Date(order.payment_timestamp).toLocaleString()}</div>}
                  {order.payment_intent_id && <div className="text-xs text-gray-400">PI: {order.payment_intent_id}</div>}
                </CardContent>
              </Card>
            )}

            {/* Order Items — WITH IMAGES */}
            <Card>
              <CardHeader><CardTitle>Order Items</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="border rounded-xl p-4 space-y-4">
                      {/* Item header */}
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-base">{item.name}</div>
                          <div className="text-sm text-gray-500 space-y-0.5 mt-1">
                            {item.size && <div>Size: {item.size}</div>}
                            {item.qualityLabel && <div>Tier: {item.qualityLabel}</div>}
                            {item.base_color && <div>Base: {item.base_color}</div>}
                            {item.paint_color && <div>Paint: {item.paint_color}</div>}
                            {item.second_paint_color && <div>2nd Paint: {item.second_paint_color}</div>}
                          </div>
                        </div>
                        <div className="text-right font-bold text-lg">${displayPrice(item.price)}</div>
                      </div>

                      {/* ── IMAGES ── */}
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Images</div>
                        <ItemImagesPanel item={item} />
                      </div>

                      {/* Design instructions */}
                      {item.design_instructions && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                          <div className="font-semibold text-yellow-800 mb-1">Design Instructions</div>
                          <div className="text-yellow-900">{item.design_instructions}</div>
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="text-right text-xl font-bold pt-3 border-t">
                    Total: ${displayPrice(order.total_amount)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status History */}
            {order.status_history?.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Status History</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {order.status_history.map((entry, idx) => (
                      <div key={idx} className="flex justify-between items-start p-3 bg-gray-50 rounded text-sm">
                        <div>
                          <div className="font-semibold">{entry.status}</div>
                          {entry.note && <div className="text-gray-500 text-xs">{entry.note}</div>}
                        </div>
                        <div className="text-xs text-gray-400">{new Date(entry.timestamp).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* RIGHT COLUMN — Status update + Email */}
          <div className="space-y-6">

            {/* Status Update */}
            <Card>
              <CardHeader><CardTitle>Update Status</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label className="mb-1 block">Status</Label>
                    <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})} disabled={!editing}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending_payment">Pending Payment</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="in_production">In Production</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-1 block">Tracking #</Label>
                    <Input value={formData.tracking_number} onChange={e => setFormData({...formData, tracking_number: e.target.value})} disabled={!editing} placeholder="UPS/USPS tracking #" />
                  </div>
                  <div>
                    <Label className="mb-1 block">Tracking URL</Label>
                    <Input value={formData.tracking_url} onChange={e => setFormData({...formData, tracking_url: e.target.value})} disabled={!editing} placeholder="https://..." />
                  </div>
                  <div>
                    <Label className="mb-1 block">Internal Notes</Label>
                    <Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} disabled={!editing} rows={3} />
                  </div>
                  {!editing ? (
                    <Button type="button" className="w-full" onClick={() => setEditing(true)}>Edit Order</Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1" disabled={updateMutation.isPending}>
                        <Save className="w-4 h-4 mr-1" />
                        {updateMutation.isPending ? 'Saving...' : 'Save'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => { setEditing(false); setFormData({ status: order.status, tracking_number: order.tracking_number || '', tracking_url: order.tracking_url || '', notes: order.notes || '' }); }}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* Email Panel */}
            <EmailPanel order={order} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrderDetail() {
  return (
    <AdminProtected>
      <AdminOrderDetailContent />
    </AdminProtected>
  );
}